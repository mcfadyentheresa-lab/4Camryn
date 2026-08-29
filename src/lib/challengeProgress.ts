// Pure progress calculations for challenge instances -- no I/O. Mirrors the
// calcStreak/calcProgressPct split in mastery.ts: read functions (in
// challengeCompletion.ts) fetch raw rows, these turn raw rows into a
// pass/fail/in-progress verdict. Nothing here is ever cached back as a
// stored number -- see the money-entries note in the migration about why
// progress is always summed from raw rows, not a running counter.

import { addLocalDays, localToday } from './date';
import { CHALLENGE_LIBRARY, DOMAIN_STYLE, type ChallengeContent, type ChallengeDomain } from './challenges';

export interface StreakEvaluation {
  daysCompleted: number;
  skipsUsed: number;
  isBroken: boolean;
  brokenOnDate: string | null;
  isComplete: boolean;
}

// Evaluates a streak challenge day-by-day from acceptance, not backward from
// today like mastery.ts's calcStreak -- a challenge has a fixed start date,
// so a gap before it started must never be misread as a missed day. Stops
// at whichever comes first: the challenge's duration, or today, since a day
// that hasn't happened yet can't be judged as a miss.
export function evaluateStreakChallenge(
  completedDates: string[],
  acceptedDate: string,
  durationDays: number,
  tolerance: 'strict' | number,
  asOfDate: string = localToday(),
): StreakEvaluation {
  const completed = new Set(completedDates);
  const maxSkips = tolerance === 'strict' ? 0 : tolerance;

  let cursor = acceptedDate;
  let daysCompleted = 0;
  let skipsUsed = 0;
  let isBroken = false;
  let brokenOnDate: string | null = null;

  for (let i = 0; i < durationDays && cursor <= asOfDate; i++) {
    if (completed.has(cursor)) {
      daysCompleted++;
    } else if (cursor < asOfDate) {
      if (skipsUsed < maxSkips) {
        skipsUsed++;
      } else {
        isBroken = true;
        brokenOnDate = cursor;
        break;
      }
    }
    cursor = addLocalDays(cursor, 1);
  }

  return { daysCompleted, skipsUsed, isBroken, brokenOnDate, isComplete: daysCompleted >= durationDays };
}

export interface CumulativeEvaluation {
  total: number;
  progressPct: number;
  isComplete: boolean;
  isExpired: boolean;
}

export function evaluateCumulativeChallenge(
  entryAmounts: number[],
  target: number,
  windowEndsDate: string | null,
  asOfDate: string = localToday(),
): CumulativeEvaluation {
  const total = entryAmounts.reduce((sum, a) => sum + a, 0);
  const isComplete = total >= target;
  return {
    total,
    progressPct: Math.min(100, Math.round((total / target) * 100)),
    isComplete,
    // Expired only matters if it hasn't already succeeded (hitting the
    // target on the last possible day is still a completion, not a miss)
    // and the challenge actually has a window -- an open-ended one (e.g.
    // "100 Club") never expires.
    isExpired: !isComplete && windowEndsDate !== null && asOfDate > windowEndsDate,
  };
}

export interface AuditEvaluation {
  reviewedCount: number;
  totalCount: number;
  isComplete: boolean;
  foundMonthlyTotal: number;
}

export function evaluateAuditChallenge(
  items: { monthlyCost: number | null; usedRecently: boolean | null }[],
): AuditEvaluation {
  const totalCount = items.length;
  const reviewedCount = items.filter((i) => i.usedRecently !== null).length;
  const foundMonthlyTotal = items
    .filter((i) => i.usedRecently === false)
    .reduce((sum, i) => sum + (i.monthlyCost ?? 0), 0);
  return {
    reviewedCount,
    totalCount,
    isComplete: totalCount > 0 && reviewedCount === totalCount,
    foundMonthlyTotal,
  };
}

export interface FeaturedRecommendation {
  challenge: ChallengeContent;
  reason: string;
}

// A challenge's rough time/effort commitment, used only to break ties among
// equally-underrepresented domains -- biases a first exposure to a new
// domain toward something approachable rather than e.g. "100 Club."
function commitmentWeight(challenge: ChallengeContent): number {
  if (challenge.completion.type === 'streak') return challenge.completion.durationDays;
  if (challenge.completion.type === 'cumulative') return challenge.completion.target;
  return 3;
}

// Picks up to 3 candidates, ranked by how underrepresented their domain is
// in what the user has actually done (active + history, any outcome --
// engagement is the signal, not just success). A domain the user has never
// touched always outranks one they've done five of, regardless of the
// specific challenges in either. Ties with no history at all fall back to
// commitment weight, which naturally makes the very first recommendation a
// low-effort one instead of an arbitrary pick.
export function getFeaturedChallenges(
  activeChallengeIds: string[],
  historyInstances: { challenge_id: string; status: string }[],
): FeaturedRecommendation[] {
  const completedIds = new Set(historyInstances.filter((i) => i.status === 'completed').map((i) => i.challenge_id));
  const engagedIds = new Set([...activeChallengeIds, ...historyInstances.map((i) => i.challenge_id)]);

  const domainCounts: Partial<Record<ChallengeDomain, number>> = {};
  for (const id of engagedIds) {
    const content = CHALLENGE_LIBRARY.find((c) => c.id === id);
    if (!content) continue;
    domainCounts[content.primaryDomain] = (domainCounts[content.primaryDomain] ?? 0) + 1;
  }

  const activeSet = new Set(activeChallengeIds);
  const eligible = CHALLENGE_LIBRARY.filter((c) => {
    if (activeSet.has(c.id) || completedIds.has(c.id)) return false;
    return (c.prerequisites ?? []).every((id) => completedIds.has(id));
  });

  const totalEngagement = Object.values(domainCounts).reduce((sum: number, n) => sum + (n ?? 0), 0);
  const [mostEngagedDomain] = (Object.entries(domainCounts) as [ChallengeDomain, number][])
    .sort((a, b) => b[1] - a[1])[0] ?? [];

  const ranked = eligible
    .map((challenge) => ({ challenge, domainCount: domainCounts[challenge.primaryDomain] ?? 0 }))
    .sort((a, b) => (a.domainCount - b.domainCount) || (commitmentWeight(a.challenge) - commitmentWeight(b.challenge)));

  return ranked.slice(0, 3).map(({ challenge, domainCount }) => {
    const domainLabel = DOMAIN_STYLE[challenge.primaryDomain].label;
    let reason: string;
    if (totalEngagement === 0) {
      reason = 'A good one to start with — nothing here is required.';
    } else if (domainCount === 0) {
      reason = `You haven't tried ${domainLabel} yet — here's a good place to start.`;
    } else if (mostEngagedDomain && mostEngagedDomain !== challenge.primaryDomain) {
      reason = `You've leaned toward ${DOMAIN_STYLE[mostEngagedDomain].label} lately — here's something from ${domainLabel} instead.`;
    } else {
      reason = "Here's one you haven't tried yet.";
    }
    return { challenge, reason };
  });
}
