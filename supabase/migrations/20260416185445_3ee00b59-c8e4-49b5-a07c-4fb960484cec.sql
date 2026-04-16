ALTER TABLE public.order_transfers
  ADD COLUMN IF NOT EXISTS seller_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS admin_escalation_sent_at TIMESTAMP WITH TIME ZONE;