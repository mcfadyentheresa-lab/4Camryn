/*
  # Create camryn_space table

  Stores daily Space & Systems log entries per user.

  Space & Systems covers the environments and routines that make it easier
  to live like an upgraded self — especially on low-energy days.

  1. New Tables
    - `camryn_space`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `entry_date` (date) — one row per user per day
      - `space_wins` (text) — what felt orderly, calm, or set up well today
      - `friction_note` (text) — what made life harder than it needed to be
      - `systems_note` (text) — any routine or system the user ran or wants to run
      - `environment_check` (jsonb) — map of checklist item → boolean
        e.g. { "bedroom-tidy": true, "kitchen-reset": false }
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - UNIQUE(user_id, entry_date)

  2. Security
    - Enable RLS
    - Users can select, insert, and update only their own rows
*/

CREATE TABLE IF NOT EXISTS camryn_space (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  space_wins text NOT NULL DEFAULT '',
  friction_note text NOT NULL DEFAULT '',
  systems_note text NOT NULL DEFAULT '',
  environment_check jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
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
