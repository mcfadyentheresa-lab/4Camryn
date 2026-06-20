/*
  # Create camryn_confidence_profile table

  Stores the persistent stylist-style profile answers for each user.
  These are answered once (and can be updated) rather than logged daily.

  Unlike camryn_confidence (daily notes), this table holds one row per user
  containing their ongoing style intake answers — the kind a personal stylist
  would gather in a first consultation.

  1. New Tables
    - `camryn_confidence_profile`
      - `id` (uuid, primary key)
      - `user_id` (uuid, unique — one profile per user)
      - `style_words` (text) — three words for how they want to look
      - `lifestyle_context` (text) — where they spend most of their week
      - `body_fit_dread` (text) — one thing about getting dressed they secretly dread
      - `closet_best_outfit` (text) — outfit that made them feel most like themselves
      - `closet_skip_piece` (text) — piece they always skip and don't know why
      - `signal_wish` (text) — what they wish people sensed before they spoke
      - `style_influence` (text) — whose wardrobe they'd borrow and why
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can select, insert, and update only their own row
*/

CREATE TABLE IF NOT EXISTS camryn_confidence_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  style_words text NOT NULL DEFAULT '',
  lifestyle_context text NOT NULL DEFAULT '',
  body_fit_dread text NOT NULL DEFAULT '',
  closet_best_outfit text NOT NULL DEFAULT '',
  closet_skip_piece text NOT NULL DEFAULT '',
  signal_wish text NOT NULL DEFAULT '',
  style_influence text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
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
