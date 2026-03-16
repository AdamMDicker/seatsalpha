
-- 1. MEMBERSHIPS: Replace permissive INSERT with service_role-only
DROP POLICY IF EXISTS "Users create own membership" ON public.memberships;
CREATE POLICY "Service role creates memberships" ON public.memberships
  FOR INSERT TO service_role
  WITH CHECK (true);

-- 2. ORDERS: Restrict INSERT to enforce status=pending and sensible defaults
DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
CREATE POLICY "Users create own orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND is_fee_waived = false
  );

-- 3. TICKETS: Create a secure public view that hides sensitive fields
CREATE OR REPLACE VIEW public.public_tickets AS
SELECT
  id,
  event_id,
  price,
  quantity,
  quantity_sold,
  is_reseller_ticket,
  is_active,
  created_at,
  hide_seat_numbers,
  sales_tax_paid,
  stock_type,
  split_type,
  seat_type,
  section,
  row_name,
  CASE WHEN hide_seat_numbers = true THEN NULL ELSE seat_number END AS seat_number,
  perks,
  seat_notes,
  seller_id
FROM public.tickets
WHERE is_active = true;

-- Grant public read access to the view
GRANT SELECT ON public.public_tickets TO anon;
GRANT SELECT ON public.public_tickets TO authenticated;
