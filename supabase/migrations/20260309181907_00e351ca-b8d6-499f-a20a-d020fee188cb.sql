ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS hide_seat_numbers boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock_type text,
  ADD COLUMN IF NOT EXISTS split_type text,
  ADD COLUMN IF NOT EXISTS seat_type text,
  ADD COLUMN IF NOT EXISTS order_number text,
  ADD COLUMN IF NOT EXISTS sales_tax_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ticket_group_account text;