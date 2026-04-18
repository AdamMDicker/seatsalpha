UPDATE public.order_transfers AS ot
SET seller_id = t.seller_id
FROM public.tickets AS t
WHERE t.id = ot.ticket_id
  AND t.seller_id IS NOT NULL
  AND ot.seller_id IS DISTINCT FROM t.seller_id;

CREATE OR REPLACE FUNCTION public.sync_order_transfer_seller_from_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ticket_owner uuid;
BEGIN
  SELECT seller_id
  INTO ticket_owner
  FROM public.tickets
  WHERE id = NEW.ticket_id;

  IF ticket_owner IS NOT NULL THEN
    NEW.seller_id := ticket_owner;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_order_transfer_seller_from_ticket ON public.order_transfers;

CREATE TRIGGER trg_sync_order_transfer_seller_from_ticket
BEFORE INSERT OR UPDATE OF ticket_id, seller_id
ON public.order_transfers
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_transfer_seller_from_ticket();