

## Plan

Four deliverables: Auth rebrand, smart server fallback, favicon/OG, Live TV section.

### 1. Auth page rebrand (`src/pages/Auth.tsx`)
Split-screen layout:
- **Left (desktop)**: Cinematic hero — large kana logo SVG with ambient teal/cyan/fuchsia glows, brand tagline ("Stream the senpai way."), 3 feature bullets (4K, Sub/Dub, Free).
- **Right**: Glass card form (existing form, restyled with Senpai teal gradient buttons, white/10 borders).
- Mobile: hero collapses to compact top banner.

### 2. Smart server fallback (`src/pages/Watch.tsx`)
State machine per stream attempt:
1. **Attempt 1** — sandboxed iframe (`allow-scripts allow-same-origin allow-presentation allow-forms`)
2. On `onError` OR 8s timeout with no load → **Attempt 2**: auto-rotate to next server, sandboxed
3. After all servers tried sandboxed → **Attempt 3**: re-try first server **unsandboxed** with red "⚠ Ads may appear — provider requires it" banner + "Back to safe mode" button
4. Manual override: user can click any server to retry sandboxed

Implementation: `attemptIndex`, `mode: 'sandboxed' | 'unsafe'`, `iframeKey` to force remount, `onLoad` clears timeout, `onError` advances chain.

### 3. Favicon + OG image
- Generate `public/favicon.png` (512×512) and `public/og-image.png` (1200×630) via Lovable AI image gen (nano-banana) using kana-mark + gradient prompt
- Delete `public/favicon.ico`, update `index.html` `<link rel="icon">` and OG/Twitter meta tags

### 4. Live TV section (IPTV)
- **New page** `src/pages/Live.tsx` — fetches `https://iptv-org.github.io/api/channels.json`, `streams.json`, `logos.json` (client-side, cached via React Query)
- Joins channels↔streams↔logos by id, filters to channels with a working `.m3u8` stream
- UI: search bar + country/category filter chips + responsive grid of channel cards (logo, name, country flag)
- Click → opens player modal/route with **HLS.js** (`hls.js` npm pkg) for `.m3u8` playback in a native `<video>`. Includes fullscreen, volume, quality (HLS auto-levels).
- Add nav link "Live TV" → `/live` in `Navbar.tsx`, route in `App.tsx`

```text
┌─────────────────────────────────┐
│ [Search] [Country▾] [Category▾] │
├─────────────────────────────────┤
│ [📺] [📺] [📺] [📺] [📺]       │
│ name  name  name  name  name    │
│ 🇺🇸    🇯🇵    🇬🇧    🇫🇷    🇮🇳    │
└─────────────────────────────────┘
```

### Technical
- **Files edited**: `src/pages/Auth.tsx`, `src/pages/Watch.tsx`, `index.html`, `src/components/Navbar.tsx`, `src/App.tsx`
- **Files created**: `src/pages/Live.tsx`, `src/components/LiveChannelPlayer.tsx`, `src/hooks/useIPTV.ts`, `public/favicon.png`, `public/og-image.png`
- **Files deleted**: `public/favicon.ico`
- **New dep**: `hls.js`
- **No DB changes**

