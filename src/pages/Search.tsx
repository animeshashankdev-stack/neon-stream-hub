import { useState, useMemo } from "react";
import { Search as SearchIcon, Filter, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentCard from "@/components/ContentCard";

import voidImg from "@/assets/poster-void-horizon.jpg";
import bloomImg from "@/assets/poster-ethereal-bloom.jpg";
import scarletImg from "@/assets/poster-scarlet-night.jpg";
import cyberImg from "@/assets/poster-cyber-pulse.jpg";
import frostImg from "@/assets/poster-frost-heart.jpg";
import stormImg from "@/assets/poster-storm-soul.jpg";
import whisperImg from "@/assets/poster-whisper-zen.jpg";
import hyperImg from "@/assets/poster-hyper-rails.jpg";
import skyboundImg from "@/assets/poster-skybound-realm.jpg";
import silentImg from "@/assets/poster-silent-peak.jpg";
import dreamImg from "@/assets/poster-dream-weaver.jpg";
import neonImg from "@/assets/poster-neon-drifters.jpg";

const allContent = [
  { id: "1", image: voidImg, title: "Void Horizon", subtitle: "Action • Sci-Fi", genres: ["Action", "Sci-Fi"], year: 2024, language: "Japanese" },
  { id: "2", image: bloomImg, title: "Ethereal Bloom", subtitle: "Fantasy • Adventure", genres: ["Fantasy", "Adventure"], year: 2024, language: "Japanese" },
  { id: "3", image: scarletImg, title: "Scarlet Night", subtitle: "Supernatural • Thriller", genres: ["Supernatural", "Thriller"], year: 2023, language: "Japanese" },
  { id: "4", image: cyberImg, title: "Cyber Pulse", subtitle: "Cyberpunk • Drama", genres: ["Cyberpunk", "Drama"], year: 2024, language: "Japanese" },
  { id: "5", image: frostImg, title: "Frost Heart", subtitle: "Fantasy • Drama", genres: ["Fantasy", "Drama"], year: 2023, language: "Japanese" },
  { id: "6", image: stormImg, title: "Storm Soul", subtitle: "Action • Adventure", genres: ["Action", "Adventure"], year: 2024, language: "English" },
  { id: "7", image: whisperImg, title: "Whisper of Zen", subtitle: "Slice of Life • Drama", genres: ["Slice of Life", "Drama"], year: 2022, language: "Japanese" },
  { id: "8", image: hyperImg, title: "Hyper Rails", subtitle: "Mecha • Sci-Fi", genres: ["Mecha", "Sci-Fi"], year: 2024, language: "Japanese" },
  { id: "9", image: skyboundImg, title: "Skybound Realm", subtitle: "Fantasy • Adventure", genres: ["Fantasy", "Adventure"], year: 2023, language: "Japanese" },
  { id: "10", image: silentImg, title: "Silent Peak", subtitle: "Mystery • Thriller", genres: ["Mystery", "Thriller"], year: 2022, language: "Japanese" },
  { id: "11", image: dreamImg, title: "Dream Weaver", subtitle: "Fantasy • Romance", genres: ["Fantasy", "Romance"], year: 2024, language: "Korean" },
  { id: "12", image: neonImg, title: "Neon Drifters", subtitle: "Cyberpunk • Action", genres: ["Cyberpunk", "Action"], year: 2023, language: "English" },
];

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Cyberpunk", "Mecha", "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Supernatural", "Thriller"];
const years = [2024, 2023, 2022, 2021, 2020];
const languages = ["Japanese", "English", "Korean", "Chinese"];

const Search = () => {
  const [query, setQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return allContent.filter((item) => {
      const matchesQuery = !query || item.title.toLowerCase().includes(query.toLowerCase());
      const matchesGenre = !selectedGenre || item.genres.includes(selectedGenre);
      const matchesYear = !selectedYear || item.year === selectedYear;
      const matchesLang = !selectedLang || item.language === selectedLang;
      return matchesQuery && matchesGenre && matchesYear && matchesLang;
    });
  }, [query, selectedGenre, selectedYear, selectedLang]);

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
        {/* Search Bar */}
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

        {/* Filters Panel */}
        {showFilters && (
          <div className="glass-card p-5 mb-6 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-display font-semibold">Filters</h3>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Genre */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Genre</label>
                <div className="flex flex-wrap gap-1.5">
                  {genres.map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGenre(selectedGenre === g ? null : g)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedGenre === g
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              {/* Year */}
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
              {/* Language */}
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

        {/* Results */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((item) => (
            <Link key={item.id} to={`/content/${item.id}`}>
              <ContentCard image={item.image} title={item.title} subtitle={item.subtitle} className="w-full" />
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
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
