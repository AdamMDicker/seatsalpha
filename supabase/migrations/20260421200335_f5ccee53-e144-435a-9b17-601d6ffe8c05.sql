-- Create venue_section_views table for AI-generated section reference images
CREATE TABLE public.venue_section_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue TEXT NOT NULL,
  section_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (venue, section_id)
);

-- Index for fast venue lookups
CREATE INDEX idx_venue_section_views_venue ON public.venue_section_views(venue);

-- Enable RLS
ALTER TABLE public.venue_section_views ENABLE ROW LEVEL SECURITY;

-- Public can read (so buyers see fallback images)
CREATE POLICY "Section views are public"
ON public.venue_section_views
FOR SELECT
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins manage section views"
ON public.venue_section_views
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role full access (for edge function)
CREATE POLICY "Service role manages section views"
ON public.venue_section_views
FOR ALL
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);