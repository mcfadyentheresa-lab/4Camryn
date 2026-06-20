-- Add cycle action tracking columns to camryn_sessions
-- Replaces localStorage-based cycleActions.ts storage so data persists across devices/cache clears
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_sessions' AND column_name = 'cycle_action_pick'
  ) THEN
    ALTER TABLE camryn_sessions ADD COLUMN cycle_action_pick jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_sessions' AND column_name = 'intentional_action'
  ) THEN
    ALTER TABLE camryn_sessions ADD COLUMN intentional_action jsonb;
  END IF;
END $$;
