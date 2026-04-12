CREATE OR REPLACE FUNCTION public.auto_approve_reseller(_reseller_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.resellers
  SET status = 'live', updated_at = now()
  WHERE id = _reseller_id
    AND user_id = auth.uid()
    AND status = 'pending';
END;
$$;