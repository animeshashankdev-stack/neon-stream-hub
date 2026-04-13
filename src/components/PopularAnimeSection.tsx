import { Link } from "react-router-dom";
import { Star } from "lucide-react";
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
        <h2 className="font-display font-bold text-xl mb-6">Popular Anime</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 sm:h-96 rounded-2xl bg-secondary animate-pulse" />
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featured) return null;

  return (
    <section className="py-12 px-6 sm:px-12 lg:px-20">
      <h2 className="font-display font-bold text-xl mb-6">Popular Anime</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link to={`/content/${featured.id}`} className="lg:col-span-2 relative rounded-2xl overflow-hidden glass-card group cursor-pointer">
          <img
            src={featured.poster_url || ""}
            alt={featured.title}
            className="w-full h-72 sm:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold tracking-wider">
              #1 THIS WEEK
            </span>
            {featured.rating && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-background/50 backdrop-blur-sm">
                <Star className="w-3 h-3 text-accent fill-current" />
                <span className="text-xs font-bold text-accent">{featured.rating}</span>
              </span>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="font-display font-bold text-2xl mb-2">{featured.title}</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-4 line-clamp-2">{featured.description}</p>
            <span className="px-5 py-2 rounded-lg bg-primary/20 text-primary text-sm font-semibold">
              Learn More
            </span>
          </div>
        </Link>

        <div className="flex flex-col gap-4">
          {sideItems.map((item, idx) => (
            <Link
              key={item.id}
              to={`/content/${item.id}`}
              className="flex items-center gap-4 glass-card p-3 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors group"
            >
              <img
                src={item.poster_url || ""}
                alt={item.title}
                className="w-16 h-20 rounded-lg object-cover flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">#{idx + 2}</p>
                <h4 className="font-display font-semibold text-sm truncate">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.genres?.join(" • ")}</p>
                {item.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-accent fill-current" />
                    <span className="text-[10px] font-bold text-accent">{item.rating}</span>
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
