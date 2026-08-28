/*
  # Create challenge library tables (camryn_challenge_*)

  ## Why
  Backs the optional challenge library (src/lib/challenges.ts) — bounded
  sprints a user opts into on top of the always-on 52-week protocol.
  Challenge *content* (why/what/rules/completion shape) lives in code, like
  PROTOCOL already does; these tables hold only per-user *state*, and each
  instance snapshots the params it was accepted with so a later content edit
  never reinterprets an already-running challenge.

  This schema deliberately guards two failure modes that already happened in
  this app's history, not hypothetical ones:
  - camryn_unlocks had no uniqueness on its natural key and took a real
    double-fire duplicate-insert bug (see
    20260726203428_dedupe_camryn_unlocks_and_add_unique_constraint.sql).
    Every table here gets its natural-key uniqueness constraint from day one,
    not bolted on after a postmortem.
  - Local-day date bugs from deriving "today" via UTC (see the header comment
    in src/lib/date.ts) have recurred multiple times. Every "which calendar
    day" column here is `date`, and every such value is written by the
    client from localToday() — never derived server-side via now()::date,
    which would be UTC and silently wrong for part of every evening.

  ## New Tables
  1. `camryn_challenge_instances` — one row per accepted challenge run.
     completion_type + params are a snapshot taken at accept time (durationDays/
     tolerance for streak challenges; target/unit/windowDays for cumulative;
     reviewUnit/markField for audit). challenge_id is free text, intentionally
     not constrained to an enum, since the content list in challenges.ts
     grows without needing a migration each time.
  2. `camryn_challenge_streak_days` — one row per completed calendar day for
     a streak-type instance. Streak length/tolerance is computed by reading
     these rows (mirrors calcStreak in mastery.ts), never stored as a counter.
  3. `camryn_challenge_money_entries` — itemized entries for cumulative-type
     instances (e.g. Find $1,000). Progress is SUM(amount), always computed
     at read time — never a separately-stored running total that can drift,
     the same lesson documented in completion.ts about save_count.
  4. `camryn_challenge_audit_items` — reviewable line items for audit-type
     instances (e.g. Subscription Audit). used_recently is nullable: null
     means "not yet reviewed," so the audit's completion (every item
     reviewed) is distinguishable from every item being marked unused.

  ## Constraints worth calling out
  - Partial unique index on camryn_challenge_instances(user_id, challenge_id)
    WHERE status IN ('active','paused') — only one concurrent run of a given
    challenge per user, while still allowing it to be repeated later after
    completion/failure/abandonment.
  - Child-table INSERT policies check the parent instance's user_id, not just
    the row's own user_id column — without this, a row could carry the
    inserting user's own user_id while pointing instance_id at someone else's
    instance, silently polluting that instance's totals for anyone who reads
    by instance_id without separately re-checking ownership.

  ## Functions
  - `start_challenge_instance(...)` — atomic prerequisite check + insert.
    Prerequisites are passed in from the client (content lives in code) and
    checked server-side inside the same statement that inserts the row, so a
    stale client cache can't start a challenge whose prerequisite was never
    actually completed.
  - `complete_challenge_instance(...)` — atomic guarded status transition.
    Only moves a row out of ('active','paused') once: a retried call after a
    flaky network response updates zero rows instead of double-completing
    (the same class of bug the camryn_unlocks dedupe migration fixed after
    the fact).

  ## Security
  RLS enabled on all four tables, owner-scoped CRUD via auth.uid() = user_id,
  matching every other camryn_* table.
*/

-- 1. Instances -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS camryn_challenge_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id text NOT NULL,
  completion_type text NOT NULL CHECK (completion_type IN ('streak', 'cumulative', 'audit')),
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed', 'abandoned')),
  accepted_date date NOT NULL,
  window_ends_date date,
  paused_at timestamptz,
  paused_days_total integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  failed_at timestamptz,
  unlocked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS camryn_challenge_instances_user_idx ON camryn_challenge_instances (user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'camryn_challenge_instances_active_unique'
  ) THEN
    CREATE UNIQUE INDEX camryn_challenge_instances_active_unique
      ON camryn_challenge_instances (user_id, challenge_id)
      WHERE status IN ('active', 'paused');
  END IF;
END $$;

ALTER TABLE camryn_challenge_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_challenge_instances" ON camryn_challenge_instances;
CREATE POLICY "select_own_challenge_instances" ON camryn_challenge_instances FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_challenge_instances" ON camryn_challenge_instances;
CREATE POLICY "insert_own_challenge_instances" ON camryn_challenge_instances FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_challenge_instances" ON camryn_challenge_instances;
CREATE POLICY "update_own_challenge_instances" ON camryn_challenge_instances FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Streak days -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS camryn_challenge_streak_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES camryn_challenge_instances(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (instance_id, completed_date)
);

CREATE INDEX IF NOT EXISTS camryn_challenge_streak_days_instance_idx ON camryn_challenge_streak_days (instance_id);

