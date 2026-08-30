/*
  # Create camryn_challenge_resistance_events

  ## Why
  Food and Body (exercise/movement) challenges fail differently than other
  challenges: not from forgetting the goal, but from a strong in-the-moment
  "no" right at the point of starting. This table logs each resistance
  moment -- what kind, what was offered, what was chosen, and how it went --
  so the app can learn what actually works for a given resistance type
  instead of treating every skipped day the same way.

  This is purely additive. camryn_challenge_instances and its RPCs
  (start_challenge_instance, complete_challenge_instance) are untouched --
  resistance is a moment, not an instance status, and can happen repeatedly
  within a single still-active instance.

  ## New Table
  `camryn_challenge_resistance_events` -- one row per resistance moment.
  Write pattern is insert-then-update, not insert-once-at-the-end: the row
  is created the moment a resistance_type is chosen, then updated as the
  flow (intervention offered -> selected -> outcome) resolves. Closing the
  flow early still preserves the classification instead of losing it.

  - `resistance_type` -- free text, not a CHECK-constrained enum, so the
    category list in resistanceSupport.ts can grow without a migration.
  - `intervention_offered` -- text[] of what was shown (usually 2 options).
  - `intervention_selected` -- nullable; null means the flow was abandoned
    after classification but before picking an intervention.
  - `started` / `completed_full` / `completed_reduced` /
    `continued_past_minimum` -- nullable booleans, filled in as the flow
    resolves. completed_reduced marks a Minimum Viable Win day -- it still
    counts as a normal completed day via the existing logStreakDay/
    logMoneyEntry path; this column is only an annotation for the cap in
    guardrail #1 (challengeProgress.ts's getMvwUsageCount) and for future
    coaching copy, not a new completion type.
  - `felt_afterward` -- nullable, skippable self-report.
  - `challenge_domain` -- snapshot of primaryDomain at event time, same
    "snapshot at acceptance" reasoning as camryn_challenge_instances.params,
    so historical stats stay stable even if content.ts domains ever change.
  - `occurred_date` -- client-supplied localToday(), never server-derived,
    matching every other date column in this schema (see date.ts header on
    why now()::date would be UTC and silently wrong for part of every
    evening).

  ## Security
  RLS enabled, owner-scoped CRUD. The INSERT policy checks the parent
  instance's user_id (not just the row's own user_id column) -- same
  pattern already used for camryn_challenge_streak_days/money_entries/
  audit_items, guarding against a row claiming the inserter's own user_id
  while instance_id points at someone else's instance.
*/

CREATE TABLE IF NOT EXISTS camryn_challenge_resistance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES camryn_challenge_instances(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_domain text NOT NULL,
  resistance_type text NOT NULL,
  intervention_offered text[] NOT NULL DEFAULT '{}',
  intervention_selected text,
  started boolean,
  completed_full boolean,
  completed_reduced boolean,
  continued_past_minimum boolean,
  felt_afterward text,
  occurred_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS camryn_challenge_resistance_events_instance_idx ON camryn_challenge_resistance_events (instance_id);
CREATE INDEX IF NOT EXISTS camryn_challenge_resistance_events_user_idx ON camryn_challenge_resistance_events (user_id);

ALTER TABLE camryn_challenge_resistance_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_resistance_events" ON camryn_challenge_resistance_events;
CREATE POLICY "select_own_resistance_events" ON camryn_challenge_resistance_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_resistance_events" ON camryn_challenge_resistance_events;
CREATE POLICY "insert_own_resistance_events" ON camryn_challenge_resistance_events FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM camryn_challenge_instances i WHERE i.id = instance_id AND i.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_resistance_events" ON camryn_challenge_resistance_events;
CREATE POLICY "update_own_resistance_events" ON camryn_challenge_resistance_events FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
