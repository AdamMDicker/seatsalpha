
-- Drop the overly permissive public SELECT policy
DROP POLICY "Public read for unsubscribe" ON public.newsletter_subscribers;

-- Drop the overly permissive public UPDATE policy
DROP POLICY "Subscribers update own" ON public.newsletter_subscribers;

-- Create a restricted UPDATE policy: only service_role can update (used by edge functions for unsubscribe)
CREATE POLICY "Service role can update subscribers"
ON public.newsletter_subscribers
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);
