import { Play } from "lucide-react";

interface ContentCardProps {
  image: string;
  title: string;
  subtitle: string;
  className?: string;
}

const ContentCard = ({ image, title, subtitle, className = "" }: ContentCardProps) => {
  return (
    <div className={`group relative flex-shrink-0 w-44 sm:w-52 cursor-pointer ${className}`}>
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden glass-card transition-all duration-300 group-hover:scale-105 group-hover:neon-glow-purple">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          width={512}
          height={768}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/90 text-primary-foreground text-xs font-semibold">
            <Play className="w-3.5 h-3.5 fill-current" />
            Watch
          </div>
        </div>
      </div>
      <h3 className="mt-3 text-sm font-display font-semibold truncate">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
};

export default ContentCard;
