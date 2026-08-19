// Coaching sentences shown at the top of the Today screen.
// One sentence per day, cached in localStorage so it doesn't change on refresh.
// Derived purely from cycle phase + protocol phase — no network call needed.

interface SentenceBank {
  [cycleKey: string]: string[];
}

// Sentences are grouped by cycle phase name (lowercase, partial match).
// Each group has enough variety to rotate without feeling repetitive.
const CYCLE_SENTENCES: SentenceBank = {
  follicular: [
    'Estrogen is rising. This is your best window for building new habits — what you start now tends to stick.',
    "You're in Follicular. Your brain forms new patterns more easily right now. Use it.",
    'Rising estrogen means sharper focus and higher motivation. Good day to push a little.',
    "Follicular energy is real. Don't waste it on passive days.",
    "Your capacity to learn and retain is at a peak right now. Make today count.",
    "You're building momentum in Follicular. The effort you put in today compounds.",
  ],
  ovulation: [
    "Peak phase. Your strength, confidence, and social energy are all up. Make something happen today.",
    "You're at ovulation — highest estrogen and testosterone together. The hardest thing on your list belongs today.",
    'Peak performance window. If you\'ve been avoiding something, now is the time.',
    "Everything feels a little easier right now. That's not luck — it's biology. Use it.",
    "Ovulation is your highest-output window. Do the thing that requires the most of you.",
    'Your pain tolerance, grip strength, and focus are peaking. Train harder today if you can.',
  ],
  'early luteal': [
    "Early Luteal. Progesterone brings calm focus — good for deep, concentrated work.",
    "Your energy is steady right now. Less social, more internal. Use that for execution.",
    "Early Luteal is the best phase for finishing what Follicular started. Keep going.",
    "Progesterone is up — you may feel less social but more focused. That's the phase working.",
    "Calm, steady, capable. That's Early Luteal. Use the focus before the PMS window opens.",
    'Good phase for deep work. The noise settles down and you can actually concentrate.',
  ],
  'late luteal': [
    "PMS window. Stress tolerance is lower right now — that's biology, not failure. Protect your energy.",
    "Late Luteal. Do the work anyway, but shorter and gentler. Rest is protocol today.",
    "This is the hardest phase. Doing the tasks today counts for more than it looks like.",
    "Your nervous system is more reactive right now. That's real. Go easier on yourself.",
    "Late Luteal: honour what your body is doing while keeping the minimum alive.",
    "Showing up in Late Luteal is the hardest version of showing up. It still counts fully.",
  ],
  menstruation: [
    "First days of your period. Rest where you can. Gentle is the protocol today.",
    "Menstruation. Lowest hormone point of your cycle. Being here at all is the whole task.",
    "Period phase. Iron, warmth, and less pressure. The protocol adapts to this.",
    "Rest is not a break from the protocol — during menstruation, rest is the protocol.",
    "Day one or two of your period. The bar is lower today, intentionally.",
    "Your body is doing a lot right now. The tasks are lighter for a reason.",
  ],
};

const PHASE_SENTENCES: Record<number, string[]> = {
  1: [
    "You're building the foundation everything else rests on. Small actions, compounding quietly.",
    "Foundation phase. Sleep, hydration, gut health — the load-bearing work. Keep going.",
    "Phase 1 is invisible progress. You won't see it yet, but you're building it.",
    "The Foundation phase is where most people quit. You're still here.",
  ],
  2: [
    "Phase 2: Ignition. The transformation starts to feel active now.",
    "You're in Ignition — nutrition, movement, skin. Visible traction is coming.",
    "Phase 2 is where the work from Phase 1 starts paying out. Stay consistent.",
  ],
  3: [
    "Build phase. Your body is adapting to new standards. Keep the pressure on.",
    "Phase 3: your body is becoming something different. That takes showing up every day.",
    "Build phase. Strength, composition, hormones. You're doing the hard work now.",
  ],
};

const FALLBACK_SENTENCES = [
  "Three things. That's all today asks. Let's go.",
  "You're building something real. Today is one more day of it.",
  "Show up today. That's the whole protocol.",
  "The protocol is simple: do the work. You already know what it is.",
  "One day at a time. Today is the one that's in front of you.",
];

function pickForDay(sentences: string[], dateKey: string, salt: string): string {
  // Deterministic but varied: use date + salt to pick an index
  let hash = 0;
  const str = dateKey + salt;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return sentences[Math.abs(hash) % sentences.length];
}

function matchCycleKey(cyclePhase: string): string | null {
  const lower = cyclePhase.toLowerCase();
  if (lower.includes('follicular')) return 'follicular';
  if (lower.includes('ovulat')) return 'ovulation';
  if (lower.includes('early luteal') || lower.includes('early lut')) return 'early luteal';
  if (lower.includes('late luteal') || lower.includes('late lut') || lower.includes('pms')) return 'late luteal';
  if (lower.includes('menstruat') || lower.includes('period')) return 'menstruation';
  return null;
}

const CACHE_KEY = 'camryn_coaching_sentence';

interface CachedSentence {
  date: string;
  sentence: string;
}

