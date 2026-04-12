
ALTER TABLE public.order_transfers
  ADD COLUMN forward_sent_at timestamptz DEFAULT NULL,
  ADD COLUMN fallback_sent_at timestamptz DEFAULT NULL;
