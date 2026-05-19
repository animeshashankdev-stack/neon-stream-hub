
DROP FUNCTION IF EXISTS public.get_episode_servers(uuid);

CREATE OR REPLACE FUNCTION public.get_episode_servers(_episode_id uuid)
RETURNS TABLE (
  id uuid,
  episode_id uuid,
  server_name text,
  quality text,
  language text,
  embed_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id,
    episode_id,
    server_name,
    quality,
    language,
    CASE
      WHEN stream_url ~* '\.(mp4|webm|ogv|m3u8)(\?|$)' THEN NULL
      ELSE stream_url
    END AS embed_url
  FROM public.video_servers
  WHERE episode_id = _episode_id
$$;

REVOKE EXECUTE ON FUNCTION public.get_episode_servers(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_episode_servers(uuid) TO authenticated;
