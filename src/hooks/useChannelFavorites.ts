import { useCallback, useEffect, useState } from "react";

const KEY = "senpai.iptv.favs";

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function useChannelFavorites() {
  const [favs, setFavs] = useState<Set<string>>(() => load());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setFavs(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = (s: Set<string>) => {
    localStorage.setItem(KEY, JSON.stringify([...s]));
    setFavs(new Set(s));
  };

  const toggle = useCallback((id: string) => {
    const s = load();
    if (s.has(id)) s.delete(id);
    else s.add(id);
    persist(s);
  }, []);

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
