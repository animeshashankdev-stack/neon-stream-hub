import { Link, Navigate } from "react-router-dom";
import { Bookmark, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentCard from "@/components/ContentCard";
import SkeletonCard from "@/components/SkeletonCard";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist, useToggleWatchlist } from "@/hooks/useWatchlist";

const Watchlist = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: items, isLoading } = useWatchlist();
  const toggleWatchlist = useToggleWatchlist();

  if (!authLoading && !user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Bookmark className="w-6 h-6 text-primary" />
          <h1 className="font-display font-extrabold text-3xl">My Watchlist</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} className="w-full" />
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item: any) => (
              <div key={item.watchlistId} className="relative group/card">
                <Link to={`/content/${item.id}`}>
                  <ContentCard
                    image={item.poster_url || ""}
                    title={item.title}
                    subtitle={`${item.type === "movie" ? "Movie" : "Series"} • ${item.release_year || ""}`}
                    rating={item.rating}
                    className="w-full"
                  />
                </Link>
                <button
                  onClick={() => toggleWatchlist.mutate(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive/80 text-destructive-foreground opacity-0 group-hover/card:opacity-100 transition-opacity text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Bookmark className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl mb-2 text-muted-foreground">Your watchlist is empty</h2>
            <p className="text-sm text-muted-foreground/70 mb-6">Start adding anime and movies to keep track of what you want to watch.</p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm neon-glow-purple"
            >
              <Plus className="w-4 h-4" /> Browse Content
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Watchlist;
