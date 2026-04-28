CREATE TABLE IF NOT EXISTS public.seller_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  order_id uuid,
  amount numeric NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_seller_credits_seller ON public.seller_credits(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_credits_status ON public.seller_credits(status);

ALTER TABLE public.seller_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage seller credits"
  ON public.seller_credits
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Sellers read own credits"
  ON public.seller_credits
  FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Service role manages seller credits"
  ON public.seller_credits
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');