// Challenge library schema. Distinct from PROTOCOL (protocol.ts) — protocol
// is the always-on 52-week path; challenges are optional, bounded sprints a
// user opts into on top of it. See ChallengeCompletion for why 'streak' and
// 'cumulative' are modeled separately rather than one shared progress calc:
// streak challenges break on a gap (calcStreak-style), cumulative ones
// accrue itemized entries toward a target and never "reset."

export type ChallengeDomain = 'body' | 'food' | 'space' | 'confidence' | 'journal' | 'cycle' | 'money' | 'general' | 'inspiration' | 'sleep';
export type ChallengeSeason = 'push' | 'maintenance';

// Reuses the existing phase-color triplets (already proven in the Protocol
// modal, light and dark) rather than inventing a parallel palette. Domains
// that never appear as a primaryDomain today (sleep, journal) fall back to
// neutral so there's nothing to visually tune until they're actually used.
export interface DomainStyle {
  label: string;
  accent: string;
  soft: string;
  track: string;
}

export const DOMAIN_STYLE: Record<ChallengeDomain, DomainStyle> = {
  body: { label: 'Body', accent: 'var(--phase-3)', soft: 'var(--phase-3-soft)', track: 'var(--phase-3-track)' },
  food: { label: 'Food', accent: 'var(--phase-2)', soft: 'var(--phase-2-soft)', track: 'var(--phase-2-track)' },
  confidence: { label: 'Confidence', accent: 'var(--phase-5)', soft: 'var(--phase-5-soft)', track: 'var(--phase-5-track)' },
  inspiration: { label: 'Inspiration', accent: 'var(--phase-4)', soft: 'var(--phase-4-soft)', track: 'var(--phase-4-track)' },
  space: { label: 'Space', accent: 'var(--phase-6)', soft: 'var(--phase-6-soft)', track: 'var(--phase-6-track)' },
  money: { label: 'Money', accent: 'var(--phase-1)', soft: 'var(--phase-1-soft)', track: 'var(--phase-1-track)' },
  cycle: { label: 'Cycle', accent: 'var(--camryn-cycle-mint)', soft: 'var(--camryn-cycle-mint-bg)', track: 'var(--line)' },
  general: { label: 'General', accent: 'var(--muted)', soft: 'var(--soft)', track: 'var(--line)' },
  sleep: { label: 'Sleep', accent: 'var(--muted)', soft: 'var(--soft)', track: 'var(--line)' },
  journal: { label: 'Journal', accent: 'var(--muted)', soft: 'var(--soft)', track: 'var(--line)' },
};

// A short, glanceable label for a challenge's shape -- what you're actually
// signing up for -- without having to open "Show details."
export function describeCompletionShape(completion: ChallengeCompletion): string {
  if (completion.type === 'streak') {
    return completion.durationDays === 1 ? 'One-time' : `${completion.durationDays}-day streak`;
  }
  if (completion.type === 'cumulative') {
    const goal = completion.unit === 'usd' ? `$${completion.target}` : `${completion.target}x`;
    return completion.windowDays ? goal : `${goal} · open-ended`;
  }
  return 'Review & mark';
}

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
// sprint rather than an open-ended goal; omit it for a genuinely open-ended
// count (e.g. "100 Club" -- accumulate 100 sessions over however long it
// takes) where there's no expiry to check at all.
export interface CumulativeCompletion {
  type: 'cumulative';
  target: number;
  unit: 'usd' | 'items';
  windowDays?: number;
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
  // One primary domain (used for card grouping/filtering) plus optional
  // secondary tags for challenges that genuinely span areas -- e.g. "Wear
  // Your Closet" is primarily Space but tags Confidence too. This is what
  // lets a future "you've been doing a lot of Body, nothing in Inspiration"
  // nudge read across a challenge's full footprint, not just one bucket.
  primaryDomain: ChallengeDomain;
  secondaryTags?: ChallengeDomain[];
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
    primaryDomain: 'money',
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
    primaryDomain: 'money',
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
    primaryDomain: 'body',
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
    primaryDomain: 'food',
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
    primaryDomain: 'confidence',
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
    primaryDomain: 'general',
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
    primaryDomain: 'cycle',
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
    primaryDomain: 'body',
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
    primaryDomain: 'space',
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

