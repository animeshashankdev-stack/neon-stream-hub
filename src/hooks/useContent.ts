import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveImageSources } from "@/lib/imageUrl";

export interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  type: "movie" | "series";
  release_year: number | null;
  rating: number | null;
  poster_url: string | null;
  banner_url: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  language: string | null;
  status: "ongoing" | "completed" | "upcoming" | null;
  featured: boolean | null;
  genres?: string[];
}

export interface Episode {
  id: string;
  content_id: string;
  season_number: number;
  episode_number: number;
  title: string | null;
  description: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
}

const resolveImages = (item: ContentItem): ContentItem => resolveImageSources(item);

interface GenreLink {
  content_id: string;
  genre_id: string;
}

interface GenreRow {
  id: string;
  name: string;
}

interface DatabaseContent {
  id: string;
  title: string;
  description: string | null;
  type: "movie" | "series";
  release_year: number | null;
  rating: number | null;
  poster_url: string | null;
  banner_url: string | null;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  language: string | null;
  status: "ongoing" | "completed" | "upcoming" | null;
  featured: boolean | null;
}

async function fetchContentWithGenres(
  query: any
): Promise<ContentItem[]> {
  const { data: content, error } = await query;
  if (error) throw error;
  if (!content || content.length === 0) return [];

  const ids = (content as DatabaseContent[]).map((c) => c.id);
  const { data: cg } = await supabase
    .from("content_genres")
    .select("content_id, genre_id");
  const { data: genres } = await supabase.from("genres").select("id, name");

  const genreMap = new Map(
    (genres as GenreRow[] | null)?.map((g) => [g.id, g.name]) || []
  );
  const contentGenres = new Map<string, string[]>();
  (cg as GenreLink[] | null)?.forEach((link) => {
    const arr = contentGenres.get(link.content_id) || [];
    const name = genreMap.get(link.genre_id);
    if (name) arr.push(name);
    contentGenres.set(link.content_id, arr);
  });

  return (content as DatabaseContent[]).map((c) =>
    resolveImages({ ...c, genres: contentGenres.get(c.id) || [] })
  );
}

export function useContentList(filters?: {
  query?: string;
  genre?: string;
  year?: number;
  language?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: ["content", "list", filters],
    queryFn: async () => {
      let q = supabase.from("content").select("*").order("rating", { ascending: false });
      if (filters?.query) q = q.ilike("title", `%${filters.query}%`);
      if (filters?.year) q = q.eq("release_year", filters.year);
      if (filters?.language) q = q.eq("language", filters.language);
      if (filters?.type && (filters.type === "movie" || filters.type === "series")) {
        q = q.eq("type", filters.type);
      }

      let items = await fetchContentWithGenres(q);

      if (filters?.genre) {
        items = items.filter((i) => i.genres?.some((g) => g.toLowerCase() === filters.genre!.toLowerCase()));
      }
      return items;
    },
  });
}

export function useFeaturedContent() {
  return useQuery({
    queryKey: ["content", "featured"],
    queryFn: async () => {
      // Try featured first
      let items = await fetchContentWithGenres(
        supabase.from("content").select("*").eq("featured", true).order("rating", { ascending: false })
      );
      // Fallback to top-rated if none featured
      if (items.length === 0) {
        items = await fetchContentWithGenres(
          supabase.from("content").select("*").order("rating", { ascending: false }).limit(5)
        );
      }
      return items;
    },
  });
}

export function useContentDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["content", "detail", id],
    queryFn: async () => {
      if (!id) return null;
      const items = await fetchContentWithGenres(supabase.from("content").select("*").eq("id", id));
      return items[0] || null;
    },
    enabled: !!id,
  });
}

export function useEpisodes(contentId: string | undefined) {
  return useQuery({
    queryKey: ["episodes", contentId],
    queryFn: async () => {
      if (!contentId) return [];
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("content_id", contentId)
        .order("season_number")
        .order("episode_number");
      if (error) throw error;
      return (data || []) as Episode[];
    },
    enabled: !!contentId,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: async () => {
      const { data, error } = await supabase.from("genres").select("*").order("name");
      if (error) throw error;
      return data || [];
    },
  });
}

export function useRecommendations(contentId: string | undefined) {
  return useQuery({
    queryKey: ["recommendations", contentId],
    queryFn: () =>
      fetchContentWithGenres(
        supabase.from("content").select("*").neq("id", contentId || "").order("rating", { ascending: false }).limit(6)
      ),
    enabled: !!contentId,
  });
}

interface ServerData {
  id: string;
  episode_id: string;
  server_name: string;
  quality: string;
  language: string | null;
  embed_url: string | null;
  stream_url?: string;
}

export function useVideoServers(episodeId: string | undefined) {
  return useQuery({
    queryKey: ["video-servers", episodeId],
    queryFn: async () => {
      if (!episodeId) return [];
      const { data, error } = await supabase.rpc("get_episode_servers", {
        _episode_id: episodeId,
      });
      if (error) throw error;
      // For embed players, embed_url is included; for direct video, URL is hidden
      // and the client must request a signed URL via the stream-token edge function.
      return ((data || []) as ServerData[]).map((s) => ({
        ...s,
        stream_url: s.embed_url || "",
      }));
    },
    enabled: !!episodeId,
  });
}
