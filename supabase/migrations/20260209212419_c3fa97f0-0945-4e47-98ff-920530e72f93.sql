
-- Fix reseller RLS: drop existing permissive-looking policies and recreate properly
-- Ensure only admins and own reseller can access resellers table

-- Drop existing policies
DROP POLICY IF EXISTS "Admins manage resellers" ON public.resellers;
DROP POLICY IF EXISTS "Resellers read own" ON public.resellers;

-- Admins can do everything
CREATE POLICY "Admins manage resellers"
ON public.resellers FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Resellers can read their own record
CREATE POLICY "Resellers read own record"
ON public.resellers FOR SELECT
USING (auth.uid() = user_id);

-- Authenticated users can insert their own reseller application
CREATE POLICY "Users can apply as reseller"
ON public.resellers FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Resellers can update their own record (for profile changes)
CREATE POLICY "Resellers update own record"
ON public.resellers FOR UPDATE
USING (auth.uid() = user_id);
