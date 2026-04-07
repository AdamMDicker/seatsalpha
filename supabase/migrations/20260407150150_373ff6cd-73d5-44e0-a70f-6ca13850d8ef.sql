ALTER TABLE public.resellers
  ADD COLUMN acknowledgment_initials text,
  ADD COLUMN acknowledgment_name text,
  ADD COLUMN acknowledgment_signed_at timestamptz;