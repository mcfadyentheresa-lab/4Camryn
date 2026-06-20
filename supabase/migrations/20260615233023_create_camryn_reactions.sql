CREATE TABLE IF NOT EXISTS camryn_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journal_entry_id uuid NOT NULL,
  reaction text NOT NULL CHECK (reaction IN ('helpful', 'not_quite')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, journal_entry_id)
);

ALTER TABLE camryn_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_reactions" ON camryn_reactions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_reactions" ON camryn_reactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_reactions" ON camryn_reactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_reactions" ON camryn_reactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_camryn_reactions_user ON camryn_reactions(user_id, created_at DESC);
