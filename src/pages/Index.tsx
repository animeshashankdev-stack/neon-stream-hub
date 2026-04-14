import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ContentCarousel from "@/components/ContentCarousel";
import ContentCard from "@/components/ContentCard";
import PopularAnimeSection from "@/components/PopularAnimeSection";
import RecommendedSection from "@/components/RecommendedSection";
import ContinueWatchingSection from "@/components/ContinueWatchingSection";
import Footer from "@/components/Footer";
import SkeletonCard from "@/components/SkeletonCard";
import { useContentList } from "@/hooks/useContent";

const Index = () => {
  const { data: trending, isLoading } = useContentList();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner />
      <ContinueWatchingSection />

      <ContentCarousel title="Trending Now" action="View All">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : (trending || []).map((item) => (
              <Link key={item.id} to={`/content/${item.id}`}>
                <ContentCard
                  image={item.poster_url || ""}
                  title={item.title}
                  subtitle={item.genres?.join(" • ") || ""}
                  rating={item.rating}
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
