-- Add status column to resellers: 'pending', 'live', 'disabled'
ALTER TABLE public.resellers ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Migrate existing data: is_enabled=true -> 'live', is_enabled=false -> 'pending'
UPDATE public.resellers SET status = 'live' WHERE is_enabled = true;
UPDATE public.resellers SET status = 'pending' WHERE is_enabled = false;