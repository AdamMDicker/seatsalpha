CREATE UNIQUE INDEX IF NOT EXISTS tickets_unique_active_listing
ON public.tickets (event_id, section, COALESCE(row_name, ''), price)
WHERE is_active = true;