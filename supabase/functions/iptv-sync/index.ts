import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface M3UChannel {
  channel_id: string | null;
  name: string;
  logo_url: string | null;
  group_title: string | null;
  stream_url: string;
  country: string | null;
  language: string | null;
}

function parseM3U(text: string): M3UChannel[] {
  const lines = text.split(/\r?\n/);
  const out: M3UChannel[] = [];
  let pending: Partial<M3UChannel> | null = null;

  const attr = (s: string, key: string) => {
    const m = s.match(new RegExp(`${key}="([^"]*)"`, "i"));
    return m ? m[1] : null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXTINF")) {
      const commaIdx = line.indexOf(",");
      const name = commaIdx >= 0 ? line.slice(commaIdx + 1).trim() : "Unknown";
      pending = {
        name,
        channel_id: attr(line, "tvg-id"),
        logo_url: attr(line, "tvg-logo"),
        group_title: attr(line, "group-title"),
        country: attr(line, "tvg-country"),
        language: attr(line, "tvg-language"),
      };
    } else if (!line.startsWith("#") && pending) {
      pending.stream_url = line;
      out.push(pending as M3UChannel);
      pending = null;
    }
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: claims } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    const userId = claims?.claims?.sub as string | undefined;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => ({}));
    const { playlistId } = body as { playlistId?: string };
    if (!playlistId) {
      return new Response(JSON.stringify({ error: "playlistId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: pl } = await admin.from("iptv_playlists").select("*").eq("id", playlistId).maybeSingle();
    if (!pl) {
      return new Response(JSON.stringify({ error: "Playlist not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const m3uRes = await fetch(pl.m3u_url, { headers: { "User-Agent": "SenpaiTV/1.0" } });
    if (!m3uRes.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch m3u: ${m3uRes.status}` }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const m3uText = await m3uRes.text();
    const channels = parseM3U(m3uText);

    // Wipe existing channels for this playlist
    await admin.from("iptv_channels").delete().eq("playlist_id", playlistId);

    // Insert in batches
    const BATCH = 500;
    let inserted = 0;
    for (let i = 0; i < channels.length; i += BATCH) {
      const batch = channels.slice(i, i + BATCH).map((c) => ({ ...c, playlist_id: playlistId }));
      const { error } = await admin.from("iptv_channels").insert(batch);
      if (!error) inserted += batch.length;
    }

    await admin.from("iptv_playlists").update({ last_synced_at: new Date().toISOString() }).eq("id", playlistId);

    return new Response(JSON.stringify({ ok: true, channels: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("iptv-sync error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});