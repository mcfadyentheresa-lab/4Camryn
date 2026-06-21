CREATE TABLE IF NOT EXISTS camryn_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'other',
  note text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE camryn_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_likes" ON camryn_likes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_likes" ON camryn_likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_likes" ON camryn_likes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_likes" ON camryn_likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
