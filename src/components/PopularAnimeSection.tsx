import { Link } from "react-router-dom";
import { Star, Play } from "lucide-react";
import { useContentList } from "@/hooks/useContent";
import SkeletonCard from "./SkeletonCard";

const PopularAnimeSection = () => {
  const { data: content, isLoading } = useContentList();
  const items = (content || []).slice(0, 5);
  const featured = items[0];
  const sideItems = items.slice(1, 4);

  if (isLoading) {
    return (
      <section className="py-12 px-6 sm:px-12 lg:px-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-pink-400 to-rose-500" />
          <h2 className="text-2xl font-display font-black tracking-tight text-white">Popular Anime</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 sm:h-96 rounded-[24px] bg-white/5 border border-white/10 animate-pulse" />
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-[20px] bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featured) return null;

  return (
    <section className="py-12 px-6 sm:px-12 lg:px-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-pink-400 to-rose-500 shadow-[0_0_10px_rgba(244,114,182,0.5)]" />
        <h2 className="text-2xl font-display font-black tracking-tight text-white">Popular Anime</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link to={`/content/${featured.id}`} className="lg:col-span-2 relative rounded-[24px] overflow-hidden group cursor-pointer border border-white/10 hover:border-violet-400/30 transition-all">
          <img
            src={featured.poster_url || ""}
            alt={featured.title}
            className="w-full h-72 sm:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A1A] via-[#0A0A1A]/40 to-transparent" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-orange-400/20 to-pink-400/20 border border-orange-400/30 text-orange-300 text-xs font-bold tracking-wider">
              #1 THIS WEEK
            </span>
            {featured.rating && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs font-bold text-yellow-400">{featured.rating}</span>
              </span>
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              <Play className="w-7 h-7 text-white fill-current ml-1" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="font-display font-black text-2xl text-white mb-2">{featured.title}</h3>
            <p className="text-white/60 text-sm max-w-md mb-4 line-clamp-2">{featured.description}</p>
          </div>
        </Link>

        <div className="flex flex-col gap-4">
          {sideItems.map((item, idx) => (
            <Link
              key={item.id}
              to={`/content/${item.id}`}
              className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-3 rounded-[20px] cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <img
                src={item.poster_url || ""}
                alt={item.title}
                className="w-16 h-20 rounded-[12px] object-cover flex-shrink-0 border border-white/10"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/50 mb-0.5 font-bold">#{idx + 2}</p>
                <h4 className="font-bold text-sm text-white group-hover:text-teal-400 transition-colors truncate">{item.title}</h4>
                <p className="text-xs text-white/50">{item.genres?.join(" • ")}</p>
                {item.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-[10px] font-bold text-yellow-400">{item.rating}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularAnimeSection;
