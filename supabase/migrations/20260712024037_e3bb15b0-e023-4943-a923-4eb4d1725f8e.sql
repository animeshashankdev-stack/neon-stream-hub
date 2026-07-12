
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.is_moderator(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_active_ban(text, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.can_access_watch_party(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.episode_has_playable_servers(uuid) FROM PUBLIC, anon, authenticated;
