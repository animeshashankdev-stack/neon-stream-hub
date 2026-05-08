## Senpai.tv — Full Build Plan

Goal: Anime from your Supabase, Live TV from iptv-org + admin M3U playlists, Manga from MangaDex (with Jikan covers), unified custom video/manga player, strong anti-scraping, fully responsive, Capacitor-wrapped iOS+Android.

---

### 1. Anime (Supabase)

- Use existing `content`, `episodes`, `genres`, `content_genres`, `video_servers`, `watchlist`, `watch_history`.
- Hooks: `useContent`, `useEpisodes(contentId)`, `useServers(episodeId)`, `useWatchlist`, `useWatchHistory` — all already mostly present, will be reviewed and tightened.
- Pages: Home, Browse, Detail, Watch, Watchlist (already exist) — wire to real `poster_url / banner_url / thumbnail_url`, add genre filter, ratings, multi-server picker (from `video_servers`).
- Resume playback from `watch_history.progress_seconds`; auto-save every 10s.

### 2. Live TV (hybrid)

- **Default source**: iptv-org public API (already wired via `useIPTV`).
- **Admin source**: parse user-added M3U playlists in `iptv_playlists` → `iptv_channels` via a new edge function `iptv-sync` (admin-only, uses service role). Also parses XMLTV EPG into `iptv_epg_programs`.
- Live page merges both sources, dedupes by name, lets user filter by country/category/group.
- `channel_favorites` already syncs to Supabase.
- Admin → Live TV tab to add/edit playlists and trigger sync.

### 3. Manga (MangaDex + Jikan)

- New `useManga` hooks calling MangaDex via a proxy edge function `manga-proxy` (handles rate limits, hides referer, adds correct User-Agent).
- Jikan used for richer cover art / metadata when MangaDex covers are low-res.
- Pages: `/manga` (browse), `/manga/:id` (detail + chapters), `/manga/:id/:chapterId` (reader).
- Reader: vertical webtoon scroll + paged mode toggle, swipe on mobile, virtualized.
- Progress saved to `manga_progress` (resume on next visit).

### 4. Custom Universal Player

A single `<UniversalPlayer />` component used by Anime, Live TV, and (image variant) Manga.

- HLS via hls.js + native Safari fallback.
- Controls: play/pause, scrub, volume, quality (from `video_servers`), playback speed, captions, PiP, fullscreen, keyboard shortcuts, mobile gestures (double-tap seek, pinch fullscreen).
- Skip intro / next episode auto-play for anime.
- Live badge + EPG strip for Live TV.
- Hardened: disables right-click, blocks `Ctrl+S`/`Ctrl+U`, blurs on tab visibility loss, no `download` attribute, MediaSource only (no raw URL exposure to DOM).

### 5. Strong Anti-Scraping

- New edge function `stream-token` issues a short-lived (60s) HMAC-signed JWT bound to `user_id + episode_id + ip` for every play request.
- New edge function `stream-proxy` validates the token, rate-limits per user (Postgres-based counter), checks `Referer` + `Origin`, and proxies HLS manifest/segments — the actual `stream_url` from `video_servers` never reaches the browser.
- Episode IDs in URLs replaced with opaque slugs (HMAC of UUID) so `episodes` table can't be enumerated.
- `STREAM_SIGNING_SECRET` stored as Supabase secret.
- Edge functions add bot-detection (User-Agent allowlist, basic JS challenge cookie).
- Watermark overlay on player with user email hash (deters re-streaming).
- Note: no web player is 100% scrape-proof; this raises the bar significantly.

### 6. Responsive + Mobile App (Capacitor)

- All pages audited at 360 / 768 / 1024 / 1440 breakpoints.
- Bottom tab bar on mobile (Home, Browse, Live, Manga, Profile), top nav on desktop.
- Touch-friendly controls, safe-area insets for notched devices.
- Capacitor setup:
  - Install `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`.
  - `capacitor.config.ts` with appId `app.lovable.bc3265f2664042baa9b4f01a2fbceddf`, hot-reload server URL pointing to sandbox preview.
  - Instructions provided to user for `git pull → npm i → npx cap add ios/android → npx cap sync → npx cap run`.

### 7. Security hardening (general)

- All edge functions: validate JWT via `getClaims`, Zod input validation, CORS, rate limit.
- RLS: existing tables already locked down; add admin-only policies for new sync functions.
- Add `stream_tokens` table (user_id, token_hash, episode_id, expires_at) to enforce one-time-use tokens.
- CSP meta tag in `index.html` restricting media sources.

---

### Technical / files

**New edge functions** (`supabase/functions/`):
- `iptv-sync/` — admin-only M3U + EPG ingestion
- `manga-proxy/` — MangaDex/Jikan proxy with caching
- `stream-token/` — issue signed playback tokens
- `stream-proxy/` — validate token + proxy HLS

**New migrations**:
- `stream_tokens` table + RLS
- Helper SQL function `issue_stream_token` (called by edge fn)

**New hooks**: `useManga`, `useMangaChapters`, `useMangaProgress`, `useStreamToken`, `useEpisodeServers`, `useAdminPlaylists`.

**New components**: `UniversalPlayer`, `MangaReader`, `BottomNav`, `StreamWatermark`, admin `PlaylistManager`.

**Edited**: Home, Live, ContentDetail, Watch, Admin, Navbar, App routes.

**New deps**: `hls.js` (already), `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`, `react-window` (manga reader virtualization).

**New secrets needed**: `STREAM_SIGNING_SECRET` (I'll request via add_secret tool).

### Out of scope this pass
- Watch parties / sync chat
- Stripe Senpai+ subscription
- Downloads for offline
- 3D scroll animations from the reference designs (will add neon/glass polish, not full Three.js)

These can be added in follow-up passes once the core platform is solid.
