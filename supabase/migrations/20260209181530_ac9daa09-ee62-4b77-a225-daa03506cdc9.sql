
-- Issue 1: Remove buyer location data from orders table (not essential, can be derived at order time)
ALTER TABLE public.orders DROP COLUMN IF EXISTS buyer_city;
ALTER TABLE public.orders DROP COLUMN IF EXISTS buyer_province;
