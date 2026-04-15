

# Fix Video Player, Thumbnails, Hero, Filtering, Seasons, and Layout

## Root Cause Analysis

1. **Video not playing / "Loading video..."**: The `stream_url` values (e.g. `https://as-cdn21.top/video/...`) are embed page URLs, not direct video files. They don't match `.mp4`/`.m3u8` patterns, so the code falls into `setUseIframe(true)`. But the logic checks `if (!video)` before checking the URL type, which is wrong -- `videoRef.current` exists at that point. The real fix: these URLs are iframe-embeddable pages, so we should always use iframe mode for `as-cdn21.top/video/` URLs and `short.icu` URLs. The `abysscdn.com` URLs are also iframe-embeddable.

2. **Ad redirects in iframe**: The embedded player pages contain ad scripts. We need to use `sandbox` attribute on the iframe to restrict popups/redirects while still allowing the video to play.

3. **Hero section black/empty**: `useFeaturedContent()` queries `featured = true`, but the DB query returns empty -- no content has `featured = true`. Need to update some content rows to `featured = true`, or fall back to showing top-rated content.

4. **All poster_url = AnimeSalt logo**: Every single content row (190 total) has `poster_url` set to `https://i.pinimg.com/1200x/c2/df/68/c2df689d17ba78f758f39877cbd63f8c.jpg` (the site logo, not actual posters). The `thumbnail_url` field has the same value. We need to use TMDB poster URLs instead. The user's pasted data shows TMDB thumbnails exist (e.g. `https://image.tmdb.org/t/p/w500/...`). We should update the DB to use proper TMDB poster URLs, or at minimum use a placeholder image when the URL is the AnimeSalt logo.

5. **No filtering by type (Series/Movies/Anime/Cartoon)**: Navbar links to `/search?type=series` and `/search?type=movie`, but `Search.tsx` never reads the `type` param from URL, and `useContentList` has no `type` filter. Also, all 190 items are `type: 'series'` -- there's no `movie` type in DB. The content_type enum likely only has `series` and `movie`. Filtering by genre (Anime, Cartoon, etc.) would be more useful.

6. **Season switching in Watch page**: The Watch page side panel shows all episodes without season grouping. Need to add season tabs/selector.

7. **Episodes hiding behind video player**: The side panel is `hidden lg:block` and overlaps the video. On smaller screens, episodes are completely hidden. Need a better layout.

8. **Quality/Speed/Fullscreen**: Quality selector is cosmetic only (doesn't change the stream). Speed control is missing. Fullscreen targets the container but should work better.

---

## Plan

### Step 1 — Fix Video Player (iframe mode + ad blocking)

**File: `src/pages/Watch.tsx`** — Major rewrite:
- Detect URL type properly: `as-cdn21.top/video/` and `short.icu/` URLs should always use iframe mode
- Add `sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"` to iframe (blocks popups/redirects/top-navigation from ads)
- Add playback speed control (0.5x, 1x, 1.25x, 1.5x, 2x) for native video mode
- Add proper fullscreen for both iframe and native modes
- Fix layout: move episodes below the video instead of a side panel that hides content. On desktop, use a collapsible side panel that doesn't overlap
- Add season tabs/selector in the episodes panel so users can switch seasons
- Show a server selector when multiple servers exist (with language labels)
- Remove the "Loading video..." stuck state — show it only briefly, then fall back to iframe

### Step 2 — Fix Hero Banner (no featured content)

**Database update**: Mark 5-6 content items as `featured = true` using the insert tool (UPDATE query).

**File: `src/components/HeroBanner.tsx`**: Add fallback — if `featured` returns empty, show top-rated content instead.

### Step 3 — Fix Missing Thumbnails

**Database update**: The poster URLs are all the AnimeSalt logo. We need to update them with TMDB poster URLs. I'll update poster_url for all content that has the AnimeSalt logo URL, mapping titles to their TMDB poster images.

**File: `src/hooks/useContent.ts`**: Remove the dead `posterMap`/`bannerMap` code (references non-existent local assets). Add a fallback: if poster_url contains "AnimeSaltLong.png", replace with a gradient placeholder or TMDB search.

### Step 4 — Fix Type Filtering (Series/Movies/Anime/Cartoon)

**File: `src/pages/Search.tsx`**: 
- Read `type` param from URL search params
- Add type filter tabs at the top: All, Anime, Series, Movies, Cartoon
- Filter by genre name for Anime/Cartoon (since `type` column only has series/movie)
- Pass type filter to `useContentList`

**File: `src/hooks/useContent.ts`**: Add `type` filter to `useContentList`.

**File: `src/components/Navbar.tsx`**: Update nav links to use genre-based filtering: Anime → `/search?genre=Anime`, Cartoon → `/search?genre=Cartoon`.

### Step 5 — Fix Watch Page Layout

**File: `src/pages/Watch.tsx`**:
- Change from fixed full-screen layout to a proper page layout
- Video player takes full width at top
- Episodes list below the video (scrollable, with season tabs)
- On desktop (lg+), optionally show episodes in a right sidebar that doesn't overlap the video
- Each episode shows its number, title, and is clearly visible

---

## Technical Details

**Files to edit**: `src/pages/Watch.tsx`, `src/components/HeroBanner.tsx`, `src/hooks/useContent.ts`, `src/pages/Search.tsx`, `src/components/Navbar.tsx`

**Database updates (via insert tool)**:
- UPDATE content SET featured = true WHERE id IN (...) — for 5 titles
- UPDATE content SET poster_url = CASE ... for titles where we can map TMDB URLs

**No schema changes needed.**

