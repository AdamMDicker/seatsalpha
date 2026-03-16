
DROP POLICY IF EXISTS "Resellers update own tickets" ON public.tickets;
CREATE POLICY "Resellers update own tickets" ON public.tickets
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'reseller'::app_role) AND seller_id = auth.uid())
  WITH CHECK (
    has_role(auth.uid(), 'reseller'::app_role)
    AND seller_id = auth.uid()
    AND event_id = (SELECT t.event_id FROM public.tickets t WHERE t.id = tickets.id)
    AND quantity_sold = (SELECT t.quantity_sold FROM public.tickets t WHERE t.id = tickets.id)
    AND is_reseller_ticket = true
    AND order_number IS NOT DISTINCT FROM (SELECT t.order_number FROM public.tickets t WHERE t.id = tickets.id)
    AND ticket_group_account IS NOT DISTINCT FROM (SELECT t.ticket_group_account FROM public.tickets t WHERE t.id = tickets.id)
  );
