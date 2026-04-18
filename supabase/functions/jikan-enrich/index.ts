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

async function jikan<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4${path}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json as T;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anon = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { data: roleCheck } = await userClient.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Find content needing enrichment
    const { data: contentRows, error: cErr } = await admin
      .from("content")
      .select("id, title, poster_url, banner_url, thumbnail_url");
    if (cErr) throw cErr;

    let updated = 0, skipped = 0, failed = 0, episodesUpdated = 0;
    const placeholderRx = /placeholder|^$/i;

    for (const row of contentRows || []) {
      const needsImages = !row.poster_url || placeholderRx.test(row.poster_url) ||
                          !row.banner_url || placeholderRx.test(row.banner_url) ||
                          !row.thumbnail_url || placeholderRx.test(row.thumbnail_url);

      // Always look up MAL id for episode enrichment, even if poster present
      const search = await jikan<{ data: JikanAnime[] }>(`/anime?q=${encodeURIComponent(row.title)}&limit=1`);
      await sleep(1100);
      const anime = search?.data?.[0];
      if (!anime) { skipped++; continue; }

      if (needsImages) {
        const poster = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;
        const banner = anime.trailer?.images?.maximum_image_url || anime.trailer?.images?.large_image_url || poster;
        const patch: any = {};
        if ((!row.poster_url || placeholderRx.test(row.poster_url)) && poster) patch.poster_url = poster;
        if ((!row.banner_url || placeholderRx.test(row.banner_url)) && banner) patch.banner_url = banner;
        if ((!row.thumbnail_url || placeholderRx.test(row.thumbnail_url)) && poster) patch.thumbnail_url = poster;
        if (Object.keys(patch).length > 0) {
          const { error: uErr } = await admin.from("content").update(patch).eq("id", row.id);
          if (uErr) failed++; else updated++;
        }
      }

      // Episode thumbnails
      const { data: eps } = await admin
        .from("episodes")
        .select("id, episode_number")
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
    }

    return new Response(
      JSON.stringify({ updated, skipped, failed, episodesUpdated, total: contentRows?.length || 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e?.message || e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
