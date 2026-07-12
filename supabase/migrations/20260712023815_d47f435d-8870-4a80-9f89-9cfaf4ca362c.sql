
-- 1. profiles UPDATE: add WITH CHECK so users can't change user_id and trigger still guards is_premium/xp/level
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. stream_health: admin-only reads (was public via USING(true))
DROP POLICY IF EXISTS "Public can view stream health" ON public.stream_health;
DROP POLICY IF EXISTS "stream_health readable" ON public.stream_health;
DROP POLICY IF EXISTS "Anyone can view stream_health" ON public.stream_health;
CREATE POLICY "Admins can view stream health"
  ON public.stream_health
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Revoke EXECUTE on internal/trigger-only or admin-only SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_privilege_escalation() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_set_premium(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_role(uuid, app_role, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_moderator(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_active_ban(text, uuid) FROM PUBLIC, anon;

-- Admin RPCs stay callable by authenticated (function body enforces has_role check)
GRANT EXECUTE ON FUNCTION public.admin_set_premium(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, app_role, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- 4. Tighter get_episode_servers: drop thumbnails and known dead redirect hosts; rank playable providers first
CREATE OR REPLACE FUNCTION public.get_episode_servers(_episode_id uuid)
 RETURNS TABLE(id uuid, episode_id uuid, server_name text, quality text, language text, embed_url text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    vs.id,
    vs.episode_id,
    vs.server_name,
    vs.quality,
    vs.language,
    vs.stream_url AS embed_url
  FROM public.video_servers vs
  WHERE vs.episode_id = _episode_id
    AND vs.stream_url ~* '^https?://'
    -- reject image thumbnails
    AND vs.stream_url !~* '\.(webp|jpg|jpeg|png|gif|svg|ico|bmp|avif)(\?|$)'
    -- reject thumbnail path segments
    AND vs.stream_url !~* '/(thumb_|thumbs?/|images?/|posters?/|covers?/)'
  ORDER BY
    CASE
      WHEN vs.stream_url ~* '(animesalt\.ac|as-cdn|abysscdn|filemoon|dood|vidcloud|megacloud|mp4upload|streamtape|vidsrc|vidplay)' THEN 0
      WHEN vs.stream_url ~* '(short\.icu|shortlink)' THEN 2
      ELSE 1
    END,
    vs.created_at DESC NULLS LAST
$function$;

REVOKE EXECUTE ON FUNCTION public.get_episode_servers(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_episode_servers(uuid) TO authenticated;
