import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const SECRET = Deno.env.get("STREAM_SIGNING_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Expose-Headers": "content-length, content-range, accept-ranges",
};

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

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function verifyToken(token: string): Promise<{ userId: string; episodeId: string; serverId: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [b64, sig] = parts;
  let payload: string;
  try {
    payload = atob(b64 + "===".slice((b64.length + 3) % 4));
  } catch {
    return null;
  }
  const expectedSig = await hmac(payload);
  if (!timingSafeEqual(sig, expectedSig)) return null;
  const [userId, episodeId, serverId, expStr] = payload.split(".");
  if (!userId || !episodeId || !serverId || !expStr) return null;
  if (Date.now() > parseInt(expStr, 10)) return null;
  return { userId, episodeId, serverId };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  if (!token) {
    return new Response("Missing token", { status: 400, headers: corsHeaders });
  }

  const verified = await verifyToken(token);
  if (!verified) {
    return new Response("Invalid or expired token", { status: 403, headers: corsHeaders });
  }

  // Optional: check token hasn't been revoked
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const tokenHash = await sha256(token);
  const { data: row } = await admin
    .from("stream_tokens")
    .select("id, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (!row || new Date(row.expires_at).getTime() < Date.now()) {
    return new Response("Token revoked", { status: 403, headers: corsHeaders });
  }

  // Fetch the real stream URL — never exposed to client
  const { data: server } = await admin
    .from("video_servers")
    .select("stream_url")
    .eq("id", verified.serverId)
    .maybeSingle();
  if (!server?.stream_url) {
    return new Response("Stream not found", { status: 404, headers: corsHeaders });
  }

  // Resolve relative HLS segment requests
  const segPath = url.searchParams.get("seg");
  let target = server.stream_url;
  if (segPath) {
    try {
      target = new URL(segPath, server.stream_url).toString();
    } catch {
      return new Response("Bad segment", { status: 400, headers: corsHeaders });
    }
  }

  const upstreamHeaders: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 SenpaiTV/1.0",
  };
  const range = req.headers.get("range");
  if (range) upstreamHeaders["Range"] = range;

  const upstream = await fetch(target, { headers: upstreamHeaders });
  const contentType = upstream.headers.get("content-type") || "";

  // Rewrite m3u8 manifest URLs to route through the proxy
  if (target.includes(".m3u8") || contentType.includes("mpegurl")) {
    const text = await upstream.text();
    const rewritten = text.split("\n").map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        // Rewrite URI="..." in tags too
        return line.replace(/URI="([^"]+)"/g, (_m, u) => {
          return `URI="${SUPABASE_URL}/functions/v1/stream-proxy?t=${encodeURIComponent(token)}&seg=${encodeURIComponent(u)}"`;
        });
      }
      return `${SUPABASE_URL}/functions/v1/stream-proxy?t=${encodeURIComponent(token)}&seg=${encodeURIComponent(trimmed)}`;
    }).join("\n");

    return new Response(rewritten, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-store",
      },
    });
  }

  // Stream segments through
  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", contentType || "application/octet-stream");
  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  const cr = upstream.headers.get("content-range");
  if (cr) headers.set("Content-Range", cr);
  headers.set("Cache-Control", "no-store");

  return new Response(upstream.body, { status: upstream.status, headers });
});