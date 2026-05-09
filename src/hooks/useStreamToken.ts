import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StreamTokenResponse {
  url: string;
  expiresAt: string;
}

export function useStreamToken() {
  return useMutation({
    mutationFn: async ({ episodeId, serverId }: { episodeId: string; serverId: string }) => {
      const { data, error } = await supabase.functions.invoke<StreamTokenResponse>("stream-token", {
        body: { episodeId, serverId },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No stream URL returned");
      return data;
    },
  });
}