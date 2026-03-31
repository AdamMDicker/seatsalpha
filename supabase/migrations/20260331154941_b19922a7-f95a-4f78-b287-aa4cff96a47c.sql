
-- 1. Fix SECURITY DEFINER view: convert public_tickets to security_invoker
DROP VIEW IF EXISTS public.public_tickets;

CREATE VIEW public.public_tickets
WITH (security_invoker = true)
AS
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
    CASE
        WHEN (hide_seat_numbers = true) THEN NULL::text
        ELSE seat_number
    END AS seat_number,
    perks,
    seat_notes,
    seller_id,
    face_value
FROM tickets
WHERE (is_active = true);

-- Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.public_tickets TO anon;
GRANT SELECT ON public.public_tickets TO authenticated;

-- Add a SELECT policy on tickets for anon users so the security_invoker view works
CREATE POLICY "Anon read active tickets via view"
ON public.tickets
FOR SELECT
TO anon
USING (is_active = true);

-- 2. Fix contact_submissions INSERT policy: remove arbitrary UUID allowance
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
TO public
WITH CHECK (is_read = false);

-- 3. Revoke direct EXECUTE on has_role from anon to prevent unauthenticated role probing
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
