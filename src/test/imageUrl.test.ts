import { describe, it, expect } from "vitest";
import { cleanImageUrl, resolveImageSources, PLACEHOLDER_POSTER } from "@/lib/imageUrl";

describe("cleanImageUrl", () => {
  it("returns null for null/undefined/empty", () => {
    expect(cleanImageUrl(null)).toBeNull();
    expect(cleanImageUrl(undefined)).toBeNull();
    expect(cleanImageUrl("")).toBeNull();
    expect(cleanImageUrl("   ")).toBeNull();
  });

  it("rejects non-http schemes", () => {
    expect(cleanImageUrl("javascript:alert(1)")).toBeNull();
    expect(cleanImageUrl("data:image/png;base64,AAA")).toBeNull();
    expect(cleanImageUrl("/local/path.jpg")).toBeNull();
  });

  it("keeps valid http(s) Supabase storage urls", () => {
    const url = "https://abc.supabase.co/storage/v1/object/public/posters/x.jpg";
    expect(cleanImageUrl(url)).toBe(url);
    expect(cleanImageUrl("http://cdn.example.com/poster.webp")).toBe("http://cdn.example.com/poster.webp");
  });

  it("filters known logo placeholders only", () => {
    expect(cleanImageUrl("https://x.com/AnimeSaltLong.png")).toBeNull();
    expect(cleanImageUrl("https://x.com/crunchyroll-193x193.png")).toBeNull();
    expect(cleanImageUrl("https://x.com/legit-poster.jpg")).toBe("https://x.com/legit-poster.jpg");
  });

  it("does not treat empty pattern strings as a match (regression)", () => {
    // If LOGO_PATTERNS ever contained "", every URL would be filtered.
    const url = "https://example.com/a.jpg";
    expect(cleanImageUrl(url)).toBe(url);
  });
});

describe("resolveImageSources", () => {
  it("falls back banner -> poster -> placeholder", () => {
    const r = resolveImageSources({ poster_url: "https://x.com/p.jpg", banner_url: null, thumbnail_url: null });
    expect(r.poster_url).toBe("https://x.com/p.jpg");
    expect(r.banner_url).toBe("https://x.com/p.jpg");
    expect(r.thumbnail_url).toBe("https://x.com/p.jpg");
  });

  it("uses placeholder when nothing valid", () => {
    const r = resolveImageSources({ poster_url: "", banner_url: null, thumbnail_url: "AnimeSaltLong" });
    expect(r.poster_url).toBe(PLACEHOLDER_POSTER);
    expect(r.banner_url).toBe(PLACEHOLDER_POSTER);
    expect(r.thumbnail_url).toBe(PLACEHOLDER_POSTER);
  });

  it("keeps independent thumbnail when provided", () => {
    const r = resolveImageSources({
      poster_url: "https://x.com/p.jpg",
      banner_url: "https://x.com/b.jpg",
      thumbnail_url: "https://x.com/t.jpg",
    });
    expect(r.poster_url).toBe("https://x.com/p.jpg");
    expect(r.banner_url).toBe("https://x.com/b.jpg");
    expect(r.thumbnail_url).toBe("https://x.com/t.jpg");
  });
});