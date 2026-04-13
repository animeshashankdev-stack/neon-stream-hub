import { useState, useEffect } from "react";
import { Play, Plus, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useFeaturedContent, ContentItem } from "@/hooks/useContent";
import { useAuth } from "@/contexts/AuthContext";
import { useIsInWatchlist, useToggleWatchlist } from "@/hooks/useWatchlist";

const HeroBanner = () => {
  const { data: featured, isLoading } = useFeaturedContent();
  const [currentIdx, setCurrentIdx] = useState(0);
  const { user } = useAuth();

  const items = featured || [];
  const current = items[currentIdx] as ContentItem | undefined;

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [items.length]);

  const { data: isInWatchlist } = useIsInWatchlist(current?.id);
  const toggleWatchlist = useToggleWatchlist();

  if (isLoading || !current) {
    return (
      <section className="relative w-full h-[85vh] min-h-[600px] bg-background animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
      </section>
    );
  }

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
      {items.map((item, idx) => (
        <img
          key={item.id}
          src={item.banner_url || item.poster_url || ""}
          alt={item.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentIdx ? "opacity-100" : "opacity-0"}`}
          width={1920}
          height={1080}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-end pb-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            {current.genres?.map((g) => (
              <span key={g} className="px-2 py-0.5 rounded-md bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                {g}
              </span>
            ))}
          </div>
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-4 max-w-2xl uppercase tracking-tight">
            {current.title}
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mb-8 leading-relaxed line-clamp-3">
            {current.description}
          </p>
          <div className="flex items-center gap-4">
            <Link
              to={`/content/${current.id}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm neon-glow-purple transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" />
              Play Now
            </Link>
            {user && (
              <button
                onClick={() => toggleWatchlist.mutate(current.id)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-foreground font-display font-semibold text-sm transition-all hover:bg-secondary"
              >
                {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isInWatchlist ? "In Watchlist" : "Watchlist"}
              </button>
            )}
          </div>

          {/* Dots */}
          {items.length > 1 && (
            <div className="flex items-center gap-2 mt-8">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-1 rounded-full transition-all ${idx === currentIdx ? "w-8 bg-primary" : "w-4 bg-muted-foreground/30"}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
