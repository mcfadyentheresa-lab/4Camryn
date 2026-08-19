import { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from './lib/supabase';
import { PROTOCOL, dayOfCycleFromDate, phaseFromDay, dailyTasks, daysCompletedInPhase } from './lib/protocol';
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
import InspirationSection from './components/InspirationSection';
import './App.css';
import { syncToFrontDoor, fetchFrontDoorCompletions, subscribeFrontDoorCompletions } from './services/camrynSyncService';
import Login from './Login';

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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('camryn_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === 'light' ? 'dark' : 'light';
      localStorage.setItem('camryn_theme', next);
      return next;
    });
  };
  const [view, setView] = useState<AppView>(() => {
    const saved = localStorage.getItem('camryn_view');
    const valid: AppView[] = ['today', 'body', 'food', 'confidence', 'space', 'journal', 'inspiration', 'profile'];
    return (saved && valid.includes(saved as AppView)) ? (saved as AppView) : 'today';
  });
  const handleViewChange = (v: AppView) => { setView(v); localStorage.setItem('camryn_view', v); };
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [allMastery, setAllMastery] = useState<AllPhaseMastery>(BLANK_MASTERY);
  const [graduatingPhase, setGraduatingPhase] = useState<number | null>(null);
  const [masteryLoaded, setMasteryLoaded] = useState(false);
  const [showCheckin, setShowCheckin] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);
  const [syncDot, setSyncDot] = useState<'synced' | 'saving' | 'idle' | 'error'>('idle');
  const [savedToday, setSavedToday] = useState(false);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const showSaveError = saveErrorMsg !== null;
  const saveRetryFnRef = useRef<(() => Promise<void>) | null>(null);

  const dismissSaveError = () => {
    setSaveErrorMsg(null);
    saveRetryFnRef.current = null;
    if (syncDot === 'error') setSyncDot('idle');
  };
  const retrySaveError = () => {
    const fn = saveRetryFnRef.current;
    saveRetryFnRef.current = null;
    setSaveErrorMsg(null);
    if (fn) fn();
  };
  const [dailyStreak, setDailyStreak] = useState(0);
  const [daysSinceLastSave, setDaysSinceLastSave] = useState<number | null>(null);
  const [frontDoorCompletions, setFrontDoorCompletions] = useState<number[]>([]);
  const frontDoorChannelRef = useRef<ReturnType<typeof subscribeFrontDoorCompletions> | null>(null);

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

  const allTaskShortTitles = useMemo(() => {
    if (!session) return [];
    const shortTag = (tag: string) => tag.split('·')[1]?.trim() || tag;
    return dailyTasks(session.current_phase, session.energy, session.stress, session.cycle_phase_name)
      .map((t) => (t as any).shortTitle || shortTag(t.tag));
  }, [session?.current_phase, session?.energy, session?.stress, session?.cycle_phase_name]);

  useEffect(() => {
    const init = async () => {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (authSession?.user) {
        setUser(authSession.user);
        setLoading(false);
        loadSession(authSession.user.id);
      } else {
        setLoading(false);
      }
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession?.user) {
        setUser(newSession.user);
        loadSession(newSession.user.id);
      } else {
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadSession = async (userId: string) => {
    let resolvedSession: Session | null = null;
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
        const { data: updated, error: patchError } = await supabase
          .from('camryn_sessions')
          .update(patched as any)
          .eq('user_id', userId)
          .select()
          .maybeSingle();
        if (patchError) {
          console.error('session auto-patch failed:', patchError);
        }
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
      const { data: inserted, error: insertError } = await supabase.from('camryn_sessions').insert([newSession]).select().maybeSingle();
      if (insertError) {
        console.error('session insert failed:', insertError);
      } else if (inserted) {
        resolvedSession = inserted as Session;
        setSession(resolvedSession);
      }
    }

    // Load all-phase mastery from Supabase
    const mastery = await loadAllMastery(userId);
    setAllMastery(mastery);
    setMasteryLoaded(true);

    // Check if any tasks were completed in Front Door today, then subscribe for real-time updates
    fetchFrontDoorCompletions(userId).then(setFrontDoorCompletions).catch(() => {});
    if (frontDoorChannelRef.current) {
      frontDoorChannelRef.current.unsubscribe();
    }
    frontDoorChannelRef.current = subscribeFrontDoorCompletions(userId, setFrontDoorCompletions);

    // Compute daily save streak and days-since-last-save.
    // Deliberately no date-range filter here -- this used to only look back
    // 90 days, which silently truncated any streak longer than that (the
    // backward-walking loop below would hit a day outside the fetched
    // window and stop, even though the real streak continued further back)
    // and made daysSinceLastSave/the "welcome back" messaging go blank for
    // anyone returning after more than 90 days away, instead of showing the
    // real gap. One row per day for this user is small even after years of
    // use, so fetching the full history isn't a real cost.
    const { data: savesData } = await supabase
      .from('camryn_daily_saves')
      .select('save_date, tasks_complete, tasks_total')
      .eq('user_id', userId)
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
      // Days since last save
      const latest = savesData[0]?.save_date as string;
      const latestDate = new Date(latest + 'T12:00:00');
      const todayDate = new Date();
      todayDate.setHours(12, 0, 0, 0);
      const diff = Math.round((todayDate.getTime() - latestDate.getTime()) / 86400000);
      setDaysSinceLastSave(diff);
      if (diff === 0) {
        setSavedToday(true);
      }
    } else {
      setDaysSinceLastSave(null);
    }

    setShowCheckin((prev) => prev || shouldShowCheckin());
    if (resolvedSession) {
      const _syncTasks = dailyTasks(resolvedSession!.current_phase, resolvedSession!.energy, resolvedSession!.stress, resolvedSession!.cycle_phase_name);
      const _syncShortTag = (tag: string) => tag.split('·')[1]?.trim() || tag;
      const _syncTaskTitles = _syncTasks.map((t) => (t as any).shortTitle || _syncShortTag(t.tag));
      syncToFrontDoor({
        userId,
        energy: resolvedSession!.energy,
        taskShortTitles: _syncTaskTitles,
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

  const updateSessionField = async (field: string, value: any): Promise<boolean> => {
    if (!session || !user) return false;

    const { data, error } = await supabase
      .from('camryn_sessions')
      .update({ [field]: value } as any)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error(`updateSessionField failed (${field}):`, error);
      return false;
    }

    if (data) setSession(data as Session);
    if (data && (field === 'energy' || field === 'stress')) {
      const _syncTasks = dailyTasks(data.current_phase, data.energy, data.stress, data.cycle_phase_name);
      const _syncShortTag = (tag: string) => tag.split('·')[1]?.trim() || tag;
      syncToFrontDoor({
        userId: user.id,
        energy: data.energy,
        taskShortTitles: _syncTasks.map((t) => (t as any).shortTitle || _syncShortTag(t.tag)),
      }).catch(() => {});
    }
    return true;
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

  const handleSaveDay = async (tasksComplete: number, tasksTotal: number, checkedItems?: boolean[]) => {
    if (!user || !session) return;

    const today = new Date().toISOString().split('T')[0];
    const isComplete = tasksComplete === tasksTotal;

    const attemptSave = async () => {
      setSyncDot('saving');

      const { error: dailySaveError } = await supabase
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

      if (dailySaveError) {
        console.error('dailySave upsert failed:', dailySaveError);
        setSyncDot('error');
        setSaveErrorMsg('Could not save today\u2019s progress. Your work is still here — just needs to sync.');
        saveRetryFnRef.current = attemptSave;
        return;
      }

      const { count: realSaveCount, error: countError } = await supabase
        .from('camryn_daily_saves')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_complete', true);
      if (countError) {
        console.error('save_count recompute failed:', countError);
      } else if (realSaveCount !== null) {
        await updateSessionField('save_count', realSaveCount);
      }

      setSyncDot('synced');
      setSavedToday(true);
      syncToFrontDoor({
        userId: user.id,
        energy: session.energy,
        taskShortTitles: allTaskShortTitles,
        checkedItems,
      }).catch(() => {});
      setDaysSinceLastSave(0);
      setDailyStreak((prev) => (prev === 0 ? 1 : prev));
      setTimeout(() => setSyncDot('idle'), 3000);
    };

    attemptSave();
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
    const { data: updated, error } = await supabase
      .from('camryn_sessions')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (error) {
      console.error('onboarding complete failed:', error);
      setSaveErrorMsg('Could not save your onboarding. Please try again.');
      saveRetryFnRef.current = () => handleOnboardingComplete(data);
      return;
    }
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

    if (nextPhase > 6) {
      // Protocol complete
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('camryn_sessions')
        .update({ protocol_complete: true, protocol_completed_at: now, current_phase: 6 })
        .eq('user_id', user.id)
        .select()
        .maybeSingle();
      if (error) {
        console.error('protocol complete failed:', error);
        setSaveErrorMsg('Could not complete the protocol. Please try again.');
        saveRetryFnRef.current = () => handleAdvancePhase();
        return;
      }
      if (data) setSession(data as Session);
      setGraduatingPhase(null);
      return;
    }

    const { data, error: advanceError } = await supabase
      .from('camryn_sessions')
      .update({ current_phase: nextPhase, phase_start_save_count: session.save_count })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (advanceError) {
      console.error('advance phase failed:', advanceError);
      setSaveErrorMsg('Could not advance to the next phase. Please try again.');
      saveRetryFnRef.current = () => handleAdvancePhase();
      return;
    }
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
    const { data, error } = await supabase
      .from('camryn_sessions')
      .update({ protocol_mode: 'maintain' })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (error) {
      console.error('protocol maintain failed:', error);
      setSaveErrorMsg('Could not switch to maintain mode. Please try again.');
      saveRetryFnRef.current = () => handleProtocolMaintain();
      return;
    }
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
    try {
      await saveAllMastery(user.id, blank);
    } catch (err) {
      console.error('protocol restart failed (mastery reset):', err);
      setSaveErrorMsg('Could not restart the protocol. Please try again.');
      saveRetryFnRef.current = () => handleProtocolRestart();
      return;
    }
    setAllMastery(blank);
    const { data, error } = await supabase
      .from('camryn_sessions')
      .update({ current_phase: 1, protocol_complete: false, protocol_completed_at: null, protocol_mode: 'protocol' })
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (error) {
      console.error('protocol restart failed:', error);
      setSaveErrorMsg('Could not restart the protocol. Please try again.');
      saveRetryFnRef.current = () => handleProtocolRestart();
      return;
    }
    if (data) setSession(data as Session);
    setPhaseProgress(0);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  if (!session) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Something went wrong setting up your account.</p>
        <button onClick={() => loadSession(user.id)} style={{ padding: '10px 20px', fontSize: '16px' }}>
          Try again
        </button>
      </div>
    );
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
    <div data-theme={theme} data-night={isNightMode ? 'true' : undefined} style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--ink)', transition: 'background 0.6s ease, color 0.6s ease' }}>
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

      {/* Phase graduation modal — appears over the app. PhaseGraduationModal
          itself branches on completedPhase === 6 to show the "Complete
          Protocol" ending instead of a "start next phase" teaser, so this
          renders for every phase, not just 1-5. */}
      {graduatingPhase !== null && (
        <PhaseGraduationModal
          completedPhase={graduatingPhase}
          displayName={displayName}
          onAdvance={handleAdvancePhase}
        />
      )}

      <NotificationBanner savedToday={savedToday} />

      {showSaveError && (
        <div className="save-error-toast">
          <span className="save-error-toast-text">{saveErrorMsg}</span>
          <div className="save-error-toast-actions">
            <button className="save-error-toast-btn save-error-toast-btn--dismiss" onClick={dismissSaveError}>Dismiss</button>
            <button className="save-error-toast-btn save-error-toast-btn--retry" onClick={retrySaveError}>Retry</button>
          </div>
        </div>
      )}

      <div className="app">
        <Header
          syncDot={syncDot}
          view={view}
          onViewChange={handleViewChange}
          currentPhase={session.current_phase}
          displayName={displayName}
          theme={theme}
          onThemeToggle={toggleTheme}
          dayCount={daysCompletedInPhase(session.save_count, session.phase_start_save_count)}
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
              frontDoorCompletions={frontDoorCompletions}
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
              <ConfidenceSection userId={user.id} onNavigateTo={(v) => handleViewChange(v as AppView)} />
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
                onNotesUpdate={async (notes) => {
                  setSession((prev) => prev ? { ...prev, personal_notes: notes } : prev);
                  const { error } = await supabase
                    .from('camryn_sessions')
                    .update({ personal_notes: notes })
                    .eq('user_id', user.id);
                  if (error) console.error('notes update failed:', error);
                }}
                onWinddownUpdate={async (summary) => {
                  setSession((prev) => prev ? { ...prev, last_winddown: summary } : prev);
                  const { error } = await supabase
                    .from('camryn_sessions')
                    .update({ last_winddown: summary })
                    .eq('user_id', user.id);
                  if (error) console.error('winddown update failed:', error);
                }}
              />
            </div>
          )}
          {view === 'inspiration' && (
            <div className="lane-single">
              <InspirationSection userId={user.id} />
            </div>
          )}
          {view === 'profile' && (
            <div className="lane-single">
              <ProfileSection userId={user.id} onReset={() => loadSession(user.id)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default App;
