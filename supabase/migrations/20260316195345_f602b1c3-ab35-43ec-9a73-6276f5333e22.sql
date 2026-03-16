
-- 1. Remove public SELECT on tickets base table (public access goes through public_tickets view)
DROP POLICY IF EXISTS "Active tickets are public" ON public.tickets;

-- 2. Fix reseller ticket_count self-modification
DROP POLICY IF EXISTS "Resellers update own record" ON public.resellers;
CREATE POLICY "Resellers update own record" ON public.resellers
  FOR UPDATE TO public
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status = (SELECT r.status FROM public.resellers r WHERE r.user_id = auth.uid())
    AND is_enabled = (SELECT r.is_enabled FROM public.resellers r WHERE r.user_id = auth.uid())
    AND ticket_count IS NOT DISTINCT FROM (SELECT r.ticket_count FROM public.resellers r WHERE r.user_id = auth.uid())
  );
