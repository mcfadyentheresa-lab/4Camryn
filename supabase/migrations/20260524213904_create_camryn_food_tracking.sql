/*
  # Create food tracking table

  1. New Tables
    - `camryn_food_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `entry_date` (date, the day this entry belongs to)
      - `meal_type` (text: 'breakfast' | 'lunch' | 'dinner' | 'snack')
      - `description` (text, free-form meal description)
      - `protein_g` (numeric, optional estimated protein grams)
      - `notes` (text, optional notes e.g. how it made them feel)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Also adds a daily nutrition summary table:
    - `camryn_food_daily`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `entry_date` (date)
      - `water_ml` (integer, daily water intake in ml)
      - `hunger_rating` (integer 1-5, overall hunger/satiety)
      - `energy_after_eating` (integer 1-5)
      - `notes` (text, end-of-day nutrition note)
      - `updated_at` (timestamptz)
      - Unique on (user_id, entry_date)

  3. Security
    - Enable RLS on both tables
    - Authenticated users can read/insert/update/delete their own entries
*/

CREATE TABLE IF NOT EXISTS camryn_food_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  meal_type text NOT NULL DEFAULT 'snack',
  description text NOT NULL DEFAULT '',
  protein_g numeric,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS camryn_food_entries_user_date
  ON camryn_food_entries (user_id, entry_date);

ALTER TABLE camryn_food_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own food entries"
  ON camryn_food_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food entries"
  ON camryn_food_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food entries"
  ON camryn_food_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food entries"
  ON camryn_food_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Daily nutrition summary (one row per user per day)
CREATE TABLE IF NOT EXISTS camryn_food_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  water_ml integer NOT NULL DEFAULT 0,
  hunger_rating integer,
  energy_after_eating integer,
  notes text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, entry_date)
);

ALTER TABLE camryn_food_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own food daily"
  ON camryn_food_daily FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food daily"
  ON camryn_food_daily FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food daily"
  ON camryn_food_daily FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own food daily"
  ON camryn_food_daily FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
