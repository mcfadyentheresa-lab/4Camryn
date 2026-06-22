export type Goal = 'lose' | 'maintain' | 'build';
export type ActivityBaseline = 'sedentary' | 'lightly_active' | 'active';

export interface FoodProfile {
  height_cm: number | null;
  weight_kg: number | null;
  age: number | null;
  goal: Goal;
  activity_baseline: ActivityBaseline;
}

export interface MacroTargets {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  note: string;
}

// Mifflin-St Jeor for females
function bmr(weight_kg: number, height_cm: number, age: number): number {
  return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityBaseline, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  active: 1.55,
};

// Phase/cycle adjustments to calories
const PHASE_ADJUSTMENTS: Record<number, number> = {
  1: 0,      // Foundation — maintain
  2: -200,   // Ignition — mild deficit for composition
  3: 100,    // Build — slight surplus to support muscle
};

const CYCLE_ADJUSTMENTS: Record<string, number> = {
  'Late luteal': 100,   // Slightly higher need pre-period
  'Menstruation': 50,   // Minor increase during bleed
  'Follicular': 0,
  'Ovulation': -50,     // Metabolism dips slightly
  'Early luteal': 0,
  'Not sure': 0,
};

// When not exercising: reduce calories (no exercise burn), reduce carbs
const REST_DAY_ADJUSTMENT = -200;

// === Input validation allowlists and sane ranges ===

const VALID_GOALS = new Set<string>(['lose', 'maintain', 'build']);
const VALID_ACTIVITY_BASELINES = new Set<string>(['sedentary', 'lightly_active', 'active']);
// Must match CYCLE_ADJUSTMENTS keys above
const VALID_CYCLE_PHASES = new Set<string>([
  'Follicular', 'Ovulation', 'Early luteal', 'Late luteal', 'Menstruation', 'Not sure',
]);

const WEIGHT_KG_RANGE: [number, number] = [20, 300];
const HEIGHT_CM_RANGE: [number, number] = [100, 250];
const AGE_RANGE: [number, number] = [10, 120];

function clampWithWarn(value: number, [min, max]: [number, number], field: string): number {
  if (value < min || value > max) {
    console.warn(`[calcMacroTargets] ${field}=${value} outside sane range [${min}–${max}]; clamped.`);
    return Math.max(min, Math.min(max, value));
  }
  return value;
}

