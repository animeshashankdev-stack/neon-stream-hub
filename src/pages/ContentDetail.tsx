import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Play, Plus, Check, Star, Film } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmartImage from "@/components/SmartImage";
import { useContentDetail, useEpisodes, useRecommendations } from "@/hooks/useContent";
import { useAuth } from "@/contexts/AuthContext";
import { useIsInWatchlist, useToggleWatchlist } from "@/hooks/useWatchlist";

const BEBAS = { fontFamily: "'Bebas Neue', 'Anton', sans-serif", letterSpacing: "0.01em" } as const;
const BARLOW = { fontFamily: "'Barlow', 'Inter', sans-serif" } as const;

const ContentDetail = () => {
  const { id } = useParams();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const { data: content, isLoading } = useContentDetail(id);
  const { data: episodes } = useEpisodes(id);
  const { data: recommendations } = useRecommendations(id);
  const { user } = useAuth();
  const { data: isInWatchlist } = useIsInWatchlist(id);
  const toggleWatchlist = useToggleWatchlist();

  const seasons = useMemo(() => [...new Set(episodes?.map((e) => e.season_number) || [1])], [episodes]);
  const filteredEpisodes = useMemo(
    () => episodes?.filter((e) => e.season_number === selectedSeason) || [],
    [episodes, selectedSeason],
  );
  const firstEpisode = filteredEpisodes[0];

  useEffect(() => {
    if (seasons.length && !seasons.includes(selectedSeason)) setSelectedSeason(seasons[0]);
  }, [seasons, selectedSeason]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] text-white" style={BARLOW}>
        <Navbar />
        <div className="pt-24 max-w-7xl mx-auto p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 md:row-span-2 h-[420px] rounded-3xl bg-white/5 animate-pulse" />
            <div className="rounded-3xl bg-white/5 animate-pulse h-[420px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] text-white" style={BARLOW}>
        <Navbar />
        <div className="pt-32 text-center text-white/50">Content not found.</div>
      </div>
    );
  }

  const progress = filteredEpisodes.length > 0 ? Math.round((1 / filteredEpisodes.length) * 100) : 0;
  const canonicalUrl = `https://ani.shashanksv.com/content/${content.id}`;
  const seoTitle = `${content.title}${content.release_year ? ` (${content.release_year})` : ""} — Watch on Senpai.tv`;
  const seoDesc = (content.description || `Stream ${content.title} on Senpai.tv in HD.`).slice(0, 155);
  const ogImage = content.banner_url || content.poster_url || content.thumbnail_url || "";
  const schema = {
    "@context": "https://schema.org",
    "@type": content.type === "series" ? "TVSeries" : "Movie",
    name: content.title,
    description: content.description || undefined,
    image: ogImage || undefined,
    genre: content.genres || undefined,
    datePublished: content.release_year ? String(content.release_year) : undefined,
    aggregateRating: content.rating
      ? { "@type": "AggregateRating", ratingValue: content.rating, bestRating: 10, ratingCount: 1 }
      : undefined,
    numberOfEpisodes: content.type === "series" ? episodes?.length : undefined,
    url: canonicalUrl,
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: origin || "/" },
      { "@type": "ListItem", position: 2, name: content.type === "series" ? "Series" : "Movies", item: `${origin}/genres` },
      { "@type": "ListItem", position: 3, name: content.title, item: canonicalUrl },
    ],
  };

  return (
    <div className="min-h-screen w-full bg-[#1a1a2e] text-white relative overflow-hidden pb-24" style={BARLOW}>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:type" content={content.type === "series" ? "video.tv_show" : "video.movie"} />
        <meta property="og:url" content={canonicalUrl} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
      </Helmet>
      <Navbar />

      {/* Ambient Aurora */}
      <div className="pointer-events-none absolute top-[-15%] left-[-5%] w-[600px] h-[600px] bg-[#a78bfa]/15 rounded-full blur-[140px] animate-pulse" />
      <div
        className="pointer-events-none absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#4ade80]/10 rounded-full blur-[140px] animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto pt-24 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-min">
          {/* Hero Poster Tile */}
          <div className="md:col-span-3 md:row-span-2 relative min-h-[420px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(167,139,250,0.12)] group">
            <SmartImage
              src={content.banner_url}
              fallbacks={[content.poster_url, content.thumbnail_url]}
              alt={content.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              debugLabel={`hero:${content.title}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#16213e] via-[#16213e]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a1a2e]/70 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {content.status && (
                  <span className="px-3 py-1 bg-[#4ade80] text-[#1a1a2e] font-bold text-[10px] rounded-full uppercase tracking-widest">
                    {content.status}
                  </span>
                )}
                {content.genres?.length ? (
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                    {content.genres.slice(0, 3).join(" • ")}
                  </span>
                ) : null}
              </div>
              <h1
                className="text-5xl md:text-7xl lg:text-8xl text-white leading-[0.85] mb-6 uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                style={BEBAS}
              >
                {content.title}
              </h1>
              <div className="flex flex-wrap gap-3">
                {firstEpisode ? (
                  <Link
                    to={`/watch/${content.id}/${firstEpisode.id}`}
                    className="px-8 md:px-10 py-3.5 bg-[#4ade80] text-[#1a1a2e] font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(74,222,128,0.35)]"
                    style={{ ...BEBAS, letterSpacing: "0.12em" }}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {content.type === "series" ? `Start S${selectedSeason} E${firstEpisode.episode_number}` : "Start Watching"}
                  </Link>
                ) : null}
                {user ? (
                  <button
                    onClick={() => toggleWatchlist.mutate(content.id)}
                    className="px-6 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2"
                    style={BEBAS}
                  >
                    {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isInWatchlist ? "In Watchlist" : "Watchlist"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Metadata Tile */}
          <div className="md:col-span-1 md:row-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-[0_0_20px_rgba(74,222,128,0.05)]">
            <div className="space-y-6">
              <div>
                <p className="text-[#4ade80] text-xs uppercase font-bold tracking-[0.2em] mb-2">Global Score</p>
                <p className="text-5xl text-white flex items-baseline gap-2" style={BEBAS}>
                  {content.rating?.toFixed(2) ?? "—"}
                  <span className="text-sm text-white/40 font-normal uppercase">/10</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Year</p>
                  <p className="text-white text-sm font-semibold">{content.release_year ?? "—"}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">
                    {content.type === "series" ? "Episodes" : "Runtime"}
                  </p>
                  <p className="text-white text-sm font-semibold">
                    {content.type === "series"
                      ? `${episodes?.length ?? 0}`
                      : content.duration_minutes
                      ? `${content.duration_minutes}m`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Type</p>
                  <p className="text-white text-sm font-semibold capitalize">{content.type}</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest mb-1">Language</p>
                  <p className="text-white text-sm font-semibold">{content.language ?? "—"}</p>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-white/5">
              <div className="flex -space-x-3 overflow-hidden mb-2">
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#1a1a2e] bg-[#a78bfa] flex items-center justify-center text-[10px] text-white font-bold">
                  YR
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#1a1a2e] bg-[#4ade80] flex items-center justify-center text-[10px] text-[#1a1a2e] font-bold">
                  KI
                </div>
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-[#1a1a2e] bg-white/20 flex items-center justify-center text-[10px] text-white font-bold">
                  +
                </div>
              </div>
              <p className="text-[10px] text-white/40">Watching now on Yorukai</p>
            </div>
          </div>

          {/* Synopsis Tile */}
          <div className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h3 className="text-[#4ade80] text-2xl mb-4 tracking-wider uppercase" style={BEBAS}>
              Synopsis
            </h3>
            <p className="text-white/70 leading-relaxed text-sm font-light">
              {content.description || "No synopsis available yet."}
            </p>
          </div>

          {/* Episodes / About Tile */}
          <div className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-2xl tracking-wider uppercase" style={BEBAS}>
                {content.type === "series" ? "Episodes" : "About"}
              </h3>
              {content.type === "series" && filteredEpisodes.length > 0 && (
                <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]"
                    style={{ width: `${Math.max(4, progress)}%` }}
                  />
                </div>
              )}
            </div>

            {seasons.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {seasons.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeason(s)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                      selectedSeason === s
                        ? "bg-[#a78bfa]/20 text-[#a78bfa] border-[#a78bfa]/40"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    S{s}
                  </button>
                ))}
              </div>
            )}

            {content.type === "series" && filteredEpisodes.length > 0 ? (
              <div className="space-y-2 overflow-y-auto max-h-[240px] pr-2 scrollbar-hide">
                {filteredEpisodes.map((ep) => (
                  <Link
                    key={ep.id}
                    to={`/watch/${content.id}/${ep.id}`}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span
                        className="text-[#4ade80] text-xl shrink-0 w-8"
                        style={BEBAS}
                      >
                        {String(ep.episode_number).padStart(2, "0")}
                      </span>
                      <p className="text-white text-sm font-medium truncate group-hover:text-[#a78bfa] transition-colors">
                        {ep.title || `Episode ${ep.episode_number}`}
                      </p>
                    </div>
                    <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center shrink-0 group-hover:border-[#4ade80]/50">
                      <Play className="w-3 h-3 text-white/60 fill-current group-hover:text-[#4ade80]" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-sm">
                {content.genres?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {content.genres.map((g) => (
                      <span
                        key={g}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] text-white/60 uppercase tracking-widest"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/50 text-sm flex items-center gap-2">
                    <Film className="w-4 h-4" /> Feature presentation ready to stream.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Related Content Rail */}
          {recommendations && recommendations.length > 0 && (
            <div className="md:col-span-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-2xl tracking-wider uppercase" style={BEBAS}>
                  More Like This
                </h3>
                <span className="text-[#a78bfa] text-xs font-bold uppercase tracking-widest">
                  {recommendations.length} titles
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {recommendations.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    to={`/content/${item.id}`}
                    className="aspect-[3/4] rounded-2xl overflow-hidden relative group border border-white/5 hover:border-[#4ade80]/40 transition-all"
                  >
                    <SmartImage
                      src={item.poster_url}
                      fallbacks={[item.thumbnail_url, item.banner_url]}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      debugLabel={`rec:${item.title}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-3">
                      <p className="text-white text-xs font-bold truncate">{item.title}</p>
                      {item.rating ? (
                        <div className="flex items-center gap-1 text-[10px] text-[#4ade80] mt-0.5">
                          <Star className="w-3 h-3 fill-current" /> {item.rating}
                        </div>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContentDetail;
