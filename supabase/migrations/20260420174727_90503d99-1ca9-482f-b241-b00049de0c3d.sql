-- Backfill legacy NULL seller_id tickets to LMK Sports Consulting
UPDATE public.tickets
SET seller_id = 'c0768913-3e54-476a-b4b2-8a0051b087ed'
WHERE seller_id IS NULL;

-- Enforce NOT NULL on seller_id going forward
ALTER TABLE public.tickets
  ALTER COLUMN seller_id SET NOT NULL;