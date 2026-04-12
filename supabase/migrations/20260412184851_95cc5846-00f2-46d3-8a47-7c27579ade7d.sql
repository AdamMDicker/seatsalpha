ALTER TABLE public.order_transfers
ADD COLUMN inbound_email_id text,
ADD COLUMN accept_link text,
ADD COLUMN accept_link_extracted_at timestamp with time zone;