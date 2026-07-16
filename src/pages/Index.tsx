import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ContentCarousel from "@/components/ContentCarousel";
import ContentCard from "@/components/ContentCard";
import PopularAnimeSection from "@/components/PopularAnimeSection";
import RecommendedSection from "@/components/RecommendedSection";
import ContinueWatchingSection from "@/components/ContinueWatchingSection";
import RecentlyWatchedRail from "@/components/RecentlyWatchedRail";
import Footer from "@/components/Footer";
import SkeletonCard from "@/components/SkeletonCard";
import { useContentList } from "@/hooks/useContent";
import { Play, User, Bell } from "lucide-react";

const Index = () => {
  const { data: trending, isLoading } = useContentList();

  return (
    <div className="min-h-screen bg-[#1a1a2e] bg-gradient-to-br from-[#1a1a2e] via-[#1a1a2e] to-[#141428] text-white">
      <Navbar />
      <HeroBanner />

      {/* Feature Row — cyber-glass */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-30">
        <div className="p-6 bg-white/[0.02] border border-white/5 hover:border-[#4ade80]/30 rounded-2xl flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-full bg-[#4ade80]/10 flex items-center justify-center text-[#4ade80]">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono">10M+</div>
            <div className="text-xs text-white/40 uppercase tracking-widest">Active Members</div>
          </div>
        </div>
        <div className="p-6 bg-white/[0.02] border border-white/5 hover:border-[#a78bfa]/30 rounded-2xl flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-full bg-[#a78bfa]/10 flex items-center justify-center text-[#a78bfa]">
            <Play className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono">4K Ultra HD</div>
            <div className="text-xs text-white/40 uppercase tracking-widest">High Fidelity</div>
          </div>
        </div>
        <div className="p-6 bg-white/[0.02] border border-white/5 hover:border-[#4ade80]/30 rounded-2xl flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-full bg-[#4ade80]/10 flex items-center justify-center text-[#4ade80]">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl font-bold font-mono">Sub &amp; Dub</div>
            <div className="text-xs text-white/40 uppercase tracking-widest">Native Voiceover</div>
          </div>
        </div>
      </div>

      <ContinueWatchingSection />
      <RecentlyWatchedRail />

      <ContentCarousel title="Trending This Season" action="See All" accentColor="from-pink-400 to-rose-500">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : (trending || []).map((item, idx) => (
              <Link key={item.id} to={`/content/${item.id}`}>
                <ContentCard
                  image={item.poster_url || ""}
                  title={item.title}
                  subtitle={item.genres?.join(" • ") || ""}
                  rating={item.rating}
                  rank={idx + 1}
                />
              </Link>
            ))}
      </ContentCarousel>

      <PopularAnimeSection />
      <RecommendedSection />
      <Footer />
    </div>
  );
};

export default Index;
