import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search as SearchIcon, Filter, Star, Play, Sparkles } from "lucide-react";
import { AppShell, GlassCard, NeonChip, ScoreBadge } from "@/components/senpai/AppShell";
import { useContentList, useGenres } from "@/hooks/useContent";

const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
const languages = ["Japanese", "English", "Korean", "Chinese", "Hindi"];
const categoryTabs = [
  { label: "All", genre: null as string | null, type: null as string | null },
  { label: "Anime", genre: "Anime", type: null },
  { label: "Cartoon", genre: "Cartoon", type: null },
  { label: "Series", genre: null, type: "series" },
  { label: "Movies", genre: null, type: "movie" },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlGenre = searchParams.get("genre");
  const urlType = searchParams.get("type");
  const urlQ = searchParams.get("q") || "";

  const initialTab = categoryTabs.findIndex(
    (t) => (t.genre && t.genre.toLowerCase() === urlGenre?.toLowerCase()) || (t.type && t.type === urlType)
  );
  const [activeTab, setActiveTab] = useState(initialTab >= 0 ? initialTab : 0);
  const [query, setQuery] = useState(urlQ);
  const [debouncedQuery, setDebouncedQuery] = useState(urlQ);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const tab = categoryTabs[activeTab];
  const { data: genres } = useGenres();
  const { data: content, isLoading } = useContentList({
    query: debouncedQuery || undefined,
    genre: tab.genre || selectedGenre || undefined,
    year: selectedYear || undefined,
    language: selectedLang || undefined,
    type: tab.type || undefined,
  });

  const filtered = content || [];
  const activeFilters = [selectedGenre, selectedYear, selectedLang].filter(Boolean).length;

  const clearFilters = () => { setSelectedGenre(null); setSelectedYear(null); setSelectedLang(null); };

  const handleTabChange = (idx: number) => {
    setActiveTab(idx);
    const t = categoryTabs[idx];
    const params = new URLSearchParams();
    if (t.genre) params.set("genre", t.genre);
    if (t.type) params.set("type", t.type);
    if (debouncedQuery) params.set("q", debouncedQuery);
    setSearchParams(params, { replace: true });
  };

  return (
    <AppShell active="search">
      <Helmet>
        <title>{debouncedQuery ? `${debouncedQuery} — Search` : "Search"} · Senpai.tv</title>
        <meta name="description" content="Search anime, cartoons, movies and series. Filter by genre, year and language." />
        <link rel="canonical" href="https://ani.shashanksv.com/search" />
      </Helmet>

      <div className="mb-8">
        <p className="senpai-mono text-[11px] uppercase tracking-[0.3em] text-fuchsia-300 font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-3 h-3" /> 探索 · Explore
        </p>
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight">
          Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-orange-300">the catalogue</span>
        </h1>
      </div>

      <GlassCard className="p-4 sm:p-5 mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Titles, genres, characters…"
            className="w-full pl-11 pr-28 py-3 rounded-xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-400/50 focus:outline-none text-sm text-white placeholder:text-white/40"
          />
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeFilters > 0 || showFilters
                ? "bg-fuchsia-500/25 text-fuchsia-100 border border-fuchsia-300/40"
                : "text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> Filters{activeFilters > 0 ? ` (${activeFilters})` : ""}
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {categoryTabs.map((t, idx) => (
            <NeonChip key={t.label} active={activeTab === idx} color="fuchsia" onClick={() => handleTabChange(idx)}>
              {t.label}
            </NeonChip>
          ))}
        </div>
      </GlassCard>

      {showFilters && (
        <GlassCard className="p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Filters</h3>
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="text-xs text-fuchsia-300 hover:underline font-bold">Clear all</button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <p className="senpai-mono text-[10px] text-white/45 mb-2 font-bold uppercase tracking-widest">Genre</p>
              <div className="flex flex-wrap gap-1.5">
                {(genres || []).slice(0, 20).map((g: any) => (
                  <NeonChip key={g.id} active={selectedGenre === g.name} color="violet" onClick={() => setSelectedGenre(selectedGenre === g.name ? null : g.name)}>
                    {g.name}
                  </NeonChip>
                ))}
              </div>
            </div>
            <div>
              <p className="senpai-mono text-[10px] text-white/45 mb-2 font-bold uppercase tracking-widest">Year</p>
              <div className="flex flex-wrap gap-1.5">
                {years.map((y) => (
                  <NeonChip key={y} active={selectedYear === y} color="amber" onClick={() => setSelectedYear(selectedYear === y ? null : y)}>
                    {y}
                  </NeonChip>
                ))}
              </div>
            </div>
            <div>
              <p className="senpai-mono text-[10px] text-white/45 mb-2 font-bold uppercase tracking-widest">Language</p>
              <div className="flex flex-wrap gap-1.5">
                {languages.map((l) => (
                  <NeonChip key={l} active={selectedLang === l} color="teal" onClick={() => setSelectedLang(selectedLang === l ? null : l)}>
                    {l}
                  </NeonChip>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="senpai-mono text-xs text-white/50">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl senpai-glass animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <SearchIcon className="w-10 h-10 mx-auto mb-3 text-white/30" />
          <p className="text-white/70">No results. Try different filters.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((item) => (
            <Link
              key={item.id}
              to={`/content/${item.id}`}
              className="group relative aspect-[2/3] rounded-2xl overflow-hidden senpai-glass border border-white/10 hover:border-fuchsia-400/40 transition-all hover:senpai-glow"
            >
              <img
                src={item.poster_url || ""}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {item.rating ? (
                <div className="absolute top-2 right-2">
                  <ScoreBadge value={Number(item.rating)} />
                </div>
              ) : null}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">{item.title}</h3>
                <p className="senpai-mono text-[10px] text-white/50 truncate mt-0.5">{item.genres?.join(" · ") || item.release_year}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
};

export default Search;
