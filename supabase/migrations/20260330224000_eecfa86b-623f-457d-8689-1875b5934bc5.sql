
-- 1. Fix public_tickets view: use SECURITY INVOKER (default) instead of SECURITY DEFINER
-- Recreate view without security definer so RLS on tickets table is respected
DROP VIEW IF EXISTS public.public_tickets;
CREATE VIEW public.public_tickets AS
SELECT id,
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
        WHEN hide_seat_numbers = true THEN NULL::text
        ELSE seat_number
    END AS seat_number,
    perks,
    seat_notes,
    seller_id,
    face_value
FROM tickets
WHERE is_active = true;

-- Grant public SELECT on the view so anonymous users can browse tickets
GRANT SELECT ON public.public_tickets TO anon;
GRANT SELECT ON public.public_tickets TO authenticated;

-- 2. Add a SELECT policy on tickets for anonymous browsing of active tickets
-- (needed since view now uses invoker security)
CREATE POLICY "Public can read active tickets"
ON public.tickets
FOR SELECT
TO anon
USING (is_active = true);

-- 3. Add SELECT policy so authenticated non-admin/non-reseller users can also read active tickets
CREATE POLICY "Authenticated read active tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (is_active = true);

-- 4. Note: Resellers already have admin-level read via "Admins read all tickets"
-- but we need resellers to only see their own via seller_id. The "Authenticated read active tickets"
-- policy above gives them read on active tickets (same as public). Their own inactive tickets
-- need a separate policy:
CREATE POLICY "Resellers read own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'reseller'::app_role) AND seller_id = auth.uid());

-- 5. Fix email-assets storage: drop permissive policy and recreate with admin check
DROP POLICY IF EXISTS "Admin upload for email assets" ON storage.objects;
CREATE POLICY "Admin upload for email assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'email-assets' AND has_role(auth.uid(), 'admin'::app_role)
);

-- 6. Fix seat-images upload: require folder ownership
DROP POLICY IF EXISTS "Authenticated users upload seat images" ON storage.objects;
CREATE POLICY "Authenticated users upload seat images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'seat-images' AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 7. Add UPDATE policy for seat-images
CREATE POLICY "Users update own seat images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'seat-images' AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'seat-images' AND (auth.uid())::text = (storage.foldername(name))[1]
);
