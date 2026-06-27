CREATE TABLE IF NOT EXISTS camryn_exercise (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date    date NOT NULL,
  movement_type text,
  duration_min  integer,
  intensity     text,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE camryn_exercise ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_exercise" ON camryn_exercise FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_exercise" ON camryn_exercise FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_exercise" ON camryn_exercise FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_exercise" ON camryn_exercise FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
