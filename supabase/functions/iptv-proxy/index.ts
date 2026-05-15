const SECRET = Deno.env.get("STREAM_SIGNING_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Expose-Headers": "content-length, content-range, accept-ranges",
};

async function hmac(input: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function verify(token: string): Promise<{ url: string } | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [b64, sig] = parts;
  let payload: string;
  try {
    payload = atob(b64 + "===".slice((b64.length + 3) % 4));
  } catch { return null; }
  const expected = await hmac(payload);
  if (!timingSafeEqual(sig, expected)) return null;
  const firstDot = payload.indexOf(".");
  const secondDot = payload.indexOf(".", firstDot + 1);
  const thirdDot = payload.indexOf(".", secondDot + 1);
  if (firstDot < 0 || secondDot < 0 || thirdDot < 0) return null;
  const expStr = payload.slice(firstDot + 1, secondDot);
  const url = payload.slice(thirdDot + 1);
  if (Date.now() > parseInt(expStr, 10)) return null;
  return { url };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  if (!token) return new Response("Missing token", { status: 400, headers: corsHeaders });

  const verified = await verify(token);
  if (!verified) return new Response("Invalid or expired token", { status: 403, headers: corsHeaders });

  const seg = url.searchParams.get("seg");
  let target = verified.url;
  if (seg) {
    try { target = new URL(seg, verified.url).toString(); }
    catch { return new Response("Bad segment", { status: 400, headers: corsHeaders }); }
  }

  const upstreamHeaders: Record<string, string> = { "User-Agent": "Mozilla/5.0 SenpaiTV/1.0" };
  const range = req.headers.get("range");
  if (range) upstreamHeaders["Range"] = range;

  const upstream = await fetch(target, { headers: upstreamHeaders });
  const contentType = upstream.headers.get("content-type") || "";

  if (target.includes(".m3u8") || contentType.includes("mpegurl")) {
    const text = await upstream.text();
    const rewritten = text.split("\n").map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        return line.replace(/URI="([^"]+)"/g, (_m, u) =>
          `URI="${SUPABASE_URL}/functions/v1/iptv-proxy?t=${encodeURIComponent(token)}&seg=${encodeURIComponent(u)}"`
        );
      }
      return `${SUPABASE_URL}/functions/v1/iptv-proxy?t=${encodeURIComponent(token)}&seg=${encodeURIComponent(trimmed)}`;
    }).join("\n");
    return new Response(rewritten, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/vnd.apple.mpegurl", "Cache-Control": "no-store" },
    });
  }

  const headers = new Headers(corsHeaders);
  headers.set("Content-Type", contentType || "application/octet-stream");
  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  const cr = upstream.headers.get("content-range");
  if (cr) headers.set("Content-Range", cr);
  headers.set("Cache-Control", "no-store");
  return new Response(upstream.body, { status: upstream.status, headers });
});