import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useMangaProgress(mangaId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["manga-progress", user?.id, mangaId],
    enabled: !!user?.id && !!mangaId,
    queryFn: async () => {
      const { data } = await supabase
        .from("manga_progress")
        .select("*")
        .eq("user_id", user!.id)
        .eq("manga_id", mangaId!)
        .maybeSingle();
      return data;
    },
  });
}

export function useSaveMangaProgress() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return async (args: { mangaId: string; chapterId: string; page: number; totalPages?: number }) => {
    if (!user?.id) return;
    await supabase.from("manga_progress").upsert(
      {
        user_id: user.id,
        manga_id: args.mangaId,
        chapter_id: args.chapterId,
        page: args.page,
        total_pages: args.totalPages ?? null,
      },
      { onConflict: "user_id,manga_id" },
    );
    qc.invalidateQueries({ queryKey: ["manga-progress", user.id, args.mangaId] });
    // Bump read_history daily counter
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("read_history").upsert(
      { user_id: user.id, read_date: today, pages_read: 1 },
      { onConflict: "user_id,read_date", ignoreDuplicates: false },
    );
  };
}