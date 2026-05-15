# Senpai redesign + full API lockdown

This is a large change. I'll ship it in 4 phases so the preview never breaks for long.

## Phase 1 — Design foundation (one commit)

Create the shared chrome the uploaded pages all import from.

- `src/styles/senpai.css` — port the contents of the uploaded `_group.css` (CSS variables, fonts, `.senpai-*` utility classes, aurora/halftone/noise/scrollbar). Imported once from `src/main.tsx`.
- `src/components/senpai/AppShell.tsx` — top nav + side rail + aurora background. Real `<Link>` routing (Home `/`, Browse `/search`, Live `/live`, Manga `/manga`, Library `/watchlist`, Profile `/profile`, Settings (new), Admin `/admin`). Wires the real `useAuth()` user into the avatar.
- `src/components/senpai/Logo.tsx` — `SenpaiLogo` component.
- `src/components/senpai/Loader.tsx` — `SenpaiLoader` from upload (replaces ad-hoc spinners).
- `src/components/senpai/primitives.tsx` — `GlassCard`, `NeonChip`, `ScoreBadge`, `YearSticker`, `PrimaryButton`, `GhostButton`, `LiveDot`. Pure presentational, accept children/props.

No mock `_shared/data` module — every page reads from real hooks.

## Phase 2 — Page rewrites (one page per commit)

Each page keeps its current route and replaces only the JSX with the uploaded design, swapping mock arrays for real hooks. Order:

1. **Watch** (`src/pages/Watch.tsx`) — already uses `useStreamToken`. Drop in the new chapter bar / up-next rail / server picker UI but keep the signed-proxy `<video>` element, `controlsList="nodownload"`, no-context-menu, watch-history writes.
2. **Search** — replace with the upload's overlay-style search; results from `useContent`, `useIPTV`, `useManga`.
3. **Profile** — bind cover/avatar/display_name/level/xp from `profiles`, history from `watch_history` + `read_history`.
4. **MangaBrowse** (`src/pages/Manga.tsx`) — feed from `useManga` (MangaDex via `manga-proxy`). Streak from `read_history`.
5. **MangaDetail** — chapters from `manga-proxy /manga/{id}/feed`.
6. **MangaReader** — keep the secured page-fetch via `manga-proxy/page`, swap the chrome.
7. **Settings** (new page `/settings` + route + nav entry) — bound to `profiles` + localStorage prefs.
8. **AppShell** is already shipped in Phase 1; verify all pages render inside it.

`BottomNav` stays for mobile; sidebar shows on `lg+`.

## Phase 3 — Full API lockdown

Goal: the browser never sees a third-party origin URL, and every proxy verifies the caller.

Hardening of existing edge functions:

- `stream-token` / `stream-proxy`
  - One-shot tokens: mark `used_at` on first manifest hit; reject reuse for non-segment requests.
  - Bind to `ip_hash` — `stream-proxy` recomputes hash from `x-forwarded-for` and rejects mismatches.
  - Reject if `Origin` / `Referer` not in allowlist (preview + published + custom domains).
  - Strip `Server`, `Via`, upstream URL fragments from rewritten manifests.
- `manga-proxy`
  - Require `Authorization` Bearer (verify with `getClaims`) for all `mangadex` / `page` routes. Covers stay public + cached.
  - Tighten allowlist (already done) + per-user rate limit keyed off `sub`, not IP.
  - Add `Referer` / `Origin` allowlist check.
- `iptv-sync` — already admin-only; add audit row to a new `admin_audit` log table (optional).
- New `iptv-proxy` edge function — proxies live channel `.m3u8` through the same signed-token pattern as `stream-proxy` so raw IPTV URLs never reach the client. `LiveWatch` switches to it.
- New `live-token` edge function — issues per-channel signed tokens (auth required).
- Frontend: remove any remaining direct `fetch()` to mangadex/jikan/iptv/raw streams. Grep gate before merge.

Config: keep `verify_jwt = false` and validate JWTs in code (signing-keys flow). Add `verify_jwt = false` entries for the new functions in `supabase/config.toml`.

## Phase 4 — Verification

- `supabase--linter` clean.
- Manual: log out → confirm `manga-proxy/mangadex/*` returns 401.
- Manual: copy a stream-proxy URL into an incognito tab → 403 (IP/origin mismatch).
- Visual QA each redesigned page in the preview.

## Notes / decisions baked in

- Kept current routes — no URL changes, no broken bookmarks.
- Kept Tailwind tokens in `index.css`; the new `.senpai-*` classes live alongside as a parallel utility layer scoped under `.senpai-root`.
- No new tables required for the redesign. The lockdown adds zero tables (one-shot reuse uses the existing `stream_tokens.used_at` column).
- I will not pull in the uploaded `_shared/data.ts` mock module — real hooks only, per your answer.

## Deliverable order

I'll start with Phase 1 (foundation) right after you approve. Each subsequent phase will be a separate turn so you can review.
