import React from "react";
import { Sparkles } from "lucide-react";

export function SenpaiLogo({ size = 36, tagline }: { size?: number; tagline?: boolean }) {
  return (
    <div className="flex items-center gap-3" style={{ fontSize: size }} aria-label="Senpai.tv">
      <div
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 grid place-items-center text-white font-black shadow-[0_0_20px_rgba(255,72,214,0.25)]"
        style={{ width: size, height: size }}
      >
        <span className="senpai-display leading-none" style={{ fontSize: Math.max(14, size * 0.42) }}>
          先
        </span>
      </div>
      {tagline && (
        <div className="hidden sm:block">
          <div className="senpai-display text-sm font-black tracking-widest">SENPAI</div>
          <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest flex items-center gap-1">
            <Sparkles size={12} className="text-amber-300" /> stream beyond
          </div>
        </div>
      )}
    </div>
  );
}

