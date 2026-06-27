ALTER TABLE camryn_sessions
  ADD COLUMN IF NOT EXISTS phase_start_save_count integer NOT NULL DEFAULT 0;
