import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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

  const canonical = "https://ani.shashanksv.com/";
  const seoTitle = "Senpai.tv — Anime, Cartoons & Series, your way";
  const seoDesc =
    "Stream anime, cartoons, movies and series in 4K with a clean, ad-light player. Pick your language, season and quality.";
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: (trending || []).slice(0, 20).map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://ani.shashanksv.com/content/${item.id}`,
      name: item.title,
    })),
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] bg-gradient-to-br from-[#1a1a2e] via-[#1a1a2e] to-[#141428] text-white">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content="https://ani.shashanksv.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDesc} />
        <meta name="twitter:image" content="https://ani.shashanksv.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
      </Helmet>
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

      {/* Crawlable series index — helps search engines discover every title */}
      <nav aria-label="All titles" className="max-w-7xl mx-auto px-6 md:px-12 py-10 border-t border-white/5">
        <h2 className="text-white/70 text-xs uppercase tracking-[0.25em] mb-4">Browse all titles</h2>
        <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-1 text-xs text-white/40">
          {(trending || []).map((item) => (
            <li key={item.id} className="truncate">
              <Link to={`/content/${item.id}`} className="hover:text-[#4ade80] transition-colors">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Footer />
    </div>
  );
};

export default Index;
