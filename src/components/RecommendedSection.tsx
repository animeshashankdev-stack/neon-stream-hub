import frostImg from "@/assets/poster-frost-heart.jpg";
import stormImg from "@/assets/poster-storm-soul.jpg";
import zenImg from "@/assets/poster-whisper-zen.jpg";
import railsImg from "@/assets/poster-hyper-rails.jpg";

interface RecommendedItem {
  title: string;
  image: string;
  rating: string;
  progress: number;
}

const items: RecommendedItem[] = [
  { title: "Frost Heart", image: frostImg, rating: "9.8", progress: 65 },
  { title: "Storm Soul", image: stormImg, rating: "9.2", progress: 30 },
  { title: "Whisper of Zen", image: zenImg, rating: "9.5", progress: 85 },
  { title: "Hyper Rails", image: railsImg, rating: "8.9", progress: 10 },
];

const RecommendedSection = () => {
  return (
    <section className="py-12 px-6 sm:px-12 lg:px-20">
      <h2 className="font-display font-bold text-xl mb-6">Recommended For You</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.title} className="group glass-card rounded-xl overflow-hidden cursor-pointer hover:neon-glow-purple transition-all duration-300">
            <div className="relative aspect-[2/3] overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded-md bg-neon-purple/20 text-neon-purple text-[10px] font-bold">
                  {item.rating} RATING
                </span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-display font-semibold text-sm mb-2">{item.title}</h3>
              <div className="w-full h-1 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-cyan"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{item.progress}% Watched</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecommendedSection;
