

The function returns 401/403/500 with non-2xx, which supabase-js surfaces as "Edge Function returned a non-2xx status code" without the body. Two issues likely:

1. `supabase/config.toml` sets `verify_jwt = true` for `jikan-enrich`. Combined with the function also checking auth manually — if the client invoke isn't passing auth properly or the user isn't admin, it 401/403s.
2. Even when reachable, errors return non-2xx so the client shows the generic message.

Fix: always return HTTP 200 with `{ ok, error, ...stats }` so the UI can show the real reason. Also wrap the long-running loop with a small batch limit + better logging so we can see progress.

## Plan

Edit `supabase/functions/jikan-enrich/index.ts`:
- Add `respond(ok, payload)` helper that always returns 200.
- Replace all `status: 401/403/500` returns with `respond(false, { error, stage })`.
- Add try/catch around per-row work; collect errors into array; never throw out.
- Add optional `?limit=N` query param (default 50) to avoid timeouts on large catalogs.
- Log `console.log` per row for dashboard visibility.

Edit `src/pages/Admin.tsx`:
- Read `data.ok` from response; show toast with `data.error` when `ok=false`, else show `updated/skipped/failed/episodesUpdated` summary.

No DB or config changes needed (`verify_jwt = true` is fine — function still validates admin role internally).

