import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const MANGADEX_BASE = "https://api.mangadex.org";
const JIKAN_BASE = "https://api.jikan.moe/v4";
const COVER_BASE = "https://uploads.mangadex.org/covers";

// Allowlist of upstream paths the proxy will forward to MangaDex
const ALLOWED_MANGA_PATHS = [
  /^\/manga(\/[a-f0-9-]+)?$/i,
  /^\/manga\/[a-f0-9-]+\/feed$/i,
  /^\/manga\/[a-f0-9-]+\/aggregate$/i,
  /^\/at-home\/server\/[a-f0-9-]+$/i,
  /^\/chapter(\/[a-f0-9-]+)?$/i,
  /^\/cover(\/[a-f0-9-]+)?$/i,
  /^\/statistics\/manga\/[a-f0-9-]+$/i,
  /^\/manga\/random$/i,
  /^\/manga\/tag$/i,
];

function isAllowed(pathname: string): boolean {
  return ALLOWED_MANGA_PATHS.some((rx) => rx.test(pathname));
}

// Simple in-memory rate limiter (per-IP)
const buckets = new Map<string, { count: number; ts: number }>();
const RATE_LIMIT = 60; // requests
const RATE_WINDOW = 60_000; // per minute

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now - b.ts > RATE_WINDOW) {
    buckets.set(ip, { count: 1, ts: now });
    return false;
  }
  b.count++;
  return b.count > RATE_LIMIT;
}

async function requireUser(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  // Reject the anon key — must be a real user JWT
  if (token === SUPABASE_ANON_KEY) return null;
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data, error } = await client.auth.getClaims(token);
    if (error || !data?.claims?.sub) return null;
    return data.claims.sub as string;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  if (rateLimited(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  // route shape: /manga-proxy/{provider}/{...path}
  const segments = url.pathname.split("/").filter(Boolean);
  // segments[0] === 'manga-proxy'
  const provider = segments[1];
  const subPath = "/" + segments.slice(2).join("/");

  try {
    // Auth required for everything except public covers (used in <img> tags)
    if (provider !== "cover") {
      const userId = await requireUser(req);
      if (!userId) {
        return new Response(JSON.stringify({ error: "Authentication required" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (provider === "mangadex") {
      if (!isAllowed(subPath)) {
        return new Response(JSON.stringify({ error: "Path not allowed" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const target = `${MANGADEX_BASE}${subPath}${url.search}`;
      const r = await fetch(target, {
        headers: { "User-Agent": "SenpaiTV/1.0 (mailto:contact@senpai.tv)" },
      });
      const body = await r.text();
      return new Response(body, {
        status: r.status,
        headers: { ...corsHeaders, "Content-Type": r.headers.get("content-type") || "application/json" },
      });
    }

    if (provider === "jikan") {
      // Forward to jikan, e.g. /anime/1
      const target = `${JIKAN_BASE}${subPath}${url.search}`;
      const r = await fetch(target);
      const body = await r.text();
      return new Response(body, {
        status: r.status,
        headers: { ...corsHeaders, "Content-Type": r.headers.get("content-type") || "application/json" },
      });
    }

    if (provider === "cover") {
      // /manga-proxy/cover/{mangaId}/{filename}
      const mangaId = segments[2];
      const filename = segments[3];
      if (!mangaId || !filename) {
        return new Response("Missing", { status: 400, headers: corsHeaders });
      }
      const r = await fetch(`${COVER_BASE}/${mangaId}/${filename}`, {
        headers: { "User-Agent": "SenpaiTV/1.0" },
      });
      const headers = new Headers(corsHeaders);
      headers.set("Content-Type", r.headers.get("content-type") || "image/jpeg");
      headers.set("Cache-Control", "public, max-age=86400");
      return new Response(r.body, { status: r.status, headers });
    }

    if (provider === "page") {
      // /manga-proxy/page?u=<encoded mangadex@home url>
      const u = url.searchParams.get("u");
      if (!u) return new Response("Missing", { status: 400, headers: corsHeaders });
      // Restrict to mangadex@home hosts
      const parsed = new URL(u);
      if (!parsed.hostname.endsWith(".mangadex.network") && !parsed.hostname.endsWith("mangadex.org")) {
        return new Response("Host not allowed", { status: 403, headers: corsHeaders });
      }
      const r = await fetch(u, { headers: { "User-Agent": "SenpaiTV/1.0" } });
      const headers = new Headers(corsHeaders);
      headers.set("Content-Type", r.headers.get("content-type") || "image/jpeg");
      headers.set("Cache-Control", "public, max-age=3600");
      return new Response(r.body, { status: r.status, headers });
    }

    return new Response(JSON.stringify({ error: "Unknown provider" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("manga-proxy error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});