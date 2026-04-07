
CREATE TABLE public.order_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  transfer_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  uploaded_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.order_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all transfers"
  ON public.order_transfers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manages transfers"
  ON public.order_transfers FOR ALL TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Sellers read own transfers"
  ON public.order_transfers FOR SELECT TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers insert own transfers"
  ON public.order_transfers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers update own transfers"
  ON public.order_transfers FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE INDEX idx_order_transfers_seller ON public.order_transfers(seller_id);
CREATE INDEX idx_order_transfers_order ON public.order_transfers(order_id);
CREATE INDEX idx_order_transfers_status ON public.order_transfers(status);
