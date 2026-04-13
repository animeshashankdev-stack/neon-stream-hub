import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ContentItem } from "./useContent";

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

export function useWatchlist() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["watchlist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("watchlist")
        .select("id, content_id, created_at, content(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((w: any) => ({
        watchlistId: w.id,
        ...w.content,
        poster_url: posterMap[w.content?.title] || w.content?.poster_url,
      }));
    },
    enabled: !!user,
  });
}

export function useIsInWatchlist(contentId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["watchlist", "check", user?.id, contentId],
    queryFn: async () => {
      if (!user || !contentId) return false;
      const { data } = await supabase
        .from("watchlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("content_id", contentId)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user && !!contentId,
  });
}

export function useToggleWatchlist() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data: existing } = await supabase
        .from("watchlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("content_id", contentId)
        .maybeSingle();

      if (existing) {
        await supabase.from("watchlist").delete().eq("id", existing.id);
        return { added: false };
      } else {
        await supabase.from("watchlist").insert({ user_id: user.id, content_id: contentId });
        return { added: true };
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}