  // ── Body ──────────────────────────────────────────────────────────────
  {
    id: 'move-10-min-10-days',
    primaryDomain: 'body',
    season: 'push',
    title: '10-Minute Minimum',
    why: "The floor matters more than the ceiling — ten minutes is low enough that skipping it has no good excuse, which is the point.",
    what: 'Move for 10 minutes a day for 10 days. Any movement counts.',
    rules: ['Walking, stretching, dancing in your kitchen — the bar is 10 minutes, not a specific activity.'],
    outcome: 'Proof that the floor is easy to clear, which makes the next thing you build on it easier to trust.',
    completion: { type: 'streak', durationDays: 10, tolerance: 2 },
  },
  {
    id: 'countdown-20',
    primaryDomain: 'body',
    season: 'push',
    title: 'Countdown 20',
    why: 'No deadline and no streak removes the two things that usually make movement feel like pressure instead of choice.',
    what: 'Complete 20 workouts. However long it takes.',
    rules: ['Log each one as you finish it — no minimum pace, no penalty for gaps between sessions.'],
    outcome: 'A completed count you built entirely on your own timeline.',
    completion: { type: 'cumulative', target: 20, unit: 'items', entryLog: true },
  },
  {
    id: 'try-something-new',
    primaryDomain: 'body',
    season: 'push',
    title: 'Try Something New',
    why: "Novel movement is one of the fastest ways to find out you like moving your body more than you thought, without the baggage of 'exercise.'",
    what: 'Try five different forms of movement you don\'t normally do.',
    rules: ['A class, a sport, a walk somewhere new, dancing — the requirement is that each one is genuinely different from your usual.'],
    outcome: "A short list of things you now know you either love or can happily rule out.",
    completion: { type: 'cumulative', target: 5, unit: 'items', windowDays: 30, entryLog: true },
  },
  {
    id: 'mobility-week',
    primaryDomain: 'body',
    season: 'push',
    title: 'Mobility Week',
    why: 'Mobility is the quiet infrastructure under every other Body goal — easy to skip, expensive to skip for long.',
    what: '10 minutes of mobility work daily.',
    rules: ['Any routine you like — a video, a stretch sequence, foam rolling. The 10 minutes is the requirement, not the method.'],
    outcome: 'A week of noticing where you\'re actually tight, which is useful information on its own.',
    completion: { type: 'streak', durationDays: 7, tolerance: 1 },
  },
  {
    id: 'walk-somewhere',
    primaryDomain: 'body',
    season: 'push',
    title: 'Walk Somewhere',
    why: 'A walk with an actual destination reads differently to your brain than a walk for exercise — same movement, less resistance.',
    what: 'Take five walks that have an actual destination — not just laps around the block.',
    rules: ['A coffee shop, a friend\'s place, a park you haven\'t been to. The destination is the whole point.'],
    outcome: 'Five walks logged, each one useful for something beyond the steps.',
    completion: { type: 'cumulative', target: 5, unit: 'items', windowDays: 30, entryLog: true },
  },
  {
    id: 'permission-to-quit',
    primaryDomain: 'body',
    season: 'push',
    title: 'Permission to Quit',
    why: "The all-or-nothing instinct is what kills consistency — this challenge exists to prove that showing up and leaving early still counts.",
    what: 'Start a workout. After eight minutes, you\'re allowed to stop, guilt-free.',
    rules: ['Log it whether you stopped at 8 minutes or kept going — both are a win here.'],
    outcome: "Evidence that starting is the hard part, and you can do the hard part on easier terms than you thought.",
    completion: { type: 'cumulative', target: 5, unit: 'items', entryLog: true },
  },
  {
    id: 'the-slow-burn',
    primaryDomain: 'body',
    season: 'push',
    title: 'The Slow Burn',
    why: 'Everything in this app defaults to pushing harder — this is the deliberate counterweight, and low-intensity work has its own real benefits (recovery, aerobic base, nervous system regulation).',
    what: 'Deliberately stay below maximum effort in every session for two weeks.',
    rules: ["If you can't hold a conversation, you're going too hard — that's the practical test."],
    outcome: 'A different relationship with effort: proof that easier isn\'t the same as wasted.',
    completion: { type: 'streak', durationDays: 14, tolerance: 3 },
  },
  {
    id: 'energy-match',
    primaryDomain: 'body',
    season: 'push',
    title: 'Energy Match',
    why: "Matching movement to the energy you actually logged (not the workout you planned three days ago) is a small habit that prevents a lot of burnout and skipped days.",
    what: "Choose your movement based on today's actual energy level, not a fixed plan.",
    rules: ['Low energy day, low-key movement. High energy day, push it. Check your daily check-in before deciding.'],
    outcome: 'A movement pattern that bends with you instead of against you.',
    completion: { type: 'streak', durationDays: 10, tolerance: 2 },
  },
  {
    id: '100-club',
    primaryDomain: 'body',
    season: 'push',
    title: '100 Club',
    why: 'Some milestones are only meaningful because of how long they take — this one rewards persistence over any particular pace.',
    what: 'Accumulate 100 movement sessions. However long it takes.',
    rules: ['No deadline. Log each session as it happens; the count is the only thing that matters.'],
    outcome: 'A number that took real time to earn, and can\'t be faked.',
    completion: { type: 'cumulative', target: 100, unit: 'items', entryLog: true },
  },

