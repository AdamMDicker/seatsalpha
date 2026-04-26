-- Reassign the remaining ticket and any related order_transfers to lmksportsconsulting
UPDATE public.tickets
SET seller_id = 'c0768913-3e54-476a-b4b2-8a0051b087ed'
WHERE seller_id <> 'c0768913-3e54-476a-b4b2-8a0051b087ed';

UPDATE public.order_transfers
SET seller_id = 'c0768913-3e54-476a-b4b2-8a0051b087ed'
WHERE seller_id IS DISTINCT FROM 'c0768913-3e54-476a-b4b2-8a0051b087ed';