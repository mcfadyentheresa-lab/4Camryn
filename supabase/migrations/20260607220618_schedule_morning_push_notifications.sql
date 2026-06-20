-- Schedule camryn-morning-push edge function to run daily at 08:00 UTC
-- This calls the camryn-push edge function which sends personalised push notifications
-- to all subscribed users based on their current phase and cycle.

SELECT cron.schedule(
  'camryn-morning-push',
  '0 8 * * *',
  $$
  SELECT extensions.http_post(
    url := (SELECT 'https://' || current_setting('app.settings.supabase_url', true) || '/functions/v1/camryn-push'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  );
  $$
);
