import { useQuery } from "@tanstack/react-query";

export interface IPTVChannel {
  id: string;
  name: string;
  alt_names?: string[];
  network?: string | null;
  country: string;
  categories: string[];
  is_nsfw: boolean;
  closed?: string | null;
  replaced_by?: string | null;
  website?: string | null;
}
export interface IPTVStream {
  channel: string | null;
  feed?: string | null;
  title: string;
  url: string;
  quality?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
}
export interface IPTVLogo {
  channel: string;
  feed?: string | null;
  url: string;
  width: number;
  height: number;
}
export interface IPTVCountry {
  name: string;
  code: string;
  flag: string;
}

export interface ResolvedChannel {
  id: string;
  name: string;
  country: string;
  flag: string;
  countryName: string;
  categories: string[];
  logo?: string;
  stream: IPTVStream;
}

const API = "https://iptv-org.github.io/api";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API}/${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

export function useIPTV() {
  return useQuery({
    queryKey: ["iptv-all"],
    staleTime: 1000 * 60 * 60, // 1h
    queryFn: async () => {
      const [channels, streams, logos, countries] = await Promise.all([
        fetchJSON<IPTVChannel[]>("channels.json"),
        fetchJSON<IPTVStream[]>("streams.json"),
        fetchJSON<IPTVLogo[]>("logos.json"),
        fetchJSON<IPTVCountry[]>("countries.json"),
      ]);

      const countryMap = new Map(countries.map((c) => [c.code, c]));
      const logoByChannel = new Map<string, string>();
      for (const l of logos) {
        if (!logoByChannel.has(l.channel)) logoByChannel.set(l.channel, l.url);
      }
      const channelMap = new Map(channels.map((c) => [c.id, c]));

      const seen = new Set<string>();
      const resolved: ResolvedChannel[] = [];
      for (const s of streams) {
        if (!s.channel || !s.url || !s.url.includes(".m3u8")) continue;
        if (seen.has(s.channel)) continue;
        const ch = channelMap.get(s.channel);
        if (!ch || ch.is_nsfw || ch.closed) continue;
        seen.add(s.channel);
        const country = countryMap.get(ch.country);
        resolved.push({
          id: ch.id,
          name: ch.name,
          country: ch.country,
          flag: country?.flag || "🌐",
          countryName: country?.name || ch.country,
          categories: ch.categories || [],
          logo: logoByChannel.get(ch.id),
          stream: s,
        });
      }

      const allCountries = [...new Set(resolved.map((r) => r.country))]
        .map((code) => countryMap.get(code))
        .filter(Boolean) as IPTVCountry[];
      const allCategories = [...new Set(resolved.flatMap((r) => r.categories))].sort();

      return {
        channels: resolved.sort((a, b) => a.name.localeCompare(b.name)),
        countries: allCountries.sort((a, b) => a.name.localeCompare(b.name)),
        categories: allCategories,
      };
    },
  });
}
