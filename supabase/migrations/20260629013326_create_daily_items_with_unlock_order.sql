/*
# Create daily_items table

Shared task table used to sync daily tasks between Camryn and the Front Door companion app.

1. New Tables
   - `daily_items`
     - `id` (uuid, primary key)
     - `user_id` (uuid, NOT NULL, owner — defaults to auth.uid())
     - `source_app` (text) — which app created the item (e.g. 'camryn')
     - `source_id` (text, unique) — stable identifier for upsert deduplication
     - `title` (text) — task display text
     - `domain` (text) — category (e.g. 'wellness')
     - `priority` (integer) — numeric priority
     - `energy_fit` (text) — 'high', 'medium', or 'low'
     - `estimated_minutes` (integer) — estimated duration
     - `due_today` (boolean) — whether the task is due today
     - `scheduled_date` (date) — the date this task belongs to
     - `completion_state` (text) — 'pending', 'done', or 'completed'
     - `is_hero` (boolean) — whether this is a hero/featured task
     - `display_order` (integer) — sort order within the list
     - `unlock_order` (integer) — sequential unlock gate: task N only becomes active after task N-1 is done. 0 = always available. Used by Front Door to gate locked tasks.
     - `updated_at` (timestamptz)
     - `created_at` (timestamptz)

2. Indexes
   - Index on (user_id, scheduled_date) for efficient daily queries
   - Unique index on source_id for upsert deduplication

3. Security
   - RLS enabled
   - Owner-scoped CRUD: authenticated users can only access their own rows
*/

CREATE TABLE IF NOT EXISTS daily_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  source_app text,
  source_id text UNIQUE,
  title text NOT NULL,
  domain text,
  priority integer DEFAULT 2,
  energy_fit text DEFAULT 'medium',
  estimated_minutes integer DEFAULT 20,
  due_today boolean DEFAULT true,
  scheduled_date date,
  completion_state text DEFAULT 'pending',
  is_hero boolean DEFAULT false,
  display_order integer DEFAULT 0,
  unlock_order integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS daily_items_user_date_idx ON daily_items (user_id, scheduled_date);

ALTER TABLE daily_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_daily_items" ON daily_items;
CREATE POLICY "select_own_daily_items" ON daily_items FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_daily_items" ON daily_items;
CREATE POLICY "insert_own_daily_items" ON daily_items FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_daily_items" ON daily_items;
CREATE POLICY "update_own_daily_items" ON daily_items FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_daily_items" ON daily_items;
CREATE POLICY "delete_own_daily_items" ON daily_items FOR DELETE
TO authenticated USING (auth.uid() = user_id);
