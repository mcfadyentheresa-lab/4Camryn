// Challenge library schema. Distinct from PROTOCOL (protocol.ts) — protocol
// is the always-on 52-week path; challenges are optional, bounded sprints a
// user opts into on top of it. See ChallengeCompletion for why 'streak' and
// 'cumulative' are modeled separately rather than one shared progress calc:
// streak challenges break on a gap (calcStreak-style), cumulative ones
// accrue itemized entries toward a target and never "reset."

export type ChallengeDomain = 'body' | 'food' | 'space' | 'confidence' | 'journal' | 'cycle' | 'money' | 'general';
export type ChallengeSeason = 'push' | 'maintenance';

// tolerance: 'strict' breaks the streak on any missed day (like PHASE_QUESTS
// mastery quests today). A number is the count of skips allowed across the
// whole run before it breaks — not a rolling window.
export interface StreakCompletion {
  type: 'streak';
  durationDays: number;
  tolerance: 'strict' | number;
}

// A cumulative challenge is never day-based. Progress is the sum of
// itemized entries the user logs (source + amount), not a single claimed
// total — see MoneyEntry. windowDays bounds it so it still reads as a
// sprint rather than an open-ended goal.
export interface CumulativeCompletion {
  type: 'cumulative';
  target: number;
  unit: 'usd' | 'items';
  windowDays: number;
  entryLog: true;
}

// A one-time review, not day-based or amount-based: the user reviews a set
// of items once and marks each against a field. Produces a derived total
// (e.g. found-money) but completing the audit itself only requires the
// review being done, not the total crossing any threshold.
export interface AuditCompletion {
  type: 'audit';
  reviewUnit: string;
  itemLabel: string;
  markField: string;
  markFieldLabel: string;
  // Whether items carry a $/mo cost worth summing into a found-money total
  // (Subscription Audit) vs. a plain reviewable list with no dollar value
  // (Closet Audit). Controls whether the cost input and total even render.
  hasCost: boolean;
}

export type ChallengeCompletion = StreakCompletion | CumulativeCompletion | AuditCompletion;

export interface UnlockSpec {
  kind: 'reward' | 'nextChallenge' | 'content';
  // For kind: 'reward', the label is user-defined at acceptance time and
  // snapshotted onto the challenge instance — never edited afterward.
  label: string;
}

export interface ChallengeContent {
  id: string;
  domain: ChallengeDomain;
  season: ChallengeSeason;
  title: string;
  why: string;
  what: string;
  rules: string[];
  outcome: string;
  completion: ChallengeCompletion;
  prerequisites?: string[];
  unlock?: UnlockSpec;
}

// One line item toward a cumulative challenge. `recurring` marks a
// canceled/reduced recurring cost — its `amount` is the saving that accrues
// per remaining period *within the challenge window*, not an annualized
// value, so a canceled subscription doesn't inflate the total with money
// that hasn't actually been saved yet.
export interface MoneyEntry {
  source: string;
  amount: number;
  recurring: boolean;
  loggedDate: string; // localToday() format
}

