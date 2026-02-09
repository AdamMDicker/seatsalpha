
DROP POLICY "Anyone can read profiles" ON public.profiles;

CREATE POLICY "Users read own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins read all profiles" ON public.profiles
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