ALTER TABLE camryn_challenge_streak_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_streak_days" ON camryn_challenge_streak_days;
CREATE POLICY "select_own_streak_days" ON camryn_challenge_streak_days FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_streak_days" ON camryn_challenge_streak_days;
CREATE POLICY "insert_own_streak_days" ON camryn_challenge_streak_days FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM camryn_challenge_instances i WHERE i.id = instance_id AND i.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_streak_days" ON camryn_challenge_streak_days;
CREATE POLICY "delete_own_streak_days" ON camryn_challenge_streak_days FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 3. Money entries -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS camryn_challenge_money_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES camryn_challenge_instances(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  recurring boolean NOT NULL DEFAULT false,
  logged_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS camryn_challenge_money_entries_instance_idx ON camryn_challenge_money_entries (instance_id);

ALTER TABLE camryn_challenge_money_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_money_entries" ON camryn_challenge_money_entries;
CREATE POLICY "select_own_money_entries" ON camryn_challenge_money_entries FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_money_entries" ON camryn_challenge_money_entries;
CREATE POLICY "insert_own_money_entries" ON camryn_challenge_money_entries FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM camryn_challenge_instances i WHERE i.id = instance_id AND i.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_money_entries" ON camryn_challenge_money_entries;
CREATE POLICY "update_own_money_entries" ON camryn_challenge_money_entries FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_money_entries" ON camryn_challenge_money_entries;
CREATE POLICY "delete_own_money_entries" ON camryn_challenge_money_entries FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 4. Audit items -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS camryn_challenge_audit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES camryn_challenge_instances(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  monthly_cost numeric(10, 2),
  used_recently boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS camryn_challenge_audit_items_instance_idx ON camryn_challenge_audit_items (instance_id);

ALTER TABLE camryn_challenge_audit_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_audit_items" ON camryn_challenge_audit_items;
CREATE POLICY "select_own_audit_items" ON camryn_challenge_audit_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_audit_items" ON camryn_challenge_audit_items;
CREATE POLICY "insert_own_audit_items" ON camryn_challenge_audit_items FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM camryn_challenge_instances i WHERE i.id = instance_id AND i.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_audit_items" ON camryn_challenge_audit_items;
CREATE POLICY "update_own_audit_items" ON camryn_challenge_audit_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_audit_items" ON camryn_challenge_audit_items;
CREATE POLICY "delete_own_audit_items" ON camryn_challenge_audit_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 5. Atomic start (prerequisite check + insert) -----------------------------

CREATE OR REPLACE FUNCTION public.start_challenge_instance(
  p_challenge_id text,
  p_completion_type text,
  p_params jsonb,
  p_accepted_date date,
  p_window_ends_date date,
  p_prerequisite_ids text[] DEFAULT '{}'
)
RETURNS camryn_challenge_instances
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_missing text;
  v_row camryn_challenge_instances;
BEGIN
  IF p_prerequisite_ids IS NOT NULL AND array_length(p_prerequisite_ids, 1) > 0 THEN
    SELECT req INTO v_missing
    FROM unnest(p_prerequisite_ids) AS req
    WHERE NOT EXISTS (
      SELECT 1 FROM camryn_challenge_instances i
      WHERE i.user_id = auth.uid()
        AND i.challenge_id = req
        AND i.status = 'completed'
    )
    LIMIT 1;

    IF v_missing IS NOT NULL THEN
      RAISE EXCEPTION 'prerequisite_not_met: %', v_missing;
    END IF;
  END IF;

  INSERT INTO camryn_challenge_instances (
    user_id, challenge_id, completion_type, params, accepted_date, window_ends_date
  ) VALUES (
    auth.uid(), p_challenge_id, p_completion_type, p_params, p_accepted_date, p_window_ends_date
  )
  RETURNING * INTO v_row;

  RETURN v_row;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'challenge_already_active: %', p_challenge_id;
END;
$$;

REVOKE ALL ON FUNCTION public.start_challenge_instance(text, text, jsonb, date, date, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_challenge_instance(text, text, jsonb, date, date, text[]) TO authenticated;

-- 6. Atomic guarded completion -----------------------------------------------

CREATE OR REPLACE FUNCTION public.complete_challenge_instance(
  p_instance_id uuid,
  p_grants_unlock boolean DEFAULT false
)
RETURNS camryn_challenge_instances
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_row camryn_challenge_instances;
BEGIN
  UPDATE camryn_challenge_instances
  SET status = 'completed',
      completed_at = now(),
      unlocked_at = CASE WHEN p_grants_unlock THEN now() ELSE unlocked_at END,
      updated_at = now()
  WHERE id = p_instance_id
    AND user_id = auth.uid()
    AND status IN ('active', 'paused')
  RETURNING * INTO v_row;

  -- No row updated means this instance was already completed/failed/abandoned
  -- (or doesn't belong to the caller) -- a retried call is a safe no-op,
  -- returning NULL rather than raising, so the client can treat "already
  -- done" the same as "just did it."
  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_challenge_instance(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_challenge_instance(uuid, boolean) TO authenticated;