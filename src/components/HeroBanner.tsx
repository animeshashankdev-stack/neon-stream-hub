import { Play, Plus } from "lucide-react";
import heroImage from "@/assets/hero-chrono-pulse.jpg";

const HeroBanner = () => {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
      <img
        src={heroImage}
        alt="Chrono Pulse"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-end pb-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <p className="text-neon-cyan font-display font-semibold text-sm tracking-widest uppercase mb-3">
          Trending Series
        </p>
        <h2 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl leading-tight mb-4 max-w-2xl">
          CHRONO PULSE
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mb-8 leading-relaxed">
          In a world where time is a currency, a young mechanic discovers a rhythm that can rewrite history. Experience the masterpiece of the season.
        </p>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm neon-glow-purple transition-all hover:scale-105">
            <Play className="w-4 h-4 fill-current" />
            Play Now
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-foreground font-display font-semibold text-sm transition-all hover:bg-secondary">
            <Plus className="w-4 h-4" />
            Watchlist
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
