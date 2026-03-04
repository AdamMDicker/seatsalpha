
-- League visibility settings table
CREATE TABLE public.league_visibility (
  league TEXT PRIMARY KEY,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Seed all leagues
INSERT INTO public.league_visibility (league, is_visible) VALUES
  ('NHL', true), ('NBA', true), ('WNBA', true), ('MLB', true),
  ('NFL', true), ('MLS', true), ('CFL', true), ('Concerts', true), ('Theatre', true);

-- Enable RLS
ALTER TABLE public.league_visibility ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "League visibility is public" ON public.league_visibility
  FOR SELECT USING (true);

-- Admins manage
CREATE POLICY "Admins manage league visibility" ON public.league_visibility
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
