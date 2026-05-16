import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type SignedLive = { url: string; expiresAt: string };
const CACHE = new Map<string, SignedLive>();
const SAFETY_MS = 10_000;

function getCached(channelUrl: string): SignedLive | null {
  const hit = CACHE.get(channelUrl);
  if (!hit) return null;
  if (new Date(hit.expiresAt).getTime() - Date.now() <= SAFETY_MS) {
    CACHE.delete(channelUrl);
    return null;
  }
  return hit;
}

export function useLiveToken() {
  return useMutation({
    mutationFn: async ({ channelUrl, force = false }: { channelUrl: string; force?: boolean }) => {
      if (!force) {
        const cached = getCached(channelUrl);
        if (cached) return cached;
      }
      const { data, error } = await supabase.functions.invoke<SignedLive>("live-token", {
        body: { channelUrl },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No signed URL");
      CACHE.set(channelUrl, data);
      return data;
    },
  });
}