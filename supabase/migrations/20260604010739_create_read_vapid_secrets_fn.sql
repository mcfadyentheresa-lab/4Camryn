/*
  # Create read_vapid_secrets helper function

  Provides a service-role-only RPC that returns VAPID keys from the vault.
  The edge function calls this via the service role client.

  1. New Functions
    - `read_vapid_secrets()` — returns { public_key, private_key } from vault.decrypted_secrets
  2. Security
    - Only accessible to the service_role (security definer)
*/

CREATE OR REPLACE FUNCTION public.read_vapid_secrets()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'public_key',  (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'VAPID_PUBLIC_KEY'  LIMIT 1),
    'private_key', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'VAPID_PRIVATE_KEY' LIMIT 1)
  );
$$;

REVOKE ALL ON FUNCTION public.read_vapid_secrets() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_vapid_secrets() TO service_role;
