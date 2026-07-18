// Local SEO validator. Reads the built dist/ folder and asserts every HTML
// document has canonical, og:*, twitter:*, and at least one JSON-LD block.
// Run after `vite build` (e.g. `tsx scripts/validate-seo.ts`).
import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const DIST = "dist";

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".html")) out.push(p);
  }
  return out;
}

interface Check { name: string; re: RegExp }
const CHECKS: Check[] = [
  { name: "<title>", re: /<title>[^<]{3,}<\/title>/i },
  { name: "meta description", re: /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{10,}/i },
  { name: "canonical", re: /<link[^>]+rel=["']canonical["'][^>]+href=["']https?:\/\//i },
  { name: "og:title", re: /<meta[^>]+property=["']og:title["']/i },
  { name: "og:description", re: /<meta[^>]+property=["']og:description["']/i },
  { name: "og:image", re: /<meta[^>]+property=["']og:image["'][^>]+content=["']https?:\/\//i },
  { name: "og:url", re: /<meta[^>]+property=["']og:url["']/i },
  { name: "twitter:card", re: /<meta[^>]+name=["']twitter:card["']/i },
  { name: "twitter:image", re: /<meta[^>]+name=["']twitter:image["'][^>]+content=["']https?:\/\//i },
  { name: "JSON-LD", re: /<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]+?<\/script>/i },
];

try {
  statSync(DIST);
} catch {
  console.error(`✗ dist/ not found — run \`vite build\` first.`);
  process.exit(1);
}

const files = walk(DIST);
let failed = 0;
for (const f of files) {
  const html = readFileSync(f, "utf8");
  const missing = CHECKS.filter((c) => !c.re.test(html)).map((c) => c.name);
  const rel = relative(process.cwd(), f);
  if (missing.length) {
    failed++;
    console.log(`✗ ${rel}\n    missing: ${missing.join(", ")}`);
  } else {
    console.log(`✓ ${rel}`);
  }
}

console.log(`\n${files.length - failed}/${files.length} files passed all SEO checks.`);
process.exit(failed > 0 ? 1 : 0);