

# Neon Curator: Deployment Ready, Branding, Continue Watching, Keyboard Shortcuts, Admin Panel

## Overview
Six areas of work: (1) Remove Lovable branding and create a custom logo/favicon, (2) Make Vercel-deploy ready, (3) Add "Continue Watching" section on homepage, (4) Add keyboard shortcuts to video player, (5) Update year to 2026, (6) Build an Admin panel with analytics.

---

## 1 — Remove Lovable Branding + Custom Logo & Favicon

- Remove `lovable-tagger` plugin from `vite.config.ts`
- Remove OG image references to `lovable.dev` from `index.html`
- Create an SVG logo for "Neon Curator" (a stylized "NC" monogram with neon glow) and save as `public/logo.svg`
- Generate a favicon from the logo and add `<link rel="icon">` to `index.html`
- Update `Navbar.tsx` to use the SVG logo instead of text-only branding
- Update `Footer.tsx` to use the logo
- Update `index.html` OG meta tags to reference the app name and description

**Files**: `vite.config.ts`, `index.html`, `public/logo.svg`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`

---

## 2 — Vercel Deploy Ready

- Add `vercel.json` with SPA rewrites (`{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`)
- Ensure `package.json` has a `build` script (already has via Vite)
- No other changes needed — Vite builds to `dist/` which Vercel auto-detects

**Files**: `vercel.json` (new)

---

## 3 — Continue Watching Section on Homepage

- Add a "Continue Watching" section in `Index.tsx` between the hero and trending sections
- Use `useWatchHistory()` to fetch partially watched episodes (where `completed = false` and `progress_seconds > 0`)
- Show episode thumbnails with a progress bar overlay and a "Resume" button
- Each card links to `/watch/:contentId/:episodeId`
- Only visible when user is logged in and has watch history

**Files**: `src/pages/Index.tsx`, possibly a new `src/components/ContinueWatchingSection.tsx`

---

## 4 — Keyboard Shortcuts for Video Player

Add a `useEffect` with `keydown` listener in `Watch.tsx`:
- **Space**: toggle play/pause
- **ArrowLeft**: seek -10s
- **ArrowRight**: seek +10s
- **F**: toggle fullscreen
- **M**: toggle mute

Only active when not using iframe mode.

**Files**: `src/pages/Watch.tsx`

---

## 5 — Update Year to 2026

- Change `© 2024` to `© 2026` in `Footer.tsx`

**Files**: `src/components/Footer.tsx`

---

## 6 — Admin Panel

This is the largest piece. Create an admin dashboard at `/admin` with:

### Database Changes (migration)
- Create `page_views` table: `id`, `page_path`, `user_agent`, `ip_hash` (text, anonymized), `created_at` (timestamp)
- RLS: public can INSERT (for tracking), only admin can SELECT
- Create `user_roles` table following the security guidelines (enum `app_role` with `admin`, `moderator`, `user`)
- Create `has_role()` security definer function
- RLS on `page_views` SELECT: only users with `admin` role

### Analytics Tracking
- Create a `usePageView()` hook that inserts a row into `page_views` on each route change
- Add it to `App.tsx` so every page navigation is tracked

### Admin Pages
- `src/pages/Admin.tsx` — Dashboard layout with sidebar navigation
- **Overview tab**: Daily/weekly/monthly/total page views with charts (using recharts, already available via shadcn chart component)
- **Users tab**: List all profiles with display name, XP, level, join date, role management
- **Content tab**: View all content entries with edit capabilities (title, description, featured toggle)
- **Analytics tab**: Detailed view counts by page, time-series charts

### Admin Access Control
- Check `has_role(auth.uid(), 'admin')` via an RPC call in a `useIsAdmin()` hook
- Redirect non-admins away from `/admin`
- Add admin link in Navbar user dropdown (only visible to admins)

### Route
- Add `/admin` and `/admin/*` routes to `App.tsx`

**Files**: 
- New: `src/pages/Admin.tsx`, `src/hooks/usePageView.ts`, `src/hooks/useAdmin.ts`
- Edit: `src/App.tsx`, `src/components/Navbar.tsx`
- Migration: `page_views` table, `user_roles` table, `has_role()` function, RLS policies

---

## Technical Details

**New files**: `vercel.json`, `public/logo.svg`, `src/pages/Admin.tsx`, `src/hooks/usePageView.ts`, `src/hooks/useAdmin.ts`, `src/components/ContinueWatchingSection.tsx`

**Edited files**: `vite.config.ts`, `index.html`, `src/App.tsx`, `src/pages/Index.tsx`, `src/pages/Watch.tsx`, `src/components/Navbar.tsx`, `src/components/Footer.tsx`

**New dependency**: None (recharts already available via shadcn chart)

**Database migration**: Create `page_views`, `user_roles` tables, `app_role` enum, `has_role()` function, and associated RLS policies

**Note**: After creating the admin infrastructure, you'll need to manually assign yourself the `admin` role by inserting a row into `user_roles` via the Supabase dashboard.

