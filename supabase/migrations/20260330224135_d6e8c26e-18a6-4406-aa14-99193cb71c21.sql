
-- With security_invoker=true, the view runs as the calling user.
-- Anon users need to be able to read the tickets table for the view to work.
-- But we want to limit WHAT they see. RLS can't restrict columns, only rows.
-- Best approach: use SECURITY INVOKER=false (definer) but with a non-superuser owner,
-- OR just re-grant anon SELECT and accept that the view is the public API.
-- 
-- Actually the simplest secure approach: make the view SECURITY DEFINER with restricted columns
-- (which it already is - it excludes order_number, ticket_group_account).
-- The linter warns about SECURITY DEFINER but in this case it's intentional - the view
-- is our controlled public API that hides sensitive columns.
--
-- Let's revert to security_invoker=false (definer) since that's the correct pattern here,
-- and re-grant anon table access via RLS.

ALTER VIEW public.public_tickets SET (security_invoker = false);

-- Re-add anon RLS policy for the underlying table (needed for security invoker views)
-- Actually since we're using definer, anon doesn't need direct table access.
-- The view owner (postgres) has full access.
-- Grant anon SELECT on the view only.
GRANT SELECT ON public.public_tickets TO anon;

-- Mark the security definer view finding as acceptable - it's our intentional public API
-- that strips sensitive columns (order_number, ticket_group_account, etc.)
