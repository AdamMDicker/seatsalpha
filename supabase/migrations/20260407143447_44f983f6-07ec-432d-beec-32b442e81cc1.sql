
-- New table: seller_subscriptions
CREATE TABLE public.seller_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id uuid NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
  stripe_subscription_id text,
  stripe_customer_id text,
  status text NOT NULL DEFAULT 'pending',
  current_period_end timestamp with time zone,
  weekly_fee numeric NOT NULL DEFAULT 9.99,
  discount_code text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(reseller_id)
);

ALTER TABLE public.seller_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage seller subscriptions"
  ON public.seller_subscriptions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Resellers read own subscription"
  ON public.seller_subscriptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.resellers
    WHERE resellers.id = seller_subscriptions.reseller_id
      AND resellers.user_id = auth.uid()
  ));

CREATE POLICY "Service role manages seller subscriptions"
  ON public.seller_subscriptions FOR ALL TO service_role
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_seller_subscriptions_updated_at
  BEFORE UPDATE ON public.seller_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- New table: seller_discount_codes
CREATE TABLE public.seller_discount_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

ALTER TABLE public.seller_discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage discount codes"
  ON public.seller_discount_codes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users read active codes"
  ON public.seller_discount_codes FOR SELECT TO authenticated
  USING (is_active = true);

-- Add columns to resellers
ALTER TABLE public.resellers
  ADD COLUMN IF NOT EXISTS is_suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Seed 10 discount codes
INSERT INTO public.seller_discount_codes (code, description) VALUES
  ('SELLER001', 'Reseller fee waiver code'),
  ('SELLER002', 'Reseller fee waiver code'),
  ('SELLER003', 'Reseller fee waiver code'),
  ('SELLER004', 'Reseller fee waiver code'),
  ('SELLER005', 'Reseller fee waiver code'),
  ('SELLER006', 'Reseller fee waiver code'),
  ('SELLER007', 'Reseller fee waiver code'),
  ('SELLER008', 'Reseller fee waiver code'),
  ('SELLER009', 'Reseller fee waiver code'),
  ('SELLER010', 'Reseller fee waiver code');
