
-- Create a table to store which leagues each reseller can sell tickets for
CREATE TABLE public.reseller_leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
  league TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reseller_id, league)
);

-- Enable RLS
ALTER TABLE public.reseller_leagues ENABLE ROW LEVEL SECURITY;

-- Admins can manage all reseller leagues
CREATE POLICY "Admins manage reseller leagues"
ON public.reseller_leagues
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Resellers can read their own league permissions
CREATE POLICY "Resellers read own leagues"
ON public.reseller_leagues
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.resellers
  WHERE resellers.id = reseller_leagues.reseller_id
  AND resellers.user_id = auth.uid()
));
