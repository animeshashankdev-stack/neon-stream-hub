import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home, Compass, Tv, BookOpen, Heart, Bell, Search, Settings, User, Flame,
  Bookmark, ShieldCheck, ChevronDown, Sparkles,
} from "lucide-react";
import { SenpaiLogo } from "./Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";

type AppShellProps = {
  children: ReactNode;
  active?: "home" | "browse" | "live" | "manga" | "library" | "profile" | "settings" | "admin" | "search" | "genres";
  hideNav?: boolean;
  hideSidebar?: boolean;
  fullBleed?: boolean;
  hideAurora?: boolean;
};

const navItems = [
  { key: "home", label: "Home", icon: Home, to: "/" },
  { key: "browse", label: "Browse", icon: Compass, to: "/genres" },
  { key: "live", label: "Live TV", icon: Tv, to: "/live" },
  { key: "manga", label: "Manga", icon: BookOpen, to: "/manga" },
] as const;

const sideItems = [
  { key: "library", label: "Watchlist", icon: Heart, to: "/watchlist" },
  { key: "genres", label: "Genres", icon: Flame, to: "/genres" },
  { key: "watchlist", label: "Bookmarks", icon: Bookmark, to: "/watchlist" },
  { key: "profile", label: "Profile", icon: User, to: "/profile" },
  { key: "settings", label: "Settings", icon: Settings, to: "/settings" },
] as const;

export function AppShell({ children, active = "home", hideNav, hideSidebar, fullBleed, hideAurora }: AppShellProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const initial = (user?.email?.[0] ?? "S").toUpperCase();
  const handle = user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "Guest";

  return (
    <div className="senpai-root min-h-screen relative overflow-hidden">
      {!hideAurora && (
        <>
          <div className="pointer-events-none fixed inset-0 senpai-aurora opacity-90" />
          <div className="pointer-events-none fixed inset-0 senpai-bg-grid opacity-40" />
          <div
            className="pointer-events-none fixed inset-0"
            style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05), transparent 60%)" }}
          />
        </>
      )}

      {!hideNav && (
        <header className="sticky top-0 z-40">
          <div className="senpai-glass border-b border-white/5 px-6 py-3 flex items-center gap-6 relative">
            <SenpaiLogo size={36} tagline />
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navItems.map((it) => {
                const Icon = it.icon;
                const isActive = active === it.key;
                return (
                  <Link
                    key={it.key}
                    to={it.to}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition relative ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/55 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={16} />
                    {it.label}
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(255,72,214,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const q = String(fd.get("q") ?? "").trim();
                navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
              }}
              className="flex-1 max-w-xl mx-auto"
            >
              <div className="relative group">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-fuchsia-300 transition" />
                <input
                  name="q"
                  className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-400/60 focus:bg-white/[0.06] text-sm text-white placeholder:text-white/40 outline-none transition"
                  placeholder="Search anime, movies, manga, channels…"
                />
                <kbd className="senpai-mono absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/50 border border-white/10 rounded px-1.5 py-0.5 bg-white/5">⌘K</kbd>
              </div>
            </form>

            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="hidden md:flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70 hover:text-white border border-white/10 hover:border-white/25 rounded-full px-3 py-1.5"
              >
                <Sparkles size={12} className="text-amber-300" /> Senpai+
              </Link>
              <button className="relative w-9 h-9 grid place-items-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <Bell size={16} className="text-white/80" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-fuchsia-400 ring-2 ring-[#0c0c14]" />
              </button>
              <Link
                to={user ? "/profile" : "/auth"}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 grid place-items-center text-[11px] font-black text-white">
                  {initial}
                </div>
                <span className="hidden sm:inline text-xs text-white/85 font-medium">{handle}</span>
                <ChevronDown size={12} className="text-white/40" />
              </Link>
            </div>
          </div>
        </header>
      )}

      <div className={`relative ${fullBleed ? "" : "max-w-[1480px] mx-auto"} flex`}>
        {!hideSidebar && (
          <aside className="hidden lg:flex flex-col w-[72px] py-6 sticky top-[72px] h-[calc(100vh-72px)] items-center gap-2">
            {sideItems.map((it) => {
              const Icon = it.icon;
              const isActive = active === it.key;
              return (
                <Link
                  key={it.key}
                  to={it.to}
                  className={`group relative w-12 h-12 rounded-2xl grid place-items-center transition ${
                    isActive
                      ? "bg-gradient-to-br from-violet-500/40 to-fuchsia-500/30 border border-violet-300/40 text-white senpai-glow"
                      : "text-white/55 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                  }`}
                >
                  <Icon size={18} />
                  <span className="absolute left-14 px-2 py-1 rounded-md bg-black/85 text-[10px] text-white/85 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10">
                    {it.label}
                  </span>
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className={`group relative w-12 h-12 rounded-2xl grid place-items-center transition ${
                  active === "admin"
                    ? "bg-gradient-to-br from-violet-500/40 to-fuchsia-500/30 border border-violet-300/40 text-white senpai-glow"
                    : "text-white/55 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                }`}
              >
                <ShieldCheck size={18} />
                <span className="absolute left-14 px-2 py-1 rounded-md bg-black/85 text-[10px] text-white/85 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10">
                  Admin
                </span>
              </Link>
            )}
            <div className="mt-auto flex flex-col items-center gap-2 pb-2">
              <div className="senpai-jp text-[10px] text-white/30 [writing-mode:vertical-rl]">先輩</div>
            </div>
          </aside>
        )}

        <main className={`flex-1 ${fullBleed ? "" : "px-4 lg:px-8 py-6"} relative z-10 min-w-0`}>
          {children}
        </main>
      </div>
    </div>
  );
}

/* ---------- Presentational primitives (also re-exported by name) ---------- */

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`senpai-glass rounded-2xl ${className}`}>{children}</div>;
}

