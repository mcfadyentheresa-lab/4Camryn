/*
  # Add food/macro profile and exercise tracking

  ## Changes

  ### New Tables
  - `camryn_food_profile`
    - `user_id` (uuid, pk/fk)
    - `height_cm` (numeric) - for TDEE calculation
    - `weight_kg` (numeric) - current body weight
    - `age` (integer)
    - `goal` (text) - 'lose' | 'maintain' | 'build'
    - `activity_baseline` (text) - 'sedentary' | 'lightly_active' | 'active'
    - `updated_at` (timestamptz)

  ### Modified Tables
  - `camryn_food_daily`
    - `exercised` (boolean) - did user exercise today? Affects macro targets.

  ## Security
  - RLS enabled on camryn_food_profile
  - Authenticated users can only read/write their own profile row
*/

CREATE TABLE IF NOT EXISTS camryn_food_profile (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  height_cm numeric,
  weight_kg numeric,
  age integer,
  goal text NOT NULL DEFAULT 'maintain',
  activity_baseline text NOT NULL DEFAULT 'lightly_active',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE camryn_food_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own food profile"
  ON camryn_food_profile FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food profile"
  ON camryn_food_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food profile"
  ON camryn_food_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_food_daily' AND column_name = 'exercised'
  ) THEN
    ALTER TABLE camryn_food_daily ADD COLUMN exercised boolean NOT NULL DEFAULT false;
  END IF;
END $$;
