import { supabase } from './supabase';

export interface Quest {
  id: string;
  title: string;
  targetDays: number;
  soft: boolean;
}

export interface QuestState {
  targetDays: number;
  completedDates: string[];
}

export interface MasteryData {
  quests: Record<string, QuestState>;
  pickDate: string;
  pickId: string;
}

export interface AllPhaseMastery {
  phase1: MasteryData;
  phase2: MasteryData;
  phase3: MasteryData;
  phase4: MasteryData;
  phase5: MasteryData;
  phase6: MasteryData;
}

// ── Quest definitions per phase ──────────────────────────────────────────────

export const FOUNDATION_QUESTS: Quest[] = [
  { id: 'fixed-sleep',          title: 'Fixed sleep/wake time',       targetDays: 21, soft: false },
  { id: 'morning-hydration',    title: 'Morning hydration',           targetDays: 14, soft: true  },
  { id: 'fiber-goal',           title: 'Fiber goal met',              targetDays: 14, soft: false },
  { id: 'fermented-food',       title: 'Fermented food daily',        targetDays: 14, soft: false },
  { id: 'daily-checkin',        title: 'Daily 5-minute check-in',     targetDays: 14, soft: true  },
  { id: 'screen-cutoff',        title: 'Screens off 45 min before bed', targetDays: 14, soft: true },
  { id: 'plant-diversity',      title: '5+ plant foods daily',        targetDays: 14, soft: false },
  { id: 'stress-breath',        title: 'Daily breathwork (1 min)',    targetDays: 14, soft: true  },
  { id: 'cool-room-sleep',      title: 'Cool room for sleep',         targetDays: 21, soft: true  },
  { id: 'no-caffeine-after-2',  title: 'No caffeine after 2pm',       targetDays: 14, soft: false },
];

export const IGNITION_QUESTS: Quest[] = [
  { id: 'protein-target',       title: 'Protein target 5/7 days',    targetDays: 21, soft: false },
  { id: 'eating-window',        title: 'Eating window maintained',   targetDays: 14, soft: false },
  { id: 'daily-walk',           title: 'Daily walk',                 targetDays: 30, soft: true  },
  { id: 'strength-2x',          title: 'Strength 2×/week',           targetDays: 28, soft: false },
  { id: 'skincare-routine',     title: 'Skincare routine',           targetDays: 30, soft: true  },
  { id: 'protein-breakfast',    title: 'Protein-first breakfast',    targetDays: 21, soft: false },
  { id: 'spf-daily',            title: 'SPF every morning',          targetDays: 30, soft: true  },
  { id: 'magnesium-pm',         title: 'Magnesium glycinate at night', targetDays: 21, soft: true },
  { id: 'cycle-tracking',       title: 'Daily cycle tracking',       targetDays: 28, soft: true  },
  { id: 'electrolytes-daily',   title: 'Electrolytes with hydration', targetDays: 14, soft: true },
];

export const BUILD_QUESTS: Quest[] = [
  { id: 'cycle-training',       title: 'Cycle-adapted training',     targetDays: 56, soft: false },
  { id: 'joint-mobility',       title: 'Joint mobility daily',       targetDays: 30, soft: true  },
  { id: 'omega3-daily',         title: 'Omega-3 daily',              targetDays: 60, soft: true  },
  { id: 'hormone-stack',        title: 'Hormone support stack',      targetDays: 60, soft: false },
  { id: 'hormone-bloodwork',    title: 'Hormone bloodwork done',     targetDays: 1,  soft: false },
  { id: 'strength-3x',          title: 'Strength 3×/week',           targetDays: 28, soft: false },
  { id: 'progressive-overload', title: 'Progressive overload logged', targetDays: 28, soft: false },
  { id: 'seed-cycling',         title: 'Seed cycling daily',         targetDays: 28, soft: true  },
  { id: 'collagen-daily',       title: 'Collagen supplement daily',  targetDays: 30, soft: true  },
  { id: 'stress-log',           title: 'Daily stress check-in',      targetDays: 21, soft: true  },
];

