import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Plus, Star, Clock, Calendar, Globe, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContentCard from "@/components/ContentCard";

import heroImg from "@/assets/hero-chrono-pulse.jpg";
import voidImg from "@/assets/poster-void-horizon.jpg";
import bloomImg from "@/assets/poster-ethereal-bloom.jpg";
import scarletImg from "@/assets/poster-scarlet-night.jpg";
import cyberImg from "@/assets/poster-cyber-pulse.jpg";
import frostImg from "@/assets/poster-frost-heart.jpg";
import stormImg from "@/assets/poster-storm-soul.jpg";

// Mock data — will be replaced by Supabase queries
const mockContent = {
  id: "1",
  title: "Cyber-Gen: Genesis Row",
  description: "In the neon-drenched underbelly of Neo-Tokyo 2187, a rogue AI awakens inside a young mechanic named Ren. As corporate enforcers close in, Ren must decode the secrets buried in his own neural pathways — secrets that could either liberate or annihilate humanity. A breathtaking cyberpunk saga of identity, rebellion, and the thin line between human and machine.",
  type: "series" as const,
  release_year: 2024,
  rating: 9.6,
  poster_url: voidImg,
  banner_url: heroImg,
  duration_minutes: 24,
  language: "Japanese",
  status: "ongoing" as const,
  genres: ["Cyberpunk", "Action", "Sci-Fi", "Drama"],
};

const mockEpisodes = [
  { id: "e1", episode_number: 1, season_number: 1, title: "Awakening Protocol", duration_seconds: 1440, thumbnail_url: voidImg },
  { id: "e2", episode_number: 2, season_number: 1, title: "Signal Lost", duration_seconds: 1380, thumbnail_url: bloomImg },
  { id: "e3", episode_number: 3, season_number: 1, title: "Neural Drift", duration_seconds: 1500, thumbnail_url: scarletImg },
  { id: "e4", episode_number: 4, season_number: 1, title: "The Glitch in the Machine", duration_seconds: 1450, thumbnail_url: cyberImg },
  { id: "e5", episode_number: 5, season_number: 1, title: "Resonance Frequency", duration_seconds: 1435, thumbnail_url: frostImg },
  { id: "e6", episode_number: 6, season_number: 1, title: "Shadow Protocol", duration_seconds: 1410, thumbnail_url: stormImg },
];

const recommendations = [
  { image: bloomImg, title: "Ethereal Bloom", subtitle: "Fantasy • Adventure" },
  { image: scarletImg, title: "Scarlet Night", subtitle: "Supernatural • Thriller" },
  { image: frostImg, title: "Frost Heart", subtitle: "Fantasy • Drama" },
  { image: stormImg, title: "Storm Soul", subtitle: "Action • Adventure" },
];

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const ContentDetail = () => {
  const { id } = useParams();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const content = mockContent;
  const episodes = mockEpisodes;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Banner */}
      <div className="relative h-[70vh] min-h-[500px]">
        <img
          src={content.banner_url}
          alt={content.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex gap-6 items-end">
            {/* Poster */}
            <div className="hidden sm:block flex-shrink-0 w-48 rounded-xl overflow-hidden neon-glow-purple shadow-2xl">
              <img src={content.poster_url} alt={content.title} className="w-full aspect-[2/3] object-cover" />
            </div>

            {/* Info */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-2">
                {content.genres.map((g) => (
                  <span key={g} className="px-2.5 py-0.5 rounded-md bg-primary/20 text-primary text-xs font-semibold">
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl mb-3">{content.title}</h1>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
                <span className="flex items-center gap-1 text-neon-cyan font-semibold">
                  <Star className="w-4 h-4 fill-current" /> {content.rating}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {content.release_year}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {content.duration_minutes} min/ep
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" /> {content.language}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-neon-cyan/20 text-neon-cyan uppercase">
                  {content.status}
                </span>
              </div>

              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed mb-5 line-clamp-3">{content.description}</p>

              <div className="flex items-center gap-3">
                <Link
                  to={`/watch/${content.id}/e1`}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm hover:bg-primary/90 transition-colors neon-glow-purple"
                >
                  <Play className="w-4 h-4 fill-current" /> Play Now
                </Link>
                <button className="flex items-center gap-2 px-5 py-3 rounded-xl glass text-foreground font-display font-semibold text-sm hover:bg-glass-border/30 transition-colors">
                  <Plus className="w-4 h-4" /> Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl">Episodes</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Season</span>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
              className="glass rounded-lg px-3 py-1.5 text-sm text-foreground bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value={1}>1</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          {episodes.map((ep, idx) => (
            <Link
              key={ep.id}
              to={`/watch/${content.id}/${ep.id}`}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors group ${
                idx === 0 ? "glass neon-glow-purple" : "hover:bg-secondary/50"
              }`}
            >
              <div className="relative w-28 sm:w-36 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                <img src={ep.thumbnail_url} alt={ep.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-background/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-6 h-6 text-foreground fill-current" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {idx === 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">Playing Now</span>}
                  {idx === 1 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan font-bold">Next Up</span>}
                </div>
                <p className="text-sm font-display font-semibold truncate">
                  {String(ep.episode_number).padStart(2, "0")}. {ep.title}
                </p>
                <p className="text-xs text-muted-foreground">{formatDuration(ep.duration_seconds)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Recommendations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <h2 className="font-display font-bold text-xl mb-5">You Might Also Like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {recommendations.map((item, i) => (
            <Link key={i} to={`/content/${i + 10}`}>
              <ContentCard image={item.image} title={item.title} subtitle={item.subtitle} className="w-full" />
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContentDetail;
