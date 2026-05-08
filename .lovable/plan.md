

The Watch page currently doesn't show poster/banner art at all, and the episode list uses solid color tiles instead of `episodes.thumbnail_url`. Plus the layout breaks below ~lg (sidebar pinned at 400px, hard-coded heights, controls cramped).

## Plan

### 1. Display real images from DB (`src/pages/Watch.tsx`)
- **Player area background** (when no stream loaded / loading): use `content.banner_url` (fallback `poster_url`) as a blurred backdrop instead of plain gradient.
- **Info section**: add a **poster column** showing `content.poster_url` next to title/description (hidden on mobile, shown ≥md).
- **Episode list thumbnails**: replace the solid-color placeholder div with `<img src={ep.thumbnail_url ?? content?.thumbnail_url ?? content?.poster_url}>` covering the 16:9 tile, with the play/pause overlay on top. Lazy-load + `onError` falls back to a gradient.

(Hooks `useContentDetail` already returns `poster_url/banner_url/thumbnail_url` cleaned via `resolveImages`, and `useEpisodes` returns `thumbnail_url` — no hook changes needed.)

### 2. Make layout fully responsive
- Container: switch from `flex-col lg:flex-row` to `flex-col xl:flex-row` so the episodes panel doesn't squeeze the player on tablets; sidebar width `w-full xl:w-[380px]`.
- Player container: replace `aspect-video md:aspect-auto md:h-[58vh]` with `aspect-video lg:aspect-auto lg:h-[60vh] xl:h-[65vh]` and add `max-h-[80vh]`.
- Top bar: allow wrap, shrink the title block, hide breadcrumb dot on xs, server/lang badges already responsive — keep as is.
- Control bar: tighten paddings on `<sm`, stack volume below on very narrow screens (already hidden — keep).
- Info section padding: `p-4 sm:p-6 md:p-8 lg:p-12`.
- Episode list `max-h`: switch `max-h-[500px]` to `max-h-[60vh] xl:max-h-[70vh]`.
- Title sizes: `text-xl sm:text-2xl md:text-3xl lg:text-4xl`.
- Description: `text-sm md:text-base` (keep) but add `line-clamp-4 md:line-clamp-none` for mobile.

### Files
- **Edited**: `src/pages/Watch.tsx`
- No DB changes, no hook changes, no new deps.