export function calcMacroTargets(
  profile: FoodProfile,
  opts: {
    phase: number;
    cyclePhase: string;
    exercised: boolean;
  }
): MacroTargets {
  // Sanitize profile inputs
  let weight_kg = profile.weight_kg;
  let height_cm = profile.height_cm;
  let age = profile.age;
  let { goal, activity_baseline } = profile;

  if (weight_kg != null) weight_kg = clampWithWarn(weight_kg, WEIGHT_KG_RANGE, 'weight_kg');
  if (height_cm != null) height_cm = clampWithWarn(height_cm, HEIGHT_CM_RANGE, 'height_cm');
  if (age != null) age = clampWithWarn(age, AGE_RANGE, 'age');

  if (!VALID_GOALS.has(goal)) {
    console.warn(`[calcMacroTargets] Unknown goal "${goal}" — falling back to "maintain".`);
    goal = 'maintain';
  }
  if (!VALID_ACTIVITY_BASELINES.has(activity_baseline)) {
    // Critical: unknown key makes ACTIVITY_MULTIPLIERS lookup return undefined → NaN TDEE
    console.warn(`[calcMacroTargets] Unknown activity_baseline "${activity_baseline}" — falling back to "lightly_active".`);
    activity_baseline = 'lightly_active';
  }

  // Phases 1–3 have distinct macro mappings; 4–6 follow phase-3 nutrition targets
  let phase = opts.phase;
  let cyclePhase = opts.cyclePhase;
  const { exercised } = opts;

  if (!Number.isInteger(phase) || phase < 1) {
    console.warn(`[calcMacroTargets] phase ${phase} is invalid — clamped to 1.`);
    phase = 1;
  } else if (phase > 3) {
    console.warn(`[calcMacroTargets] phase ${phase} has no macro mapping — clamped to 3.`);
    phase = 3;
  }
  if (!VALID_CYCLE_PHASES.has(cyclePhase)) {
    console.warn(`[calcMacroTargets] Unknown cyclePhase "${cyclePhase}" — falling back to "Not sure".`);
    cyclePhase = 'Not sure';
  }

  // If no profile data, return sensible defaults
  if (!weight_kg || !height_cm || !age) {
    return defaultTargets(exercised, phase, goal);
  }

  const baseBmr = bmr(weight_kg, height_cm, age);
  let tdee = baseBmr * ACTIVITY_MULTIPLIERS[activity_baseline];

  // Goal adjustment
  if (goal === 'lose') tdee -= 300;
  if (goal === 'build') tdee += 200;

  // Phase adjustment
  tdee += PHASE_ADJUSTMENTS[phase] ?? 0;

  // Cycle adjustment
  tdee += CYCLE_ADJUSTMENTS[cyclePhase] ?? 0;

  // Rest day: pull back on calories and carbs
  if (!exercised) tdee += REST_DAY_ADJUSTMENT;

  const calories = Math.round(tdee / 10) * 10; // Round to nearest 10

  // Protein: 1.6–2.2g/kg depending on phase and goal
  const proteinMultiplier =
    phase === 3 ? 2.0 :
    phase === 2 ? 1.8 :
    goal === 'build' ? 1.8 : 1.6;
  const protein_g = Math.round(weight_kg * proteinMultiplier);

  // Carbs: reduced on rest days, higher on exercise days in Phase 2+
  const carbPct = exercised
    ? (phase >= 2 ? 0.40 : 0.35)
    : 0.30;
  const carbs_g = Math.round((calories * carbPct) / 4);

  // Fat: fill remaining calories after protein + carbs
  const proteinCals = protein_g * 4;
  const carbCals = carbs_g * 4;
  const fat_g = Math.max(40, Math.round((calories - proteinCals - carbCals) / 9));

  // Fiber: 25–35g, higher on rest days (gut focus)
  const fiber_g = exercised ? 28 : 32;

  const note = buildNote(exercised, cyclePhase, phase, goal);

  return { calories, protein_g, carbs_g, fat_g, fiber_g, note };
}

function defaultTargets(exercised: boolean, phase: number, goal: Goal): MacroTargets {
  const calories = exercised ? (phase === 3 ? 2100 : phase === 2 ? 1800 : 1900) : (phase === 3 ? 1900 : 1600);
  return {
    calories: goal === 'build' ? calories + 200 : goal === 'lose' ? calories - 200 : calories,
    protein_g: phase === 3 ? 130 : phase === 2 ? 115 : 100,
    carbs_g: exercised ? 200 : 140,
    fat_g: 65,
    fiber_g: exercised ? 28 : 32,
    note: buildNote(exercised, 'Not sure', phase, goal),
  };
}

function buildNote(exercised: boolean, cyclePhase: string, phase: number, goal: Goal): string {
  const parts: string[] = [];

  if (!exercised) {
    parts.push('Rest day targets — carbs and calories pulled back. Focus on protein and fiber.');
  } else {
    parts.push('Exercise day targets — carbs higher to fuel recovery.');
  }

  if (cyclePhase === 'Late luteal') {
    parts.push('Late luteal: slight calorie bump to support higher metabolic demand.');
  } else if (cyclePhase === 'Menstruation') {
    parts.push('Menstruation: iron-rich foods and slightly higher calorie tolerance.');
  }

  if (phase === 3 && goal !== 'lose') {
    parts.push('Phase 3: protein target increased to support muscle adaptation.');
  }

  return parts.join(' ');
}
