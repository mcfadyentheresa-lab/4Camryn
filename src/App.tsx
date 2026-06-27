import { useEffect, useState, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { PROTOCOL, dayOfCycleFromDate, phaseFromDay, dailyTasks } from './lib/protocol';
import {
  loadAllMastery,
  saveAllMastery,
  PHASE_QUESTS,
  calcProgressPct,
  ensureDailyPick,
  type AllPhaseMastery,
} from './lib/mastery';
import Header, { AppView } from './components/Header';
import MainContent from './components/MainContent';
import ProfileSection from './components/ProfileSection';
import BodySection from './components/BodySection';
import ConfidenceSection from './components/ConfidenceSection';
import SpaceSection from './components/SpaceSection';
import JournalSection from './components/JournalSection';
import FoodSection from './components/FoodSection';
import OnboardingFlow from './components/OnboardingFlow';
import DailyCheckinModal, { shouldShowCheckin } from './components/DailyCheckinModal';
import PhaseGraduationModal from './components/PhaseGraduationModal';
import ProtocolComplete from './components/ProtocolComplete';
import NotificationBanner from './components/NotificationBanner';
import MorningNudgePrompt from './components/MorningNudgePrompt';
import LovesSection from './components/LovesSection';
import './App.css';
import { syncToFrontDoor } from './services/camrynSyncService';

// Register service worker for push notifications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {/* silent */});
}

export interface PersonalNote {
  type: 'book' | 'goal' | 'task' | 'other';
  text: string;
  mentioned_at: string;
}

interface Session {
  id: string;
  current_phase: number;
  cycle_phase_name: string;
  cycle_day: number | null;
  last_period_date: string | null;
  energy: string;
  stress: string;
  save_count: number;
  phase_start_save_count: number;
  display_name: string | null;
  onboarding_complete: boolean;
  protocol_complete: boolean;
  protocol_completed_at: string | null;
  protocol_mode: string;
  personal_notes: PersonalNote[];
  last_winddown: string | null;
}

function computeIsNightMode(energyLevel: string): boolean {
  const hour = new Date().getHours();
  // Low-energy days: night mode starts at 7pm; otherwise 9pm
  const nightStart = energyLevel === 'Low' ? 19 : 21;
  return hour >= nightStart || hour < 5;
}

interface Unlock {
  id: string;
  phase_id: number;
  unlock_index: number;
  title: string;
  total_days: number;
  remaining_days: number;
  status: string;
}

const PHASE_COLORS: Record<number, { fill: string; track: string; soft: string }> = {
  1: { fill: 'var(--phase-1)', track: 'var(--phase-1-track)', soft: 'var(--phase-1-soft)' },
  2: { fill: 'var(--phase-2)', track: 'var(--phase-2-track)', soft: 'var(--phase-2-soft)' },
  3: { fill: 'var(--phase-3)', track: 'var(--phase-3-track)', soft: 'var(--phase-3-soft)' },
};

const BLANK_MASTERY: AllPhaseMastery = {
  phase1: { quests: {}, pickDate: '', pickId: '' },
  phase2: { quests: {}, pickDate: '', pickId: '' },
  phase3: { quests: {}, pickDate: '', pickId: '' },
  phase4: { quests: {}, pickDate: '', pickId: '' },
  phase5: { quests: {}, pickDate: '', pickId: '' },
  phase6: { quests: {}, pickDate: '', pickId: '' },
};

interface PhaseProgressBarProps {
  phase: number;
  phaseName: string;
  pct: number;
}

