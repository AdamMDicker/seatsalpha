
DROP POLICY IF EXISTS "Users can apply as reseller" ON public.resellers;
CREATE POLICY "Users can apply as reseller" ON public.resellers
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND is_enabled = false
  );
