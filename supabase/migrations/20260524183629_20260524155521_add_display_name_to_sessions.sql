/*
  # Add display_name to camryn_sessions

  1. Changes
    - Adds `display_name` text column to `camryn_sessions`
    - Nullable — existing rows stay untouched, app prompts for name on first load
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_sessions' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE camryn_sessions ADD COLUMN display_name text;
  END IF;
END $$;
