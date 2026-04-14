import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { useWatchHistory } from "@/hooks/useWatchHistory";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

const ContinueWatchingSection = () => {
  const { user } = useAuth();
  const { data: history } = useWatchHistory();

  if (!user) return null;

  const continuing = (history || []).filter(
    (h: any) => !h.completed && h.progress_seconds > 0
  );

  if (continuing.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-lg font-display font-bold mb-4">Continue Watching</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {continuing.map((item: any) => {
          const episode = item.episodes;
          const content = episode?.content;
          if (!content || !episode) return null;
          const pct = item.total_seconds > 0 ? (item.progress_seconds / item.total_seconds) * 100 : 0;

          return (
            <Link
              key={item.id}
              to={`/watch/${content.id}/${episode.id}`}
              className="flex-shrink-0 w-56 group"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary mb-2">
                {content.thumbnail_url && (
                  <img src={content.thumbnail_url} alt={content.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-8 h-8 text-white fill-current" />
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                  <Progress value={pct} className="h-1 rounded-none" />
                </div>
              </div>
              <p className="text-xs font-semibold truncate">{content.title}</p>
              <p className="text-[10px] text-muted-foreground">
                S{episode.season_number} E{episode.episode_number} • {episode.title}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ContinueWatchingSection;
