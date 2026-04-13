import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Plus, Check, Star, Clock, Calendar, Globe, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentCard from "@/components/ContentCard";
import SkeletonCard from "@/components/SkeletonCard";
import { useContentDetail, useEpisodes, useRecommendations } from "@/hooks/useContent";
import { useAuth } from "@/contexts/AuthContext";
import { useIsInWatchlist, useToggleWatchlist } from "@/hooks/useWatchlist";

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const ContentDetail = () => {
  const { id } = useParams();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const { data: content, isLoading } = useContentDetail(id);
  const { data: episodes } = useEpisodes(id);
  const { data: recommendations } = useRecommendations(id);
  const { user } = useAuth();
  const { data: isInWatchlist } = useIsInWatchlist(id);
  const toggleWatchlist = useToggleWatchlist();

  const seasons = [...new Set(episodes?.map((e) => e.season_number) || [1])];
  const filteredEpisodes = episodes?.filter((e) => e.season_number === selectedSeason) || [];
  const firstEpisode = filteredEpisodes[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="h-[70vh] bg-secondary animate-pulse" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-muted-foreground">Content not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Banner */}
      <div className="relative h-[70vh] min-h-[500px]">
        <img
          src={content.banner_url || content.poster_url || ""}
          alt={content.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex gap-6 items-end">
            <div className="hidden sm:block flex-shrink-0 w-48 rounded-xl overflow-hidden shadow-[0_0_40px_hsl(265_90%_60%/0.3)]">
              <img src={content.poster_url || ""} alt={content.title} className="w-full aspect-[2/3] object-cover" />
            </div>

            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {content.genres?.map((g) => (
                  <span key={g} className="px-2.5 py-0.5 rounded-md bg-primary/20 text-primary text-xs font-semibold">{g}</span>
                ))}
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl mb-3">{content.title}</h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
                {content.rating && (
                  <span className="flex items-center gap-1 text-accent font-semibold">
                    <Star className="w-4 h-4 fill-current" /> {content.rating}
                  </span>
                )}
                {content.release_year && (
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {content.release_year}</span>
                )}
                {content.duration_minutes && (
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {content.duration_minutes} min{content.type === "series" ? "/ep" : ""}</span>
                )}
                {content.language && (
                  <span className="flex items-center gap-1"><Globe className="w-4 h-4" /> {content.language}</span>
                )}
                {content.status && (
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-accent/20 text-accent uppercase">{content.status}</span>
                )}
              </div>

              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed mb-5 line-clamp-3">{content.description}</p>

              <div className="flex items-center gap-3">
                {firstEpisode && (
                  <Link
                    to={`/watch/${content.id}/${firstEpisode.id}`}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm hover:bg-primary/90 transition-colors neon-glow-purple"
                  >
                    <Play className="w-4 h-4 fill-current" /> Play Now
                  </Link>
                )}
                {user && (
                  <button
                    onClick={() => toggleWatchlist.mutate(content.id)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl glass text-foreground font-display font-semibold text-sm hover:bg-secondary/50 transition-colors"
                  >
                    {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isInWatchlist ? "In Watchlist" : "Watchlist"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes */}
      {content.type === "series" && filteredEpisodes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl">Episodes</h2>
            {seasons.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Season</span>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="glass rounded-lg px-3 py-1.5 text-sm text-foreground bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {filteredEpisodes.map((ep, idx) => (
              <Link
                key={ep.id}
                to={`/watch/${content.id}/${ep.id}`}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors group ${
                  idx === 0 ? "glass shadow-[0_0_20px_hsl(265_90%_60%/0.15)]" : "hover:bg-secondary/50"
                }`}
              >
                <div className="relative w-28 sm:w-36 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-foreground fill-current" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {idx === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">New</span>}
                  </div>
                  <p className="text-sm font-display font-semibold truncate">
                    {String(ep.episode_number).padStart(2, "0")}. {ep.title}
                  </p>
                  {ep.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{ep.description}</p>}
                  {ep.duration_seconds && <p className="text-xs text-muted-foreground mt-0.5">{formatDuration(ep.duration_seconds)}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <h2 className="font-display font-bold text-xl mb-5">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map((item) => (
              <Link key={item.id} to={`/content/${item.id}`}>
                <ContentCard
                  image={item.poster_url || ""}
                  title={item.title}
                  subtitle={item.genres?.join(" • ") || ""}
                  rating={item.rating}
                  className="w-full"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ContentDetail;
