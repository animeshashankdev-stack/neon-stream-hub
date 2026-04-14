

# Fix Video Player, Add Genre Browsing, HLS Streaming, and Search Suggestions

## Overview

Four changes: (1) integrate real video playback using an HTML5 video element with the stream URLs from `video_servers`, (2) add a search suggestions dropdown that appears as the user types, (3) create a Genre Browsing page at `/genres`, (4) wire everything up with proper routes.

---

## 1 — Fix Video Player with Real Streaming

**Problem**: The current `Watch.tsx` has no `<video>` element — it's just a styled div with fake time state. The `video_servers` table has real stream URLs (e.g., `https://as-cdn21.top/video/...`).

**Solution**:
- Add a `useVideoServers(episodeId)` hook to `useContent.ts` that fetches stream URLs from `video_servers` for the current episode
- Replace the gradient placeholder in `Watch.tsx` with an actual `<video>` element
- Use the first available stream URL as the video `src`
- Wire all custom controls (play/pause, seek, volume, time display) to the real `<video>` ref via `HTMLVideoElement` API
- For HLS streams (`.m3u8` URLs): install `hls.js` and conditionally attach it when the URL ends in `.m3u8`; for direct MP4/embed URLs, use the native `<video src>` or an `<iframe>` fallback
- The stream URLs in DB appear to be direct video/embed links (not `.m3u8`), so we'll handle both cases: try as video src first, fall back to iframe embed if the URL isn't a direct video file
- Track `currentTime`, `duration`, `buffered` from `timeupdate`/`progress` events
- Skip intro advances the actual video by 90 seconds

**New dependency**: `hls.js`

**Files**: `src/hooks/useContent.ts` (add `useVideoServers`), `src/pages/Watch.tsx` (full rewrite with `<video>` element)

---

## 2 — Search Suggestions Dropdown

**Problem**: Search only shows results after navigating. User wants suggestions while typing.

**Solution**:
- In `Search.tsx`, add a suggestions dropdown below the search input that appears when `query.length >= 2`
- Use the existing `useContentList` with `debouncedQuery` — the data is already fetched
- Show a floating dropdown (absolute positioned, glass-card styled) with up to 8 results showing poster thumbnail, title, genre, and rating
- Each suggestion links to `/content/:id`
- Dropdown hides on blur or when a suggestion is clicked
- Also show the full grid results below as before

**Files**: `src/pages/Search.tsx`

---

## 3 — Genre Browsing Page

**Problem**: No way to browse content by genre.

**Solution**:
- Create `src/pages/Genres.tsx` at route `/genres`
- Fetch all genres with `useGenres()`, then for each genre that has content, fetch content filtered by that genre
- Use a single query approach: fetch all content with genres, then group client-side by genre
- Layout: hero header with "Browse by Genre" title, then genre sections with horizontal scrollable rows of `ContentCard`s
- Each genre section has a header with the genre name, content count, and a "See All" link to `/search?genre=GenreName`
- Add a genre tag cloud/grid at the top for quick navigation (anchor links to sections)
- Add route to `App.tsx` and nav link to `Navbar.tsx`

**Files**: `src/pages/Genres.tsx` (new), `src/App.tsx` (add route), `src/components/Navbar.tsx` (add link)

---

## 4 — Add `useVideoServers` Hook

Add to `useContent.ts`:
```typescript
export function useVideoServers(episodeId: string | undefined) {
  return useQuery({
    queryKey: ["video-servers", episodeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_servers")
        .select("*")
        .eq("episode_id", episodeId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!episodeId,
  });
}
```

---

## Technical Details

**Files to create**: `src/pages/Genres.tsx`

**Files to edit**: `src/pages/Watch.tsx`, `src/pages/Search.tsx`, `src/hooks/useContent.ts`, `src/App.tsx`, `src/components/Navbar.tsx`

**New dependency**: `hls.js` (for HLS stream support)

**No database changes needed** — all tables exist with proper RLS.

