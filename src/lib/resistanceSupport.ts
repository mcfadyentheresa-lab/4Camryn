// Content bank for the Food/Body resistance-support flow. Same pattern as
// dailyCoaching.ts: curated, deterministic copy keyed by context -- not
// generated text. No restriction/shame framing anywhere in the food copy.
//
// See challengeProgress.ts for the pure logic (ranking interventions, the
// Minimum Viable Win cap) and challengeCompletion.ts for the read/write
// layer. This file is content only.

export type ResistanceDomain = 'body' | 'food' | 'sleep';

export type ResistanceType =
  | 'dont-want-to-start'
  | 'feels-too-big'
  | 'boredom'
  | 'low-energy'
  | 'dont-want-to-decide'
  | 'getting-ready-hurdle'
  | 'want-comfort-instead'
  | 'takes-too-long'
  | 'frustrated-no-results'
  | 'missed-days-feels-ruined'
  | 'strong-no-unclear';

export interface ResistanceTypeOption {
  id: ResistanceType;
  label: string;
}

export const RESISTANCE_TYPES: ResistanceTypeOption[] = [
  { id: 'dont-want-to-start', label: "Don't want to start" },
  { id: 'feels-too-big', label: 'Feels too big right now' },
  { id: 'boredom', label: 'Bored of this one' },
  { id: 'low-energy', label: 'Low energy' },
  { id: 'dont-want-to-decide', label: "Don't want to decide" },
  { id: 'getting-ready-hurdle', label: 'Getting ready is the hurdle' },
  { id: 'want-comfort-instead', label: 'Want comfort instead' },
  { id: 'takes-too-long', label: "Feels like it'll take too long" },
  { id: 'frustrated-no-results', label: 'Frustrated — no results yet' },
  { id: 'missed-days-feels-ruined', label: 'Already missed days' },
  { id: 'strong-no-unclear', label: 'Just a strong no' },
];

export type InterventionType =
  | 'start-with-me'
  | 'push-me'
  | 'remove-friction'
  | 'different-version'
  | 'make-it-a-game'
  | 'choose-for-me'
  | 'minimum-viable-win';

export interface InterventionOption {
  id: InterventionType;
  label: string;
}

export const INTERVENTIONS: InterventionOption[] = [
  { id: 'start-with-me', label: 'Start With Me' },
  { id: 'push-me', label: 'Push Me a Little' },
  { id: 'remove-friction', label: 'Remove the Friction' },
  { id: 'different-version', label: 'Give Me a Different Version' },
  { id: 'make-it-a-game', label: 'Make It a Game' },
  { id: 'choose-for-me', label: 'Choose For Me' },
  { id: 'minimum-viable-win', label: 'Minimum Viable Win' },
];

// Cold-start default: which 2 interventions to lead with per resistance
// type, before there's enough history for getInterventionStats to reorder
// this (challengeProgress.ts). Deliberately leads with initiation
// (start-with-me/push-me) rather than reduction (minimum-viable-win) for
// the ambiguous cases -- reduction is earned from evidence, not the default.
export const DEFAULT_INTERVENTIONS_BY_TYPE: Record<ResistanceType, InterventionType[]> = {
  'dont-want-to-start': ['start-with-me', 'push-me'],
  'feels-too-big': ['minimum-viable-win', 'remove-friction'],
  boredom: ['make-it-a-game', 'different-version'],
  'low-energy': ['minimum-viable-win', 'different-version'],
  'dont-want-to-decide': ['choose-for-me', 'different-version'],
  'getting-ready-hurdle': ['remove-friction', 'start-with-me'],
  'want-comfort-instead': ['push-me', 'minimum-viable-win'],
  'takes-too-long': ['minimum-viable-win', 'remove-friction'],
  'frustrated-no-results': ['push-me', 'different-version'],
  'missed-days-feels-ruined': ['push-me', 'start-with-me'],
  'strong-no-unclear': ['start-with-me', 'push-me'],
};

export interface InterventionCopy {
  // Shown on the option card, before it's picked.
  prompt: string;
  // Shown once selected, framing what's about to happen. Empty string for
  // interventions whose actual content comes from a pool below instead.
  action: string;
}

