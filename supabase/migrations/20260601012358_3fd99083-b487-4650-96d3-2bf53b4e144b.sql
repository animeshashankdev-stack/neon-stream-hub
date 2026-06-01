
-- 1) Harden ad/redirect filtering in episode servers RPC
CREATE OR REPLACE FUNCTION public.get_episode_servers(_episode_id uuid)
RETURNS TABLE(id uuid, episode_id uuid, server_name text, quality text, language text, embed_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    id,
    episode_id,
    server_name,
    quality,
    language,
    stream_url AS embed_url
  FROM public.video_servers
  WHERE episode_id = _episode_id
    AND stream_url ~* '^https?://'
    AND stream_url !~* '\.(webp|jpg|jpeg|png|gif|svg)(\?|$)'
    -- Block known ad redirector / shortlink domains
    AND stream_url !~* '://(short\.icu|shrtfly|adfly|adf\.ly|linkvertise|ouo\.io|exe\.io|bc\.vc|cuty\.io|shortest|clk\.sh|fc-lc|sub2unlock|exe.app|safelinkconverter)'
$function$;

-- 2) Episode chapter markers (intro / outro / recap / scene)
CREATE TABLE IF NOT EXISTS public.episode_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'chapter',
  label text,
  start_seconds integer NOT NULL,
  end_seconds integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_episode_chapters_episode ON public.episode_chapters(episode_id);

GRANT SELECT ON public.episode_chapters TO anon, authenticated;
GRANT ALL ON public.episode_chapters TO service_role;
ALTER TABLE public.episode_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chapters are publicly readable"
ON public.episode_chapters FOR SELECT USING (true);

CREATE POLICY "Admins manage chapters insert"
ON public.episode_chapters FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage chapters update"
ON public.episode_chapters FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage chapters delete"
ON public.episode_chapters FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Watch parties
CREATE TABLE IF NOT EXISTS public.watch_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  host_id uuid NOT NULL,
  content_id uuid NOT NULL,
  episode_id uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_watch_parties_code ON public.watch_parties(code);
CREATE INDEX IF NOT EXISTS idx_watch_parties_host ON public.watch_parties(host_id);

GRANT SELECT, INSERT, UPDATE ON public.watch_parties TO authenticated;
GRANT ALL ON public.watch_parties TO service_role;
ALTER TABLE public.watch_parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view parties"
ON public.watch_parties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create their own parties"
ON public.watch_parties FOR INSERT TO authenticated WITH CHECK (host_id = auth.uid());
CREATE POLICY "Host can update their party"
ON public.watch_parties FOR UPDATE TO authenticated USING (host_id = auth.uid());

-- 4) Watch party chat messages
CREATE TABLE IF NOT EXISTS public.watch_party_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES public.watch_parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_wpm_party_time ON public.watch_party_messages(party_id, created_at);

GRANT SELECT, INSERT ON public.watch_party_messages TO authenticated;
GRANT ALL ON public.watch_party_messages TO service_role;
ALTER TABLE public.watch_party_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read party messages"
ON public.watch_party_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated send messages as self"
ON public.watch_party_messages FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Realtime: enable changes broadcast
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_messages;
ALTER TABLE public.watch_party_messages REPLICA IDENTITY FULL;
