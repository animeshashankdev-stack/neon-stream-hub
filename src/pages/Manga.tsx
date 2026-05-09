import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { usePopularManga, useSearchManga, type MangaCard } from "@/hooks/useManga";

const Card = ({ m }: { m: MangaCard }) => (
  <Link
    to={`/manga/${m.id}`}
    className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-accent/40 transition-colors"
  >
    {m.cover ? (
      <img src={m.cover} alt={m.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/40 to-cyan-900/40">
        <BookOpen className="w-10 h-10 text-white/30" />
      </div>
    )}
    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/70 to-transparent">
      <p className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight">{m.title}</p>
      {m.year && <p className="text-[10px] text-white/50 mt-1">{m.year}</p>}
    </div>
  </Link>
);

const Manga = () => {
  const [q, setQ] = useState("");
  const popular = usePopularManga();
  const search = useSearchManga(q);
  const items = q.trim().length > 1 ? search.data : popular.data;
  const loading = q.trim().length > 1 ? search.isLoading : popular.isLoading;

  return (
    <div className="min-h-screen bg-[#080818] text-white font-body pb-24 md:pb-10">
      <Navbar />
      <main className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-2 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Manga · MangaDex
            </p>
            <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight">Discover Manga</h1>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles…"
              className="w-full pl-11 pr-4 py-3 rounded-full bg-white/5 border border-white/10 focus:border-accent/40 focus:outline-none text-sm placeholder:text-white/40"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {(items || []).map((m) => <Card key={m.id} m={m} />)}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Manga;