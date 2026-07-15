# Deploy Senpai.tv to Hostinger via GitHub

This app is a static Vite + React SPA — perfect for Hostinger shared hosting.
Supabase (auth, database, edge functions) is a separate hosted service; nothing
server-side needs to run on Hostinger.

## 1. Push the repo to GitHub

Connect the project to GitHub from Lovable (top-right → GitHub → Connect). This
creates a repo that mirrors the code both ways.

## 2. Enable Git deployment in Hostinger

1. hPanel → **Website** → **Git**.
2. Click **Create repository**.
3. Paste your GitHub HTTPS URL, pick the branch (`main`), set the deploy path
   to your domain's `public_html/`.
4. Save. Hostinger clones the repo.

## 3. Build the app before pushing (recommended)

Hostinger shared hosting can't run `npm run build`. Two options:

### Option A — commit `dist/` (simplest)

```bash
npm ci
npm run build
# temporarily commit the dist folder
git add -f dist && git commit -m "deploy" && git push
```

Then in Hostinger → Git → **Advanced** → set the deploy path to
`public_html/` and the source subdirectory to `dist/`. Hostinger will copy
only `dist/*` into `public_html/` on every push.

### Option B — GitHub Actions builds for you

Add `.github/workflows/deploy.yml` that runs `npm run build` and pushes the
resulting `dist/` to a `deploy` branch. Point Hostinger's Git integration at
the `deploy` branch. (Ask if you want this scaffolded.)

## 4. SPA routing

`public/.htaccess` is copied into `dist/` at build time. It:

- Rewrites every non-file request to `index.html` (React Router deep links).
- Sets long-lived cache headers on hashed assets.
- Adds baseline security headers.

No further Hostinger config needed.

## 5. Environment variables

All runtime config lives in Supabase; there are no build-time secrets. The
Supabase URL/anon key are embedded from `src/integrations/supabase/client.ts`
and are safe to ship publicly.

## 6. Custom domain + SSL

In Hostinger → **Domains**, point your domain at the same hosting plan. SSL
is auto-provisioned via Let's Encrypt. Update `og:url` / `canonical` in your
`index.html` to your live domain if it differs from the current
`https://neon-curator-hub.lovable.app`.

## 7. Verify after deploy

- Load `/` — hero should render.
- Load `/content/<some-id>` directly (deep link) — should hydrate, not 404.
- Check the response headers in DevTools: `.js`/`.css` should be
  `Cache-Control: public, max-age=31536000, immutable`.
- Share a title URL to Twitter / Discord — the per-page `og:image` and title
  should show once the crawler executes JS (may take a minute).