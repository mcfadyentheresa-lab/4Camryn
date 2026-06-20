/*
  # Enable pg_cron and pg_net, schedule morning push

  1. Enables pg_cron extension for scheduled jobs
  2. Enables pg_net extension for outbound HTTP calls from the database
  3. Schedules "camryn-morning-push" to fire daily at 12:00 UTC (noon UTC)
     — adjust to taste; 12:00 UTC = 8am ET / 5am PT
*/

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
