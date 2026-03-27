-- Fix: contact_submissions ALL policy
DROP POLICY "Service role can manage contact submissions" ON public.contact_submissions;
CREATE POLICY "Service role can manage contact submissions" ON public.contact_submissions
  AS PERMISSIVE FOR ALL TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Fix: notifications INSERT policy
DROP POLICY "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications" ON public.notifications
  AS PERMISSIVE FOR INSERT TO service_role
  WITH CHECK (auth.role() = 'service_role');

-- Fix: newsletter_subscribers UPDATE policy
DROP POLICY "Service role can update subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Service role can update subscribers" ON public.newsletter_subscribers
  AS PERMISSIVE FOR UPDATE TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Fix: memberships INSERT policy
DROP POLICY "Service role creates memberships" ON public.memberships;
CREATE POLICY "Service role creates memberships" ON public.memberships
  AS PERMISSIVE FOR INSERT TO service_role
  WITH CHECK (auth.role() = 'service_role');