  // ── Food ──────────────────────────────────────────────────────────────
  {
    id: 'add-dont-remove',
    primaryDomain: 'food',
    season: 'push',
    title: "Add, Don't Remove",
    why: "Restriction is where most food challenges quietly go wrong — this one only ever asks you to add, never to eliminate.",
    what: 'Add one nutritious food to your day, every day, instead of cutting anything out.',
    rules: ["Nothing is off-limits and nothing is required to be removed — this is purely additive."],
    outcome: 'A wider plate, built without a single rule about what you can\'t eat.',
    completion: { type: 'streak', durationDays: 14, tolerance: 3 },
  },
  {
    id: 'protein-first',
    primaryDomain: 'food',
    season: 'push',
    title: 'Protein First',
    why: 'Protein at the first meal is already a Phase 2 pillar — this compresses it into a fast, visible proof of the effect.',
    what: 'Include a protein source at your first meal, seven days straight.',
    rules: ["Any source counts — eggs, yogurt, a shake. The requirement is presence, not a gram target."],
    outcome: 'A week of steadier morning hunger to compare against how it usually feels.',
    completion: { type: 'streak', durationDays: 7, tolerance: 1 },
  },
  {
    id: 'colour-hunt',
    primaryDomain: 'food',
    season: 'push',
    title: 'Colour Hunt',
    why: "Colour is an easy, non-clinical proxy for plant diversity — a much more approachable ask than 'eat more micronutrients.'",
    what: 'Eat five different naturally occurring colours in a day. Do this seven days running.',
    rules: ['Naturally occurring only — a rainbow of candy doesn\'t count, and you know it.'],
    outcome: 'A week of noticeably more varied plates, with zero food ruled out to get there.',
    completion: { type: 'streak', durationDays: 7, tolerance: 2 },
  },
  {
    id: 'water-before-coffee',
    primaryDomain: 'food',
    season: 'push',
    title: 'Water Before Coffee',
    why: 'Same logic as the Phase 1 morning hydration protocol, compressed into its own short proof rather than a background habit.',
    what: 'Drink water before your first coffee, seven mornings in a row.',
    rules: ["Any amount of water counts, as long as it comes first."],
    outcome: 'A week of data on whether your first-hour energy actually shifts.',
    completion: { type: 'streak', durationDays: 7, tolerance: 1 },
  },
  {
    id: 'recipe-roulette',
    primaryDomain: 'food',
    season: 'push',
    title: 'Recipe Roulette',
    why: "Novelty is the fastest way out of a food rut, and a food rut is usually what's actually behind 'I don't know what to eat.'",
    what: "Try three meals or recipes you've never made before.",
    rules: ['Log each one as you make it — didn\'t like it is still a valid, useful result.'],
    outcome: "Three new data points on what you'd actually make again.",
    completion: { type: 'cumulative', target: 3, unit: 'items', windowDays: 21, entryLog: true },
  },
  {
    id: 'restaurant-detective',
    primaryDomain: 'food',
    season: 'push',
    title: 'Restaurant Detective',
    why: 'Enjoyment and feeling good afterward aren\'t always the same meal — finding the overlap is worth doing deliberately.',
    what: "Find three meals you genuinely enjoy that also leave you feeling good afterward.",
    rules: ['Self-reported, no calorie or macro tracking required — this is about how it actually felt, not the numbers.'],
    outcome: "A short, personal list of meals that are both a want and a good choice — the rarest kind.",
    completion: { type: 'audit', reviewUnit: 'meal', itemLabel: 'Meal or restaurant', markField: 'feltGood', markFieldLabel: 'Left you feeling good afterward', hasCost: false },
  },
  {
    id: 'the-repeatable-five',
    primaryDomain: 'food',
    season: 'push',
    title: 'The Repeatable Five',
    why: "Decision fatigue is a bigger driver of poor eating than most people give it credit for — a short list of defaults removes the decision entirely.",
    what: "Discover five easy meals you'd happily eat on repeat.",
    rules: ['Easy is the whole requirement — the bar is "would make again without dreading it."'],
    outcome: 'A go-to list that makes an average weeknight easier for good, not just this week.',
    completion: { type: 'audit', reviewUnit: 'meal', itemLabel: 'Meal', markField: 'wouldRepeat', markFieldLabel: "Easy enough you'd make it again", hasCost: false },
  },
  {
    id: 'hunger-detective',
    primaryDomain: 'food',
    season: 'push',
    title: 'Hunger Detective',
    why: "Most people have never actually paused to notice hunger and fullness signals directly — this is observation only, with no attempt to change anything yet.",
    what: 'Notice your hunger and fullness before and after meals, without trying to change either.',
    rules: ['Observation only — this is not a challenge to eat more or less, just to notice.'],
    outcome: 'A clearer read on your own signals, which is the foundation every other food habit sits on.',
    completion: { type: 'streak', durationDays: 7, tolerance: 2 },
  },
  {
    id: 'kitchen-reset',
    primaryDomain: 'food',
    season: 'push',
    title: 'Kitchen Reset',
    why: 'Willpower is unreliable; a kitchen where the healthy choice is also the easy one isn\'t.',
    what: 'Set up your kitchen so the easiest healthy choice is the easiest thing to reach.',
    rules: ['One pass is enough — front of the fridge, counter, wherever you actually look first.'],
    outcome: 'A kitchen that makes the good choice the default one, not the effortful one.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'no-perfect-days',
    primaryDomain: 'food',
    season: 'push',
    title: 'No Perfect Days',
    why: 'The idea of a "perfect" eating day is usually what turns one imperfect meal into a written-off day — removing the concept removes the collapse.',
    what: 'Intentionally let go of the idea of having a "perfect" eating day.',
    rules: ["Especially tolerant by design — the whole point is that a gap here isn't a failure, it's the practice."],
    outcome: "Fewer all-or-nothing days, because there was never an all to protect.",
    completion: { type: 'streak', durationDays: 14, tolerance: 4 },
  },

