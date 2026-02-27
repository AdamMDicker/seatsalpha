
-- Add phone and ip_address columns to banned_users
ALTER TABLE public.banned_users 
  ALTER COLUMN email DROP NOT NULL,
  ADD COLUMN phone text,
  ADD COLUMN ip_address text,
  ADD COLUMN ban_type text NOT NULL DEFAULT 'email';

-- Drop old unique constraint on email if exists
ALTER TABLE public.banned_users DROP CONSTRAINT IF EXISTS banned_users_email_key;

-- Add unique constraints per type
CREATE UNIQUE INDEX banned_users_email_unique ON public.banned_users (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX banned_users_phone_unique ON public.banned_users (phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX banned_users_ip_unique ON public.banned_users (ip_address) WHERE ip_address IS NOT NULL;

-- Replace the is_email_banned function with a broader check
CREATE OR REPLACE FUNCTION public.is_email_banned(_email text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.banned_users WHERE email = lower(trim(_email))
  )
$$;

-- New function to check phone ban
CREATE OR REPLACE FUNCTION public.is_phone_banned(_phone text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.banned_users WHERE phone = trim(_phone)
  )
$$;

-- New function to check IP ban
CREATE OR REPLACE FUNCTION public.is_ip_banned(_ip text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.banned_users WHERE ip_address = trim(_ip)
  )
$$;
