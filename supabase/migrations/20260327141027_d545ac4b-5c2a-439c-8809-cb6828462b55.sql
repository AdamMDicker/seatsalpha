-- Drop the overly broad ALL policy and replace with specific command policies
DROP POLICY "Admins manage roles" ON public.user_roles;

-- Admins can update roles
CREATE POLICY "Admins update roles" ON public.user_roles
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete roles
CREATE POLICY "Admins delete roles" ON public.user_roles
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert roles (the handle_new_user trigger runs as SECURITY DEFINER so bypasses RLS)
CREATE POLICY "Admins insert roles" ON public.user_roles
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));