
-- Seat images table for seller-uploaded seat view photos
CREATE TABLE public.seat_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  uploaded_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.seat_images ENABLE ROW LEVEL SECURITY;

-- Public can view seat images for active tickets
CREATE POLICY "Seat images are public" ON public.seat_images FOR SELECT USING (true);

-- Resellers can upload images for their own tickets
CREATE POLICY "Sellers upload own seat images" ON public.seat_images FOR INSERT
  WITH CHECK (auth.uid() = uploaded_by);

-- Sellers can delete own images
CREATE POLICY "Sellers delete own seat images" ON public.seat_images FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Admins full access
CREATE POLICY "Admins manage seat images" ON public.seat_images FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Storage bucket for seat images
INSERT INTO storage.buckets (id, name, public) VALUES ('seat-images', 'seat-images', true);

-- Storage policies for seat-images bucket
CREATE POLICY "Anyone can view seat images" ON storage.objects FOR SELECT USING (bucket_id = 'seat-images');
CREATE POLICY "Authenticated users upload seat images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'seat-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users delete own seat images" ON storage.objects FOR DELETE USING (bucket_id = 'seat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add giveaway fields to events
ALTER TABLE public.events ADD COLUMN is_giveaway boolean NOT NULL DEFAULT false;
ALTER TABLE public.events ADD COLUMN giveaway_item text;

-- Add perks to tickets (aisle, row 1, food included, etc.)
ALTER TABLE public.tickets ADD COLUMN perks text[];
ALTER TABLE public.tickets ADD COLUMN seat_notes text;