  // ── Confidence ────────────────────────────────────────────────────────
  {
    id: 'wear-the-thing',
    primaryDomain: 'confidence',
    season: 'push',
    title: 'Wear the Thing',
    why: '"When I..." is usually a story that never actually resolves — this forces the resolution.',
    what: 'Wear three things you\'ve been saving for "when…"',
    rules: ["No occasion required. A Tuesday counts."],
    outcome: 'Proof that the version of you who gets to wear nice things is already here.',
    completion: { type: 'cumulative', target: 3, unit: 'items', windowDays: 30, entryLog: true },
  },
  {
    id: 'photo-proof',
    primaryDomain: 'confidence',
    season: 'push',
    title: 'Photo Proof',
    why: 'The instinct to delete an unflattering photo immediately is itself the thing worth interrupting.',
    what: 'Take one photo every day without judging it or deleting it right away.',
    rules: ['No filters, no immediate delete — just take it and leave it.'],
    outcome: 'Two weeks of unedited evidence that you looked like yourself the whole time.',
    completion: { type: 'streak', durationDays: 14, tolerance: 3 },
  },
  {
    id: 'say-it',
    primaryDomain: 'confidence',
    season: 'push',
    title: 'Say It',
    why: 'The opinion you keep to yourself doesn\'t disappear — it just costs you the practice of having a voice.',
    what: "Voice one opinion you'd normally keep to yourself.",
    rules: ['Low stakes counts — a restaurant choice, a preference, a "actually, I disagree."'],
    outcome: 'A week of proof that your opinion having weight didn\'t cost you anything.',
    completion: { type: 'streak', durationDays: 7, tolerance: 2 },
  },
  {
    id: 'take-the-compliment',
    primaryDomain: 'confidence',
    season: 'push',
    title: 'Take the Compliment',
    why: 'Deflecting a compliment is a reflex, not a fact about whether it\'s true — this challenge just interrupts the reflex.',
    what: 'When complimented, only say "thank you." No deflecting, no correcting, no minimizing.',
    rules: ['"Thank you" is the whole response. Nothing added.'],
    outcome: 'Practice letting something good about you land without immediately talking it back down.',
    completion: { type: 'streak', durationDays: 10, tolerance: 3 },
  },
  {
    id: 'do-it-alone',
    primaryDomain: 'confidence',
    season: 'push',
    title: 'Do It Alone',
    why: 'Needing company for something isn\'t always about the activity — sometimes it\'s about not trusting yourself to be seen alone.',
    what: "Do one thing alone that you'd normally want company for.",
    rules: ['A meal out, a movie, an event — your call on what counts as a stretch.'],
    outcome: 'One less thing that requires someone else\'s availability before you\'ll do it.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'tiny-brave-things',
    primaryDomain: 'confidence',
    season: 'push',
    title: 'Tiny Brave Things',
    why: 'Confidence is built the same way strength is — small, repeated exposure, not one dramatic leap.',
    what: 'Do one small uncomfortable thing every day, seven days straight.',
    rules: ['Small is the requirement — this is a volume game, not a difficulty game.'],
    outcome: 'Seven pieces of evidence that discomfort is survivable and often forgettable within the hour.',
    completion: { type: 'streak', durationDays: 7, tolerance: 'strict' },
  },
  {
    id: 'no-apology-week',
    primaryDomain: 'confidence',
    season: 'push',
    title: 'No Apology Week',
    why: 'Reflexive apologizing for existing, taking up space, or having a need quietly erodes how much room you let yourself take.',
    what: 'Catch yourself apologizing unnecessarily, and notice it — for a week.',
    rules: ["Noticing is the win here, not perfect elimination."],
    outcome: 'An honest count of how often "sorry" was doing work it didn\'t need to do.',
    completion: { type: 'streak', durationDays: 7, tolerance: 2 },
  },
  {
    id: 'evidence-file',
    primaryDomain: 'confidence',
    season: 'push',
    title: 'Evidence File',
    why: 'A negative belief rarely survives being held up against specific, dated counter-evidence — it only survives staying vague.',
    what: 'Collect ten pieces of evidence that contradict one negative belief you hold about yourself.',
    rules: ['Specific and real — a memory, a fact, a moment someone told you something true.'],
    outcome: 'A file you can actually reread the next time that belief shows up.',
    completion: { type: 'cumulative', target: 10, unit: 'items', windowDays: 30, entryLog: true },
  },
  {
    id: 'future-self-day',
    primaryDomain: 'confidence',
    season: 'push',
    title: 'Future-Self Day',
    why: "Acting like the person you're becoming, even for one day, is a faster way to find out if it fits than waiting to feel ready.",
    what: "Spend one full day behaving as the person you're becoming.",
    rules: ["One day is enough — this is a trial, not a commitment."],
    outcome: 'A lived data point on what that version of you actually feels like, not just imagines like.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'camera-roll-challenge',
    primaryDomain: 'confidence',
    season: 'push',
    title: 'Camera Roll Challenge',
    why: 'Always being behind the camera is a quiet way of opting out of your own life\'s record.',
    what: 'Appear in more photos over two weeks, instead of always being the one taking them.',
    rules: ['Ask someone to take one, or use a timer — however it happens.'],
    outcome: 'A camera roll that actually includes you.',
    completion: { type: 'streak', durationDays: 14, tolerance: 4 },
  },
  {
    id: 'the-ask',
    primaryDomain: 'confidence',
    season: 'push',
    title: 'The Ask',
    why: 'The thing you\'ve been avoiding asking for is usually smaller than the story you\'ve built around asking for it.',
    what: "Ask for something you've been avoiding asking for.",
    rules: ['A raise, a favor, help, clarity in a relationship — your call on what it is.'],
    outcome: "Whatever the answer is, proof that asking didn't cost what you feared.",
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'compliment-yourself',
    primaryDomain: 'confidence',
    season: 'push',
    title: 'Compliment Yourself',
    why: 'Most people can list what they\'d change about themselves instantly and what they like slowly, if at all — this reverses the ratio, deliberately.',
    what: 'Identify one thing you genuinely like about yourself, every day for ten days.',
    rules: ["Has to be genuine — no backhanded compliments, no 'at least.'"],
    outcome: 'Ten specific, collected reasons you\'re worth liking, in your own words.',
    completion: { type: 'streak', durationDays: 10, tolerance: 2 },
  },