export function getDailyCoachingSentence(cyclePhase: string, protocolPhase: number): string {
  const today = new Date().toISOString().split('T')[0];

  // Return cached sentence if it was generated today
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached: CachedSentence = JSON.parse(raw);
      if (cached.date === today) return cached.sentence;
    }
  } catch {
    // ignore malformed cache
  }

  // Pick sentence: prefer cycle-specific, fall back to phase-specific, then fallback
  const cycleKey = matchCycleKey(cyclePhase);
  let candidates: string[];

  if (cycleKey && CYCLE_SENTENCES[cycleKey]?.length) {
    candidates = CYCLE_SENTENCES[cycleKey];
  } else if (PHASE_SENTENCES[protocolPhase]?.length) {
    candidates = PHASE_SENTENCES[protocolPhase];
  } else {
    candidates = FALLBACK_SENTENCES;
  }

  const salt = `${cyclePhase}:${protocolPhase}`;
  const sentence = pickForDay(candidates, today, salt);

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, sentence }));
  } catch {
    // ignore storage errors
  }

  return sentence;
}

// How many protocol weeks fit in each phase (used for strip display)
const PHASE_WEEK_SPANS: Record<number, { totalWeeks: number; startWeek: number }> = {
  1: { totalWeeks: 6, startWeek: 1 },
  2: { totalWeeks: 6, startWeek: 7 },
  3: { totalWeeks: 10, startWeek: 13 },
  4: { totalWeeks: 10, startWeek: 23 },
  5: { totalWeeks: 12, startWeek: 33 },
  6: { totalWeeks: 8, startWeek: 45 },
};

export interface PhasePosition {
  dayInPhase: number;
  weekInPhase: number;
  totalWeeksInPhase: number;
}

export function getPhasePosition(
  saveCount: number,
  protocolPhase: number,
  phaseStartSaveCount = 0,
): PhasePosition {
  const span = PHASE_WEEK_SPANS[protocolPhase] ?? PHASE_WEEK_SPANS[1];
  // Days relative to when the user entered this phase.
  // For existing users where phaseStartSaveCount is 0 (column defaulted) and
  // protocolPhase > 1, we fall back to a 1-based floor so the strip shows
  // something sensible rather than a large incorrect number.
  const relative = phaseStartSaveCount > 0 || protocolPhase === 1
    ? Math.max(saveCount - phaseStartSaveCount, 1)
    : 1;
  // No cap here -- this used to clamp at totalDaysInPhase/totalWeeks, which
  // meant anyone who took longer than a phase's nominal length (missed days,
  // slower pace) would see the day/week counter freeze at the phase's last
  // day forever, even as real elapsed days kept climbing. totalWeeksInPhase
  // is a planned length, not a hard ceiling, so dayInPhase/weekInPhase should
  // keep counting past it rather than silently stall.
  const dayInPhase = relative;
  const weekInPhase = Math.ceil(dayInPhase / 7);
  return { dayInPhase, weekInPhase, totalWeeksInPhase: span.totalWeeks };
}

// Short completion notes shown in the persistent day-done state.
// Different tone from the coaching sentence: landing, not orienting.
const COMPLETION_CYCLE: SentenceBank = {
  follicular: [
    'Good use of a strong day.',
    'Your body was ready. You delivered.',
    'Follicular energy put to work. Well done.',
  ],
  ovulation: [
    'Peak window, used well.',
    "That's what your best days are for.",
    'You made something happen. That counts.',
  ],
  'early luteal': [
    'Steady work in a steady phase.',
    'Focused and done. Exactly right.',
    'The phase gave you concentration. You used it.',
  ],
  'late luteal': [
    'Showing up here is harder than it looks.',
    'The hardest version of showing up still counts fully.',
    'You did the work in the hardest window. That matters.',
  ],
  menstruation: [
    'You kept the minimum alive. Rest now.',
    'The bar was lower today, intentionally. You cleared it.',
    'Gentle and done. That was the protocol.',
  ],
};

const COMPLETION_PHASE: Record<number, string[]> = {
  1: [
    'Foundation, one more day deeper.',
    'Small consistent days compound quietly.',
    'The invisible work is still work.',
  ],
  2: [
    'Ignition days add up. This one did.',
    'Traction builds from days exactly like this.',
    'Phase 2 is moving. So are you.',
  ],
  3: [
    "You're shaping something. Keep going.",
    'Build phase, another day placed.',
    'The work is cumulative. Today contributed.',
  ],
};

const COMPLETION_FALLBACK = [
  'Done. That is the whole protocol.',
  'One day at a time. Today is done.',
  'That is all it takes. Show up, do the work.',
  'Small day, real progress.',
];

const COMPLETION_CACHE_KEY = 'camryn_completion_note';

export function getCompletionNote(cyclePhase: string, protocolPhase: number): string {
  const today = new Date().toISOString().split('T')[0];

  try {
    const raw = localStorage.getItem(COMPLETION_CACHE_KEY);
    if (raw) {
      const cached: CachedSentence = JSON.parse(raw);
      if (cached.date === today) return cached.sentence;
    }
  } catch { /* ignore */ }

  const cycleKey = matchCycleKey(cyclePhase);
  let candidates: string[];

  if (cycleKey && COMPLETION_CYCLE[cycleKey]?.length) {
    candidates = COMPLETION_CYCLE[cycleKey];
  } else if (COMPLETION_PHASE[protocolPhase]?.length) {
    candidates = COMPLETION_PHASE[protocolPhase];
  } else {
    candidates = COMPLETION_FALLBACK;
  }

  const salt = `completion:${cyclePhase}:${protocolPhase}`;
  const sentence = pickForDay(candidates, today, salt);

  try {
    localStorage.setItem(COMPLETION_CACHE_KEY, JSON.stringify({ date: today, sentence }));
  } catch { /* ignore */ }

  return sentence;
}
