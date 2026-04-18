-- Auto-grant reseller role when reseller status becomes 'live'
CREATE OR REPLACE FUNCTION public.grant_reseller_role_on_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'live' AND (OLD.status IS DISTINCT FROM 'live') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.user_id, 'reseller')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_grant_reseller_role ON public.resellers;

CREATE TRIGGER trg_grant_reseller_role
AFTER INSERT OR UPDATE OF status ON public.resellers
FOR EACH ROW
EXECUTE FUNCTION public.grant_reseller_role_on_approval();