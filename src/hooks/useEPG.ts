import { useQuery } from "@tanstack/react-query";

export interface EPGProgram {
  title: string;
  start: Date;
  stop: Date;
}

// Try epg.pw lightweight JSON endpoint. Falls back to empty silently.
async function fetchEPG(channelId: string): Promise<EPGProgram[]> {
  try {
    const res = await fetch(
      `https://epg.pw/api/epg.json?channel_id=${encodeURIComponent(channelId)}&lang=en`,
      { cache: "force-cache" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const programs = Array.isArray(data?.programs) ? data.programs : Array.isArray(data) ? data : [];
    return programs
      .map((p: any) => ({
        title: p.title || p.name || "Program",
        start: new Date(p.start || p.start_time || p.startTime),
        stop: new Date(p.stop || p.end_time || p.stopTime || p.endTime),
      }))
      .filter((p: EPGProgram) => !isNaN(p.start.getTime()) && !isNaN(p.stop.getTime()));
  } catch {
    return [];
  }
}

export function useEPG(channelId: string | undefined) {
  return useQuery({
    queryKey: ["epg", channelId],
    queryFn: () => fetchEPG(channelId!),
    enabled: !!channelId,
    staleTime: 1000 * 60 * 30,
    retry: false,
  });
}

export function getNowNext(programs: EPGProgram[] | undefined) {
  if (!programs || programs.length === 0) return { now: null, next: null };
  const now = new Date();
  const sorted = [...programs].sort((a, b) => a.start.getTime() - b.start.getTime());
  const idx = sorted.findIndex((p) => p.start <= now && p.stop > now);
  return {
    now: idx >= 0 ? sorted[idx] : null,
    next: idx >= 0 && idx + 1 < sorted.length ? sorted[idx + 1] : null,
  };
}
