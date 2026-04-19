import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const KEY = "senpai.iptv.favs";

function loadLocalFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveLocalFavorites(favs: Set<string>) {
  localStorage.setItem(KEY, JSON.stringify([...favs]));
}

export function useChannelFavorites() {
  const { user } = useAuth();
  const [favs, setFavs] = useState<Set<string>>(() => loadLocalFavorites());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setFavs(loadLocalFavorites());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!user) return;

    const syncFavorites = async () => {
      const localFavorites = loadLocalFavorites();
      const { data, error } = await supabase
        .from<{ channel_id: string }>("channel_favorites")
        .select("channel_id")
        .eq("user_id", user.id);

      if (error) {
        console.error("Failed to load channel favorites:", error);
        return;
      }

      const remoteFavorites = new Set<string>((data || []).map((row) => row.channel_id));
      const mergedFavorites = new Set<string>([...remoteFavorites, ...localFavorites]);
      saveLocalFavorites(mergedFavorites);
      setFavs(mergedFavorites);

      const toInsert = [...mergedFavorites].filter((id) => !remoteFavorites.has(id));
      const toDelete = [...remoteFavorites].filter((id) => !mergedFavorites.has(id));

      if (toInsert.length > 0) {
        await supabase.from("channel_favorites").upsert(
          toInsert.map((channel_id) => ({ user_id: user.id, channel_id })),
        );
      }

      if (toDelete.length > 0) {
        await supabase.from("channel_favorites").delete().eq("user_id", user.id).in("channel_id", toDelete);
      }
    };

    syncFavorites();
  }, [user]);

  const persist = useCallback((next: Set<string>) => {
    const nextSet = new Set(next);
    saveLocalFavorites(nextSet);
    setFavs(nextSet);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setFavs((current) => {
        const next = new Set(current);
        const isFavorite = next.has(id);

        if (isFavorite) next.delete(id);
        else next.add(id);

        saveLocalFavorites(next);

        if (user) {
          (async () => {
            if (isFavorite) {
              await supabase.from("channel_favorites").delete().eq("user_id", user.id).eq("channel_id", id);
            } else {
              await supabase.from("channel_favorites").upsert({ user_id: user.id, channel_id: id });
            }
          })().catch((error) => console.error("Failed to sync channel favorite:", error));
        }

        return next;
      });
    },
    [user],
  );

  const has = useCallback((id: string) => favs.has(id), [favs]);

  return { favs, toggle, has };
}

const BROKEN_KEY = "senpai.iptv.broken";

export function loadBrokenChannels(): Set<string> {
  try {
    const raw = localStorage.getItem(BROKEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function markChannelBroken(id: string) {
  const s = loadBrokenChannels();
  s.add(id);
  localStorage.setItem(BROKEN_KEY, JSON.stringify([...s]));
  window.dispatchEvent(new StorageEvent("storage", { key: BROKEN_KEY }));
}

export function useBrokenChannels() {
  const [broken, setBroken] = useState<Set<string>>(() => loadBrokenChannels());
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === BROKEN_KEY) setBroken(loadBrokenChannels());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return broken;
}
