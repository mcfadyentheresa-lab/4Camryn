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
  markField: string;
  markFieldLabel: string;
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
      markField: 'usedRecently',
      markFieldLabel: 'Used in the last 30 days',
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
];
