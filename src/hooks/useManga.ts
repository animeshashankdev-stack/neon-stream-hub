import { useQuery } from "@tanstack/react-query";

const SUPABASE_URL = "https://zoduthqkxhphvlldxyjr.supabase.co";
const PROXY = `${SUPABASE_URL}/functions/v1/manga-proxy`;

const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZHV0aHFreGhwaHZsbGR4eWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwODU0ODIsImV4cCI6MjA5MTY2MTQ4Mn0.R3wnKBwOt1WfTJVfFr3sPWydUFtE9cp2PohjEy4R6H4";

async function mdFetch(path: string): Promise<any> {
  const r = await fetch(`${PROXY}/mangadex${path}`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  });
  if (!r.ok) throw new Error(`MangaDex ${r.status}`);
  return r.json();
}

export interface MangaCard {
  id: string;
  title: string;
  cover: string | null;
  status: string;
  year: number | null;
  description: string;
  tags: string[];
}

function pickCoverFile(manga: any): string | null {
  const rel = manga?.relationships?.find((r: any) => r.type === "cover_art");
  return rel?.attributes?.fileName ?? null;
}

function coverUrl(mangaId: string, fileName: string | null): string | null {
  if (!fileName) return null;
  return `${PROXY}/cover/${mangaId}/${fileName}.512.jpg`;
}

function normalize(manga: any): MangaCard {
  const t = manga.attributes?.title || {};
  const title = t.en || t["ja-ro"] || t.ja || Object.values(t)[0] as string || "Untitled";
  const desc = manga.attributes?.description?.en || Object.values(manga.attributes?.description || {})[0] as string || "";
  const file = pickCoverFile(manga);
  return {
    id: manga.id,
    title,
    cover: coverUrl(manga.id, file),
    status: manga.attributes?.status || "unknown",
    year: manga.attributes?.year ?? null,
    description: desc,
    tags: (manga.attributes?.tags || []).map((t: any) => t.attributes?.name?.en).filter(Boolean),
  };
}

export function usePopularManga() {
  return useQuery({
    queryKey: ["manga", "popular"],
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const j = await mdFetch(
        "/manga?limit=24&order[followedCount]=desc&includes[]=cover_art&availableTranslatedLanguage[]=en&contentRating[]=safe&contentRating[]=suggestive",
      );
      return (j.data || []).map(normalize) as MangaCard[];
    },
  });
}

export function useSearchManga(q: string) {
  return useQuery({
    queryKey: ["manga", "search", q],
    enabled: q.trim().length > 1,
    queryFn: async () => {
      const j = await mdFetch(
        `/manga?limit=24&title=${encodeURIComponent(q)}&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`,
      );
      return (j.data || []).map(normalize) as MangaCard[];
    },
  });
}

export function useMangaDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["manga", "detail", id],
    enabled: !!id,
    queryFn: async () => {
      const j = await mdFetch(`/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`);
      return normalize(j.data);
    },
  });
}

export interface MangaChapter {
  id: string;
  chapter: string;
  volume: string | null;
  title: string;
  language: string;
  publishedAt: string;
}

export function useMangaChapters(id: string | undefined) {
  return useQuery({
    queryKey: ["manga", "chapters", id],
    enabled: !!id,
    queryFn: async () => {
      const all: MangaChapter[] = [];
      let offset = 0;
      for (let page = 0; page < 5; page++) {
        const j = await mdFetch(
          `/manga/${id}/feed?limit=100&offset=${offset}&translatedLanguage[]=en&order[chapter]=asc&includes[]=scanlation_group`,
        );
        for (const c of j.data || []) {
          all.push({
            id: c.id,
            chapter: c.attributes?.chapter ?? "?",
            volume: c.attributes?.volume ?? null,
            title: c.attributes?.title ?? `Chapter ${c.attributes?.chapter ?? "?"}`,
            language: c.attributes?.translatedLanguage ?? "en",
            publishedAt: c.attributes?.publishAt ?? "",
          });
        }
        if ((j.data?.length ?? 0) < 100) break;
        offset += 100;
      }
      return all;
    },
  });
}

export function useChapterPages(chapterId: string | undefined) {
  return useQuery({
    queryKey: ["manga", "pages", chapterId],
    enabled: !!chapterId,
    queryFn: async () => {
      const j = await mdFetch(`/at-home/server/${chapterId}`);
      const baseUrl = j.baseUrl as string;
      const hash = j.chapter?.hash as string;
      const files = (j.chapter?.data || []) as string[];
      return files.map((f) => `${PROXY}/page?u=${encodeURIComponent(`${baseUrl}/data/${hash}/${f}`)}`);
    },
  });
}