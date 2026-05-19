
-- 1) Attach the privilege-escalation guard trigger to profiles
DROP TRIGGER IF EXISTS profiles_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER profiles_prevent_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 2) Lock video_servers SELECT to admins only (edge function uses service role)
DROP POLICY IF EXISTS "Authenticated users can read video servers" ON public.video_servers;
CREATE POLICY "Admins can read video servers"
ON public.video_servers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3) Safe RPC: list episode servers WITHOUT stream_url
CREATE OR REPLACE FUNCTION public.get_episode_servers(_episode_id uuid)
RETURNS TABLE (
  id uuid,
  episode_id uuid,
  server_name text,
  quality text,
  language text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, episode_id, server_name, quality, language
  FROM public.video_servers
  WHERE episode_id = _episode_id
$$;

REVOKE EXECUTE ON FUNCTION public.get_episode_servers(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_episode_servers(uuid) TO authenticated;

-- 4) Admin RPC: list users with profile + premium + admin flag
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  is_premium boolean,
  is_admin boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.is_premium,
    EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.user_id AND ur.role = 'admin') AS is_admin,
    p.created_at
  FROM public.profiles p
  WHERE public.has_role(auth.uid(), 'admin')
  ORDER BY p.created_at DESC
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- 5) Admin RPC: set premium status on a user
CREATE OR REPLACE FUNCTION public.admin_set_premium(_target uuid, _is_premium boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.profiles SET is_premium = _is_premium, updated_at = now() WHERE user_id = _target;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_premium(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_premium(uuid, boolean) TO authenticated;

-- 6) Admin RPC: grant/revoke admin role
CREATE OR REPLACE FUNCTION public.admin_set_role(_target uuid, _role app_role, _grant boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  IF _target = auth.uid() AND _role = 'admin' AND _grant = false THEN
    RAISE EXCEPTION 'cannot revoke own admin role';
  END IF;
  IF _grant THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_target, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _target AND role = _role;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_role(uuid, app_role, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, app_role, boolean) TO authenticated;
