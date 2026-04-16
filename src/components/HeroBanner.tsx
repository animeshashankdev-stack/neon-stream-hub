import { useState, useEffect } from "react";
import { Play, Plus, Check, Star, Flame } from "lucide-react";
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

  if (isLoading) {
    return (
      <section className="relative w-full h-[85vh] min-h-[600px] bg-gradient-to-br from-[#0F0A2E] to-[#1A0A3E] animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A2E] via-transparent to-transparent" />
      </section>
    );
  }

  if (!current) {
    return (
      <section className="relative w-full h-[70vh] min-h-[500px] bg-gradient-to-br from-[#0F0A2E] via-[#1A0A3E] to-[#0A1628] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 text-lg font-medium">Discover your next obsession</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
      {/* Background images */}
      {items.map((item, idx) => (
        <img
          key={item.id}
          src={item.banner_url || item.poster_url || ""}
          alt={item.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentIdx ? "opacity-40" : "opacity-0"}`}
          width={1920}
          height={1080}
        />
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F0A2E] via-[#0F0A2E]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F0A2E]/90 via-[#0F0A2E]/30 to-transparent" />

      {/* Ambient glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_65%_40%,rgba(244,114,182,0.15),transparent)] mix-blend-screen" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(167,139,250,0.1),transparent_60%)] mix-blend-screen" />
      
      {/* Sparkles */}
      <div className="absolute top-[25%] right-[30%] text-teal-300 text-sm animate-pulse">✦</div>
      <div className="absolute top-[45%] right-[15%] text-pink-300 text-lg animate-pulse" style={{ animationDelay: '75ms' }}>✦</div>
      <div className="absolute bottom-[35%] right-[40%] text-yellow-300 text-xs animate-pulse" style={{ animationDelay: '150ms' }}>✦</div>

      <div className="relative z-10 h-full max-w-7xl mx-auto flex items-center px-6">
        <div className="w-full md:w-[55%] pr-4 md:pr-10">
          {/* Trending badge */}
          <div className="inline-flex items-center w-max px-4 py-1 rounded-full bg-gradient-to-r from-orange-400/20 to-pink-400/20 border border-orange-400/40 text-orange-300 text-xs font-bold mb-6 gap-2">
            <Flame className="w-3.5 h-3.5" /> Trending Now
          </div>

          {/* Genre tags */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {current.genres?.slice(0, 3).map((g) => (
              <span key={g} className="rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-semibold text-white/90">
                {g}
              </span>
            ))}
            {current.rating && (
              <span className="rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-semibold flex items-center gap-1 text-yellow-400">
                <Star className="w-3 h-3 fill-current" /> {current.rating}
              </span>
            )}
            {current.release_year && (
              <span className="rounded-full bg-white/10 backdrop-blur px-3 py-1 text-xs font-semibold text-white/90">
                {current.release_year}
              </span>
            )}
          </div>

          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-7xl leading-[1.1] mb-6 text-white tracking-tight">
            {current.title}
          </h2>

          <p className="text-white/70 text-sm sm:text-base max-w-lg mb-10 leading-relaxed font-light line-clamp-3">
            {current.description}
          </p>

          <div className="flex items-center gap-4 mb-10">
            <Link
              to={`/content/${current.id}`}
              className="rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 text-black font-bold px-8 py-3.5 shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:shadow-[0_0_30px_rgba(45,212,191,0.6)] transition-all flex items-center gap-2 text-sm tracking-wide hover:scale-105"
            >
              <Play className="w-4 h-4 fill-current" /> Watch Now
            </Link>
            {user && (
              <button
                onClick={() => toggleWatchlist.mutate(current.id)}
                className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold px-8 py-3.5 hover:bg-white/20 transition-all flex items-center gap-2 text-sm tracking-wide"
              >
                {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isInWatchlist ? "In Watchlist" : "My List"}
              </button>
            )}
          </div>

          {/* Carousel dots */}
          {items.length > 1 && (
            <div className="flex items-center gap-2">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIdx
                      ? "w-8 bg-gradient-to-r from-teal-400 to-cyan-500 shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                      : "w-3 bg-white/30 hover:bg-white/50"
                  }`}
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
