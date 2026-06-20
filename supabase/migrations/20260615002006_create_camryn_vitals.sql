CREATE TABLE IF NOT EXISTS camryn_vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  resting_hr integer,
  hrv_ms numeric(6, 1),
  sleep_hours numeric(4, 2),
  steps integer,
  source text NOT NULL DEFAULT 'apple_watch',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entry_date)
);

ALTER TABLE camryn_vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_vitals" ON camryn_vitals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_vitals" ON camryn_vitals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_vitals" ON camryn_vitals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_vitals" ON camryn_vitals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_camryn_vitals_user_date ON camryn_vitals(user_id, entry_date DESC);
