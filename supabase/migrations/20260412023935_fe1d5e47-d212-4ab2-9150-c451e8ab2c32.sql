UPDATE public.order_transfers 
SET transfer_email_alias = REPLACE(transfer_email_alias, '@seats.ca', '@transfers.seats.ca')
WHERE transfer_email_alias LIKE '%@seats.ca' 
  AND transfer_email_alias NOT LIKE '%@transfers.seats.ca';