/*
  # Add onboarding_complete flag to sessions

  ## Changes
  - `camryn_sessions`: adds `onboarding_complete` boolean column (default false)

  This lets the app detect first-time users and show the welcome onboarding flow.
  Existing users are backfilled to true so they don't see the onboarding again.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_sessions' AND column_name = 'onboarding_complete'
  ) THEN
    ALTER TABLE camryn_sessions ADD COLUMN onboarding_complete boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Existing users who already have a display_name are considered onboarded
UPDATE camryn_sessions SET onboarding_complete = true WHERE display_name IS NOT NULL AND display_name != '';
