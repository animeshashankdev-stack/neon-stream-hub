

# Full Overhaul: Real Data, New Pages, Premium Redesign

## Overview
This is a major overhaul covering: (1) seed the database with real content, (2) replace all dummy data with Supabase queries, (3) build Auth, Watchlist, and Profile pages, (4) redesign every component for a premium, polished feel.

---

## Step 1 — Seed Database with Content

Insert sample anime data into Supabase via the insert tool:
- **12 content entries** with titles, descriptions, poster/banner URLs (using picsum or generated assets), ratings, years, languages, statuses
- **content_genres** linking entries to existing genres
- **episodes** (6-12 per series) with titles, durations, thumbnails
- **video_servers** entries for each episode (placeholder stream URLs)

This gives every page real data to pull from.

---

## Step 2 — Create Supabase Data Hooks

Create `src/hooks/useContent.ts` with React Query hooks:
- `useContentList(filters)` — search/filter content with genre joins
- `useFeaturedContent()` — content where `featured = true`
- `useContentDetail(id)` — single content + genres + episodes
- `useEpisodes(contentId)` — episodes for a content item
- `useGenres()` — all genres for filter UI
- `useRecommendations(contentId)` — random content excluding current

Create `src/hooks/useAuth.ts`:
- `useAuth()` — session state, sign in, sign up, sign out via Supabase Auth
- Auth context provider wrapping the app

Create `src/hooks/useWatchlist.ts`:
- `useWatchlist()` — fetch user's watchlist with content joins
- `useToggleWatchlist(contentId)` — add/remove

Create `src/hooks/useWatchHistory.ts`:
- `useWatchHistory()` — fetch user's history with content/episode joins

---

## Step 3 — Authentication (Login/Signup Page)

New file: `src/pages/Auth.tsx`
- Tabbed Login / Sign Up form with email + password
- Glass-card centered layout matching the neon theme
- Post-login redirect to previous page
- Route: `/auth`

Update `Navbar` to show user avatar or "Sign In" button.

---

## Step 4 — Watchlist Page

New file: `src/pages/Watchlist.tsx`
- Route: `/watchlist`
- Grid of saved content cards fetched from `watchlist` table joined with `content`
- Empty state with CTA to browse
- Remove button on each card
- Requires auth — redirect to `/auth` if not logged in

---

## Step 5 — Profile Page

New file: `src/pages/Profile.tsx`
- Route: `/profile`
- User avatar, display name, member since date
- **XP Progress Bar**: shows current XP, level, and progress to next level (100 XP per level)
- **Stats row**: total watched, watchlist count, hours watched
- **Watch History section**: recent episodes with progress bars, resume buttons
- **Watchlist preview**: top 4 saved items
- Requires auth

---

## Step 6 — Replace All Dummy Data

### Homepage (`Index.tsx`)
- Hero banner: fetch a random `featured` content from DB
- "Trending Now" carousel: fetch content ordered by rating desc
- "Popular Anime" section: fetch top-rated content
- "Recommended For You": if logged in, fetch from watch history genres; otherwise random
- Skeleton loaders while fetching

### Search (`Search.tsx`)
- Fetch genres from DB for filter chips
- Query `content` table with text search (`ilike`), genre filter (join), year filter, language filter
- Debounced search input
- Pagination (load more button)

### Content Detail (`ContentDetail.tsx`)
- Fetch content by `id` param from DB with genre names
- Fetch episodes for that content
- Fetch recommendations (same genres, different content)
- Watchlist button: toggle via `useToggleWatchlist`

### Watch (`Watch.tsx`)
- Fetch episode and content info from DB
- Fetch episode list for sidebar
- Fetch similar content for sidebar

---

## Step 7 — Premium UI Redesign

### Global Polish
- Refine color palette: deeper blacks, more subtle glass effects, refined glow intensities
- Add micro-animations: staggered fade-in for card grids, smooth hover transforms
- Improve typography hierarchy: larger hero text, better line heights, letter spacing
- Add skeleton loading states to all data-fetching components

### Navbar
- Add frosted blur effect that increases on scroll
- User avatar dropdown (profile, watchlist, sign out)
- Active nav link underline animation
- Mobile drawer with smooth slide transition

### Hero Banner
- Auto-rotate between multiple featured content (carousel with dots)
- Animated text entrance (fade-up with stagger)
- Gradient overlays refined for depth

### Content Cards
- Subtle border glow on hover instead of full box shadow
- Rating badge with star icon
- Episode count chip
- Smoother scale transition

### Content Detail
- Parallax-style banner scroll effect
- Animated genre tags
- Episode list with hover thumbnails and progress indicators
- Cleaner metadata layout

### Watch Page
- Refined controls with better spacing and hover states
- Animated settings panel (slide-up)
- Progress bar with buffered indicator styling

### Footer
- Organized into columns (About, Legal, Social)
- Newsletter signup field

---

## Step 8 — Add Routes

Update `App.tsx` to add:
- `/auth` — Auth page
- `/watchlist` — Watchlist page  
- `/profile` — Profile page

---

## Technical Details

**Files to create:**
- `src/hooks/useContent.ts`
- `src/hooks/useAuth.ts`
- `src/hooks/useWatchlist.ts`
- `src/hooks/useWatchHistory.ts`
- `src/contexts/AuthContext.tsx`
- `src/pages/Auth.tsx`
- `src/pages/Watchlist.tsx`
- `src/pages/Profile.tsx`
- `src/components/SkeletonCard.tsx`

**Files to heavily edit:**
- `src/pages/Index.tsx` — remove imports of local images, use hooks
- `src/pages/Search.tsx` — remove hardcoded array, use Supabase queries
- `src/pages/ContentDetail.tsx` — remove mock data, use hooks
- `src/pages/Watch.tsx` — remove mock data, use hooks
- `src/components/Navbar.tsx` — add auth state, avatar, mobile drawer
- `src/components/HeroBanner.tsx` — fetch featured content, auto-carousel
- `src/components/ContentCard.tsx` — accept DB shape, add rating badge
- `src/components/PopularAnimeSection.tsx` — fetch from DB
- `src/components/RecommendedSection.tsx` — fetch from DB
- `src/components/Footer.tsx` — redesign layout
- `src/index.css` — refined animations, new utility classes
- `src/App.tsx` — add auth provider, new routes

**Database operations (insert tool):**
- Insert ~12 content rows
- Insert ~30 content_genres rows
- Insert ~50 episode rows
- Insert ~50 video_server rows

**No schema changes needed** — existing tables cover all requirements.

