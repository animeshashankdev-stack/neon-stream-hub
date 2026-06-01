import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ChapterKind = "intro" | "outro" | "recap" | "chapter";

export interface EpisodeChapter {
  id: string;
  episode_id: string;
  kind: ChapterKind;
  label: string | null;
  start_seconds: number;
  end_seconds: number | null;
}

export function useEpisodeChapters(episodeId: string | undefined) {
  return useQuery({
    queryKey: ["episode-chapters", episodeId],
    enabled: !!episodeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episode_chapters" as never)
        .select("*")
        .eq("episode_id", episodeId!)
        .order("start_seconds");
      if (error) return [] as EpisodeChapter[];
      return (data || []) as unknown as EpisodeChapter[];
    },
  });
}