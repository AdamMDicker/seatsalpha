ALTER TABLE public.order_transfers
ADD COLUMN IF NOT EXISTS inbound_email_id text,
ADD COLUMN IF NOT EXISTS accept_link text,
ADD COLUMN IF NOT EXISTS accept_link_extracted_at timestamp with time zone;