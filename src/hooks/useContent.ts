import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

const posterMap: Record<string, string> = {
  "Void Horizon": "/src/assets/poster-void-horizon.jpg",
  "Ethereal Bloom": "/src/assets/poster-ethereal-bloom.jpg",
  "Scarlet Night": "/src/assets/poster-scarlet-night.jpg",
  "Cyber Pulse": "/src/assets/poster-cyber-pulse.jpg",
  "Frost Heart": "/src/assets/poster-frost-heart.jpg",
  "Storm Soul": "/src/assets/poster-storm-soul.jpg",
  "Whisper of Zen": "/src/assets/poster-whisper-zen.jpg",
  "Hyper Rails": "/src/assets/poster-hyper-rails.jpg",
  "Skybound Realm": "/src/assets/poster-skybound-realm.jpg",
  "Silent Peak": "/src/assets/poster-silent-peak.jpg",
  "Dream Weaver": "/src/assets/poster-dream-weaver.jpg",
  "Neon Drifters": "/src/assets/poster-neon-drifters.jpg",
};

const bannerMap: Record<string, string> = {
  "Void Horizon": "/src/assets/hero-chrono-pulse.jpg",
  "Ethereal Bloom": "/src/assets/poster-ethereal-bloom.jpg",
  "Scarlet Night": "/src/assets/poster-scarlet-night.jpg",
  "Cyber Pulse": "/src/assets/poster-cyber-pulse.jpg",
  "Frost Heart": "/src/assets/poster-frost-heart.jpg",
  "Storm Soul": "/src/assets/poster-storm-soul.jpg",
  "Whisper of Zen": "/src/assets/poster-whisper-zen.jpg",
  "Hyper Rails": "/src/assets/poster-hyper-rails.jpg",
  "Skybound Realm": "/src/assets/poster-skybound-realm.jpg",
  "Silent Peak": "/src/assets/poster-silent-peak.jpg",
  "Dream Weaver": "/src/assets/poster-dream-weaver.jpg",
  "Neon Drifters": "/src/assets/poster-neon-drifters.jpg",
};

function resolveImages(item: ContentItem): ContentItem {
  return {
    ...item,
    poster_url: posterMap[item.title] || item.poster_url,
    banner_url: bannerMap[item.title] || item.banner_url,
  };
}

async function fetchContentWithGenres(query: any): Promise<ContentItem[]> {
  const { data: content, error } = await query;
  if (error) throw error;
  if (!content || content.length === 0) return [];

  const ids = content.map((c: any) => c.id);
  const { data: cg } = await supabase
    .from("content_genres")
    .select("content_id, genre_id")
    .in("content_id", ids);
  const { data: genres } = await supabase.from("genres").select("id, name");

  const genreMap = new Map(genres?.map((g: any) => [g.id, g.name]) || []);
  const contentGenres = new Map<string, string[]>();
  cg?.forEach((link: any) => {
    const arr = contentGenres.get(link.content_id) || [];
    const name = genreMap.get(link.genre_id);
    if (name) arr.push(name);
    contentGenres.set(link.content_id, arr);
  });

  return content.map((c: any) => resolveImages({ ...c, genres: contentGenres.get(c.id) || [] }));
}

export function useContentList(filters?: {
  query?: string;
  genre?: string;
  year?: number;
  language?: string;
}) {
  return useQuery({
    queryKey: ["content", "list", filters],
    queryFn: async () => {
      let q = supabase.from("content").select("*").order("rating", { ascending: false });
      if (filters?.query) q = q.ilike("title", `%${filters.query}%`);
      if (filters?.year) q = q.eq("release_year", filters.year);
      if (filters?.language) q = q.eq("language", filters.language);

      let items = await fetchContentWithGenres(q);

      if (filters?.genre) {
        items = items.filter((i) => i.genres?.includes(filters.genre!));
      }
      return items;
    },
  });
}

export function useFeaturedContent() {
  return useQuery({
    queryKey: ["content", "featured"],
    queryFn: () =>
      fetchContentWithGenres(
        supabase.from("content").select("*").eq("featured", true).order("rating", { ascending: false })
      ),
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

export function useVideoServers(episodeId: string | undefined) {
  return useQuery({
    queryKey: ["video-servers", episodeId],
    queryFn: async () => {
      if (!episodeId) return [];
      const { data, error } = await supabase
        .from("video_servers")
        .select("*")
        .eq("episode_id", episodeId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!episodeId,
  });
}