export const CHALLENGE_LIBRARY: ChallengeContent[] = [
  {
    id: 'subscription-audit',
    domain: 'money',
    season: 'push',
    title: 'Subscription Audit',
    why: "Recurring subscriptions are the easiest money leak because no decision gets re-made — the charge just repeats. Most people can't name what they're paying for without looking.",
    what: "List every subscription or app you're billed for. For each one, mark whether you've used it in the last 30 days.",
    rules: [
      'Self-reported — no account linking required',
      'Use whatever you already have (your bank statement, an app like Rocket Money, or just memory) to build the list',
      'No daily quota — this is a one-time review, done at your own pace',
    ],
    outcome: "A found-money total: the combined monthly cost of everything marked unused. That number is yours to act on, and it can seed a Find $1,000 challenge or fund a locked reward.",
    completion: {
      type: 'audit',
      reviewUnit: 'subscription',
      itemLabel: 'Subscription name',
      markField: 'usedRecently',
      markFieldLabel: 'Used in the last 30 days',
      hasCost: true,
    },
  },
  {
    id: 'find-1000',
    domain: 'money',
    season: 'push',
    title: 'Find $1,000',
    why: 'A fixed dollar goal is more motivating than "spend less" because it has a real finish line, and leaving the method open — sell, save, cut, earn — means it fits whatever situation you\'re actually in.',
    what: 'Log entries toward a $1,000 total over 60 days, by any legitimate means: sold items, canceled subscriptions, grocery savings, a side gig.',
    rules: [
      'Every entry needs a source and an amount — no lump "I found $1,000" claim',
      'Recurring savings (e.g. a canceled subscription) only count what accrues within the remaining challenge window, not the annualized value',
      'Entries can be corrected or removed if a sale falls through — the total is always the live sum of current entries',
    ],
    outcome: 'Unlocks whatever reward you name at the start — the challenge funds its own reward rather than just gating it.',
    completion: {
      type: 'cumulative',
      target: 1000,
      unit: 'usd',
      windowDays: 60,
      entryLog: true,
    },
    unlock: {
      kind: 'reward',
      label: '',
    },
  },
  {
    id: 'sleep-non-negotiable',
    domain: 'body',
    season: 'push',
    title: '7-Day Sleep Non-Negotiable',
    why: "Phase 1's whole thesis is that sleep is infrastructure — this is a compressed proof of that, not a replacement for the full 6 weeks.",
    what: 'Same wake time (±15 min) and no screens 45 minutes before bed, 7 days straight.',
    rules: [
      'Strict — a missed day resets the counter to 0. That\'s intentional; this one only works consecutive.',
      'Mark each day done once, that same calendar day',
    ],
    outcome: 'Unlocks a "rested baseline" note comparing your logged energy scores before vs. after.',
    completion: {
      type: 'streak',
      durationDays: 7,
      tolerance: 'strict',
    },
  },
  {
    id: 'macro-reset-14',
    domain: 'food',
    season: 'push',
    title: '14-Day Macro Reset',
    why: "Most people have never actually seen their real intake vs. what they assume — the gap is where plateaus hide.",
    what: 'Log every meal for 14 days and hit your protein target 12 of 14 days.',
    rules: [
      "Any tracking app or method counts — MyFitnessPal, a notes app, this app's Food tab. The requirement is the log existing and the protein number, not the tool.",
    ],
    outcome: 'Unlocks a "known baseline" — your real average macros, used to calibrate Phase 2/3 targets instead of generic ones.',
    completion: {
      type: 'streak',
      durationDays: 14,
      tolerance: 2,
    },
  },
  {
    id: 'digital-detox-weekend',
    domain: 'confidence',
    season: 'push',
    title: 'Digital Detox Weekend',
    why: 'A lot of confidence work gets undone by comparison loops that only exist because the phone is in hand.',
    what: 'No social media apps for 48 hours (texting/calls fine).',
    rules: [
      'Delete-the-app or use a screen-time block — your choice of enforcement, the requirement is the outcome not the method.',
    ],
    outcome: 'Unlocks a reflection prompt in Journal and a badge. Repeatable once a month.',
    completion: {
      type: 'streak',
      durationDays: 2,
      tolerance: 'strict',
    },
  },
  {
    id: 'consistency-maintenance-month',
    domain: 'general',
    season: 'maintenance',
    title: 'Consistency Maintenance Month',
    why: "Not everything can be a sprint — this is the \"no pressure, just don't disappear\" mode for a season where energy is low.",
    what: 'Complete your normal daily protocol tasks at least 20 of 30 days. No streak, just a monthly floor.',
    rules: [
      "Fully tolerant of gaps — this challenge exists specifically so a bad week doesn't feel like failure.",
    ],
    outcome: 'No dramatic unlock — completing it simply keeps you moving. Low stakes by design.',
    completion: {
      type: 'streak',
      durationDays: 30,
      tolerance: 10,
    },
  },
  {
    id: 'cycle-synced-strength',
    domain: 'cycle',
    season: 'push',
    title: 'Cycle-Synced Strength Sprint',
    why: 'Training with your cycle rather than against it is already a Phase 2+ theme — this makes it a discrete, measurable block instead of an ongoing background idea.',
    what: 'Log 10 strength sessions, ideally timed to your follicular and ovulatory windows (your highest natural capacity).',
    rules: [
      'Session count is fixed at 10 — timing them to your logged cycle phase is up to you, this app doesn\'t auto-schedule them yet.',
      'Log each session as you complete it, no need to batch them.',
    ],
    outcome: 'Unlocks a "strength curve" note comparing how sessions felt across cycle phases.',
    completion: {
      type: 'cumulative',
      target: 10,
      unit: 'items',
      windowDays: 84,
      entryLog: true,
    },
  },
  {
    id: 'steps-10k-10-days',
    domain: 'body',
    season: 'push',
    title: '10,000 Steps, 10 Days',
    why: 'Walking is already the highest-leverage low-effort tool in Phase 2 — this turns it into a visible short block instead of a background habit.',
    what: 'Hit 10,000 steps for 10 days.',
    rules: [
      'Track however you already do — phone, watch, pedometer. The requirement is the number, not the device.',
    ],
    outcome: 'Unlocks a "movement baseline" comparing your logged energy scores on walk days vs. not.',
    completion: {
      type: 'streak',
      durationDays: 10,
      tolerance: 2,
    },
  },
  {
    id: 'closet-audit',
    domain: 'space',
    season: 'push',
    title: 'Closet Audit',
    why: "Same principle as the subscription audit, applied to physical space — most clutter is stuff you already decided you don't need, you just haven't looked at it directly yet.",
    what: 'List your clothing, or just one category — one drawer, one shelf. For each item, mark whether you\'ve worn it in the last 90 days.',
    rules: [
      "Self-reported — no need to physically sort everything first, just look and mark honestly.",
      "One category or one space is enough. This doesn't need to be your whole wardrobe.",
    ],
    outcome: "A concrete list of what to actually let go of, instead of vague guilt about \"too much stuff.\"",
    completion: {
      type: 'audit',
      reviewUnit: 'item',
      itemLabel: 'Clothing item',
      markField: 'usedRecently',
      markFieldLabel: 'Worn in the last 90 days',
      hasCost: false,
    },
  },
];
