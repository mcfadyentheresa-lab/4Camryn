/*
# Create camryn_pending_writes table

## Purpose
Landing table for Front Door to write proposed Camryn check-ins into,
for Camryn's own apply-logic (Task 5) to later read and act on.

## Context
- Front Door and Camryn share ONE Supabase project (iejpkrzqilqzyhltbbgc)
  and the same auth.users table, so RLS can key on auth.uid() directly
  with no cross-project mapping needed.
- This is deliberately a separate table from daily_items — daily_items
  is a task-display sync table with multiple existing writers; reusing
  it for check-in payloads risks collision.

## 1. New Table: camryn_pending_writes
- id (uuid, primary key, auto-generated)
- user_id (uuid, not null, defaults to auth.uid(), references auth.users with cascade delete)
- energy_level (text, not null, check constraint: 'low', 'medium', 'high')
- symptom_notes (text, nullable)
- reflection (text, nullable)
- target_date (date, not null, defaults to current_date)
- status (text, not null, defaults to 'pending', check: 'pending', 'applied', 'rejected')
- created_at (timestamptz, not null, defaults to now())
- applied_at (timestamptz, nullable)
- applied_daily_save_id (uuid, nullable — set by Camryn's apply-logic for traceability)

## 2. Security
- RLS enabled.
- INSERT policy: authenticated users can insert rows they own (auth.uid() = user_id).
  This is the write Front Door performs on the user's behalf using the user's own session.
- SELECT policy: authenticated users can read rows they own.
  Used by Front Door's verify step to confirm the row landed.
- NO UPDATE or DELETE policy for authenticated role — intentionally.
  Only Camryn's apply-logic (Task 5), running with the service-role key (bypasses RLS),
  may transition a row from pending -> applied or -> rejected. This stops a client
  from marking its own write "applied" without Camryn ever processing it.

## 3. Indexes
- Partial index on (status, created_at) WHERE status = 'pending'
  for efficient polling by Camryn's apply-logic.
*/

CREATE TABLE IF NOT EXISTS camryn_pending_writes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,

  -- payload fields (matches camryn.propose_checkin's confirmed shape)
  energy_level text NOT NULL CHECK (energy_level IN ('low', 'medium', 'high')),
  symptom_notes text,
  reflection text,
  target_date date NOT NULL DEFAULT current_date,

  -- lifecycle
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  applied_at timestamptz,

  -- set by Camryn's apply-logic (Task 5) once handleSaveDay's shared
  -- write function has run successfully for this row, for traceability
  applied_daily_save_id uuid
);

COMMENT ON TABLE camryn_pending_writes IS
  'Front Door writes confirmed Camryn check-in proposals here. Camryn''s apply-logic (Task 5) reads status = pending rows, runs them through the same write path as handleSaveDay, and marks them applied. Never read by the Camryn UI directly.';

ALTER TABLE camryn_pending_writes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can insert their own pending writes" ON camryn_pending_writes;
CREATE POLICY "users can insert their own pending writes"
  ON camryn_pending_writes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can read their own pending writes" ON camryn_pending_writes;
CREATE POLICY "users can read their own pending writes"
  ON camryn_pending_writes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Deliberately NO update or delete policy for the 'authenticated' role.
-- Only Camryn's apply-logic (Task 5), running with the service-role key,
-- may transition a row from pending -> applied or -> rejected. This is
-- intentional: it stops a client from marking its own write "applied"
-- without Camryn ever actually having processed it, which would violate
-- the verified status meaning anything real.

CREATE INDEX IF NOT EXISTS camryn_pending_writes_status_idx
  ON camryn_pending_writes (status, created_at)
  WHERE status = 'pending';