const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div className={`flex-shrink-0 w-44 sm:w-52 ${className}`}>
    <div className="aspect-[2/3] rounded-xl bg-secondary animate-pulse" />
    <div className="mt-3 h-4 w-3/4 rounded bg-secondary animate-pulse" />
    <div className="mt-1.5 h-3 w-1/2 rounded bg-secondary/60 animate-pulse" />
  </div>
);

export default SkeletonCard;
