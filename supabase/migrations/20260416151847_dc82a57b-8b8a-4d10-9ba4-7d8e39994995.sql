CREATE POLICY "Anyone can read active tickets"
  ON public.tickets
  FOR SELECT
  TO anon
  USING (is_active = true);