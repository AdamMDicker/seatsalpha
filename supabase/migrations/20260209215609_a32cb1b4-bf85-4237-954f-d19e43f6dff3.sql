-- Drop the unique constraint on user_id to allow test data
ALTER TABLE public.resellers DROP CONSTRAINT IF EXISTS resellers_user_id_key;