CREATE POLICY "Buyers read own order transfers"
ON public.order_transfers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_transfers.order_id
      AND o.user_id = auth.uid()
  )
);