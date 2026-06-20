/*
  # Create Camryn Protocol Schema

  1. New Tables
    - `camryn_sessions` - Stores user protocol state (current phase, cycle, energy, stress)
    - `camryn_daily_saves` - Records each day's task completion and progress
    - `camryn_unlocks` - Tracks mastery countdown progress for each phase
  
  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Authenticated users only
  
  3. Features
    - Session state: phase, cycle tracking, energy/stress levels
    - Daily save snapshots: completion status and timestamps
    - Mastery tracking: countdown progress across phases
*/

CREATE TABLE IF NOT EXISTS camryn_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_phase integer DEFAULT 1,
  cycle_phase_name text DEFAULT 'Not sure',
  cycle_day integer,
  last_period_date date,
  energy text DEFAULT 'Medium',
  stress text DEFAULT 'Moderate',
  save_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS camryn_daily_saves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  save_date date NOT NULL,
  tasks_complete integer DEFAULT 0,
  tasks_total integer DEFAULT 3,
  is_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, save_date)
);

CREATE TABLE IF NOT EXISTS camryn_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase_id integer NOT NULL,
  unlock_index integer NOT NULL,
  title text NOT NULL,
  total_days integer NOT NULL,
  remaining_days integer NOT NULL,
  status text DEFAULT 'not_started',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE camryn_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE camryn_daily_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE camryn_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own session"
  ON camryn_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own session"
  ON camryn_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own session"
  ON camryn_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own daily saves"
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

CREATE POLICY "Users can read own unlocks"
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

CREATE INDEX idx_camryn_sessions_user ON camryn_sessions(user_id);
CREATE INDEX idx_camryn_daily_saves_user_date ON camryn_daily_saves(user_id, save_date);
CREATE INDEX idx_camryn_unlocks_user ON camryn_unlocks(user_id);
