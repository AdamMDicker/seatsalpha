CREATE TABLE public.stripe_webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'buyer',
  status TEXT NOT NULL DEFAULT 'received',
  processing_ms INTEGER,
  error_message TEXT,
  payload_summary JSONB,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX stripe_webhook_events_event_source_uniq
  ON public.stripe_webhook_events (stripe_event_id, source);

CREATE INDEX stripe_webhook_events_received_at_idx
  ON public.stripe_webhook_events (received_at DESC);

CREATE INDEX stripe_webhook_events_status_idx
  ON public.stripe_webhook_events (status);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read webhook events"
  ON public.stripe_webhook_events
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role manages webhook events"
  ON public.stripe_webhook_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');