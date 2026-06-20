/*
  # Revoke read_vapid_secrets from anon and authenticated roles

  The read_vapid_secrets() SECURITY DEFINER function should only be callable
  by service_role. Explicitly revoke EXECUTE from anon and authenticated to
  suppress the security advisor warnings and close the access gap.
*/

REVOKE EXECUTE ON FUNCTION public.read_vapid_secrets() FROM anon;
REVOKE EXECUTE ON FUNCTION public.read_vapid_secrets() FROM authenticated;
