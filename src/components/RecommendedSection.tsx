import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { useContentList } from "@/hooks/useContent";
import SkeletonCard from "./SkeletonCard";

const RecommendedSection = () => {
  const { data: content, isLoading } = useContentList();
  // Show the lower-rated ones as "recommended"
  const items = (content || []).slice(4, 8);

  if (isLoading) {
    return (
      <section className="py-12 px-6 sm:px-12 lg:px-20">
        <h2 className="font-display font-bold text-xl mb-6">Recommended For You</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} className="w-full" />)}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-12 px-6 sm:px-12 lg:px-20">
      <h2 className="font-display font-bold text-xl mb-6">Recommended For You</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/content/${item.id}`}
            className="group glass-card rounded-xl overflow-hidden cursor-pointer hover:shadow-[0_0_30px_hsl(265_90%_60%/0.15)] transition-all duration-300"
          >
            <div className="relative aspect-[2/3] overflow-hidden">
              <img
                src={item.poster_url || ""}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {item.rating && (
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/60 backdrop-blur-sm">
                  <Star className="w-3 h-3 text-accent fill-current" />
                  <span className="text-[10px] font-bold text-accent">{item.rating}</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-display font-semibold text-sm mb-1 truncate">{item.title}</h3>
              <p className="text-[10px] text-muted-foreground">{item.genres?.join(" • ")}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendedSection;
