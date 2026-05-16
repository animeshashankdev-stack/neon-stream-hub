## Scope

Eight workstreams across UI, security, and SEO. Grouped below.

---

## 1. Live routes auth + token caching + auto-refresh

- Wrap `/live` and `/live/:channelId` in `<RequireAuth>` in `src/App.tsx`.
- Update `useLiveToken` to keep an in-memory cache keyed by `channelUrl`; reuse token while `expiresAt - now > 10s`; otherwise mint new.
- `LiveChannelPlayer`: listen for HLS `ERROR` events (network/manifest 403/410) and auto re-request signed URL, then `hls.loadSource(newUrl)` and `hls.startLoad()`. Also pre-refresh ~10s before known expiry via timer.

## 2. Manga browse — Senpai redesign (auth-gated already)

Rewrite `src/pages/Manga.tsx` using `AppShell`, `GlassCard`, `NeonChip`, `senpai-*` utilities from `src/components/senpai/AppShell.tsx`. Keeps `usePopularManga` / `useSearchManga` hooks. No data-layer change.

## 3. Search page — Senpai redesign + real Supabase

Rewrite `src/pages/Search.tsx` against `useContentList({ query, genre, year, language, type })` and `useGenres()`. Senpai shell + glass filter rail + poster grid using `content.poster_url` / `banner_url` / `thumbnail_url` (already cleaned by `useContent.ts`).

Confirm `ContentCard` / poster usage everywhere reads `poster_url` (banner→`banner_url`, thumb→`thumbnail_url`). Existing `useContent.ts` already does the right mapping, so this is a render-layer audit only — no schema changes.

## 4. Security fixes (DB + edge)

Migrations:

- **stream_tokens**: revoke all client write; rely on service role only. Add explicit `INSERT`/`DELETE` policies denying anon/auth (no policy = denied, but make this explicit via restrictive policies and document).
- **page_views**: add `user_id uuid` column + bind RLS `INSERT` to `auth.uid() = user_id`; replace "always true" check. Update `usePageView` to send `user_id`.
- **iptv_channels**: introduce subscription gate. Add `is_premium` check via `has_role` or `profiles.is_premium`. Update `live-token` edge fn to verify caller has `profiles.is_premium = true` OR admin role; reject otherwise.
- **video_servers**: tighten — change SELECT policy from `true` to `auth.uid() IS NOT NULL`. Stream URL access only via `stream-token` edge fn (already enforced).
- **SECURITY DEFINER functions**: `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated` for `has_role`, `is_moderator`, `prevent_profile_privilege_escalation`, `handle_new_user`, `update_updated_at_column`. Grant back to `service_role` only (functions still callable inside RLS expressions — that uses the definer privilege, not the caller's EXECUTE grant).
- **RLS Policy Always True**: replace `Content/Episodes/Genres/EPG/content_genres` `USING (true)` SELECT policies with `auth.uid() IS NOT NULL` if user wants gating, OR keep public + acknowledge intent in security memory. Default: keep public (anime catalog is meant to be browsable) and write to security memory.

Auth config:
- Enable Leaked Password Protection (Supabase auth setting — surface link to dashboard; can't toggle via SQL).

## 5. SEO / AI search

- Add `react-helmet-async` provider in `src/main.tsx`; per-page `<Helmet>` titles + descriptions on `Index`, `Search`, `ContentDetail`, `Watch`, `Live`, `Manga`, `Watchlist`, `Profile`, `Auth`.
- Create `scripts/generate-sitemap.ts` + `predev`/`prebuild` hooks. Includes static routes + dynamic `/content/:id` + `/manga/:id` from Supabase.
- Per-page OG/Twitter tags via Helmet.
- Add JSON-LD `Organization` + `WebSite` in `index.html`; `VideoObject` JSON-LD on `ContentDetail`.
- Add `aria-label`s on icon-only buttons across `Navbar`, `BottomNav`, players.
- Note SSR-style pre-rendering is a Lovable platform feature, not a code change — call out in the wrap-up.

## 6. Poster/thumbnail audit

`useContent.ts` already resolves `poster_url`/`banner_url`/`thumbnail_url` with fallbacks. Verify `ContentCard`, `HeroBanner`, `ContentCarousel`, `RecommendedSection`, `PopularAnimeSection`, `Search`, `Watchlist` all use the right field per surface (card=poster, hero=banner, rail=thumbnail). Fix any mis-bindings.

---

## Order of execution

1. Migrations (page_views.user_id, RLS tightening, REVOKE EXECUTE)
2. Edge fn changes (`live-token` premium gate)
3. `App.tsx` route guards
4. `useLiveToken` cache + `LiveChannelPlayer` refresh
5. `Search.tsx` + `Manga.tsx` rewrites
6. Poster audit
7. SEO (Helmet + sitemap + JSON-LD + aria)
8. Run `supabase--linter` and security scan; update security memory

## Risks / decisions needed

- **Catalog public vs auth-only**: `content`, `episodes`, `genres` currently `USING (true)`. Keep public (recommended for SEO of anime detail pages) or lock to authed users? Default = keep public.
- **IPTV premium gate**: Use `profiles.is_premium` column (exists) — non-premium users get 403 from `live-token`. Confirm OK.
- **page_views.user_id**: making non-null breaks anonymous tracking. Plan: nullable column, RLS `INSERT` requires `user_id = auth.uid() OR user_id IS NULL` only when caller is anon. Simpler: require auth + bind to uid; drop anonymous page views.

I'll proceed with defaults above unless you flag otherwise.
