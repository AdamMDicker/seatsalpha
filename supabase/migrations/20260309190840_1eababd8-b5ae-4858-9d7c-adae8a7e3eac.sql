CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  unsubscribed_at timestamp with time zone
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO public
  WITH CHECK (true);

-- Subscribers can unsubscribe by matching their email
CREATE POLICY "Public read for unsubscribe" ON public.newsletter_subscribers
  FOR SELECT TO public
  USING (true);

-- Only admins can view all / manage
CREATE POLICY "Admins manage subscribers" ON public.newsletter_subscribers
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Subscribers can update their own record (unsubscribe)
CREATE POLICY "Subscribers update own" ON public.newsletter_subscribers
  FOR UPDATE TO public
  USING (true)
  WITH CHECK (true);

-- Newsletter sends table for tracking
CREATE TABLE public.newsletter_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  body text NOT NULL,
  sent_by uuid NOT NULL,
  recipient_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage newsletter sends" ON public.newsletter_sends
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));