-- Migration: redefine camryn_pending_writes payload to match reality
--
-- CORRECTION: the original schema (energy_level, symptom_notes, reflection)
-- was designed around a fictional "check-in" concept that doesn't
-- correspond to any real Camryn write. Camryn's actual daily save
-- (handleSaveDay) only ever records which of today's 3 fixed tasks were
-- completed. This migration replaces the payload fields accordingly.
--
-- Safe to run as a destructive ALTER: no real user data has ever been
-- stored in the old columns (only test rows, already cleaned up).

alter table camryn_pending_writes
  drop column if exists energy_level,
  drop column if exists symptom_notes,
  drop column if exists reflection;

alter table camryn_pending_writes
  add column if not exists tasks_complete integer not null default 3,
  add column if not exists tasks_total integer not null default 3,
  add column if not exists checked_items boolean[] not null default array[true, true, true]::boolean[];

comment on table camryn_pending_writes is
  'Front Door writes a "mark today complete" proposal here after user confirmation. Camryn''s apply-logic reads status = pending rows and applies them via the same writes handleSaveDay performs (camryn_daily_saves + camryn_sessions.save_count in V1; camryn_unlocks and daily_items deferred — see build brief). Never read by the Camryn UI directly.';
