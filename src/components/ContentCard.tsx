import { Play, Star } from "lucide-react";

interface ContentCardProps {
  image: string;
  title: string;
  subtitle: string;
  rating?: number | null;
  className?: string;
}

const ContentCard = ({ image, title, subtitle, rating, className = "" }: ContentCardProps) => {
  return (
    <div className={`group relative flex-shrink-0 w-44 sm:w-52 cursor-pointer ${className}`}>
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden glass-card transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_0_30px_hsl(265_90%_60%/0.2)]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          width={512}
          height={768}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {rating && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/70 backdrop-blur-sm">
            <Star className="w-3 h-3 text-accent fill-current" />
            <span className="text-[10px] font-bold text-accent">{rating}</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary/90 text-primary-foreground text-xs font-semibold backdrop-blur-sm">
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