  // ── Space ─────────────────────────────────────────────────────────────
  {
    id: 'one-drawer',
    primaryDomain: 'space',
    season: 'push',
    title: 'One Drawer',
    why: 'Deliberately small scope is the point — one finished drawer proves more than five half-started rooms.',
    what: 'Transform one drawer. Then stop.',
    rules: ['One drawer only — resisting the urge to keep going is part of the challenge.'],
    outcome: 'One genuinely finished space, which is rarer than it sounds.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'the-10-thing-exit',
    primaryDomain: 'space',
    season: 'push',
    title: 'The 10-Thing Exit',
    why: 'A small, exact number is easier to actually finish than a vague goal to "declutter."',
    what: "Remove ten things you don't want.",
    rules: ["Sell, donate, or bin — the method doesn't matter, the count does."],
    outcome: 'Ten fewer decisions sitting around unmade.',
    completion: { type: 'cumulative', target: 10, unit: 'items', windowDays: 14, entryLog: true },
  },
  {
    id: 'make-one-corner-beautiful',
    primaryDomain: 'space',
    season: 'push',
    title: 'Make One Corner Beautiful',
    why: 'One genuinely nice corner changes how a whole room feels to walk into, more than a mediocre pass over everything does.',
    what: 'Choose one neglected area and make it beautiful.',
    rules: ['One corner, fully finished — not a start on several.'],
    outcome: 'One spot in your space you\'re actually glad to look at.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'hotel-bedroom',
    primaryDomain: 'space',
    season: 'push',
    title: 'Hotel Bedroom',
    why: 'A hotel room feels prepared for you on purpose — most bedrooms just accumulate by accident. The difference is deliberate, not expensive.',
    what: 'Make your bedroom feel deliberately prepared for you, the way a good hotel room does.',
    rules: ['Whatever "prepared for you" means to you — clean sheets, no clutter, good lighting.'],
    outcome: 'A room that feels like it was set up on purpose, because it was.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'the-surface-challenge',
    primaryDomain: 'space',
    season: 'push',
    title: 'The Surface Challenge',
    why: 'One completely clear surface is a small, visible proof that clutter isn\'t inevitable — even if nothing else around it changes yet.',
    what: 'Keep one chosen surface completely clear for seven days.',
    rules: ['Pick one surface at the start and stay strict about it — nothing lands there for the week.'],
    outcome: 'A week of proof that "just for now" doesn\'t have to mean forever.',
    completion: { type: 'streak', durationDays: 7, tolerance: 'strict' },
  },
  {
    id: 'use-the-good-stuff',
    primaryDomain: 'space',
    season: 'push',
    title: 'Use the Good Stuff',
    why: "Saving things for a special occasion that never quite arrives is its own quiet form of denying yourself the present.",
    what: "Use something you've been saving.",
    rules: ["The candle, the dishes, the good pen — whatever you've been keeping for later."],
    outcome: 'One less thing waiting for a someday that was always going to be today.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'one-in-one-out',
    primaryDomain: 'space',
    season: 'push',
    title: 'One-In-One-Out Experiment',
    why: 'A rule tested for two weeks is a low-risk way to find out if it actually fits your life, before deciding whether to keep it permanently.',
    what: 'Test a one-in-one-out rule for 14 days: something new only comes in if something else goes out.',
    rules: ['Applies to whatever category you choose — clothes, books, kitchen items.'],
    outcome: 'A real answer on whether the rule is sustainable for you, not a guess.',
    completion: { type: 'streak', durationDays: 14, tolerance: 3 },
  },
  {
    id: 'closet-shop',
    primaryDomain: 'space',
    season: 'push',
    title: 'Closet Shop',
    why: 'Most closets already contain more good outfits than we give them credit for — this challenge is about finding them, not buying more.',
    what: "Create five outfits entirely from things you already own.",
    rules: ['Nothing new — the whole point is rediscovering what\'s already there.'],
    outcome: 'Five ready outfits and a closet that suddenly feels bigger than it did.',
    completion: { type: 'cumulative', target: 5, unit: 'items', windowDays: 14, entryLog: true },
  },
  {
    id: 'lighting-reset',
    primaryDomain: 'space',
    season: 'push',
    title: 'Lighting Reset',
    why: 'Lighting is one of the highest-leverage, lowest-effort changes to how a room actually feels — and it\'s usually the last thing anyone thinks to fix.',
    what: 'Improve the lighting in one room.',
    rules: ['A lamp, a bulb swap, moving a light source — small counts.'],
    outcome: 'A room that feels different at the same time of day, for the same reason it always looked the same before.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'sunday-reset',
    primaryDomain: 'space',
    season: 'push',
    title: 'Sunday Reset',
    why: 'A short, repeatable weekly ritual does more for a space long-term than one big irregular clean, because it never lets things pile back up.',
    what: 'Test a 20-minute weekly reset for four weeks.',
    rules: ['Same day, same short window — the repetition is what\'s being tested, not the depth of the clean.'],
    outcome: 'A real read on whether a weekly reset is something you\'d actually keep doing.',
    completion: { type: 'cumulative', target: 4, unit: 'items', windowDays: 35, entryLog: true },
  },
  {
    id: 'fix-the-annoyance',
    primaryDomain: 'space',
    season: 'push',
    title: 'Fix the Annoyance',
    why: 'The small thing that irritates you daily costs more over a year than almost anything else in your space, precisely because it repeats.',
    what: 'Repair one small household thing that irritates you every single day.',
    rules: ['The sticky drawer, the wobbly chair, the drippy tap — whatever it is that you\'ve been tolerating.'],
    outcome: 'One fewer daily irritation, permanently.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'invisible-clutter',
    primaryDomain: 'space',
    season: 'push',
    title: 'Invisible Clutter',
    why: 'Digital clutter creates the same low-grade friction as physical clutter, it\'s just easier to ignore because you can\'t see it pile up.',
    what: 'Tackle screenshots, downloads, email, and phone clutter — one category at a time.',
    rules: ['Four categories, your pace — log each one as you clear it.'],
    outcome: 'A phone and inbox that stop quietly nagging at you.',
    completion: { type: 'cumulative', target: 4, unit: 'items', windowDays: 14, entryLog: true },
  },

