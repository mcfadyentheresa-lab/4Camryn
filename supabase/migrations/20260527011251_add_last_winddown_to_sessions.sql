/*
  # Add last_winddown to camryn_sessions

  1. Changes
    - `camryn_sessions`: new column `last_winddown` (text, nullable)
      Stores a short plain-text summary of the previous night's wind-down
      conversation so Camryn can reference it the following morning.

  2. Notes
    - No data is lost; this is an additive column with no default required.
    - RLS policies are inherited from the existing table setup.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_sessions' AND column_name = 'last_winddown'
  ) THEN
    ALTER TABLE camryn_sessions ADD COLUMN last_winddown text;
  END IF;
END $$;
