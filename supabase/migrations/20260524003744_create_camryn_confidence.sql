/*
  # Create camryn_confidence table

  Stores daily confidence and rebrand notes per user.

  1. New Tables
    - `camryn_confidence`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `entry_date` (date) — the day this entry belongs to
      - `confidence_note` (text) — how the user showed up externally today
      - `rebrand_note` (text) — keep/retire details for the quiet rebrand profile
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - UNIQUE(user_id, entry_date) — one entry per user per day, enables clean upserts

  2. Security
    - Enable RLS
    - Users can only select, insert, and update their own rows
*/

CREATE TABLE IF NOT EXISTS camryn_confidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  confidence_note text NOT NULL DEFAULT '',
  rebrand_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
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
