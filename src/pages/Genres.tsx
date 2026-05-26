/**
 * SENPAI.TV - Genres/Browse Page
 * Cinematic genre discovery with editorial layouts
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { AppShell, ScrollReveal, TiltCard, GlowingCard } from '@/components/senpai';
import { useContentList, useGenres, ContentItem } from '@/hooks/useContent';

const Genres = () => {
  const { data: genres, isLoading: genresLoading } = useGenres();
  const { data: allContent, isLoading: contentLoading } = useContentList();
  const [activeGenre, setActiveGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const grouped = useMemo(() => {
    if (!allContent || !genres) return [];
    const map = new Map<string, ContentItem[]>();
    for (const item of allContent) {
      for (const g of item.genres || []) {
        if (!map.has(g)) map.set(g, []);
        map.get(g)!.push(item);
      }
    }
    return (genres as Array<{ name: string; slug: string }>)
      .map((g) => ({ name: g.name, slug: g.slug, items: map.get(g.name) || [] }))
      .filter((g) => g.items.length > 0);
  }, [allContent, genres]);

  const filtered = useMemo(() => {
    let result = grouped;
    if (activeGenre) {
      result = result.filter((g) => g.slug === activeGenre);
    }
    if (searchQuery) {
      result = result.map((g) => ({
        ...g,
        items: g.items.filter((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((g) => g.items.length > 0);
    }
    return result;
  }, [grouped, activeGenre, searchQuery]);

  const isLoading = genresLoading || contentLoading;

  return (
    <AppShell active="browse">
      <div className="space-y-12 pb-20">
        {/* HERO SECTION */}
        <ScrollReveal>
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-cinematic text-senpai-text font-[Anton]">
                Discover Your Next Favorite
              </h1>
              <p className="text-senpai-text-dim text-lg">
                Explore thousands of anime across every genre
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex gap-3 flex-col sm:flex-row">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-senpai-text-dim"
                />
                <input
                  type="text"
                  placeholder="Search within genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-senpai-surface border border-white/10 focus:border-senpai-violet/40 text-senpai-text placeholder:text-senpai-text-dim outline-none transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-senpai-surface border border-white/10 hover:border-senpai-violet/40 text-senpai-text transition-all">
                <Filter size={18} />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* GENRE CAROUSEL */}
        <ScrollReveal>
          <div className="space-y-4">
            <p className="text-sm text-senpai-text-dim uppercase tracking-widest font-bold">
              Browse by Genre
            </p>
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {(genres || []).map((g: any) => (
                <button
                  key={g.id}
                  onClick={() =>
                    setActiveGenre(activeGenre === g.slug ? null : g.slug)
                  }
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                    activeGenre === g.slug
                      ? 'bg-senpai-violet/30 border-senpai-violet/60 text-senpai-violet glow-violet'
                      : 'bg-senpai-surface border-white/10 text-senpai-text-dim hover:text-senpai-text hover:border-white/20'
                  } border`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CONTENT GRID */}
        {isLoading ? (
          <div className="space-y-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-32 bg-senpai-surface rounded-lg animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div
                      key={j}
                      className="aspect-[9/13] bg-senpai-surface rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-senpai-text-dim text-lg">No genres found</p>
            <button
              onClick={() => {
                setActiveGenre(null);
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-senpai-violet hover:bg-senpai-violet-2 text-senpai-text rounded-lg font-bold transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {filtered.map((genre, genreIdx) => (
              <ScrollReveal key={genre.slug} delay={genreIdx * 50}>
                <section
                  id={`genre-${genre.slug}`}
                  className="scroll-mt-24 space-y-6"
                >
                  {/* Genre Header */}
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="flex items-baseline gap-3">
                      <div className="w-2 h-8 bg-gradient-to-b from-senpai-violet to-senpai-teal rounded-full" />
                      <div>
                        <h2 className="text-cinematic-sm text-senpai-text font-[Bowlby_One]">
                          {genre.name}
                        </h2>
                        <p className="text-xs text-senpai-text-dim mt-1">
                          {genre.items.length} title
                          {genre.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/search?genre=${genre.name}`}
                      className="text-xs text-senpai-violet hover:text-senpai-violet-2 font-bold transition-colors whitespace-nowrap"
                    >
                      View All →
                    </Link>
                  </div>

                  {/* Content Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {genre.items.map((item, itemIdx) => (
                      <TiltCard key={item.id} intensity={8}>
                        <Link
                          to={`/content/${item.id}`}
                          className="group relative aspect-[9/13] rounded-lg overflow-hidden glass-card hover:glow-violet transition-all duration-300"
                        >
                          {/* Image */}
                          <img
                            src={item.poster_url || ''}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-senpai-bg via-transparent to-transparent" />

                          {/* Content */}
                          <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <h3 className="font-bold text-senpai-text text-xs line-clamp-2">
                              {item.title}
                            </h3>
                            {item.rating && (
                              <p className="text-xs text-senpai-text-dim mt-1">
                                ⭐ {item.rating.toFixed(1)}
                              </p>
                            )}
                          </div>
                        </Link>
                      </TiltCard>
                    ))}
                  </div>
                </section>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Genres;
