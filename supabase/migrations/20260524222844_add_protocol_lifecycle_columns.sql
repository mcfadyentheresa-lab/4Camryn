/*
  # Add protocol lifecycle columns to camryn_sessions

  ## Changes
  - `camryn_sessions`:
    - `protocol_complete` (boolean, default false) — true when all 3 phases mastered
    - `protocol_completed_at` (timestamptz, nullable) — when graduation happened
    - `protocol_mode` (text, default 'protocol') — 'protocol' | 'maintain' | 'restarting'
    - `mastery_data` (jsonb, nullable) — all-phase mastery quest state (replaces localStorage)

  ## Notes
  - mastery_data stores `{ phase1: MasteryData, phase2: MasteryData, phase3: MasteryData }`
  - Existing users keep protocol_mode = 'protocol' by default
  - No data is destroyed; localStorage mastery will be migrated client-side on first load
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_sessions' AND column_name = 'protocol_complete'
  ) THEN
    ALTER TABLE camryn_sessions ADD COLUMN protocol_complete boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_sessions' AND column_name = 'protocol_completed_at'
  ) THEN
    ALTER TABLE camryn_sessions ADD COLUMN protocol_completed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_sessions' AND column_name = 'protocol_mode'
  ) THEN
    ALTER TABLE camryn_sessions ADD COLUMN protocol_mode text NOT NULL DEFAULT 'protocol';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_sessions' AND column_name = 'mastery_data'
  ) THEN
    ALTER TABLE camryn_sessions ADD COLUMN mastery_data jsonb;
  END IF;
END $$;
