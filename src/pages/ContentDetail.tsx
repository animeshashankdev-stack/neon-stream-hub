import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Plus, Check, Star, Clock, Calendar, Globe, ChevronDown, Share2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentCard from "@/components/ContentCard";
import { useContentDetail, useEpisodes, useRecommendations } from "@/hooks/useContent";
import { useAuth } from "@/contexts/AuthContext";
import { useIsInWatchlist, useToggleWatchlist } from "@/hooks/useWatchlist";
import { Badge } from "@/components/ui/badge";

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const ContentDetail = () => {
  const { id } = useParams();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedLang, setSelectedLang] = useState<string>("");
  const { data: content, isLoading } = useContentDetail(id);
  const { data: episodes } = useEpisodes(id);
  const { data: recommendations } = useRecommendations(id);
  const { user } = useAuth();
  const { data: isInWatchlist } = useIsInWatchlist(id);
  const toggleWatchlist = useToggleWatchlist();

  const seasons = [...new Set(episodes?.map((e) => e.season_number) || [1])];
  const filteredEpisodes = episodes?.filter((e) => e.season_number === selectedSeason) || [];
  const firstEpisode = filteredEpisodes[0];

  // Language options derived from content + a sane default list
  const languageOptions = [content?.language, "English (Dub)", "Japanese (Sub)", "Spanish", "Hindi"]
    .filter((v, i, a): v is string => !!v && a.indexOf(v) === i);

  useEffect(() => {
    if (!selectedLang && languageOptions[0]) setSelectedLang(languageOptions[0]);
  }, [languageOptions, selectedLang]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D0A2A] to-[#1A0F3E]">
        <Navbar />
        <div className="h-[65vh] bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0D0A2A] to-[#1A0F3E] text-white">
        <Navbar />
        <div className="pt-24 text-center">
          <p className="text-white/50">Content not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D0A2A] to-[#1A0F3E] text-white pb-24">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative w-full h-[65vh] min-h-[450px] flex pt-16 z-10">
        {/* Left Art Area */}
        <div className="w-1/2 h-full relative overflow-hidden hidden md:flex items-end">
          <img
            src={content.banner_url || content.poster_url || ""}
            alt={content.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D0A2A] via-[#0D0A2A]/60 to-transparent z-10" />
          <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-[#0D0A2A] to-transparent z-20" />
        </div>

        {/* Right Content Box */}
        <div className="w-full md:w-1/2 h-full flex items-center justify-center p-6 md:p-8 relative z-20">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[28px] p-6 md:p-8 w-full max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_0_20px_rgba(255,255,255,0.05)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal-500/20 to-transparent rounded-bl-full pointer-events-none" />

            <h1 className="font-display font-black text-3xl lg:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 uppercase tracking-tight mb-2">
              {content.title}
            </h1>

            {/* Rating */}
            {content.rating && (
              <div className="flex items-center gap-1 text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(content.rating! / 2) ? "fill-current" : "opacity-30"}`} />
                ))}
                <span className="font-bold text-white ml-2 text-lg">{content.rating}</span>
              </div>
            )}

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {content.genres?.map((g) => (
                <Badge key={g} variant="outline" className="rounded-full bg-white/10 border-white/20 px-4 py-1.5 text-xs font-medium text-white shadow-sm">
                  {g}
                </Badge>
              ))}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-white/60 mb-4 flex-wrap">
              {content.release_year && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {content.release_year}</span>}
              {content.duration_minutes && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {content.duration_minutes}min</span>}
              {content.language && <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {content.language}</span>}
              {content.status && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-400 uppercase">{content.status}</span>
              )}
            </div>

            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-lg line-clamp-3">
              {content.description}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {firstEpisode && (
                <Link
                  to={`/watch/${content.id}/${firstEpisode.id}`}
                  className="rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 text-black font-bold px-8 py-3 shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:shadow-[0_0_30px_rgba(45,212,191,0.6)] transition-all flex items-center gap-2 text-sm"
                >
                  <Play className="w-4 h-4 fill-current" /> Play Episode 1
                </Link>
              )}
              {user && (
                <button
                  onClick={() => toggleWatchlist.mutate(content.id)}
                  className="rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold px-6 py-3 hover:bg-white/20 transition-all flex items-center gap-2 text-sm"
                >
                  {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isInWatchlist ? "In Watchlist" : "Watchlist"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes & Sidebar */}
      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col lg:flex-row gap-12 relative z-20">
        {/* Episodes */}
        {content.type === "series" && filteredEpisodes.length > 0 && (
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-teal-400 to-cyan-500" />
                <h3 className="text-2xl font-display font-bold tracking-tight">Episodes</h3>
              </div>
              {seasons.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {seasons.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSeason(s)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        selectedSeason === s
                          ? "bg-teal-400/20 text-teal-400 border-teal-400/30 shadow-[0_0_10px_rgba(45,212,191,0.3)]"
                          : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      Season {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {filteredEpisodes.map((ep, idx) => (
                <Link
                  key={ep.id}
                  to={`/watch/${content.id}/${ep.id}`}
                  className="group flex flex-col sm:flex-row gap-4 p-4 rounded-[16px] bg-white/5 border border-white/10 hover:border-violet-400/40 hover:shadow-[0_0_15px_rgba(167,139,250,0.2)] transition-all cursor-pointer items-center"
                >
                  <div className="relative w-full sm:w-36 aspect-video rounded-[12px] bg-gradient-to-br from-slate-800 to-slate-950 overflow-hidden shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-black text-3xl text-white/20 group-hover:text-white/40 transition-colors">{String(ep.episode_number).padStart(2, "0")}</span>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center flex-1 min-w-0 py-1">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className="text-base font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                        {ep.title || `Episode ${ep.episode_number}`}
                      </h4>
                      {ep.duration_seconds && (
                        <Badge variant="outline" className="rounded-full bg-white/10 border-none text-[10px] text-white/70 px-2 shrink-0">
                          {formatDuration(ep.duration_seconds)}
                        </Badge>
                      )}
                    </div>
                    {ep.description && <p className="text-white/60 text-xs leading-relaxed line-clamp-2">{ep.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Sidebar: Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="w-full lg:w-[320px] shrink-0 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-orange-400 to-yellow-400" />
                <h4 className="font-display font-bold text-lg">More Like This</h4>
              </div>
              <div className="space-y-4">
                {recommendations.slice(0, 6).map((item) => (
                  <Link key={item.id} to={`/content/${item.id}`} className="flex gap-4 items-center group cursor-pointer">
                    <div className="w-14 aspect-[2/3] rounded-[10px] bg-gradient-to-br from-slate-800 to-slate-950 overflow-hidden shrink-0 border border-white/10 group-hover:border-teal-400/50 transition-colors">
                      <img src={item.poster_url || ""} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors line-clamp-1 mb-1">{item.title}</h5>
                      {item.rating && (
                        <div className="flex items-center gap-1 text-[10px] text-yellow-400">
                          <Star className="w-3 h-3 fill-current" /> {item.rating}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* About card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 rounded-full bg-gradient-to-b from-teal-400 to-cyan-500" />
                <h4 className="font-display font-bold text-lg">About</h4>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50 font-medium">Type</span>
                  <span className="font-bold text-white capitalize">{content.type}</span>
                </div>
                {content.status && (
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/50 font-medium">Status</span>
                    <span className="font-bold text-white capitalize">{content.status}</span>
                  </div>
                )}
                {content.language && (
                  <div className="flex justify-between pb-2">
                    <span className="text-white/50 font-medium">Language</span>
                    <span className="font-bold text-white">{content.language}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {content.genres && content.genres.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-pink-400 to-rose-400" />
                  <h4 className="font-display font-bold text-lg">Tags</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {content.genres.map((tag) => (
                    <Badge key={tag} variant="outline" className="rounded-full bg-teal-400/10 border-teal-400/30 text-teal-300 font-medium text-xs px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ContentDetail;
