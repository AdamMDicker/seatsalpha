
-- Fix the security definer view issue - set to INVOKER
ALTER VIEW public.public_tickets SET (security_invoker = on);
