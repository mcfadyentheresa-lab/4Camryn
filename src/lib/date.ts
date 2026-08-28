// Local-calendar-day date helpers, used everywhere the app needs "what day
// is it" (today's tasks, today's log entries, cutoffs for "last N days",
// once-per-day flags, etc.).
//
// Never use `date.toISOString().split('T')[0]` for this -- toISOString()
// reports UTC. For part of the evening in any timezone west of UTC, UTC has
// already rolled to tomorrow, so a UTC-derived "today" silently points at
// the wrong calendar day: today's own rows go missing, once-per-day flags
// re-trigger a second time, cutoffs are off by one. Confirmed live multiple
// times this session (8:46pm Eastern already reads as tomorrow in UTC).

export function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function localToday(): string {
  return formatLocalDate(new Date());
}

// Adds (or subtracts, with a negative n) whole calendar days to a
// YYYY-MM-DD string. Parses at noon local time before shifting so a shift
// landing on a DST boundary can't skip or repeat a day.
export function addLocalDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12, 0, 0);
  dt.setDate(dt.getDate() + n);
  return formatLocalDate(dt);
}

// Whole calendar days between two YYYY-MM-DD strings (to minus from). Both
// sides are parsed at noon local time, same DST-safety reasoning as
// addLocalDays.
export function daysBetweenLocal(fromDateStr: string, toDateStr: string): number {
  const [fy, fm, fd] = fromDateStr.split('-').map(Number);
  const [ty, tm, td] = toDateStr.split('-').map(Number);
  const from = new Date(fy, fm - 1, fd, 12, 0, 0);
  const to = new Date(ty, tm - 1, td, 12, 0, 0);
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}
