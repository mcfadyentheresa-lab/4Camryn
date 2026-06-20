-- Add rebrand_prompt column to camryn_confidence_profile
-- Stores the user's answer to the daily rebrand identity prompt
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_confidence_profile' AND column_name = 'rebrand_prompt'
  ) THEN
    ALTER TABLE camryn_confidence_profile ADD COLUMN rebrand_prompt text NOT NULL DEFAULT '';
  END IF;
END $$;
