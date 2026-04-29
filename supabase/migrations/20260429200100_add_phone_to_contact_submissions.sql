-- Add phone column to contact_submissions table for better support follow-up
ALTER TABLE IF EXISTS public.contact_submissions
  ADD COLUMN IF NOT EXISTS phone text;
