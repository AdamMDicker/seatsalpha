-- Allow anyone to insert contact submissions (the contact-form edge function uses service role,
-- but this provides defense-in-depth for direct API submissions)
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
  AS PERMISSIVE FOR INSERT TO public
  WITH CHECK (
    is_read = false
    AND id IS NOT NULL
  );

-- Explicitly allow admins to read contact submissions
CREATE POLICY "Admins read contact submissions" ON public.contact_submissions
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));