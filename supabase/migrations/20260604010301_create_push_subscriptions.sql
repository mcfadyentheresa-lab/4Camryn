/*
  # Create push_subscriptions table

  Stores Web Push API subscription objects per user so the edge function
  can send morning notifications.

  1. New Tables
    - `push_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `endpoint` (text, unique) — the browser-assigned push endpoint URL
      - `p256dh` (text) — client public key for payload encryption
      - `auth_key` (text) — client auth secret for encryption
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled
    - Users can only insert/select/delete their own subscriptions
    - No UPDATE policy (subscriptions are replaced, not updated)

  3. Notes
    - endpoint is unique so re-subscribing the same browser replaces the row
    - The edge function uses service_role key so bypasses RLS when sending
*/

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text UNIQUE NOT NULL,
  p256dh text NOT NULL,
  auth_key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own push subscription"
  ON push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
