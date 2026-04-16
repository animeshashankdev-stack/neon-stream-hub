import { useState, useRef, useEffect } from "react";
import { Search as SearchIcon, Filter, Star, Mic, Play } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A20] via-[#120A2E] to-[#0A1828] text-white">
      <Navbar />

      {/* Hero Search Area */}
      <div className="pt-28 pb-10 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-violet-400 to-pink-400 mb-3 drop-shadow-sm">
            Explore Anime
          </h1>
          <p className="text-white/70 text-base max-w-2xl mx-auto mb-8 font-light tracking-wide">
            Discover your next obsession
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8 group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-white/50 group-focus-within:text-teal-400 transition-colors" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              placeholder="Search titles, characters, genres..."
              className="w-full h-14 pl-14 pr-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-base font-medium text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 shadow-[0_10px_30px_rgba(0,0,0,0.3),inset_0_0_20px_rgba(255,255,255,0.05)] transition-all"
            />
            <div className="absolute inset-y-0 right-4 flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeFilters > 0 ? "bg-teal-400/20 text-teal-400 border border-teal-400/30" : "text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                {activeFilters > 0 && `(${activeFilters})`}
              </button>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 z-50 max-h-96 overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    to={`/content/${item.id}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 border border-white/10">
                      {item.poster_url && <img src={item.poster_url} alt={item.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate text-white">{item.title}</p>
                      <p className="text-xs text-white/50 truncate">{item.genres?.join(", ")}</p>
                    </div>
                    {item.rating && (
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        <Star className="w-3 h-3 fill-current" />
                        {Number(item.rating).toFixed(1)}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Category pills */}
          <div className="flex overflow-x-auto pb-2 justify-start md:justify-center gap-3 max-w-4xl mx-auto scrollbar-hide">
            {categoryTabs.map((t, idx) => (
              <button
                key={t.label}
                onClick={() => handleTabChange(idx)}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                  activeTab === idx
                    ? "bg-gradient-to-r from-teal-400 to-cyan-500 text-black shadow-[0_0_15px_rgba(45,212,191,0.5)] border border-transparent"
                    : "bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="max-w-4xl mx-auto px-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Filters</h3>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="text-xs text-teal-400 hover:underline font-bold">Clear all</button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-white/50 mb-2 block font-bold uppercase tracking-wider">Genre</label>
                <div className="flex flex-wrap gap-1.5">
                  {(genres || []).slice(0, 20).map((g: any) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGenre(selectedGenre === g.name ? null : g.name)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                        selectedGenre === g.name
                          ? "bg-teal-400/20 text-teal-400 border-teal-400/30"
                          : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-2 block font-bold uppercase tracking-wider">Year</label>
                <div className="flex flex-wrap gap-1.5">
                  {years.map((y) => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(selectedYear === y ? null : y)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                        selectedYear === y
                          ? "bg-teal-400/20 text-teal-400 border-teal-400/30"
                          : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-2 block font-bold uppercase tracking-wider">Language</label>
                <div className="flex flex-wrap gap-1.5">
                  {languages.map((l) => (
                    <button
                      key={l}
                      onClick={() => setSelectedLang(selectedLang === l ? null : l)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                        selectedLang === l
                          ? "bg-teal-400/20 text-teal-400 border-teal-400/30"
                          : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 pb-24 relative z-20">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-white/50 font-medium">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-[20px] bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {filtered.map((item) => (
              <Link
                key={item.id}
                to={`/content/${item.id}`}
                className="group relative rounded-[20px] overflow-hidden border border-white/10 cursor-pointer hover:border-violet-400/50 hover:shadow-[0_0_20px_rgba(167,139,250,0.2)] transition-all duration-300"
              >
                <div className="w-full aspect-[2/3] bg-gradient-to-br from-slate-800 to-slate-950 relative">
                  <img
                    src={item.poster_url || ""}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {item.rating && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-[10px] font-bold text-yellow-400">{item.rating}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" />
                  </div>
                  <div className="absolute bottom-0 w-full p-3 bg-gradient-to-t from-[#0A0A1A] via-[#0A0A1A]/80 to-transparent">
                    <h3 className="font-bold text-xs text-white truncate drop-shadow-md">{item.title}</h3>
                    <p className="text-[10px] text-white/50 truncate">{item.genres?.join(" • ")}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <SearchIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 font-medium">No results found. Try different filters.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Search;
