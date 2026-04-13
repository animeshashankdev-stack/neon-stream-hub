import skyboundImg from "@/assets/poster-skybound-realm.jpg";
import silentPeakImg from "@/assets/poster-silent-peak.jpg";
import dreamWeaverImg from "@/assets/poster-dream-weaver.jpg";
import neonDriftersImg from "@/assets/poster-neon-drifters.jpg";

const featured = {
  title: "Skybound Realm",
  description: "Discover the legend of the floating continents and the explorers who dare to cross the infinite blue.",
  image: skyboundImg,
  badge: "#1 THIS WEEK",
};

const sideItems = [
  { title: "Silent Peak", image: silentPeakImg },
  { title: "Dream Weaver", image: dreamWeaverImg },
  { title: "Neon Drifters", image: neonDriftersImg },
];

const PopularAnimeSection = () => {
  return (
    <section className="py-12 px-6 sm:px-12 lg:px-20">
      <h2 className="font-display font-bold text-xl mb-6">Popular Anime</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Card */}
        <div className="lg:col-span-2 relative rounded-2xl overflow-hidden glass-card group cursor-pointer">
          <img
            src={featured.image}
            alt={featured.title}
            className="w-full h-72 sm:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full bg-neon-cyan/20 text-neon-cyan text-xs font-bold tracking-wider">
              {featured.badge}
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="font-display font-bold text-2xl mb-2">{featured.title}</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-4">{featured.description}</p>
            <button className="px-5 py-2 rounded-lg bg-primary/20 text-primary text-sm font-semibold hover:bg-primary/30 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Side Stack */}
        <div className="flex flex-col gap-4">
          {sideItems.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 glass-card p-3 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-16 h-20 rounded-lg object-cover flex-shrink-0"
                loading="lazy"
              />
              <h4 className="font-display font-semibold text-sm">{item.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularAnimeSection;
