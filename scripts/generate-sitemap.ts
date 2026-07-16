import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://ani.shashanksv.com";
interface Entry { path: string; changefreq?: string; priority?: string }

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://zoduthqkxhphvlldxyjr.supabase.co";
const ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

async function fetchContentIds(): Promise<string[]> {
  if (!ANON) return [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/content?select=id`, {
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
    });
    if (!r.ok) return [];
    const rows = await r.json();
    return rows.map((x: any) => x.id);
  } catch { return []; }
}

const staticEntries: Entry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/search", changefreq: "daily", priority: "0.9" },
  { path: "/genres", changefreq: "weekly", priority: "0.8" },
  { path: "/live", changefreq: "hourly", priority: "0.7" },
  { path: "/manga", changefreq: "daily", priority: "0.8" },
  { path: "/auth", changefreq: "monthly", priority: "0.3" },
];

(async () => {
  const ids = await fetchContentIds();
  const entries: Entry[] = [
    ...staticEntries,
    ...ids.map((id) => ({ path: `/content/${id}`, changefreq: "weekly", priority: "0.7" })),
  ];
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries.map((e) => [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean).join("\n")),
    `</urlset>`,
  ].join("\n");
  mkdirSync(resolve("public"), { recursive: true });
  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(`sitemap.xml written (${entries.length} entries)`);
})();
