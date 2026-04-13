import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ContentCarousel from "@/components/ContentCarousel";
import ContentCard from "@/components/ContentCard";
import PopularAnimeSection from "@/components/PopularAnimeSection";
import RecommendedSection from "@/components/RecommendedSection";
import Footer from "@/components/Footer";

import voidImg from "@/assets/poster-void-horizon.jpg";
import bloomImg from "@/assets/poster-ethereal-bloom.jpg";
import scarletImg from "@/assets/poster-scarlet-night.jpg";
import cyberImg from "@/assets/poster-cyber-pulse.jpg";

const trendingItems = [
  { image: voidImg, title: "Void Horizon", subtitle: "Action • Sci-Fi • Ep 12/24" },
  { image: bloomImg, title: "Ethereal Bloom", subtitle: "Fantasy • Adventure • Movie" },
  { image: scarletImg, title: "Scarlet Night", subtitle: "Supernatural • Thriller • Ep 8/12" },
  { image: cyberImg, title: "Cyber Pulse", subtitle: "Cyberpunk • Drama • Ep 20/24" },
  { image: voidImg, title: "Void Horizon S2", subtitle: "Action • Sci-Fi • Ep 4/24" },
  { image: bloomImg, title: "Ethereal Bloom II", subtitle: "Fantasy • Adventure • Movie" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroBanner />

      <ContentCarousel title="Trending Now" action="View All">
        {trendingItems.map((item, i) => (
          <ContentCard key={i} {...item} />
        ))}
      </ContentCarousel>

      <PopularAnimeSection />
      <RecommendedSection />
      <Footer />
    </div>
  );
};

export default Index;
