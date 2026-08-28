// Pure progress calculations for challenge instances -- no I/O. Mirrors the
// calcStreak/calcProgressPct split in mastery.ts: read functions (in
// challengeCompletion.ts) fetch raw rows, these turn raw rows into a
// pass/fail/in-progress verdict. Nothing here is ever cached back as a
// stored number -- see the money-entries note in the migration about why
// progress is always summed from raw rows, not a running counter.

import { addLocalDays, localToday } from './date';

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
  windowEndsDate: string,
  asOfDate: string = localToday(),
): CumulativeEvaluation {
  const total = entryAmounts.reduce((sum, a) => sum + a, 0);
  const isComplete = total >= target;
  return {
    total,
    progressPct: Math.min(100, Math.round((total / target) * 100)),
    isComplete,
    // Expired only matters if it hasn't already succeeded -- hitting the
    // target on the last possible day is still a completion, not a miss.
    isExpired: !isComplete && asOfDate > windowEndsDate,
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
