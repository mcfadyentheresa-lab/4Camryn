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
