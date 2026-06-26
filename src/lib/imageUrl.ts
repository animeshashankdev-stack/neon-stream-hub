// Image URL resolver — keeps Supabase-stored URLs intact and filters only
// known logo/placeholder artifacts. Exported separately so we can unit-test it.

export const PLACEHOLDER_POSTER =
  "https://i.pinimg.com/1200x/c2/df/68/c2df689d17ba78f758f39877cbd63f8c.jpg";

// Substrings that identify scraped logos we never want to render as art.
// MUST NOT contain empty strings — `"".includes("")` is always true and would
// nuke every URL.
export const LOGO_PATTERNS: readonly string[] = [
  "AnimeSaltLong",
  "crunchyroll-193x193",
];

export function cleanImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) return null;
  for (const p of LOGO_PATTERNS) {
    if (p && trimmed.includes(p)) return null;
  }
  return trimmed;
}

export interface ImageSources {
  poster_url?: string | null;
  banner_url?: string | null;
  thumbnail_url?: string | null;
}

export function resolveImageSources<T extends ImageSources>(item: T): T {
  const poster = cleanImageUrl(item.poster_url);
  const banner = cleanImageUrl(item.banner_url);
  const thumb = cleanImageUrl(item.thumbnail_url);
  return {
    ...item,
    poster_url: poster || PLACEHOLDER_POSTER,
    banner_url: banner || poster || PLACEHOLDER_POSTER,
    thumbnail_url: thumb || poster || PLACEHOLDER_POSTER,
  };
}