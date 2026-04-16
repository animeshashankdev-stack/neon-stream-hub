import { Play, Star } from "lucide-react";

interface ContentCardProps {
  image: string;
  title: string;
  subtitle: string;
  rating?: number | null;
  className?: string;
  rank?: number;
}

const ContentCard = ({ image, title, subtitle, rating, className = "", rank }: ContentCardProps) => {
  return (
    <div className={`group relative flex-shrink-0 w-[160px] sm:w-[180px] cursor-pointer ${className}`}>
      <div className="relative w-full aspect-[2/3] rounded-[20px] overflow-hidden border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(167,139,250,0.4)] group-hover:border-violet-400/50 bg-gradient-to-br from-slate-800 to-slate-950">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          width={512}
          height={768}
        />
        {/* Rank badge */}
        {rank && rank <= 3 && (
          <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 flex items-center justify-center font-black text-xs text-black shadow-lg z-10 border border-white/20">
            #{rank}
          </div>
        )}
        {/* Rating */}
        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-[10px] font-bold text-yellow-400">{rating}</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A1A]/90 via-transparent to-transparent opacity-80" />
        {/* Hover slide-up info */}
        <div className="absolute bottom-0 w-full p-3 bg-white/5 backdrop-blur-md border-t border-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-xs text-white truncate mb-0.5">{title}</h3>
          <p className="text-[10px] text-white/50 truncate">{subtitle}</p>
        </div>
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <Play className="w-4 h-4 text-white fill-current ml-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
