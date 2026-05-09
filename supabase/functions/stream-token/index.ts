import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SECRET = Deno.env.get("STREAM_SIGNING_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const TTL_SECONDS = 60;

async function hmac(input: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const { episodeId, serverId } = body as { episodeId?: string; serverId?: string };
    if (!episodeId || !serverId || typeof episodeId !== "string" || typeof serverId !== "string") {
      return new Response(JSON.stringify({ error: "episodeId and serverId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Verify the server belongs to the episode
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: server, error: srvErr } = await admin
      .from("video_servers")
      .select("id, episode_id, stream_url")
      .eq("id", serverId)
      .eq("episode_id", episodeId)
      .maybeSingle();
    if (srvErr || !server) {
      return new Response(JSON.stringify({ error: "Server not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
    const ipHash = await sha256(ip);
    const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000);
    const nonce = crypto.randomUUID();
    const payload = `${userId}.${episodeId}.${serverId}.${expiresAt.getTime()}.${nonce}`;
    const sig = await hmac(payload);
    const token = `${btoa(payload).replace(/=/g, "")}.${sig}`;
    const tokenHash = await sha256(token);

    await admin.from("stream_tokens").insert({
      user_id: userId,
      episode_id: episodeId,
      token_hash: tokenHash,
      ip_hash: ipHash,
      expires_at: expiresAt.toISOString(),
    });

    // Cleanup expired
    await admin.from("stream_tokens").delete().lt("expires_at", new Date(Date.now() - 3600_000).toISOString());

    const proxyUrl = `${SUPABASE_URL}/functions/v1/stream-proxy?t=${encodeURIComponent(token)}`;
    return new Response(JSON.stringify({ url: proxyUrl, expiresAt: expiresAt.toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stream-token error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});