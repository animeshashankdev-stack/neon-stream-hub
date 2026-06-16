/**
 * SENPAI.TV - Manga Library
 * Discover and read manga with cinematic editorial design
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search as SearchIcon, BookOpen, TrendingUp, Sparkles } from 'lucide-react';
import { AppShell, TiltCard, ScrollReveal } from '@/components/senpai';
import { usePopularManga, useSearchManga, type MangaCard } from '@/hooks/useManga';

const MangaCard = ({ m }: { m: MangaCard }) => (
  <TiltCard intensity={10}>
    <Link
      to={`/manga/${m.id}`}
      className="group relative aspect-[2/3] rounded-lg overflow-hidden glass-card hover:glow-violet transition-all duration-300"
    >
      {m.cover ? (
        <img
          src={m.cover}
          alt={m.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-senpai-violet/20 to-senpai-pink/20">
          <BookOpen className="w-10 h-10 text-senpai-text-dim" />
        </div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-senpai-bg via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-xs font-bold text-senpai-text line-clamp-2 leading-tight">
          {m.title}
        </p>
        {m.year && <p className="font-mono text-[10px] text-senpai-text-dim mt-1">{m.year}</p>}
      </div>
    </Link>
  </TiltCard>
);

const Manga = () => {
  const [q, setQ] = useState('');
  const popular = usePopularManga();
  const search = useSearchManga(q);
  const items = q.trim().length > 1 ? search.data : popular.data;
  const loading = q.trim().length > 1 ? search.isLoading : popular.isLoading;

  return (
    <AppShell active="manga">
      <Helmet>
        <title>Manga — Senpai.tv</title>
        <meta
          name="description"
          content="Discover and read manga in a clean, ad-light reader. Powered by MangaDex."
        />
        <link rel="canonical" href="https://senpai.tv/manga" />
        <meta property="og:title" content="Manga — Senpai.tv" />
        <meta property="og:description" content="Discover and read manga with premium streaming experience." />
      </Helmet>

      <div className="space-y-12 pb-20">
        {/* HERO SECTION */}
        <ScrollReveal>
          <div className="space-y-6">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-senpai-violet font-bold mb-3 flex items-center gap-2">
                <Sparkles size={14} /> 漫画 · Manga Library
              </p>
              <h1 className="text-cinematic text-senpai-text font-[Anton]">
                Discover Manga
              </h1>
              <p className="text-senpai-text-dim text-lg mt-3 max-w-2xl">
                Explore thousands of manga titles. Read, bookmark, and pick up where you left off.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full max-w-xl">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-senpai-text-dim" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search manga titles..."
                className="w-full pl-12 pr-4 py-3 rounded-lg glass-card border border-white/10 focus:border-senpai-violet/40 focus:outline-none text-senpai-text placeholder:text-senpai-text-dim transition-all"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Results Header */}
        <ScrollReveal>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-senpai-violet rounded-full" />
            <span className="text-xs uppercase tracking-widest text-senpai-text-dim font-bold">
              {q.trim().length > 1 ? `Results for "${q}"` : 'Most Followed This Season'}
            </span>
          </div>
        </ScrollReveal>

        {/* Content Grid */}
        <ScrollReveal>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-lg bg-senpai-surface animate-pulse"
                />
              ))}
            </div>
          ) : (items?.length ?? 0) === 0 ? (
            <div className="text-center py-20 space-y-4">
              <BookOpen className="w-12 h-12 mx-auto text-senpai-text-dim" />
              <div>
                <p className="text-senpai-text-dim text-lg font-bold">No manga found</p>
                <p className="text-senpai-text-dim text-sm mt-1">Try a different search term</p>
              </div>
              {q.trim().length > 1 && (
                <button
                  onClick={() => setQ('')}
                  className="mt-4 px-4 py-2 bg-senpai-violet hover:bg-senpai-violet-2 text-senpai-text rounded-lg font-bold transition-all"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {(items || []).map((m) => (
                <MangaCard key={m.id} m={m} />
              ))}
            </div>
          )}
        </ScrollReveal>
      </div>
    </AppShell>
  );
};

export default Manga;
