export function SenpaiLoader({ label = "Loading", size = 64 }: { label?: string; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* outer rotating gradient ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent, #a16bff, #ff48d6, #ff7a2e, #2af0d9, transparent)",
            animation: "senpai-spin 1.4s linear infinite",
            mask: "radial-gradient(circle, transparent 60%, black 61%)",
            WebkitMask: "radial-gradient(circle, transparent 60%, black 61%)",
          }}
        />
        {/* inner counter-rotating */}
        <div
          className="absolute rounded-full"
          style={{
            inset: size * 0.18,
            background: "conic-gradient(from 180deg, transparent, #2af0d9, transparent 50%)",
            animation: "senpai-spin 0.9s linear infinite reverse",
            mask: "radial-gradient(circle, transparent 55%, black 56%)",
            WebkitMask: "radial-gradient(circle, transparent 55%, black 56%)",
          }}
        />
        {/* center kana */}
        <div className="absolute inset-0 grid place-items-center">
          <span className="senpai-jp font-black text-white" style={{ fontSize: size * 0.32, animation: "senpai-pulse 1.6s ease-in-out infinite" }}>先</span>
        </div>
      </div>
      <div className="text-[10px] text-white/60 tracking-[0.4em] uppercase senpai-mono">{label}</div>
    </div>
  );
}
