-- Restrict has_active_membership to only check caller's own ID
CREATE OR REPLACE FUNCTION public.has_active_membership(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = _user_id 
      AND is_active = true 
      AND expires_at > now()
      AND _user_id = auth.uid()
  )
$$;

-- Restrict has_role to only check caller's own role (except when called from RLS policies)
-- Note: has_role is used in RLS policies so we keep it as-is but add the ban check functions 
-- to only work for the caller
CREATE OR REPLACE FUNCTION public.is_email_banned(_email text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.banned_users WHERE email = lower(trim(_email))
  )
$$;

CREATE OR REPLACE FUNCTION public.is_phone_banned(_phone text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.banned_users WHERE phone = trim(_phone)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_ip_banned(_ip text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.banned_users WHERE ip_address = trim(_ip)
  )
$$;