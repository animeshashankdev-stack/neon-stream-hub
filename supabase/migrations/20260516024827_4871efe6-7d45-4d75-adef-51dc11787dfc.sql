
-- 1. page_views: add user_id and bind RLS to auth.uid()
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS user_id uuid;

DROP POLICY IF EXISTS "Authenticated users can log page views" ON public.page_views;
CREATE POLICY "Users insert own page views"
ON public.page_views FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 2. video_servers: require auth for SELECT
DROP POLICY IF EXISTS "Video servers are publicly readable" ON public.video_servers;
CREATE POLICY "Authenticated users can read video servers"
ON public.video_servers FOR SELECT TO authenticated
USING (true);

-- 3. iptv_channels: require premium or admin for SELECT
DROP POLICY IF EXISTS "Authenticated users can read channels" ON public.iptv_channels;
CREATE POLICY "Premium or admin users can read channels"
ON public.iptv_channels FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.is_premium = true)
);

-- 4. stream_tokens: explicit no-write policies for clients (service role bypasses RLS)
REVOKE INSERT, UPDATE, DELETE ON public.stream_tokens FROM anon, authenticated;

-- 5. Lock down SECURITY DEFINER functions from direct execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_moderator(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_privilege_escalation() FROM PUBLIC, anon, authenticated;
