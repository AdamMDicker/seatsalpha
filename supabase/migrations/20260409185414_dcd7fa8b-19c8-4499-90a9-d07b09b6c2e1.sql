
-- 1. Drop the anon SELECT policy on the base tickets table
DROP POLICY IF EXISTS "Anon read active tickets via view" ON public.tickets;

-- 2. Switch public_tickets view to security_definer so anon doesn't need base table access
-- First drop and recreate with security_definer = false (owner privileges)
DROP VIEW IF EXISTS public.public_tickets;

CREATE VIEW public.public_tickets
WITH (security_invoker = false)
AS
SELECT
  id, event_id, section, row_name,
  CASE WHEN hide_seat_numbers THEN NULL ELSE seat_number END AS seat_number,
  price, quantity, quantity_sold, is_active, is_reseller_ticket,
  created_at, perks, seat_notes, hide_seat_numbers,
  seat_type, split_type, stock_type, face_value,
  sales_tax_paid, seller_id
FROM public.tickets
WHERE is_active = true;

-- 3. Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.public_tickets TO anon;
GRANT SELECT ON public.public_tickets TO authenticated;
