import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useLiveToken() {
  return useMutation({
    mutationFn: async ({ channelUrl }: { channelUrl: string }) => {
      const { data, error } = await supabase.functions.invoke<{ url: string; expiresAt: string }>("live-token", {
        body: { channelUrl },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No signed URL");
      return data;
    },
  });
}