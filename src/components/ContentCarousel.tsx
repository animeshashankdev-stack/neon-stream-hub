import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContentCarouselProps {
  title: string;
  action?: string;
  children: React.ReactNode;
}

const ContentCarousel = ({ title, action, children }: ContentCarouselProps) => {
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
      <div className="flex items-center justify-between mb-5 px-6 sm:px-12 lg:px-20">
        <h2 className="font-display font-bold text-xl">{title}</h2>
        <div className="flex items-center gap-3">
          {action && (
            <button className="text-sm text-neon-cyan font-medium hover:underline">
              {action}
            </button>
          )}
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-lg glass text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-lg glass text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-6 sm:px-12 lg:px-20"
      >
        {children}
      </div>
    </section>
  );
};

export default ContentCarousel;
