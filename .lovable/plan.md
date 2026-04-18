

## Plan

Six deliverables. Concise scope below.

### 1. Fix Live page issues (`src/pages/Live.tsx`, `src/hooks/useIPTV.ts`)
- **Country `<select>` text invisible**: native `<option>` elements inherit OS styling — replace native selects with custom dropdowns (Radix `Popover` + searchable list) that render dark-themed options.
- **Hide broken-channel error UI**: add `error: boolean` to `ResolvedChannel`. When `LiveChannelPlayer` HLS load fails, fire `onChannelError(id)` callback → push id into a `Set<string>` (persisted in `localStorage` as `senpai.iptv.broken`). Filter list excludes those ids. Also pre-filter known-bad domains.

### 2. Live TV favorites — "My Channels" rail (`src/pages/Live.tsx`, `src/components/LiveChannelPlayer.tsx`)
- New hook `src/hooks/useChannelFavorites.ts` — localStorage-backed `Set<string>` of channel ids with `toggle/has` helpers.
- Star button (top-right of each card + in player header).
- New "⭐ My Channels" section pinned above the main grid when favorites exist.

### 3. EPG strip in player (`src/components/LiveChannelPlayer.tsx`, new `src/hooks/useEPG.ts`)
- Fetch `https://iptv-org.github.io/api/guides.json` (cached 1h) → resolves channel→site mapping. EPG XMLTV data lives on `https://epg.pw/api/json.php?lang=en&channel_id=...` style endpoints; iptv-org guides reference external sites (sky.co.uk, etc.) — those aren't directly fetchable as JSON.
- **Pragmatic approach**: use `https://iptv-org.github.io/epg/guides/` XMLTV files. Since per-channel XMLTV is heavy, we'll use a lightweight wrapper: `https://epg.pw/api/epg.json?channel_id=<id>` (free, CORS-enabled). If the channel has no EPG, hide the strip gracefully.
- UI: thin strip below player header → `NOW: <program> (00:00–00:30)` and `NEXT: <program> (00:30–01:00)` with a slim progress bar for current program.

### 4. Live TV dedicated watch page (`src/pages/LiveWatch.tsx`)
- Route: `/live/:channelId` — fullscreen-friendly page with player + EPG + channel info sidebar + "Related channels" (same country/category).
- Update `Live.tsx` card click → navigate instead of modal (modal stays as quick-preview optional).
- Add route in `src/App.tsx`.

### 5. "Recently Watched" rail on homepage (`src/pages/Index.tsx`)
- New component `src/components/RecentlyWatchedRail.tsx`.
- Query `watch_history` joined with `episodes` + `content` for `auth.uid()`, ordered by `last_watched_at desc limit 10`.
- Card shows episode thumbnail, S/E label, content title, **resume progress bar** (`progress_seconds / total_seconds`). Click → `/watch/:contentId/:episodeId`.
- Hidden when not logged in or empty.

### 6. Backfill posters/thumbnails from Jikan (Edge Function)
- New edge function `supabase/functions/jikan-enrich/index.ts` (admin-triggered):
  1. Selects `content` rows where `poster_url` is null OR matches placeholder.
  2. For each: `GET https://api.jikan.moe/v4/anime?q=<title>&limit=1` (rate-limit: 1 req/sec → use `await sleep(1100)`).
  3. Updates `content.poster_url`, `banner_url`, `thumbnail_url` from `images.jpg.large_image_url` / `trailer.images.maximum_image_url`.
  4. Then for each content's episodes with null thumbnail: `GET /anime/{mal_id}/episodes` (paginated) → picks episode by number → updates `episodes.thumbnail_url`. Falls back to anime image if missing.
- Trigger: button on `Admin.tsx` → "Enrich images from Jikan" → calls function via `supabase.functions.invoke('jikan-enrich')`.
- Returns progress summary `{ updated, skipped, failed }`.

### Technical
- **Files created**: `src/pages/LiveWatch.tsx`, `src/components/RecentlyWatchedRail.tsx`, `src/hooks/useChannelFavorites.ts`, `src/hooks/useEPG.ts`, `supabase/functions/jikan-enrich/index.ts`
- **Files edited**: `src/pages/Live.tsx`, `src/components/LiveChannelPlayer.tsx`, `src/hooks/useIPTV.ts`, `src/pages/Index.tsx`, `src/App.tsx`, `src/pages/Admin.tsx`, `supabase/config.toml`
- **DB changes**: none (Jikan function uses service role to UPDATE existing rows)
- **No new npm deps**

