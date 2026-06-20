/*
  # Add personal_notes to camryn_sessions

  ## Summary
  Adds a JSONB column `personal_notes` to `camryn_sessions` to store things Camryn
  should remember across conversations — books being read, goals being worked toward,
  tasks the user mentioned. Camryn extracts these from journal entries and references
  them in future replies to create continuity.

  ## Changes
  - `camryn_sessions.personal_notes` (jsonb, default '[]') — array of note objects:
    { type: 'book'|'goal'|'task'|'other', text: string, mentioned_at: ISO date }
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camryn_sessions' AND column_name = 'personal_notes'
  ) THEN
    ALTER TABLE camryn_sessions ADD COLUMN personal_notes jsonb DEFAULT '[]'::jsonb NOT NULL;
  END IF;
END $$;