export const INTERVENTION_COPY: Record<InterventionType, Record<ResistanceDomain, InterventionCopy>> = {
  'start-with-me': {
    body: { prompt: "Don't commit to the whole workout. Just start.", action: "Don't commit to the workout yet. Put on your shoes and come back." },
    food: { prompt: "Just get one small thing ready. That's it for now.", action: 'Just get one ingredient or item out. Nothing else yet.' },
    sleep: { prompt: "Don't commit to lights-out yet. Just start winding down.", action: "Don't decide about sleep yet. Put your phone on the charger, away from the bed, and come back." },
  },
  'push-me': {
    body: { prompt: 'This looks like the starting barrier, not a real reason to skip.', action: "Give it 3 minutes. You can stop after that and it still won't count against you — but let's see." },
    food: { prompt: 'This looks like resistance to starting, not an actual no.', action: "Give it 3 minutes on getting this ready. You can stop after — but let's see." },
    sleep: { prompt: 'This looks like stalling, not an actual reason to stay up.', action: "Give the wind-down 3 minutes — screens off, lights low. You can change your mind after — but let's see." },
  },
  'remove-friction': {
    body: { prompt: "Tell me what's actually in the way.", action: '' },
    food: { prompt: "Tell me what's actually in the way.", action: '' },
    sleep: { prompt: "Tell me what's actually keeping you up.", action: '' },
  },
  'different-version': {
    body: { prompt: 'Same purpose, different activity — your call.', action: '' },
    food: { prompt: 'Same purpose, easier option — your call.', action: '' },
    sleep: { prompt: 'Same goal, easier version — your call.', action: '' },
  },
  'make-it-a-game': {
    body: { prompt: 'Beat the clock instead of thinking about it.', action: 'Can you be moving before this 60-second countdown ends?' },
    food: { prompt: 'Turn this into a short countdown.', action: 'Can you have it ready before this 2-minute countdown ends?' },
    sleep: { prompt: 'Turn lights-out into a short countdown.', action: 'Can you be in bed, lights off, before this 2-minute countdown ends?' },
  },
  'choose-for-me': {
    body: { prompt: 'No options. Just tell me what to do.', action: '' },
    food: { prompt: 'No options. Just tell me what to make.', action: '' },
    sleep: { prompt: 'No options. Just tell me what to do.', action: '' },
  },
  'minimum-viable-win': {
    body: { prompt: 'A smaller version that still counts, for today.', action: '' },
    food: { prompt: 'A smaller version that still counts, for today.', action: '' },
    sleep: { prompt: 'A smaller version that still counts, for today.', action: '' },
  },
};

export const DIFFERENT_VERSION_OPTIONS: Record<ResistanceDomain, string[]> = {
  body: [
    'A 10-minute walk instead',
    'Stretching instead of training',
    'Dancing to two songs, however that looks',
    'Five minutes of bodyweight moves, nothing else',
  ],
  food: [
    'The easiest thing you already have on hand',
    'A version with fewer steps, same goal',
    'Something pre-made or ready-to-eat that still fits',
  ],
  sleep: [
    'Lights off 15 minutes later than planned, but still off',
    'Screens away from the bed even if you stay up reading instead',
    'Skip the full wind-down routine — just the lights and the phone',
  ],
};

export const CHOSEN_FOR_YOU: Record<ResistanceDomain, string[]> = {
  body: [
    'A 10-minute walk, right now.',
    'Ten bodyweight squats, then reassess.',
    'Stretch for five minutes. That is the whole instruction.',
  ],
  food: [
    'Whatever protein you already have, plus anything green.',
    'The easiest meal you already know you like — eggs and toast if nothing comes to mind.',
    'A smoothie with whatever is already in your fridge.',
  ],
  sleep: [
    'Phone on the charger, away from the bed, right now.',
    'Lights off within the next 10 minutes. That is the whole instruction.',
    'Same wake time tomorrow, whatever time you fall asleep tonight.',
  ],
};

export const MVW_ACTIONS: Record<ResistanceDomain, string> = {
  body: 'Two minutes of movement. Anything. That is the full ask today.',
  food: "One deliberate choice today that fits — it doesn't have to be the whole plan.",
  sleep: 'One thing tonight: phone out of the bed, or lights off on time. Pick one.',
};

export interface FrictionOption {
  id: string;
  label: string;
  fix: string;
}

export const FRICTION_OPTIONS: Record<ResistanceDomain, FrictionOption[]> = {
  body: [
    { id: 'clothes', label: "Don't want to change clothes", fix: "You don't have to change. Just start in what you're wearing." },
    { id: 'deciding', label: 'Deciding what to do', fix: "Don't decide. Walk for 5 minutes and figure out the rest once you're moving." },
    { id: 'location', label: 'Getting to the right place', fix: 'Skip the location. Do it wherever you are right now.' },
    { id: 'other', label: 'Something else', fix: 'Pick the smallest possible piece of it and do only that.' },
  ],
  food: [
    { id: 'deciding', label: 'Deciding what to make', fix: "Don't decide. Make whatever you ate most recently that felt fine." },
    { id: 'prep', label: 'Prep feels like too much', fix: 'Skip prep. Eat the easiest ready option that still fits.' },
    { id: 'cleanup', label: 'Dreading the cleanup', fix: 'One dish, one pan, one plate — that is the whole rule right now.' },
    { id: 'other', label: 'Something else', fix: 'Make it smaller than you think it needs to be.' },
  ],
  sleep: [
    { id: 'not-tired', label: 'Not tired at the right time', fix: "You don't have to fall asleep on command. Just start the wind-down and let your body catch up." },
    { id: 'screens', label: 'Screens are hard to put down', fix: 'Charge your phone across the room tonight — just for tonight.' },
    { id: 'routine', label: 'The wind-down routine feels like too much', fix: 'Skip the routine. Lights off, phone away — that alone counts.' },
    { id: 'other', label: 'Something else', fix: 'Pick the smallest possible piece of it and do only that.' },
  ],
};

// Deterministic pick from a pool, varied per day + instance rather than
// random, so the same intervention on the same day doesn't flicker between
// renders but different days/instances get variety. Mirrors the private
// pickForDay in dailyCoaching.ts.
export function pickFromPool(pool: string[], salt: string): string {
  let hash = 0;
  for (let i = 0; i < salt.length; i++) hash = (hash * 31 + salt.charCodeAt(i)) & 0xffffffff;
  return pool[Math.abs(hash) % pool.length];
}
