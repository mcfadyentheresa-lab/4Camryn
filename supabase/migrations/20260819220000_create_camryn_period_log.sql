CREATE TABLE IF NOT EXISTS camryn_period_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date   date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE camryn_period_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_period_log" ON camryn_period_log FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_period_log" ON camryn_period_log FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_period_log" ON camryn_period_log FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_period_log" ON camryn_period_log FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
