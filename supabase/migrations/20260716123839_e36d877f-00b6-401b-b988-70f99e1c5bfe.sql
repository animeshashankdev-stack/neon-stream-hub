-- Update handle_new_user to capture Google avatar and name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.email
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (user_id) DO UPDATE
    SET avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name);
  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill avatar_url for existing Google users
UPDATE public.profiles p
SET avatar_url = COALESCE(
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data->>'picture'
)
FROM auth.users u
WHERE u.id = p.user_id
  AND p.avatar_url IS NULL
  AND COALESCE(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture') IS NOT NULL;

-- SECURITY: lock down stream_health so raw stream URLs are not exposed to anon
-- Drop any permissive policies and restrict SELECT to admins/service_role only
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='stream_health'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.stream_health', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.stream_health ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.stream_health FROM anon;
REVOKE ALL ON public.stream_health FROM authenticated;
GRANT ALL ON public.stream_health TO service_role;

CREATE POLICY "Admins can read stream_health"
  ON public.stream_health
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can modify stream_health"
  ON public.stream_health
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
