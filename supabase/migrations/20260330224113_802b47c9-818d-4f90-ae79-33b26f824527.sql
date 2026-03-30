
-- 1. Explicitly set public_tickets view to SECURITY INVOKER
ALTER VIEW public.public_tickets SET (security_invoker = true);

-- 2. Hide sensitive fulfillment fields from public view by recreating it
-- Remove order_number and ticket_group_account (already not in view)
-- The view already doesn't expose order_number or ticket_group_account, which is correct.
-- But we should ensure face_value stays (legal requirement) and sales_tax_paid is kept
-- since it's used in the checkout flow.

-- 3. Restrict the anon SELECT policy to not expose order_number/ticket_group_account
-- These aren't in the view, but the direct table policy exposes them.
-- Fix: make anon policy only return specific safe columns by restricting via the view.
-- Actually, let's just remove the anon direct table policy since they should use the view.
DROP POLICY IF EXISTS "Public can read active tickets" ON public.tickets;

-- Recreate with column-level restriction isn't possible via RLS, 
-- so we keep the view approach. Anon users access via view only.
-- The view already excludes order_number, ticket_group_account.
-- We need to grant anon SELECT on the VIEW but not on the TABLE directly.

-- Revoke direct anon access to tickets table
REVOKE SELECT ON public.tickets FROM anon;

-- Grant anon access only via the view
GRANT SELECT ON public.public_tickets TO anon;
