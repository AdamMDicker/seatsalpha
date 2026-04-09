
-- Add new columns to resellers
ALTER TABLE public.resellers
ADD COLUMN is_registered_company boolean NOT NULL DEFAULT false,
ADD COLUMN corporation_number text,
ADD COLUMN tax_collection_number text;

-- Create reseller_application_seats table
CREATE TABLE public.reseller_application_seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
  league text NOT NULL,
  section text NOT NULL,
  row_name text NOT NULL,
  seat_count integer NOT NULL,
  lowest_seat text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reseller_application_seats ENABLE ROW LEVEL SECURITY;

-- Sellers can insert their own seat entries (via reseller join)
CREATE POLICY "Sellers insert own application seats"
ON public.reseller_application_seats
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.resellers
    WHERE resellers.id = reseller_application_seats.reseller_id
    AND resellers.user_id = auth.uid()
  )
);

-- Sellers can read their own seat entries
CREATE POLICY "Sellers read own application seats"
ON public.reseller_application_seats
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.resellers
    WHERE resellers.id = reseller_application_seats.reseller_id
    AND resellers.user_id = auth.uid()
  )
);

-- Admins can manage all
CREATE POLICY "Admins manage application seats"
ON public.reseller_application_seats
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