  // ── Inspiration ───────────────────────────────────────────────────────
  {
    id: 'curiosity-week',
    primaryDomain: 'inspiration',
    season: 'push',
    title: 'Curiosity Week',
    why: 'Curiosity is a muscle that atrophies fast under routine — this is a deliberate week of exercising it.',
    what: 'Follow one random curiosity every day, for a week.',
    rules: ['No justification needed — if it pulled your attention, that\'s enough reason to follow it.'],
    outcome: 'A week of proof that your attention still wanders somewhere interesting when you let it.',
    completion: { type: 'streak', durationDays: 7, tolerance: 1 },
  },
  {
    id: 'childhood-you',
    primaryDomain: 'inspiration',
    season: 'push',
    title: 'Childhood You',
    why: 'The things you loved before you learned to judge them for being impractical are often the most honest data you have about what you actually enjoy.',
    what: 'Do three things you loved when you were younger.',
    rules: ['No adult justification required — the only qualifier is that you loved it then.'],
    outcome: 'Three reminders of what you liked before anyone told you it wasn\'t worth your time.',
    completion: { type: 'cumulative', target: 3, unit: 'items', windowDays: 21, entryLog: true },
  },
  {
    id: 'make-something-badly',
    primaryDomain: 'inspiration',
    season: 'push',
    title: 'Make Something Badly',
    why: 'The requirement that it be good is usually what stops anything from getting made at all.',
    what: 'Create something with absolutely no requirement that it be good.',
    rules: ['Bad is not just allowed, it\'s the goal — this is about making, not making well.'],
    outcome: 'Proof you can finish something without the fear of it being judged getting in the way.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'seven-new-things',
    primaryDomain: 'inspiration',
    season: 'push',
    title: 'Seven New Things',
    why: 'One new experience a day is small enough to actually happen and large enough to notice by the end of the week.',
    what: 'Have one new experience each day, for seven days.',
    rules: ['New to you is enough — it doesn\'t need to be objectively novel.'],
    outcome: 'A week that felt distinct from every other week, on purpose.',
    completion: { type: 'streak', durationDays: 7, tolerance: 'strict' },
  },
  {
    id: 'rabbit-hole',
    primaryDomain: 'inspiration',
    season: 'push',
    title: 'Rabbit Hole',
    why: 'Permission to obsess over one subject for a week, with no productivity requirement attached, is rarer than it should be.',
    what: 'Choose one subject and give yourself full permission to obsess over it for a week.',
    rules: ['No requirement that it lead anywhere — the obsession is the point, not a project it produces.'],
    outcome: "A week spent somewhere your curiosity actually wanted to go.",
    completion: { type: 'streak', durationDays: 7, tolerance: 2 },
  },
  {
    id: 'no-algorithm-night',
    primaryDomain: 'inspiration',
    season: 'push',
    title: 'No Algorithm Night',
    why: 'Recommendation feeds optimize for engagement, not for what you\'d actually choose — this removes them from the decision entirely.',
    what: 'Choose your entertainment without using any recommendations or algorithms.',
    rules: ['A book off a shelf, a movie you already knew about, a friend\'s suggestion — anything not served to you by a feed.'],
    outcome: 'A handful of nights spent on something you actually chose.',
    completion: { type: 'cumulative', target: 5, unit: 'items', windowDays: 21, entryLog: true },
  },
  {
    id: 'the-artist-date',
    primaryDomain: 'inspiration',
    season: 'push',
    title: 'The Artist Date',
    why: 'A solo outing built purely for inspiration, with no other agenda, is a different kind of input than anything scheduled around productivity.',
    what: 'Take one solo outing purely for inspiration.',
    rules: ['A museum, a bookstore, a walk somewhere new — solo, and with no other purpose attached.'],
    outcome: 'One outing that existed purely to feed you something, with no other job to do.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'learn-one-weird-thing',
    primaryDomain: 'inspiration',
    season: 'push',
    title: 'Learn One Weird Thing',
    why: "Learning something with zero practical use removes the pressure that usually turns learning into another task.",
    what: 'Pick something completely impractical to learn, and start.',
    rules: ['Impractical is the requirement — if it has an obvious use, pick something else.'],
    outcome: 'One new, useless, genuinely interesting thing you now know.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'inspiration-hunt',
    primaryDomain: 'inspiration',
    season: 'push',
    title: 'Inspiration Hunt',
    why: 'Actively hunting for things that catch your attention trains you to notice them more often, even outside the challenge.',
    what: 'Photograph ten things that genuinely catch your attention.',
    rules: ['No theme required — the only filter is that it actually caught your eye.'],
    outcome: 'A small, honest collection of what your attention is drawn to when nobody\'s directing it.',
    completion: { type: 'cumulative', target: 10, unit: 'items', windowDays: 14, entryLog: true },
  },
  {
    id: 'make-a-tiny-thing',
    primaryDomain: 'inspiration',
    season: 'push',
    title: 'Make a Tiny Thing',
    why: 'A small, finished thing beats a large, unfinished one for proving to yourself that you can actually complete what you start.',
    what: 'Finish something creative in under an hour.',
    rules: ['Under an hour, actually finished — small scope is the whole mechanism here.'],
    outcome: 'One small, completed thing that exists because you made it.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'future-life-board',
    primaryDomain: 'inspiration',
    season: 'push',
    title: 'Future Life Board',
    why: 'Collecting how you want life to feel, rather than what you want to own, keeps the exercise honest instead of turning into a shopping list.',
    what: 'Collect things that represent how you want life to feel — not possessions you want.',
    rules: ['Feelings, not objects — a photo of a place, a word, a color, a mood. No price tags.'],
    outcome: 'A slowly built, honest picture of what you\'re actually working toward.',
    completion: { type: 'cumulative', target: 10, unit: 'items', entryLog: true },
  },
  {
    id: 'the-lost-interest',
    primaryDomain: 'inspiration',
    season: 'push',
    title: 'The Lost Interest',
    why: "Something you abandoned years ago rarely got abandoned because you stopped caring — usually life just got in the way.",
    what: "Revisit something you abandoned years ago.",
    rules: ['An instrument, a hobby, a half-written something — pick it back up, even briefly.'],
    outcome: 'A direct answer on whether it\'s worth picking back up for real.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },

  // ── Crossover ─────────────────────────────────────────────────────────
  // "Stronger Than Day One" (benchmark + 30-day retest), "The Energy
  // Experiment" (cross-referencing logged sleep/food/movement against
  // energy scores), and "30 Days From Now" (three independently-tracked
  // goals inside one challenge) are deliberately not included -- none of
  // them fit streak/cumulative/audit without real new capability (a
  // benchmark-and-retest completion type, and read access to other
  // sections' logged data for correlation). Flagging rather than forcing.
  {
    id: 'main-character-weekend',
    primaryDomain: 'confidence',
    secondaryTags: ['inspiration', 'body'],
    season: 'push',
    title: 'The Main Character Weekend',
    why: 'Most weekends default to whatever\'s easiest or most obligated — this one is deliberately planned around what you actually want.',
    what: 'Plan one weekend entirely around things you actually want to experience.',
    rules: ['Plan it in advance — the deliberateness is the point, not just a good weekend that happens to occur.'],
    outcome: 'One weekend that was actually yours, on purpose.',
    completion: { type: 'streak', durationDays: 2, tolerance: 'strict' },
  },
  {
    id: 'bedroom-brain-reset',
    primaryDomain: 'space',
    secondaryTags: ['sleep', 'confidence'],
    season: 'push',
    title: 'Bedroom → Brain Reset',
    why: 'Your sleep environment is one of the highest-leverage, least-touched parts of the Phase 1 sleep protocol.',
    what: 'Change your sleep environment, then notice whether mornings feel different.',
    rules: ["The 'measuring' part is your own read on it — compare how you feel against what you've logged in your daily check-ins, there's no automatic comparison yet."],
    outcome: 'A bedroom set up on purpose, and your own honest read on whether it mattered.',
    completion: { type: 'streak', durationDays: 1, tolerance: 'strict' },
  },
  {
    id: 'wear-your-closet',
    primaryDomain: 'space',
    secondaryTags: ['confidence'],
    season: 'push',
    title: 'Wear Your Closet',
    why: 'Closet Shop finds the outfits — this challenge is about actually wearing them instead of rediscovering the same three defaults.',
    what: 'Create and actually wear seven outfits built from clothing you\'d forgotten you owned.',
    rules: ['Log each one on the day you wear it, not when you plan it.'],
    outcome: 'A closet that feels twice as large, without buying anything.',
    completion: { type: 'cumulative', target: 7, unit: 'items', windowDays: 30, entryLog: true },
  },
  {
    id: 'anti-optimization-week',
    primaryDomain: 'general',
    secondaryTags: ['body', 'food', 'confidence', 'space', 'inspiration'],
    season: 'push',
    title: 'The Anti-Optimization Challenge',
    why: "Every other challenge in this library is about improving something — this one exists so that instinct gets a rest, deliberately.",
    what: 'For seven days, do things because they\'re enjoyable, beautiful, interesting, or satisfying — not because they improve you.',
    rules: ['No self-improvement framing allowed, even secretly. If it\'s "good for you," it doesn\'t count here.'],
    outcome: 'A week of proof that you don\'t need a productivity reason to do something worthwhile.',
    completion: { type: 'streak', durationDays: 7, tolerance: 1 },
  },
];
