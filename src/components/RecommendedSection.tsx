import { Link } from "react-router-dom";
import { Star, Play } from "lucide-react";
import { useContentList } from "@/hooks/useContent";
import SkeletonCard from "./SkeletonCard";

const RecommendedSection = () => {
  const { data: content, isLoading } = useContentList();
  const items = (content || []).slice(4, 10);

  if (isLoading) {
    return (
      <section className="py-12 px-6 sm:px-12 lg:px-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-orange-400 to-yellow-500" />
          <h2 className="text-2xl font-display font-black tracking-tight text-white">New & Hot</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} className="w-full" />)}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-12 px-6 sm:px-12 lg:px-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-orange-400 to-yellow-500 shadow-[0_0_10px_rgba(251,146,60,0.5)]" />
        <h2 className="text-2xl font-display font-black tracking-tight text-white">New & Hot</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/content/${item.id}`}
            className="group relative rounded-[20px] overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-orange-400/50 hover:shadow-[0_0_20px_rgba(251,146,60,0.15)] transition-all cursor-pointer"
          >
            <div className="h-[140px] relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950">
              <img
                src={item.poster_url || ""}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider uppercase shadow-[0_0_10px_rgba(244,114,182,0.6)]">
                NEW
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                </div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-white text-sm truncate mb-1">{item.title}</h3>
              <p className="text-xs text-white/50 font-medium">{item.genres?.join(" • ")}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendedSection;
