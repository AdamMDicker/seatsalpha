
-- Add face_value column to tickets table
ALTER TABLE public.tickets ADD COLUMN face_value numeric NULL;

-- Recreate public_tickets view to include face_value
CREATE OR REPLACE VIEW public.public_tickets AS
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
