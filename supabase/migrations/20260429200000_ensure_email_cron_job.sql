-- Ensure the process-email-queue cron job exists.
-- This job runs every 5 seconds, checks for queued emails, and invokes
-- the process-email-queue Edge Function via pg_net.
-- 
-- Prerequisites: pg_cron, pg_net, and vault secret 'email_queue_service_role_key'
-- must already be configured (handled by the email_infra migration and Lovable setup).

-- First ensure extensions are available
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Unschedule any existing job with the same name to avoid duplicates
SELECT cron.unschedule('process-email-queue')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process-email-queue'
);

-- Schedule the email queue processor to run every 5 seconds.
-- The job:
--   1. Checks email_send_state.retry_after_until for rate-limit cooldown
--   2. Checks if auth_emails or transactional_emails queues have messages
--   3. If conditions met, calls process-email-queue Edge Function via pg_net
SELECT cron.schedule(
  'process-email-queue',
  '5 seconds',
  $$
  SELECT extensions.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/process-email-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        SELECT decrypted_secret
        FROM vault.decrypted_secrets
        WHERE name = 'email_queue_service_role_key'
        LIMIT 1
      )
    ),
    body := '{}'::jsonb
  )
  WHERE (
    SELECT COALESCE(retry_after_until < now(), true)
    FROM public.email_send_state
    WHERE id = 1
  )
  AND (
    EXISTS (SELECT 1 FROM pgmq.read('auth_emails', 0, 1))
    OR EXISTS (SELECT 1 FROM pgmq.read('transactional_emails', 0, 1))
  );
  $$
);
