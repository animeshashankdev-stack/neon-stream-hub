import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search as SearchIcon, BookOpen, TrendingUp, Sparkles } from "lucide-react";
import { AppShell, GlassCard, NeonChip } from "@/components/senpai/AppShell";
import { usePopularManga, useSearchManga, type MangaCard } from "@/hooks/useManga";

const Card = ({ m }: { m: MangaCard }) => (
  <Link
    to={`/manga/${m.id}`}
    className="group relative aspect-[2/3] rounded-2xl overflow-hidden senpai-glass border border-white/10 hover:border-fuchsia-400/40 transition-all hover:senpai-glow"
  >
    {m.cover ? (
      <img src={m.cover} alt={m.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40">
        <BookOpen className="w-10 h-10 text-white/30" />
      </div>
    )}
    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
      <p className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-tight">{m.title}</p>
      {m.year && <p className="senpai-mono text-[10px] text-white/50 mt-1">{m.year}</p>}
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
    <AppShell active="manga">
      <Helmet>
        <title>Manga — Senpai.tv</title>
        <meta name="description" content="Discover and read manga in a clean, ad-light reader. Powered by MangaDex." />
        <link rel="canonical" href="https://neon-curator-hub.lovable.app/manga" />
        <meta property="og:title" content="Manga — Senpai.tv" />
        <meta property="og:description" content="Discover and read manga in a clean, ad-light reader." />
      </Helmet>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="senpai-mono text-[11px] uppercase tracking-[0.3em] text-fuchsia-300 font-bold mb-2 flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> 漫画 · Manga Library
          </p>
          <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-orange-300">Manga</span>
          </h1>
          <p className="text-white/55 text-sm mt-2 max-w-lg">Curated from MangaDex. Search a title, dive into a chapter, pick up where you left off.</p>
        </div>
        <div className="relative w-full sm:w-96">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles…"
            className="w-full pl-11 pr-4 py-3 rounded-2xl senpai-glass border border-white/10 focus:border-fuchsia-400/50 focus:outline-none text-sm placeholder:text-white/40 text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-4 h-4 text-fuchsia-300" />
        <span className="text-xs uppercase tracking-widest text-white/60 font-bold">
          {q.trim().length > 1 ? `Search results for "${q}"` : "Most followed this season"}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-2xl senpai-glass animate-pulse" />
          ))}
        </div>
      ) : (items?.length ?? 0) === 0 ? (
        <GlassCard className="p-10 text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-white/30" />
          <p className="text-white/70">No manga found. Try a different search.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(items || []).map((m) => <Card key={m.id} m={m} />)}
        </div>
      )}
    </AppShell>
  );
};

export default Manga;