export const INTEGRATE_QUESTS: Quest[] = [
  { id: 'daily-breathwork',     title: 'Daily breathwork practice',  targetDays: 30, soft: true  },
  { id: 'cold-exposure',        title: 'Cold exposure 3×/week',      targetDays: 42, soft: false },
  { id: 'identity-journal',     title: 'Weekly identity journal',    targetDays: 8,  soft: true  },
  { id: 'needs-conversation',   title: 'Needs conversation done',    targetDays: 1,  soft: false },
  { id: 'environment-audit',    title: 'Environment audit done',     targetDays: 1,  soft: false },
  { id: 'cycle-social-cal',     title: 'Cycle-aligned social calendar', targetDays: 28, soft: true },
  { id: 'hrv-baseline',         title: 'HRV/RHR baseline set',       targetDays: 1,  soft: false },
  { id: 'stress-recovery-5min', title: 'Stress recovery ≤5 min × 3', targetDays: 3,  soft: false },
  { id: 'hard-thing-follicular', title: 'Hard thing in follicular',  targetDays: 1,  soft: false },
  { id: 'full-protocol-hard-week', title: 'Protocol through hard week', targetDays: 7, soft: false },
];

export const SUSTAIN_QUESTS: Quest[] = [
  { id: 'zone2-cardio',         title: 'Zone 2 cardio 2×/week',      targetDays: 56, soft: false },
  { id: 'disruption-protocol',  title: 'Protocol through disruption', targetDays: 7, soft: false },
  { id: 'annual-bloodwork',     title: 'Annual bloodwork done',       targetDays: 1,  soft: false },
  { id: 'purpose-statement',    title: 'Purpose statement written',   targetDays: 1,  soft: false },
  { id: 'bone-loading-weekly',  title: 'Bone-loading movement weekly', targetDays: 8, soft: false },
  { id: 'travel-protocol',      title: 'Travel protocol tested',      targetDays: 1,  soft: false },
  { id: 'min-dose-documented',  title: 'Minimum dose protocol written', targetDays: 1, soft: false },
  { id: 'health-identity-act',  title: 'External health identity act', targetDays: 1, soft: false },
  { id: 'arc2-goals-review',    title: 'Arc 2 goals reviewed',        targetDays: 1,  soft: false },
  { id: 'protocol-12wk-hold',   title: '12 weeks ≥80% adherence',     targetDays: 84, soft: false },
];

export const THRIVE_QUESTS: Quest[] = [
  { id: 'arc1-review-written',  title: 'Arc 1 review written',        targetDays: 1,  soft: false },
  { id: 'phase6-modules-done',  title: 'All Phase 6 modules done',    targetDays: 1,  soft: false },
  { id: 'mentored-someone',     title: 'Mentored someone in health',  targetDays: 1,  soft: false },
  { id: 'arc2-vision-doc',      title: 'Arc 2 vision documented',     targetDays: 1,  soft: false },
  { id: 'arc2-priorities-set',  title: 'Arc 2 top 3 priorities set',  targetDays: 1,  soft: false },
  { id: 'maintenance-tested',   title: 'Maintenance protocol tested', targetDays: 14, soft: false },
  { id: 'all-phases-mastery',   title: 'All previous phases mastered', targetDays: 1, soft: false },
  { id: 'year-completion',      title: 'Full year protocol complete', targetDays: 1,  soft: false },
  { id: '52wk-adherence',       title: '52 weeks partial adherence',  targetDays: 364, soft: true },
  { id: 'arc2-ready',           title: 'Ready for Arc 2',             targetDays: 1,  soft: false },
];

export const PHASE_QUESTS: Record<number, Quest[]> = {
  1: FOUNDATION_QUESTS,
  2: IGNITION_QUESTS,
  3: BUILD_QUESTS,
  4: INTEGRATE_QUESTS,
  5: SUSTAIN_QUESTS,
  6: THRIVE_QUESTS,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function prevDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function calcStreak(completedDates: string[], targetDays: number): number {
  const today = new Date().toISOString().split('T')[0];
  const sorted = [...completedDates].sort().reverse();
  let streak = 0;
  let cursor = today;
  for (const d of sorted) {
    if (d === cursor) {
      streak++;
      cursor = prevDay(cursor);
      if (streak >= targetDays) break;
    } else if (d < cursor) {
      break;
    }
  }
  return streak;
}

export function isTodayCompleted(completedDates: string[]): boolean {
  const today = new Date().toISOString().split('T')[0];
  return completedDates.includes(today);
}

export function toggleToday(completedDates: string[]): string[] {
  const today = new Date().toISOString().split('T')[0];
  return completedDates.includes(today)
    ? completedDates.filter((d) => d !== today)
    : [...completedDates, today];
}

export function isPhaseComplete(data: MasteryData, quests: Quest[]): boolean {
  return quests.every((q) => {
    const qs = data.quests[q.id];
    if (!qs) return false;
    return calcStreak(qs.completedDates, q.targetDays) >= q.targetDays;
  });
}

export function calcProgressPct(data: MasteryData, quests: Quest[]): number {
  const totalTarget = quests.reduce((acc, q) => acc + q.targetDays, 0);
  const totalEarned = quests.reduce((acc, q) => {
    const qs = data.quests[q.id];
    if (!qs) return acc;
    return acc + Math.min(calcStreak(qs.completedDates, q.targetDays), q.targetDays);
  }, 0);
  return totalTarget > 0 ? Math.round((totalEarned / totalTarget) * 100) : 0;
}

// ── Default blank MasteryData for a phase ─────────────────────────────────────

function blankMasteryData(quests: Quest[]): MasteryData {
  return {
    quests: Object.fromEntries(
      quests.map((q) => [q.id, { targetDays: q.targetDays, completedDates: [] }])
    ),
    pickDate: '',
    pickId: '',
  };
}

// ── localStorage (legacy Phase 1 only) ───────────────────────────────────────

const LEGACY_KEY = 'camrynMasteryFoundation';

function loadLegacyMastery(): MasteryData | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw) return JSON.parse(raw) as MasteryData;
  } catch {
    // ignore
  }
  return null;
}

