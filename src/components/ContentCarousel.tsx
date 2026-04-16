import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContentCarouselProps {
  title: string;
  action?: string;
  accentColor?: string;
  children: React.ReactNode;
}

const ContentCarousel = ({ title, action, accentColor = "from-teal-400 to-cyan-500", children }: ContentCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6 px-6 sm:px-12 lg:px-20">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-7 rounded-full bg-gradient-to-b ${accentColor} shadow-[0_0_10px_rgba(45,212,191,0.5)]`} />
          <h2 className="text-2xl font-display font-black tracking-tight text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {action && (
            <button className="text-sm font-bold text-teal-400 hover:text-teal-300 transition-colors bg-teal-400/10 hover:bg-teal-400/20 px-4 py-1.5 rounded-full border border-teal-400/20">
              {action} →
            </button>
          )}
          <button
            onClick={() => scroll("left")}
            className="p-2 rounded-full bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors backdrop-blur-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 rounded-full bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors backdrop-blur-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide px-6 sm:px-12 lg:px-20"
      >
        {children}
      </div>
    </section>
  );
};

export default ContentCarousel;
