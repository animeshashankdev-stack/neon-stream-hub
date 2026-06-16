/**
 * SENPAI.TV - Home Page
 * Cinematic anime streaming experience with immersive scroll animations
 */

import { Link } from 'react-router-dom';
import { Play, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { AppShell, CinematicHero, ScrollReveal, TiltCard, GlowingCard } from '@/components/senpai';
import { useContentList } from '@/hooks/useContent';

const Index = () => {
  const { data: trending, isLoading } = useContentList();

  return (
    <AppShell active="home">
      <div className="space-y-20 pb-20">
        {/* HERO SECTION - Cinematic Introduction */}
        <CinematicHero
          title="Dive Into Anime Heaven"
          subtitle="Stream premium anime, live channels, and manga. Experience cinema-quality streaming with Senpai.tv"
          gradient="violet-teal"
          height="screen"
          actionButton={{
            label: 'Start Streaming Now',
            onClick: () => {},
            color: 'violet',
          }}
          animated
        >
          <div className="flex items-center justify-center gap-4 mt-8">
            <button className="px-6 py-3 bg-senpai-violet/20 border border-senpai-violet/40 text-senpai-violet rounded-lg hover:bg-senpai-violet/30 transition-all font-bold">
              Watch Trailer
            </button>
          </div>
        </CinematicHero>

        {/* FEATURED STATS SECTION */}
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlowingCard color="violet">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-senpai-violet/20 flex items-center justify-center">
                  <Sparkles className="text-senpai-violet" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-senpai-text">10M+</p>
                  <p className="text-senpai-text-dim">Active Members</p>
                </div>
              </div>
            </GlowingCard>

            <GlowingCard color="teal">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-senpai-teal/20 flex items-center justify-center">
                  <Play className="text-senpai-teal" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-senpai-text">4K Ultra</p>
                  <p className="text-senpai-text-dim">Streaming Quality</p>
                </div>
              </div>
            </GlowingCard>

            <GlowingCard color="pink">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-lg bg-senpai-pink/20 flex items-center justify-center">
                  <TrendingUp className="text-senpai-pink" size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-senpai-text">5000+</p>
                  <p className="text-senpai-text-dim">Titles & Episodes</p>
                </div>
              </div>
            </GlowingCard>
          </div>
        </ScrollReveal>

        {/* TRENDING SECTION */}
        <ScrollReveal direction="up">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-cinematic-sm text-senpai-text font-[Bowlby_One]">
                Trending Now
              </h2>
              <Link
                to="/genres"
                className="text-senpai-violet hover:text-senpai-violet-2 text-sm font-bold transition-colors"
              >
                See All →
              </Link>
            </div>

            {/* Trending Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[9/13] bg-senpai-surface rounded-lg animate-pulse"
                    />
                  ))
                : (trending || []).slice(0, 8).map((item, idx) => (
                    <TiltCard key={item.id} intensity={10}>
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
                        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <h3 className="font-bold text-senpai-text text-sm line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="text-xs text-senpai-text-dim mt-1">
                            {item.genres?.slice(0, 2).join(' • ')}
                          </p>

                          {/* Rank Badge */}
                          <div className="absolute top-3 right-3 w-10 h-10 rounded-lg bg-senpai-violet/30 border border-senpai-violet/60 flex items-center justify-center font-bold text-senpai-violet text-sm glow-violet">
                            #{idx + 1}
                          </div>
                        </div>
                      </Link>
                    </TiltCard>
                  ))}
            </div>
          </div>
        </ScrollReveal>

        {/* FEATURED SPOTLIGHT */}
        <ScrollReveal direction="left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="aspect-video rounded-xl overflow-hidden glass-card group hover:glow-violet transition-all">
              <img
                src={trending?.[0]?.poster_url || ''}
                alt="Featured"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-senpai-violet font-bold text-sm uppercase tracking-widest">
                  SPOTLIGHT
                </p>
                <h2 className="text-cinematic text-senpai-text font-[Anton]">
                  {trending?.[0]?.title || 'Explore Premium Content'}
                </h2>
                <p className="text-senpai-text-dim text-lg leading-relaxed">
                  {trending?.[0]?.description || 'Experience the best anime streaming service with thousands of titles in stunning 4K quality.'}
                </p>
              </div>

              <div className="flex gap-3">
                <button className="px-6 py-3 bg-senpai-violet hover:bg-senpai-violet-2 text-senpai-text rounded-lg font-bold transition-all active:scale-95 glow-violet">
                  Watch Now
                </button>
                <button className="px-6 py-3 border border-senpai-violet/40 text-senpai-violet rounded-lg font-bold hover:bg-senpai-violet/10 transition-all">
                  Learn More
                </button>
              </div>

              {/* Info Pills */}
              <div className="flex flex-wrap gap-3">
                {['HD', '2024', 'Studio Original'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-senpai-violet/10 border border-senpai-violet/20 text-senpai-text-dim text-xs rounded-full font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* CONTINUE WATCHING */}
        <ScrollReveal>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-senpai-violet rounded-full" />
              <h2 className="text-cinematic-sm text-senpai-text font-[Bowlby_One]">
                Continue Watching
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="group relative aspect-video rounded-lg overflow-hidden glass-card hover:glow-teal transition-all"
                >
                  <div className="w-full h-full bg-senpai-surface flex items-center justify-center">
                    <Clock className="text-senpai-text-dim" size={32} />
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-senpai-violet/30">
                    <div className="h-full w-1/3 bg-senpai-violet glow-violet" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* RECOMMENDATIONS */}
        <ScrollReveal direction="right">
          <div className="space-y-6">
            <h2 className="text-cinematic-sm text-senpai-text font-[Bowlby_One]">
              Recommended For You
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trending?.slice(0, 8).map((item) => (
                <Link
                  key={item.id}
                  to={`/content/${item.id}`}
                  className="group relative aspect-[9/13] rounded-lg overflow-hidden hover:glow-pink transition-all"
                >
                  <div className="w-full h-full bg-senpai-surface flex items-center justify-center">
                    <Sparkles className="text-senpai-text-dim" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* CTA SECTION */}
        <ScrollReveal>
          <div className="relative rounded-2xl overflow-hidden glass-card p-12 md:p-16 text-center space-y-6 border border-senpai-violet/20 glow-violet">
            {/* Background glow */}
            <div
              className="absolute -top-1/2 -right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle, #a16bff 0%, transparent 70%)',
              }}
            />

            <div className="relative z-10 space-y-4">
              <h3 className="text-4xl font-bold text-senpai-text">
                Ready to Start Your Anime Journey?
              </h3>
              <p className="text-senpai-text-dim text-lg">
                Join millions of anime fans. Stream unlimited anime, manga, and live channels.
              </p>

              <button className="mt-6 px-8 py-4 bg-senpai-violet hover:bg-senpai-violet-2 text-senpai-text rounded-lg font-bold transition-all active:scale-95 glow-violet">
                Sign Up Free
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </AppShell>
  );
};

export default Index;
