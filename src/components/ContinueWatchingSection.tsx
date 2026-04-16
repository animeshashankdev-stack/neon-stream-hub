import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useAuth } from "@/contexts/AuthContext";

const ContinueWatchingSection = () => {
  const { user } = useAuth();
  const { data: history } = useWatchHistory();

  if (!user) return null;

  const continuing = (history || []).filter(
    (h: any) => !h.completed && h.progress_seconds > 0
  );

  if (continuing.length === 0) return null;

  return (
    <section className="py-8 px-6 sm:px-12 lg:px-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-teal-400 to-cyan-500 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
        <h2 className="text-2xl font-display font-black tracking-tight text-white">Continue Watching</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {continuing.slice(0, 6).map((item: any) => {
          const episode = item.episodes;
          const content = episode?.content;
          if (!content || !episode) return null;
          const pct = item.total_seconds > 0 ? (item.progress_seconds / item.total_seconds) * 100 : 0;
          const remaining = item.total_seconds > 0 ? Math.round((item.total_seconds - item.progress_seconds) / 60) : 0;

          return (
            <Link
              key={item.id}
              to={`/watch/${content.id}/${episode.id}`}
              className="group rounded-[20px] overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-teal-400/50 hover:shadow-[0_0_20px_rgba(45,212,191,0.15)] transition-all cursor-pointer"
            >
              <div className="h-[160px] bg-gradient-to-br from-violet-900 to-indigo-950 relative overflow-hidden">
                {content.thumbnail_url && (
                  <img src={content.thumbnail_url} alt={content.title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                )}
                <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold text-white border border-white/10">
                  S{episode.season_number} E{episode.episode_number}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all">
                    <Play className="w-5 h-5 text-white fill-current ml-1" />
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-[6px] w-full bg-white/5 relative">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-cyan-500 shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white text-lg truncate mb-1">{content.title}</h3>
                <p className="text-xs text-white/50 font-medium">{remaining > 0 ? `${remaining}m remaining` : episode.title}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ContinueWatchingSection;
