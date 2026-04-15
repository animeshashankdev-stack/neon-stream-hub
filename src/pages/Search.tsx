import { useState, useRef, useEffect } from "react";
import { Search as SearchIcon, Filter, Star } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentCard from "@/components/ContentCard";
import SkeletonCard from "@/components/SkeletonCard";
import { useContentList, useGenres } from "@/hooks/useContent";

const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
const languages = ["Japanese", "English", "Korean", "Chinese", "Hindi"];

const categoryTabs = [
  { label: "All", genre: null, type: null },
  { label: "Anime", genre: "Anime", type: null },
  { label: "Cartoon", genre: "Cartoon", type: null },
  { label: "Series", genre: null, type: "series" },
  { label: "Movies", genre: null, type: "movie" },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlGenre = searchParams.get("genre");
  const urlType = searchParams.get("type");

  // Find matching tab from URL params
  const initialTab = categoryTabs.findIndex(
    (t) =>
      (t.genre && t.genre.toLowerCase() === urlGenre?.toLowerCase()) ||
      (t.type && t.type === urlType)
  );

  const [activeTab, setActiveTab] = useState(initialTab >= 0 ? initialTab : 0);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) && e.target !== inputRef.current) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const tab = categoryTabs[activeTab];
  const filterGenre = tab.genre || selectedGenre || undefined;
  const filterType = tab.type || undefined;

  const { data: genres } = useGenres();
  const { data: content, isLoading } = useContentList({
    query: debouncedQuery || undefined,
    genre: filterGenre,
    year: selectedYear || undefined,
    language: selectedLang || undefined,
    type: filterType,
  });

  const filtered = content || [];
  const suggestions = query.length >= 2 ? filtered.slice(0, 8) : [];
  const activeFilters = [selectedGenre, selectedYear, selectedLang].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedGenre(null);
    setSelectedYear(null);
    setSelectedLang(null);
  };

  const handleTabChange = (idx: number) => {
    setActiveTab(idx);
    const t = categoryTabs[idx];
    const params = new URLSearchParams();
    if (t.genre) params.set("genre", t.genre);
    if (t.type) params.set("type", t.type);
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {categoryTabs.map((t, idx) => (
            <button
              key={t.label}
              onClick={() => handleTabChange(idx)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === idx
                  ? "bg-primary text-primary-foreground"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
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

          {showSuggestions && suggestions.length > 0 && (
            <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-2 glass-card p-2 z-50 max-h-96 overflow-y-auto">
              {suggestions.map((item) => (
                <Link
                  key={item.id}
                  to={`/content/${item.id}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-10 h-14 rounded-md overflow-hidden flex-shrink-0 bg-secondary">
                    {item.poster_url && <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.genres?.join(", ")}</p>
                  </div>
                  {item.rating && (
                    <div className="flex items-center gap-1 text-xs text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      {Number(item.rating).toFixed(1)}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
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
                  {(genres || []).slice(0, 20).map((g: any) => (
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