export function NeonChip({
  children,
  active = false,
  color = "violet",
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  color?: "violet" | "teal" | "fuchsia" | "amber" | "orange";
  onClick?: () => void;
}) {
  const colorMap: Record<string, string> = {
    violet: active ? "bg-violet-500/25 border-violet-300/50 text-violet-100" : "border-white/10 text-white/65 hover:text-white hover:border-white/20",
    teal: active ? "bg-teal-500/25 border-teal-300/50 text-teal-100" : "border-white/10 text-white/65 hover:text-white hover:border-white/20",
    fuchsia: active ? "bg-fuchsia-500/25 border-fuchsia-300/50 text-fuchsia-100" : "border-white/10 text-white/65 hover:text-white hover:border-white/20",
    amber: active ? "bg-amber-500/25 border-amber-300/50 text-amber-100" : "border-white/10 text-white/65 hover:text-white hover:border-white/20",
    orange: active ? "bg-orange-500/25 border-orange-300/50 text-orange-100" : "border-white/10 text-white/65 hover:text-white hover:border-white/20",
  };
  return (
    <span onClick={onClick} className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition font-medium ${colorMap[color]}`}>
      {children}
    </span>
  );
}

export function ScoreBadge({ value, big = false }: { value: number; big?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-1 senpai-mono ${
        big ? "text-sm px-2.5 py-1" : "text-[11px] px-1.5 py-0.5"
      } rounded bg-amber-400/15 border border-amber-300/40 text-amber-200 font-bold`}
    >
      ★ {value.toFixed(1)}
    </div>
  );
}

export function LiveDot({ pulse = true }: { pulse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-100 bg-rose-500/25 border border-rose-400/50 px-1.5 py-0.5 rounded-md">
      <span
        className="w-1.5 h-1.5 rounded-full bg-rose-400"
        style={{ animation: pulse ? "senpai-pulse 1.4s ease-in-out infinite" : "" }}
      />
      LIVE
    </span>
  );
}

export function YearSticker({
  year,
  color = "amber",
  rotate = -6,
}: {
  year: number | string;
  color?: "amber" | "pink" | "violet" | "teal";
  rotate?: number;
}) {
  const map: Record<string, string> = {
    amber: "senpai-sticker",
    pink: "senpai-sticker senpai-sticker-pink",
    violet: "senpai-sticker senpai-sticker-violet",
    teal: "senpai-sticker senpai-sticker-teal",
  };
  return (
    <span className={`${map[color]} text-xs`} style={{ transform: `rotate(${rotate}deg)` }}>
      {year}
    </span>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: { children: ReactNode; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm tracking-wide overflow-hidden transition active:scale-95 ${className}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 opacity-100" />
      <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 opacity-0 group-hover:opacity-100 transition" />
      <span className="absolute inset-0 senpai-shimmer opacity-0 group-hover:opacity-100" />
      <span className="relative">{children}</span>
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  ...props
}: { children: ReactNode; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white/85 text-sm tracking-wide border border-white/15 bg-white/[0.03] hover:bg-white/10 hover:border-white/30 transition active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}