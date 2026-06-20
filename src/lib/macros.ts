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

export function calcMacroTargets(
  profile: FoodProfile,
  opts: {
    phase: number;
    cyclePhase: string;
    exercised: boolean;
  }
): MacroTargets {
  const { weight_kg, height_cm, age, goal, activity_baseline } = profile;

  // If no profile data, return sensible defaults
  if (!weight_kg || !height_cm || !age) {
    return defaultTargets(opts.exercised, opts.phase, goal);
  }

  const baseBmr = bmr(weight_kg, height_cm, age);
  let tdee = baseBmr * ACTIVITY_MULTIPLIERS[activity_baseline];

  // Goal adjustment
  if (goal === 'lose') tdee -= 300;
  if (goal === 'build') tdee += 200;

  // Phase adjustment
  tdee += PHASE_ADJUSTMENTS[opts.phase] ?? 0;

  // Cycle adjustment
  tdee += CYCLE_ADJUSTMENTS[opts.cyclePhase] ?? 0;

  // Rest day: pull back on calories and carbs
  if (!opts.exercised) tdee += REST_DAY_ADJUSTMENT;

  const calories = Math.round(tdee / 10) * 10; // Round to nearest 10

  // Protein: 1.6–2.2g/kg depending on phase and goal
  const proteinMultiplier =
    opts.phase === 3 ? 2.0 :
    opts.phase === 2 ? 1.8 :
    goal === 'build' ? 1.8 : 1.6;
  const protein_g = Math.round(weight_kg * proteinMultiplier);

  // Carbs: reduced on rest days, higher on exercise days in Phase 2+
  const carbPct = opts.exercised
    ? (opts.phase >= 2 ? 0.40 : 0.35)
    : 0.30;
  const carbs_g = Math.round((calories * carbPct) / 4);

  // Fat: fill remaining calories after protein + carbs
  const proteinCals = protein_g * 4;
  const carbCals = carbs_g * 4;
  const fat_g = Math.max(40, Math.round((calories - proteinCals - carbCals) / 9));

  // Fiber: 25–35g, higher on rest days (gut focus)
  const fiber_g = opts.exercised ? 28 : 32;

  const note = buildNote(opts.exercised, opts.cyclePhase, opts.phase, goal);

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
