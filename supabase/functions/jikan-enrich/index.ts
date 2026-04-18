import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface JikanAnime {
  mal_id: number;
  title: string;
  images?: { jpg?: { large_image_url?: string; image_url?: string } };
  trailer?: { images?: { maximum_image_url?: string; large_image_url?: string } };
}

function respond(ok: boolean, payload: Record<string, unknown>) {
  return new Response(JSON.stringify({ ok, ...payload }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function jikan<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return respond(false, { error: "Missing Authorization header", stage: "auth" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anon = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: uErr } = await userClient.auth.getUser();
    if (uErr || !userData?.user) return respond(false, { error: "Unauthorized — invalid session", stage: "auth" });

    const { data: roleCheck, error: rErr } = await userClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (rErr) return respond(false, { error: `Role check failed: ${rErr.message}`, stage: "role" });
    if (!roleCheck) return respond(false, { error: "Forbidden — admin role required", stage: "role" });

    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 200);

    const admin = createClient(supabaseUrl, serviceKey);

    const { data: contentRows, error: cErr } = await admin
      .from("content")
      .select("id, title, poster_url, banner_url, thumbnail_url")
      .limit(limit);
    if (cErr) return respond(false, { error: `Content query failed: ${cErr.message}`, stage: "query" });

    let updated = 0, skipped = 0, failed = 0, episodesUpdated = 0;
    const errors: string[] = [];
    const placeholderRx = /placeholder|^$/i;

    for (const row of contentRows || []) {
      try {
        console.log(`[jikan-enrich] Processing: ${row.title}`);
        const needsImages = !row.poster_url || placeholderRx.test(row.poster_url) ||
                            !row.banner_url || placeholderRx.test(row.banner_url) ||
                            !row.thumbnail_url || placeholderRx.test(row.thumbnail_url);

        const search = await jikan<{ data: JikanAnime[] }>(`/anime?q=${encodeURIComponent(row.title)}&limit=1`);
        await sleep(1100);
        const anime = search?.data?.[0];
        if (!anime) { skipped++; console.log(`[jikan-enrich] No match: ${row.title}`); continue; }

        if (needsImages) {
          const poster = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
          const banner = anime.trailer?.images?.maximum_image_url || anime.trailer?.images?.large_image_url || poster;
          const patch: Record<string, string> = {};
          if ((!row.poster_url || placeholderRx.test(row.poster_url)) && poster) patch.poster_url = poster;
          if ((!row.banner_url || placeholderRx.test(row.banner_url)) && banner) patch.banner_url = banner;
          if ((!row.thumbnail_url || placeholderRx.test(row.thumbnail_url)) && poster) patch.thumbnail_url = poster;
          if (Object.keys(patch).length > 0) {
            const { error: upErr } = await admin.from("content").update(patch).eq("id", row.id);
            if (upErr) { failed++; errors.push(`${row.title}: ${upErr.message}`); }
            else updated++;
          }
        }

        const { data: eps } = await admin
          .from("episodes")
          .select("id")
          .eq("content_id", row.id)
          .is("thumbnail_url", null);

        if (eps && eps.length > 0) {
          const fallback = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
          if (fallback) {
            for (const ep of eps) {
              await admin.from("episodes").update({ thumbnail_url: fallback }).eq("id", ep.id);
              episodesUpdated++;
            }
          }
        }
      } catch (e: any) {
        failed++;
        errors.push(`${row.title}: ${e?.message || String(e)}`);
        console.error(`[jikan-enrich] Row failed: ${row.title}`, e);
      }
    }

    return respond(true, {
      updated, skipped, failed, episodesUpdated,
      total: contentRows?.length || 0,
      errors: errors.slice(0, 10),
    });
  } catch (e: any) {
    console.error("[jikan-enrich] Fatal:", e);
    return respond(false, { error: String(e?.message || e), stage: "fatal" });
  }
});
