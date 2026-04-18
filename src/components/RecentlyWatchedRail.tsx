import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Row {
  id: string;
  episode_id: string;
  progress_seconds: number;
  total_seconds: number;
  last_watched_at: string;
  episodes: {
    id: string;
    season_number: number;
    episode_number: number;
    title: string | null;
    thumbnail_url: string | null;
    content_id: string;
    content: {
      id: string;
      title: string;
      poster_url: string | null;
      banner_url: string | null;
    } | null;
  } | null;
}

const RecentlyWatchedRail = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("watch_history")
        .select("id, episode_id, progress_seconds, total_seconds, last_watched_at, episodes!inner(id, season_number, episode_number, title, thumbnail_url, content_id, content:content_id(id, title, poster_url, banner_url))")
        .eq("user_id", user.id)
        .order("last_watched_at", { ascending: false })
        .limit(10);
      if (!cancelled) {
        setRows((data as any) || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!user || (!loading && rows.length === 0)) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto mt-8 sm:mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Recently <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-300">Watched</span>
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/50 text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : (
        <div ref={railRef} className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {rows.map((r) => {
            const ep = r.episodes;
            if (!ep || !ep.content) return null;
            const pct = r.total_seconds > 0 ? Math.min(100, (r.progress_seconds / r.total_seconds) * 100) : 0;
            const thumb = ep.thumbnail_url || ep.content.banner_url || ep.content.poster_url || "";
            return (
              <Link
                key={r.id}
                to={`/watch/${ep.content_id}/${ep.id}`}
                className="group shrink-0 w-[260px] sm:w-[300px] snap-start bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-400/40 rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
              >
                <div className="relative aspect-video bg-black/40">
                  {thumb && (
                    <img src={thumb} alt={ep.content.title} className="w-full h-full object-cover" loading="lazy" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-teal-400/90 flex items-center justify-center text-black">
                      <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div className="h-full bg-gradient-to-r from-teal-300 to-cyan-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-teal-300 font-bold uppercase tracking-widest mb-1">
                    S{ep.season_number} · E{ep.episode_number} · {Math.round(pct)}%
                  </p>
                  <h3 className="text-sm font-bold text-white truncate">{ep.content.title}</h3>
                  <p className="text-xs text-white/50 truncate">{ep.title || `Episode ${ep.episode_number}`}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default RecentlyWatchedRail;
