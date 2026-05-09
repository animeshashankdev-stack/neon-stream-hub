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
    <div className="min-h-screen bg-gradient-to-br from-[#0F0A2E] via-[#1A0A3E] to-[#0A1628] text-white">
      <Navbar />
      <HeroBanner />

      {/* Stats Row */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 -mt-8 relative z-30 px-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] px-5 md:px-6 py-3 flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
            <User className="w-5 h-5 text-teal-400" />
          </div>
          <p className="font-bold text-white text-sm">10M+ Members</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] px-5 md:px-6 py-3 flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Play className="w-5 h-5 text-violet-400" />
          </div>
          <p className="font-bold text-white text-sm">4K Ultra HD</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] px-5 md:px-6 py-3 flex items-center gap-3 shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-pink-400" />
          </div>
          <p className="font-bold text-white text-sm">Sub & Dub</p>
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
