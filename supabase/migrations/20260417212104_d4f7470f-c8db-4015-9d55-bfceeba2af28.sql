ALTER TABLE public.order_transfers
ADD COLUMN IF NOT EXISTS expected_quantity integer;

UPDATE public.order_transfers ot
SET expected_quantity = oi.quantity
FROM public.order_items oi
WHERE oi.order_id = ot.order_id
  AND oi.ticket_id = ot.ticket_id
  AND (ot.expected_quantity IS NULL OR ot.expected_quantity <> oi.quantity);

UPDATE public.order_transfers
SET expected_quantity = 1
WHERE expected_quantity IS NULL;

ALTER TABLE public.order_transfers
ALTER COLUMN expected_quantity SET NOT NULL,
ALTER COLUMN expected_quantity SET DEFAULT 1;