/*
  # Create camryn_journal table

  ## Summary
  Stores user journal entries and Camryn's AI-generated replies.
  Each entry captures the user's free-text input, the AI response,
  and a snapshot of today's wellness context (phase, energy, etc.)
  so the conversation log stays meaningful over time.

  ## New Table: camryn_journal
  - `id` — uuid primary key
  - `user_id` — references auth.users
  - `created_at` — full timestamp (serves as unique entry key)
  - `entry_date` — YYYY-MM-DD date string for grouping by day
  - `user_text` — the user's journal message
  - `camryn_reply` — Camryn's AI-generated reflection
  - `phase` — protocol phase name at time of entry (e.g. "Follicular")
  - `protocol_phase` — protocol phase number (1, 2, 3)
  - `energy` — session energy level at time of entry
  - `body_snapshot` — jsonb: { energy, symptoms, cycle_status, vitamins }
  - `confidence_snapshot` — jsonb: { confidence_note }
  - `mastery_snapshot` — jsonb: streaks summary

  ## Security
  - RLS enabled; users can only access their own journal entries.
*/

CREATE TABLE IF NOT EXISTS camryn_journal (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at      timestamptz DEFAULT now(),
  entry_date      text NOT NULL,
  user_text       text NOT NULL DEFAULT '',
  camryn_reply    text NOT NULL DEFAULT '',
  phase           text NOT NULL DEFAULT '',
  protocol_phase  integer NOT NULL DEFAULT 1,
  energy          text NOT NULL DEFAULT '',
  body_snapshot   jsonb DEFAULT '{}'::jsonb,
  confidence_snapshot jsonb DEFAULT '{}'::jsonb,
  mastery_snapshot jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS camryn_journal_user_date
  ON camryn_journal (user_id, entry_date DESC);

ALTER TABLE camryn_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own journal entries"
  ON camryn_journal FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON camryn_journal FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON camryn_journal FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