function PhaseProgressBar({ phase, phaseName, pct }: PhaseProgressBarProps) {
  const colors = PHASE_COLORS[phase] || PHASE_COLORS[1];
  return (
    <div className="phase-top-bar" style={{ background: colors.soft }}>
      <div className="phase-top-bar-inner">
        <span className="phase-top-label" style={{ color: colors.fill }}>
          Phase {phase} · {phaseName}
        </span>
        <div className="phase-top-track" style={{ background: colors.track }}>
          <div
            className="phase-top-fill"
            style={{ width: `${pct}%`, background: colors.fill }}
          />
        </div>
        <span className="phase-top-pct" style={{ color: colors.fill }}>{pct}%</span>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [unlocks, setUnlocks] = useState<Unlock[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [saveStatus, setSaveStatus] = useState('Not saved yet');
  const [view, setView] = useState<AppView>(() => {
    const saved = localStorage.getItem('camryn_view');
    const valid: AppView[] = ['today', 'body', 'food', 'confidence', 'space', 'journal', 'loves', 'profile'];
    return (saved && valid.includes(saved as AppView)) ? (saved as AppView) : 'today';
  });
  const handleViewChange = (v: AppView) => { setView(v); localStorage.setItem('camryn_view', v); };
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [allMastery, setAllMastery] = useState<AllPhaseMastery>(BLANK_MASTERY);
  const [graduatingPhase, setGraduatingPhase] = useState<number | null>(null);
  const [masteryLoaded, setMasteryLoaded] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [syncDot, setSyncDot] = useState<'synced' | 'saving' | 'idle'>('idle');
  const [savedToday, setSavedToday] = useState(false);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [daysSinceLastSave, setDaysSinceLastSave] = useState<number | null>(null);

  const firstTask = useMemo(() => {
    if (!session) return null;
    const tasks = dailyTasks(session.current_phase, session.energy, session.stress, session.cycle_phase_name);
    const t = tasks[0];
    if (!t) return null;
    const shortTag = (tag: string) => tag.split('·')[1]?.trim() || tag;
    return {
      shortTitle: (t as any).shortTitle || shortTag(t.tag),
      tag: shortTag(t.tag),
      body: t.body,
    };
  }, [session?.current_phase, session?.energy, session?.stress, session?.cycle_phase_name]);

  useEffect(() => {
    const autoSignIn = async () => {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (authSession?.user) {
        setUser(authSession.user);
        setLoading(false);
        loadSession(authSession.user.id);
        return;
      }

      // Try anonymous sign-in first (requires it to be enabled in Supabase dashboard)
      const { data: anonData } = await supabase.auth.signInAnonymously();
      if (anonData?.user) {
        setUser(anonData.user);
        setLoading(false);
        loadSession(anonData.user.id);
        return;
      }

      // Fallback: device-bound account stored in localStorage
      const DEVICE_KEY = 'camryn_device_id';
      let deviceId = localStorage.getItem(DEVICE_KEY);
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem(DEVICE_KEY, deviceId);
      }
      const email = `device-${deviceId}@camryn.app`;
      const password = `C${deviceId.replace(/-/g, '')}!`;

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (!signInError && signInData.user) {
        setUser(signInData.user);
        setLoading(false);
        loadSession(signInData.user.id);
        return;
      }

      // Account doesn't exist yet — create it
      const { data: signUpData } = await supabase.auth.signUp({ email, password });
      if (signUpData?.user) {
        setUser(signUpData.user);
        setLoading(false);
        loadSession(signUpData.user.id);
      } else {
        setLoading(false);
      }
    };

    autoSignIn();
  }, []);

  const loadSession = async (userId: string) => {
    let resolvedSession: Session | null = null;
    let localStreak = 0;
    let localSavedToday = false;
    const { data: sessionData } = await supabase
      .from('camryn_sessions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (sessionData) {
      // Auto-advance cycle phase from last_period_date every time app loads
      let patched: Partial<Session> = {};
      if (sessionData.last_period_date) {
        const currentDay = dayOfCycleFromDate(sessionData.last_period_date);
        const currentPhase = currentDay ? phaseFromDay(currentDay) : null;
        if (currentDay && currentPhase) {
          if (
            currentDay !== sessionData.cycle_day ||
            currentPhase.name !== sessionData.cycle_phase_name
          ) {
            patched = { cycle_day: currentDay, cycle_phase_name: currentPhase.name };
          }
        }
      }

      // Backfill name from auth metadata if not yet saved in session
      if (!sessionData.display_name) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const metaName = authUser?.user_metadata?.display_name as string | undefined;
        if (metaName) patched = { ...patched, display_name: metaName };
      }

      if (Object.keys(patched).length > 0) {
        const { data: updated } = await supabase
          .from('camryn_sessions')
          .update(patched as any)
          .eq('user_id', userId)
          .select()
          .maybeSingle();
        resolvedSession = { ...sessionData, ...patched, ...(updated ?? {}) } as Session;
        setSession(resolvedSession);
      } else {
        resolvedSession = sessionData as Session;
        setSession(resolvedSession);
      }
    } else {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const metaName = authUser?.user_metadata?.display_name as string | undefined;
      const newSession = {
        user_id: userId,
        current_phase: 1,
        cycle_phase_name: 'Not sure',
        cycle_day: null,
        last_period_date: null,
        energy: 'Medium',
        stress: 'Moderate',
        save_count: 0,
        display_name: metaName ?? null,
      };
      const { data } = await supabase.from('camryn_sessions').insert([newSession]).select().maybeSingle();
      if (data) { resolvedSession = data as Session; setSession(resolvedSession); }
    }

    const { data: unlocksData } = await supabase
      .from('camryn_unlocks')
      .select('*')
      .eq('user_id', userId);
    setUnlocks(unlocksData as Unlock[] || []);

    // Load all-phase mastery from Supabase
    const mastery = await loadAllMastery(userId);
    setAllMastery(mastery);
    setMasteryLoaded(true);

    // Compute daily save streak and days-since-last-save
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const { data: savesData } = await supabase
      .from('camryn_daily_saves')
      .select('save_date')
      .eq('user_id', userId)
      .gte('save_date', ninetyDaysAgo.toISOString().split('T')[0])
      .order('save_date', { ascending: false });
    if (savesData && savesData.length > 0) {
      const dates = new Set(savesData.map((r: any) => r.save_date as string));
      const todayStr = new Date().toISOString().split('T')[0];
      let streak = 0;
      let cursor = new Date();
      // Count streak — allow today or yesterday as start (today might not be saved yet)
      const startOffset = dates.has(todayStr) ? 0 : 1;
      cursor.setDate(cursor.getDate() - startOffset);
      while (true) {
        const d = cursor.toISOString().split('T')[0];
        if (!dates.has(d)) break;
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      }
      setDailyStreak(streak);
      localStreak = streak;
      // Days since last save
      const latest = savesData[0]?.save_date as string;
      const latestDate = new Date(latest + 'T12:00:00');
      const todayDate = new Date();
      todayDate.setHours(12, 0, 0, 0);
      const diff = Math.round((todayDate.getTime() - latestDate.getTime()) / 86400000);
      setDaysSinceLastSave(diff);
      if (diff === 0) { localSavedToday = true; setSavedToday(true); }
    } else {
      setDaysSinceLastSave(null);
    }

    setShowCheckin((prev) => prev || shouldShowCheckin());
    if (resolvedSession) {
      const _syncPhase = PROTOCOL.phases.find((p) => p.id === resolvedSession!.current_phase);
      const _syncTasks = dailyTasks(resolvedSession!.current_phase, resolvedSession!.energy, resolvedSession!.stress, resolvedSession!.cycle_phase_name);
      syncToFrontDoor({
        userId,
        protocolPhase: resolvedSession!.current_phase,
        protocolPhaseName: _syncPhase?.name ?? '',
        cyclePhase: resolvedSession!.cycle_phase_name,
        energy: resolvedSession!.energy,
        stress: resolvedSession!.stress,
        dailyStreak: localStreak,
        savedToday: localSavedToday,
        tasksComplete: 0,
        tasksTotal: 0,
        protocolComplete: resolvedSession!.protocol_complete ?? false,
        priorityTaskTitle: (_syncTasks[0] as any)?.shortTitle ?? null,
      }).catch(() => {});
    }
  };

  // Re-evaluate night mode every minute so the app transitions naturally at the threshold hour
  useEffect(() => {
    if (!session) return;
    setIsNightMode(computeIsNightMode(session.energy));
    const interval = setInterval(() => {
      setIsNightMode(computeIsNightMode(session.energy));
    }, 60_000);
    return () => clearInterval(interval);
  }, [session?.energy]);

  const updateSessionField = async (field: string, value: any) => {
    if (!session || !user) return;

    const { data } = await supabase
      .from('camryn_sessions')
      .update({ [field]: value } as any)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (data) setSession(data as Session);
    if (data && (field === 'energy' || field === 'stress')) {
      const _syncPhase = PROTOCOL.phases.find((p) => p.id === data.current_phase);
      const _syncTasks = dailyTasks(data.current_phase, data.energy, data.stress, data.cycle_phase_name);
      syncToFrontDoor({
        userId: user.id,
        protocolPhase: data.current_phase,
        protocolPhaseName: _syncPhase?.name ?? '',
        cyclePhase: data.cycle_phase_name,
        energy: data.energy,
        stress: data.stress,
        dailyStreak,
        savedToday,
        tasksComplete: 0,
        tasksTotal: 0,
        protocolComplete: data.protocol_complete ?? false,
        priorityTaskTitle: (_syncTasks[0] as any)?.shortTitle ?? null,
      }).catch(() => {});
    }
  };

  const handleCycleDateChange = (dateStr: string) => {
    const day = dayOfCycleFromDate(dateStr);
    if (day) {
      const phase = phaseFromDay(day);
      updateSessionField('last_period_date', dateStr);
      updateSessionField('cycle_day', day);
      updateSessionField('cycle_phase_name', phase.name);
    }
  };

  const handleSaveDay = async (tasksComplete: number, tasksTotal: number) => {
    if (!user || !session) return;

    const today = new Date().toISOString().split('T')[0];
    const isComplete = tasksComplete === tasksTotal;

    await supabase
      .from('camryn_daily_saves')
      .upsert([
        {
          user_id: user.id,
          save_date: today,
          tasks_complete: tasksComplete,
          tasks_total: tasksTotal,
          is_complete: isComplete,
        },
      ], { onConflict: 'user_id,save_date' });

    applyUnlockProgress(isComplete);

    setSyncDot('saving');
    setSaveStatus(
      isComplete
        ? `Saved just now · ${tasksComplete}/${tasksTotal} tasks complete`
        : `Saved just now · progress paused at ${tasksComplete}/${tasksTotal}`
    );

    await updateSessionField('save_count', (session.save_count || 0) + 1);
    setSyncDot('synced');
    setSavedToday(true);
    syncToFrontDoor({
      userId: user.id,
      protocolPhase: session.current_phase,
      protocolPhaseName: PROTOCOL.phases.find((p) => p.id === session.current_phase)?.name ?? '',
      cyclePhase: session.cycle_phase_name,
      energy: session.energy,
      stress: session.stress,
      dailyStreak,
      savedToday: true,
      tasksComplete,
      tasksTotal,
      protocolComplete: session.protocol_complete ?? false,
      priorityTaskTitle: firstTask?.shortTitle ?? null,
    }).catch(() => {});
    setDaysSinceLastSave(0);
    setDailyStreak((prev) => (prev === 0 ? 1 : prev));
    setTimeout(() => setSyncDot('idle'), 3000);
  };

  const applyUnlockProgress = async (savedCompleteDay: boolean) => {
    if (!user || !session) return;

    const phase = PROTOCOL.phases.find((p) => p.id === session.current_phase) || PROTOCOL.phases[0];
    const countdownSeeds = [21, 14, 14, 14, 14];

    let newUnlocks = [...unlocks];

    phase.mastery.forEach((title, idx) => {
      const seed = countdownSeeds[idx] || 14 + idx * 7;
      let existing = newUnlocks.find(
        (u) => u.phase_id === session.current_phase && u.unlock_index === idx
      );

      if (!existing) {
        existing = {
          id: '',
          phase_id: session.current_phase,
          unlock_index: idx,
          title,
          total_days: seed,
          remaining_days: seed,
          status: 'not_started',
        };
        newUnlocks.push(existing);
      }

      if (savedCompleteDay) {
        if (existing.status === 'not_started') existing.status = 'active';
        if (existing.status === 'paused') existing.status = 'active';
        if (existing.status === 'active' && existing.remaining_days > 0) {
          existing.remaining_days -= 1;
        }
        if (existing.remaining_days <= 0) {
          existing.remaining_days = 0;
          existing.status = 'done';
        }
      } else {
        if (existing.status === 'active') existing.status = 'paused';
      }
    });

    setUnlocks(newUnlocks);

    for (const unlock of newUnlocks) {
      if (unlock.id) {
        await supabase
          .from('camryn_unlocks')
          .update({
            remaining_days: unlock.remaining_days,
            status: unlock.status,
          })
          .eq('id', unlock.id);
      } else {
        await supabase.from('camryn_unlocks').insert([
          {
            user_id: user.id,
            phase_id: unlock.phase_id,
            unlock_index: unlock.unlock_index,
            title: unlock.title,
            total_days: unlock.total_days,
            remaining_days: unlock.remaining_days,
            status: unlock.status,
          },
        ]);
      }
    }
  };

  const handleOnboardingComplete = async (data: {
    name: string;
    cyclePhase: string;
    lastPeriodDate: string | null;
    goals: string[];
  }) => {
    if (!session || !user) return;
    const day = data.lastPeriodDate ? dayOfCycleFromDate(data.lastPeriodDate) : null;
    const phaseObj = day ? phaseFromDay(day) : null;
    const updates = {
      display_name: data.name,
      cycle_phase_name: phaseObj?.name ?? data.cyclePhase,
      cycle_day: day ?? null,
      last_period_date: data.lastPeriodDate ?? null,
      onboarding_complete: true,
    };
    const { data: updated } = await supabase
      .from('camryn_sessions')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (updated) {
      setSession(updated as Session);
      handleViewChange('today');
    }
  };

  const handlePhaseComplete = (completedPhase: number) => {
    // Don't re-show if already shown this session or already past this phase
    if (!session) return;
    if (session.current_phase !== completedPhase) return;
    // Slight delay so the last quest mark animation completes
    setTimeout(() => setGraduatingPhase(completedPhase), 600);
  };

  const handleAdvancePhase = async () => {
    if (!session || !user || graduatingPhase === null) return;
    const nextPhase = graduatingPhase + 1;

    if (nextPhase > 3) {
      // Protocol complete
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('camryn_sessions')
        .update({ protocol_complete: true, protocol_completed_at: now, current_phase: 3 })
        .eq('user_id', user.id)
        .select()
        .maybeSingle();
      if (data) setSession(data as Session);
      setGraduatingPhase(null);
      return;
    }

    const { data } = await supabase
      .from('camryn_sessions')
      .update({ current_phase: nextPhase, phase_start_save_count: session.save_count })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (data) setSession(data as Session);

    // Re-init mastery progress for the new phase
    const pKey = `phase${nextPhase}` as keyof AllPhaseMastery;
    const quests = PHASE_QUESTS[nextPhase] ?? PHASE_QUESTS[1];
    const phaseData = ensureDailyPick(allMastery[pKey], quests);
    setPhaseProgress(calcProgressPct(phaseData, quests));

    setGraduatingPhase(null);
  };

  const handleProtocolMaintain = async () => {
    if (!session || !user) return;
    const { data } = await supabase
      .from('camryn_sessions')
      .update({ protocol_mode: 'maintain' })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (data) setSession(data as Session);
  };

  const handleProtocolRestart = async () => {
    if (!session || !user) return;
    const blank: AllPhaseMastery = {
      phase1: { quests: {}, pickDate: '', pickId: '' },
      phase2: { quests: {}, pickDate: '', pickId: '' },
      phase3: { quests: {}, pickDate: '', pickId: '' },
      phase4: { quests: {}, pickDate: '', pickId: '' },
      phase5: { quests: {}, pickDate: '', pickId: '' },
      phase6: { quests: {}, pickDate: '', pickId: '' },
    };
    await saveAllMastery(user.id, blank);
    setAllMastery(blank);
    const { data } = await supabase
      .from('camryn_sessions')
      .update({ current_phase: 1, protocol_complete: false, protocol_completed_at: null, protocol_mode: 'protocol' })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (data) setSession(data as Session);
    setPhaseProgress(0);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!session) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Initializing...</div>;
  }

  // Show onboarding for new users who haven't completed it
  if (!session.onboarding_complete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const displayName = session.display_name?.trim() || null;

  // Protocol graduation screen
  if (session.protocol_complete && session.protocol_mode !== 'maintain') {
    return (
      <ProtocolComplete
        displayName={displayName}
        completedAt={session.protocol_completed_at}
        onMaintain={handleProtocolMaintain}
        onRestart={handleProtocolRestart}
      />
    );
  }

  const handleCheckinComplete = (energy: string, stress: string) => {
    updateSessionField('energy', energy);
    updateSessionField('stress', stress);
    setShowCheckin(false);
  };

  return (
    <div data-theme={theme} data-night={isNightMode ? 'true' : undefined} style={{ background: 'var(--bg)', color: 'var(--ink)', transition: 'background 0.6s ease, color 0.6s ease' }}>
      {/* Daily check-in modal — once per day */}
      {showCheckin && session && (
        <DailyCheckinModal
          initialEnergy={session.energy}
          initialStress={session.stress}
          onComplete={handleCheckinComplete}
          onDismiss={() => setShowCheckin(false)}
        />
      )}

      {/* Morning nudge push prompt — shown once after onboarding */}
      {session?.onboarding_complete && user && (
        <MorningNudgePrompt userId={user.id} />
      )}

      {/* Phase graduation modal — appears over the app */}
      {graduatingPhase !== null && graduatingPhase < 3 && (
        <PhaseGraduationModal
          completedPhase={graduatingPhase}
          displayName={displayName}
          onAdvance={handleAdvancePhase}
        />
      )}

      <NotificationBanner savedToday={savedToday} />

      <div className="app">
        <Header
          theme={theme}
          onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          saveStatus={saveStatus}
          syncDot={syncDot}
          onSignOut={() => { /* no-op: no login page */ }}
          view={view}
          onViewChange={handleViewChange}
          currentPhase={session.current_phase}
          displayName={displayName}
          dayCount={session.save_count || 0}
        />

        <PhaseProgressBar
          phase={session.current_phase}
          phaseName={PROTOCOL.phases.find(p => p.id === session.current_phase)?.name || ''}
          pct={phaseProgress}
        />

        <div className="lane-view">
          {view === 'today' && masteryLoaded && (
            <MainContent
              userId={user.id}
              session={session}
              allMastery={allMastery}
              onAllMasteryChange={setAllMastery}
              onSaveDay={handleSaveDay}
              onNavigateToJournal={() => handleViewChange('journal')}
              onNavigateTo={(v) => handleViewChange(v as AppView)}
              onPhaseProgressChange={setPhaseProgress}
              onPhaseComplete={handlePhaseComplete}
              dailyStreak={dailyStreak}
              daysSinceLastSave={daysSinceLastSave}
            />
          )}
          {view === 'body' && (
            <div className="lane-single">
              <BodySection
                userId={user.id}
                cyclePhase={session.cycle_phase_name}
                cycleDay={session.cycle_day}
                lastPeriodDate={session.last_period_date}
                onCyclePhaseChange={(name) => updateSessionField('cycle_phase_name', name)}
                onCycleDateChange={handleCycleDateChange}
              />
            </div>
          )}
          {view === 'food' && (
            <div className="lane-single">
              <FoodSection
                userId={user.id}
                currentPhase={session.current_phase}
                cyclePhase={session.cycle_phase_name}
              />
            </div>
          )}
          {view === 'confidence' && (
            <div className="lane-single">
              <ConfidenceSection userId={user.id} />
            </div>
          )}
          {view === 'space' && (
            <div className="lane-single">
              <SpaceSection userId={user.id} />
            </div>
          )}
          {view === 'journal' && (
            <div className="lane-single">
              <JournalSection
                userId={user.id}
                session={session}
                displayName={displayName}
                personalNotes={session.personal_notes ?? []}
                isNightMode={isNightMode}
                lastWinddown={session.last_winddown ?? null}
                allMastery={allMastery}
                firstTask={firstTask}
                onMasteryUpdate={(updated) => {
                  setAllMastery(updated);
                }}
                onNotesUpdate={(notes) => {
                  setSession((prev) => prev ? { ...prev, personal_notes: notes } : prev);
                  supabase
                    .from('camryn_sessions')
                    .update({ personal_notes: notes })
                    .eq('user_id', user.id);
                }}
                onWinddownUpdate={(summary) => {
                  setSession((prev) => prev ? { ...prev, last_winddown: summary } : prev);
                  supabase
                    .from('camryn_sessions')
                    .update({ last_winddown: summary })
                    .eq('user_id', user.id);
                }}
              />
            </div>
          )}
          {view === 'loves' && (
            <div className="lane-single">
              <LovesSection userId={user.id} />
            </div>
          )}
          {view === 'profile' && (
            <div className="lane-single">
              <ProfileSection userId={user.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default App;
