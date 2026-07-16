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
      <section className="relative w-full h-[85vh] min-h-[600px] bg-gradient-to-br from-[#1a1a2e] to-[#141428] animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-transparent to-transparent" />
      </section>
    );
  }

  if (!current) {
    return (
      <section className="relative w-full h-[70vh] min-h-[500px] bg-gradient-to-br from-[#1a1a2e] via-[#1a1a2e] to-[#141428] flex items-center justify-center">
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
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] via-[#1a1a2e]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/90 via-[#1a1a2e]/30 to-transparent" />

      {/* Ambient glow effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_65%_40%,rgba(244,114,182,0.15),transparent)] mix-blend-screen" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(167,139,250,0.1),transparent_60%)] mix-blend-screen" />
      
      {/* Sparkles */}
      <div className="absolute top-[25%] right-[30%] text-teal-300 text-sm animate-pulse">✦</div>
      <div className="absolute top-[45%] right-[15%] text-pink-300 text-lg animate-pulse" style={{ animationDelay: '75ms' }}>✦</div>
      <div className="absolute bottom-[35%] right-[40%] text-yellow-300 text-xs animate-pulse" style={{ animationDelay: '150ms' }}>✦</div>

      {/* Floating Glass Card */}
      <div className="relative z-10 h-full max-w-7xl mx-auto flex items-end px-6 pb-20">
        <div className="w-full md:max-w-2xl p-6 md:p-8 rounded-3xl bg-[#1a1a2e]/40 backdrop-blur-md border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Badges row */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#4ade80] text-[#1a1a2e] text-[10px] font-black uppercase tracking-widest">
              <Flame className="w-3 h-3" /> Trending Now
            </span>
            <div className="flex gap-2 flex-wrap">
              {current.genres?.slice(0, 3).map((g) => (
                <span key={g} className="px-2 py-0.5 rounded border border-white/20 text-[10px] font-semibold bg-white/5 text-white/80">
                  {g}
                </span>
              ))}
            </div>
          </div>

          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl mb-4 tracking-tighter leading-none">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
              {current.title}
            </span>
          </h2>

          <div className="flex items-center gap-4 mb-6 flex-wrap">
            {current.rating && (
              <div className="flex items-center gap-1 text-yellow-400">
                <span className="font-bold">{current.rating}</span>
                <Star className="w-4 h-4 fill-current" />
              </div>
            )}
            {current.release_year && (
              <span className="text-white/40 text-sm">
                {current.release_year}
              </span>
            )}
          </div>

          <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-8 line-clamp-3 max-w-lg">
            {current.description}
          </p>

          <div className="flex items-center gap-4">
            <Link
              to={`/content/${current.id}`}
              className="px-8 py-4 bg-[#4ade80] text-[#1a1a2e] font-bold rounded-xl hover:bg-[#4ade80]/90 transition-all active:scale-95 shadow-lg shadow-[#4ade80]/20 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> Watch Now
            </Link>
            {user && (
              <button
                onClick={() => toggleWatchlist.mutate(current.id)}
                aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#a78bfa]/40 transition-all"
              >
                {isInWatchlist ? <Check className="w-6 h-6 text-[#4ade80]" /> : <Plus className="w-6 h-6 text-white" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vertical dot indicators */}
      {items.length > 1 && (
        <div className="absolute right-6 md:right-12 bottom-24 flex flex-col gap-3 z-20">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`w-1 rounded-full transition-all duration-300 ${
                idx === currentIdx
                  ? "h-8 bg-[#4ade80] shadow-[0_0_10px_rgba(74,222,128,0.6)]"
                  : "h-3 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroBanner;
