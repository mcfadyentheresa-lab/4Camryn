/*
  # Create camryn_body table

  Stores daily body snapshot data per user — weight, energy, symptoms,
  vitamin intake, and cycle status notes.

  1. New Tables
    - `camryn_body`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `entry_date` (date) — scoped to one row per user per day
      - `weight` (numeric, nullable) — body weight, unit is user's choice
      - `energy` (smallint, nullable) — 1–5 scale
      - `symptoms` (text) — free-form hormone/body symptoms
      - `vitamins` (jsonb) — map of vitamin name → boolean
      - `cycle_status` (text) — selected label e.g. "Period day", "Luteal"
      - `cycle_note` (text) — free-form cycle observation
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - UNIQUE(user_id, entry_date) — enables clean upserts

  2. Security
    - Enable RLS
    - Policies for select, insert, update on own rows only
*/

CREATE TABLE IF NOT EXISTS camryn_body (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  weight numeric(6, 1),
  energy smallint CHECK (energy IS NULL OR (energy >= 1 AND energy <= 5)),
  symptoms text NOT NULL DEFAULT '',
  vitamins jsonb NOT NULL DEFAULT '{}',
  cycle_status text NOT NULL DEFAULT '',
  cycle_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
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
