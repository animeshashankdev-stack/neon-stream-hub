import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type SignedLive = { url: string; expiresAt: string };
export class LivePremiumError extends Error {
  code = "PREMIUM_REQUIRED" as const;
  constructor() { super("Premium required for live TV"); }
}

const CACHE = new Map<string, SignedLive>();
const SAFETY_MS = 10_000;
const STORAGE_PREFIX = "senpai.livetok:";

function storageKey(channelUrl: string) {
  return STORAGE_PREFIX + channelUrl;
}

function readStorage(channelUrl: string): SignedLive | null {
  try {
    const raw = localStorage.getItem(storageKey(channelUrl));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SignedLive;
    if (!parsed?.url || !parsed?.expiresAt) return null;
    return parsed;
  } catch { return null; }
}

function writeStorage(channelUrl: string, signed: SignedLive) {
  try { localStorage.setItem(storageKey(channelUrl), JSON.stringify(signed)); } catch { /* ignore */ }
}

function getCached(channelUrl: string): SignedLive | null {
  let hit = CACHE.get(channelUrl);
  if (!hit) {
    const fromStore = readStorage(channelUrl);
    if (fromStore) {
      CACHE.set(channelUrl, fromStore);
      hit = fromStore;
    }
  }
  if (!hit) return null;
  if (new Date(hit.expiresAt).getTime() - Date.now() <= SAFETY_MS) {
    CACHE.delete(channelUrl);
    try { localStorage.removeItem(storageKey(channelUrl)); } catch { /* ignore */ }
    return null;
  }
  return hit;
}

interface FunctionsErrorContext {
  status?: number;
}

export function useLiveToken() {
  return useMutation({
    mutationFn: async ({
      channelUrl,
      force = false,
    }: {
      channelUrl: string;
      force?: boolean;
    }) => {
      if (!force) {
        const cached = getCached(channelUrl);
        if (cached) return cached;
      }
      const { data, error } = await supabase.functions.invoke<SignedLive>(
        "live-token",
        {
          body: { channelUrl },
        }
      );
      if (error) {
        // supabase-js wraps non-2xx as FunctionsHttpError; sniff for 403
        const ctx = (error as FunctionsErrorContext & { context?: FunctionsErrorContext })
          .context;
        const status =
          ctx?.status ??
          (error as FunctionsErrorContext & { status?: number }).status;
        if (status === 403) throw new LivePremiumError();
        throw error;
      }
      if (!data?.url) throw new Error("No signed URL");
      CACHE.set(channelUrl, data);
      writeStorage(channelUrl, data);
      return data;
    },
  });
}