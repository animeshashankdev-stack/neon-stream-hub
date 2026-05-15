import { Link } from "react-router-dom";

export function SenpaiLogo({ size = 36, tagline = false }: { size?: number; tagline?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
      <div
        className="relative grid place-items-center rounded-xl overflow-hidden"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #a16bff 0%, #ff48d6 50%, #ff7a2e 100%)",
          boxShadow: "0 0 24px rgba(255,72,214,0.45), inset 0 0 0 1px rgba(255,255,255,0.18)",
        }}
      >
        <span
          className="senpai-jp font-black text-white"
          style={{ fontSize: size * 0.5, lineHeight: 1, transform: "translateY(-1px)" }}
        >
          先
        </span>
        <span className="absolute inset-0 senpai-shimmer opacity-40 group-hover:opacity-80 transition" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="senpai-display text-[15px] tracking-tight text-white">SENPAI</span>
        {tagline && (
          <span className="senpai-mono text-[8px] uppercase tracking-[0.32em] text-white/45 mt-0.5">
            curated · neon
          </span>
        )}
      </div>
    </Link>
  );
}