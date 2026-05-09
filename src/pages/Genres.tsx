import { useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentCard from "@/components/ContentCard";
import SkeletonCard from "@/components/SkeletonCard";
import { useContentList, useGenres, ContentItem } from "@/hooks/useContent";

const Genres = () => {
  const { data: genres, isLoading: genresLoading } = useGenres();
  const { data: allContent, isLoading: contentLoading } = useContentList();

  const grouped = useMemo(() => {
    if (!allContent || !genres) return [];
    const map = new Map<string, ContentItem[]>();
    for (const item of allContent) {
      for (const g of item.genres || []) {
        if (!map.has(g)) map.set(g, []);
        map.get(g)!.push(item);
      }
    }
    return genres
      .map((g: any) => ({ name: g.name, slug: g.slug, items: map.get(g.name) || [] }))
      .filter((g) => g.items.length > 0);
  }, [allContent, genres]);

  const isLoading = genresLoading || contentLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-display font-extrabold text-gradient-neon mb-2">Browse by Genre</h1>
        <p className="text-muted-foreground text-sm mb-8">Explore curated collections across every genre</p>

        {/* Genre tag cloud */}
        <div className="flex flex-wrap gap-2 mb-10">
          {(genres || []).map((g: any) => (
            <a
              key={g.id}
              href={`#genre-${g.slug}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-primary/20 hover:text-primary transition-colors"
            >
              {g.name}
            </a>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-12">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <div className="h-6 w-32 bg-secondary rounded mb-4 animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: 6 }).map((_, j) => <SkeletonCard key={j} className="w-40 flex-shrink-0" />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {grouped.map((genre) => (
              <section key={genre.slug} id={`genre-${genre.slug}`} className="scroll-mt-24">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-display font-bold">{genre.name}</h2>
                    <p className="text-xs text-muted-foreground">{genre.items.length} title{genre.items.length !== 1 ? "s" : ""}</p>
                  </div>
                  <Link to={`/search?genre=${genre.name}`} className="text-xs text-primary hover:underline">See All →</Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {genre.items.map((item) => (
                    <Link key={item.id} to={`/content/${item.id}`} className="flex-shrink-0 w-40">
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
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Genres;
