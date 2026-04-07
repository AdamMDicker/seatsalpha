ALTER TABLE public.resellers ADD COLUMN signup_fee_paid_at timestamptz;
ALTER TABLE public.resellers ADD COLUMN stripe_connect_account_id text;
ALTER TABLE public.seller_subscriptions ALTER COLUMN weekly_fee SET DEFAULT 1.00;