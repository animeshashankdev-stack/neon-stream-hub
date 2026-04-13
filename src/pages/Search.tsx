import { useState, useMemo, useEffect } from "react";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentCard from "@/components/ContentCard";
import SkeletonCard from "@/components/SkeletonCard";
import { useContentList, useGenres } from "@/hooks/useContent";

const years = [2024, 2023, 2022, 2021, 2020];
const languages = ["Japanese", "English", "Korean", "Chinese"];

const Search = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: genres } = useGenres();
  const { data: content, isLoading } = useContentList({
    query: debouncedQuery || undefined,
    genre: selectedGenre || undefined,
    year: selectedYear || undefined,
    language: selectedLang || undefined,
  });

  const filtered = content || [];
  const activeFilters = [selectedGenre, selectedYear, selectedLang].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedGenre(null);
    setSelectedYear(null);
    setSelectedLang(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime, movies, series..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFilters > 0 ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters {activeFilters > 0 && `(${activeFilters})`}
          </button>
        </div>

        {showFilters && (
          <div className="glass-card p-5 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-display font-semibold">Filters</h3>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all</button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Genre</label>
                <div className="flex flex-wrap gap-1.5">
                  {(genres || []).map((g: any) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGenre(selectedGenre === g.name ? null : g.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedGenre === g.name
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Year</label>
                <div className="flex flex-wrap gap-1.5">
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(selectedYear === y ? null : y)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedYear === y
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Language</label>
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((l) => (
                    <button
                      key={l}
                      onClick={() => setSelectedLang(selectedLang === l ? null : l)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedLang === l
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} className="w-full" />)
            : filtered.map((item) => (
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
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <SearchIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No results found. Try different filters.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Search;