export function saveMasteryData(_data: MasteryData): void {
  // No-op — mastery is now persisted to Supabase only.
  // Kept for call-site compatibility during transition.
}

// ── Supabase persistence ───────────────────────────────────────────────────────

export async function loadAllMastery(userId: string): Promise<AllPhaseMastery> {
  const { data } = await supabase
    .from('camryn_sessions')
    .select('mastery_data')
    .eq('user_id', userId)
    .maybeSingle();

  const remote = (data?.mastery_data as AllPhaseMastery | null) ?? null;

  // If nothing stored remotely, check localStorage for legacy phase 1 data
  const legacy = loadLegacyMastery();

  const p1 = remote?.phase1 ?? legacy ?? blankMasteryData(FOUNDATION_QUESTS);
  const p2 = remote?.phase2 ?? blankMasteryData(IGNITION_QUESTS);
  const p3 = remote?.phase3 ?? blankMasteryData(BUILD_QUESTS);
  const p4 = remote?.phase4 ?? blankMasteryData(INTEGRATE_QUESTS);
  const p5 = remote?.phase5 ?? blankMasteryData(SUSTAIN_QUESTS);
  const p6 = remote?.phase6 ?? blankMasteryData(THRIVE_QUESTS);

  // Ensure all quest keys exist (in case new quests were added)
  const phaseQuestPairs: [MasteryData, Quest[]][] = [
    [p1, FOUNDATION_QUESTS],
    [p2, IGNITION_QUESTS],
    [p3, BUILD_QUESTS],
    [p4, INTEGRATE_QUESTS],
    [p5, SUSTAIN_QUESTS],
    [p6, THRIVE_QUESTS],
  ];
  for (const [pData, quests] of phaseQuestPairs) {
    for (const q of quests) {
      if (!pData.quests[q.id]) pData.quests[q.id] = { targetDays: q.targetDays, completedDates: [] };
    }
  }

  return { phase1: p1, phase2: p2, phase3: p3, phase4: p4, phase5: p5, phase6: p6 };
}

export async function saveAllMastery(userId: string, all: AllPhaseMastery): Promise<void> {
  await supabase
    .from('camryn_sessions')
    .update({ mastery_data: all as any })
    .eq('user_id', userId);
}

// ── Daily pick ────────────────────────────────────────────────────────────────

export function chooseDailyPick(data: MasteryData, quests: Quest[], totalDaysCompleted: number): string {
  const incompletes = quests.filter((q) => {
    const state = data.quests[q.id];
    if (!state) return true;
    return calcStreak(state.completedDates, state.targetDays) < state.targetDays;
  });
  if (incompletes.length === 0) return '';

  const pool =
    totalDaysCompleted < 7
      ? incompletes.filter((q) => q.soft).length > 0
        ? incompletes.filter((q) => q.soft)
        : incompletes
      : incompletes;

  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx].id;
}

export function ensureDailyPick(data: MasteryData, quests: Quest[]): MasteryData {
  const today = new Date().toISOString().split('T')[0];
  if (data.pickDate === today && data.pickId) return data;

  const totalDone = Object.values(data.quests).reduce(
    (acc, qs) => acc + qs.completedDates.length,
    0
  );
  const pickId = chooseDailyPick(data, quests, totalDone);
  return { ...data, pickDate: today, pickId };
}

// Legacy shim — kept so App.tsx calcPhaseProgress still compiles until refactored
export function loadMasteryData(): MasteryData {
  return loadLegacyMastery() ?? blankMasteryData(FOUNDATION_QUESTS);
}
