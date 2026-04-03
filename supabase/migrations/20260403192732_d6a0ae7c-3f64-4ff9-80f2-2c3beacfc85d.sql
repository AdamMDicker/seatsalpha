-- Grant SELECT on tickets to anon so the security_invoker view works
GRANT SELECT ON public.tickets TO anon;

-- Also ensure the view itself is accessible
GRANT SELECT ON public.public_tickets TO anon;