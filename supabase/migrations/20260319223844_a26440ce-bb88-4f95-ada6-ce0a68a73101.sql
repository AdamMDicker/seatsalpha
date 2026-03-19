
-- Recreate public_tickets view WITHOUT security_invoker so public users can read active tickets
-- while sensitive fields (order_number, ticket_group_account) remain hidden
DROP VIEW IF EXISTS public_tickets;

CREATE VIEW public_tickets AS
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
        WHEN (hide_seat_numbers = true) THEN NULL::text
        ELSE seat_number
    END AS seat_number,
    perks,
    seat_notes,
    seller_id
FROM tickets
WHERE (is_active = true);

-- Grant SELECT to anon and authenticated so anyone can browse active inventory
GRANT SELECT ON public_tickets TO anon;
GRANT SELECT ON public_tickets TO authenticated;
