/*
  # Create Camryn wellness app tables

  ## New Tables

  1. `camryn_sessions` — Per-user app state (phase, cycle, energy, stress, display name)
  2. `camryn_body` — Daily body tracking (weight, energy, symptoms, vitamins, cycle status)
  3. `camryn_confidence` — Daily confidence & rebrand notes
  4. `camryn_confidence_profile` — Persistent stylist profile answers (one row per user)
  5. `camryn_space` — Daily space & systems notes and environment checklist
  6. `camryn_journal` — Journal chat entries with Camryn AI replies
  7. `camryn_daily_saves` — Daily task completion records
  8. `camryn_unlocks` — Mastery unlock progress tracking

  ## Security
  - RLS enabled on all tables
  - Users can only access their own rows
*/

-- ── Sessions ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS camryn_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_phase integer NOT NULL DEFAULT 1,
  cycle_phase_name text NOT NULL DEFAULT 'Not sure',
  cycle_day integer,
  last_period_date date,
  energy text NOT NULL DEFAULT 'Medium',
  stress text NOT NULL DEFAULT 'Moderate',
  save_count integer NOT NULL DEFAULT 0,
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE camryn_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own session"
  ON camryn_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session"
  ON camryn_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session"
  ON camryn_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Body ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS camryn_body (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  weight numeric(6,2),
  energy integer,
  symptoms text DEFAULT '',
  vitamins jsonb DEFAULT '{}',
  cycle_status text DEFAULT '',
  cycle_note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, entry_date)
);

ALTER TABLE camryn_body ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own body entries"
  ON camryn_body FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own body entries"
  ON camryn_body FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own body entries"
  ON camryn_body FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Confidence daily ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS camryn_confidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  confidence_note text DEFAULT '',
  rebrand_note text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, entry_date)
);

ALTER TABLE camryn_confidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own confidence entries"
  ON camryn_confidence FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own confidence entries"
  ON camryn_confidence FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own confidence entries"
  ON camryn_confidence FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Confidence profile ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS camryn_confidence_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_words text DEFAULT '',
  lifestyle_context text DEFAULT '',
  body_fit_dread text DEFAULT '',
  closet_best_outfit text DEFAULT '',
  closet_skip_piece text DEFAULT '',
  signal_wish text DEFAULT '',
  style_influence text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE camryn_confidence_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own confidence profile"
  ON camryn_confidence_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own confidence profile"
  ON camryn_confidence_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own confidence profile"
  ON camryn_confidence_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Space & Systems ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS camryn_space (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  space_wins text DEFAULT '',
  friction_note text DEFAULT '',
  systems_note text DEFAULT '',
  environment_check jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, entry_date)
);

ALTER TABLE camryn_space ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own space entries"
  ON camryn_space FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own space entries"
  ON camryn_space FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own space entries"
  ON camryn_space FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Journal ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS camryn_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  user_text text NOT NULL DEFAULT '',
  camryn_reply text DEFAULT '',
  phase text DEFAULT '',
  protocol_phase integer DEFAULT 1,
  energy text DEFAULT '',
  body_snapshot jsonb DEFAULT '{}',
  confidence_snapshot jsonb DEFAULT '{}',
  mastery_snapshot jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE camryn_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own journal"
  ON camryn_journal FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal"
  ON camryn_journal FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ── Daily saves ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS camryn_daily_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  save_date date NOT NULL,
  tasks_complete integer NOT NULL DEFAULT 0,
  tasks_total integer NOT NULL DEFAULT 3,
  is_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, save_date)
);

ALTER TABLE camryn_daily_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own daily saves"
  ON camryn_daily_saves FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily saves"
  ON camryn_daily_saves FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily saves"
  ON camryn_daily_saves FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Unlocks ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS camryn_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase_id integer NOT NULL,
  unlock_index integer NOT NULL,
  title text NOT NULL DEFAULT '',
  total_days integer NOT NULL DEFAULT 14,
  remaining_days integer NOT NULL DEFAULT 14,
  status text NOT NULL DEFAULT 'not_started',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE camryn_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own unlocks"
  ON camryn_unlocks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own unlocks"
  ON camryn_unlocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own unlocks"
  ON camryn_unlocks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
