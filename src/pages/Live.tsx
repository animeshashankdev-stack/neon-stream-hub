import { useMemo, useState } from "react";
import { Search, Tv, Loader2, Radio } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useIPTV, type ResolvedChannel } from "@/hooks/useIPTV";
import LiveChannelPlayer from "@/components/LiveChannelPlayer";

const Live = () => {
  const { data, isLoading, error } = useIPTV();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const [active, setActive] = useState<ResolvedChannel | null>(null);

  const channels = data?.channels || [];
  const countries = data?.countries || [];
  const categories = data?.categories || [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return channels.filter((c) => {
      if (country !== "ALL" && c.country !== country) return false;
      if (category !== "ALL" && !c.categories.includes(category)) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [channels, query, country, category]);

  return (
    <div className="min-h-screen bg-[#080818] text-white font-body">
      <Navbar />

      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
        {/* Hero */}
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] font-bold uppercase tracking-widest mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> Live · Worldwide
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3">
            Live <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-cyan-300 to-fuchsia-400">TV channels</span>
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-2xl">
            Free live channels from around the world, powered by the open IPTV-org community. Pick a country, vibe, or just hit play.
          </p>
        </div>

        {/* Filters */}
        <div className="sticky top-16 z-30 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 mb-6 backdrop-blur-2xl bg-[#080818]/80 border-b border-white/5">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search channels…"
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-teal-400/40"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-teal-400/40 cursor-pointer"
              >
                <option value="ALL">🌐 All countries ({channels.length})</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-teal-400/40 cursor-pointer"
              >
                <option value="ALL">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <div className="flex-1" />
              <div className="text-xs text-white/50 self-center font-medium">
                {filtered.length.toLocaleString()} channels
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-white/60">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400 mb-3" />
            <p className="text-sm">Loading global channel library…</p>
          </div>
        )}
        {error && (
          <div className="text-center py-20 text-white/60">
            <p>Couldn't reach the IPTV directory. Check your connection.</p>
          </div>
        )}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-white/50">
            <Tv className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No channels match your filters.</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filtered.slice(0, 300).map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActive(ch)}
              className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-400/40 rounded-2xl p-3 sm:p-4 transition-all text-left flex flex-col items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(45,212,191,0.15)]"
            >
              <div className="w-full aspect-square rounded-xl bg-black/40 flex items-center justify-center overflow-hidden p-2 relative">
                {ch.logo ? (
                  <img
                    src={ch.logo}
                    alt={ch.name}
                    loading="lazy"
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <Radio className="w-8 h-8 text-white/30" />
                )}
                <span className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-500/80 text-white text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> Live
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white/90 line-clamp-2 text-center w-full leading-tight group-hover:text-teal-300 transition-colors">
                {ch.name}
              </h3>
              <span className="text-base">{ch.flag}</span>
            </button>
          ))}
        </div>

        {filtered.length > 300 && (
          <p className="text-center text-xs text-white/40 mt-8">
            Showing first 300 results — refine your search to find more.
          </p>
        )}
      </main>

      <Footer />

      {active && <LiveChannelPlayer channel={active} onClose={() => setActive(null)} />}
    </div>
  );
};

export default Live;
