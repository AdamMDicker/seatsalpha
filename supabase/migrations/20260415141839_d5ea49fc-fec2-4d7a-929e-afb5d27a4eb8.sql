-- 1. Update the public_tickets view to hide sold-out tickets
CREATE OR REPLACE VIEW public.public_tickets AS
SELECT id,
    event_id,
    section,
    row_name,
    CASE
        WHEN hide_seat_numbers THEN NULL::text
        ELSE seat_number
    END AS seat_number,
    price,
    quantity,
    quantity_sold,
    is_active,
    is_reseller_ticket,
    created_at,
    perks,
    seat_notes,
    hide_seat_numbers,
    seat_type,
    split_type,
    stock_type,
    face_value,
    sales_tax_paid,
    seller_id
FROM tickets
WHERE is_active = true
  AND quantity > quantity_sold;

-- 2. Add a trigger to prevent quantity_sold from exceeding quantity
CREATE OR REPLACE FUNCTION public.prevent_oversell()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.quantity_sold > NEW.quantity THEN
    RAISE EXCEPTION 'Cannot sell more tickets than available (quantity: %, quantity_sold: %)', NEW.quantity, NEW.quantity_sold;
  END IF;
  IF NEW.quantity_sold < 0 THEN
    RAISE EXCEPTION 'quantity_sold cannot be negative (got %)', NEW.quantity_sold;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_no_oversell
BEFORE INSERT OR UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.prevent_oversell();