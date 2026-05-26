"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import {
  Home,
  Compass,
  Tv,
  BookOpen,
  Heart,
  Bell,
  Search,
  Settings,
  User,
  Flame,
  Bookmark,
  ShieldCheck,
  ChevronDown,
  Sparkles,
} from "lucide-react";

type AppShellProps = {
  children: ReactNode;
  active?:
    | "home"
    | "browse"
    | "live"
    | "manga"
    | "library"
    | "profile"
    | "settings"
    | "admin"
    | "search"
    | "genres";
  hideNav?: boolean;
  hideSidebar?: boolean;
  fullBleed?: boolean;
  hideAurora?: boolean;
};

const navItems = [
  { key: "home" as const, label: "Home", icon: Home, to: "/" },
  { key: "browse" as const, label: "Browse", icon: Compass, to: "/browse" },
  { key: "live" as const, label: "Live TV", icon: Tv, to: "/live" },
  { key: "manga" as const, label: "Manga", icon: BookOpen, to: "/manga" },
] as const;

const sideItems = [
  { key: "library" as const, label: "Watchlist", icon: Heart, to: "/library" },
  { key: "genres" as const, label: "Genres", icon: Flame, to: "/genres" },
  { key: "watchlist" as const, label: "Bookmarks", icon: Bookmark, to: "/library" },
  { key: "profile" as const, label: "Profile", icon: User, to: "/profile" },
  { key: "settings" as const, label: "Settings", icon: Settings, to: "/settings" },
] as const;

// Minimal placeholder shell for mock UI. Auth hooks will be wired in later.
export function AppShell({
  children,
  active = "home",
  hideNav,
  hideSidebar,
  fullBleed,
  hideAurora,
}: AppShellProps) {
  return (
    <div className="senpai-root min-h-screen relative overflow-hidden">
      {!hideAurora && (
        <>
          <div className="pointer-events-none fixed inset-0 senpai-aurora opacity-90" />
          <div className="pointer-events-none fixed inset-0 senpai-bg-grid opacity-40" />
          <div
            className="pointer-events-none fixed inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05), transparent 60%)",
            }}
          />
        </>
      )}

      {!hideNav && (
        <header className="sticky top-0 z-40">
          <div className="senpai-glass border-b border-white/5 px-6 py-3 flex items-center gap-6 relative">
            <Link
              href="/"
              className="flex items-center gap-3 text-white"
              aria-label="Senpai.tv"
            >
              <span className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-lg font-black">S</span>
              <span className="hidden sm:inline text-sm font-black tracking-widest senpai-display">SENPAI</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navItems.map((it) => {
                const Icon = it.icon;
                const isActive = active === it.key;
                return (
                  <Link
                    key={it.key}
                    href={it.to}
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

            <div className="flex-1 max-w-xl mx-auto">
              <div className="relative group">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-fuchsia-300 transition"
                />
                <input
                  className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-400/60 focus:bg-white/[0.06] text-sm text-white placeholder:text-white/40 outline-none transition"
                  placeholder="Search anime, movies, manga, channels…"
                />
                <kbd className="senpai-mono absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/50 border border-white/10 rounded px-1.5 py-0.5 bg-white/5">
                  ⌘K
                </kbd>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="hidden md:flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70 hover:text-white border border-white/10 hover:border-white/25 rounded-full px-3 py-1.5">
                <Sparkles size={12} className="text-amber-300" /> Senpai+
              </button>
              <button className="relative w-9 h-9 grid place-items-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition" aria-label="Notifications">
                <Bell size={16} className="text-white/80" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-fuchsia-400 ring-2 ring-[#0c0c14]" />
              </button>
              <button className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition" aria-label="User menu">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 grid place-items-center text-[11px] font-black text-white">
                  N
                </div>
                <span className="hidden sm:inline text-xs text-white/85 font-medium">NekoMaster</span>
                <ChevronDown size={12} className="text-white/40" />
              </button>
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
                  href={it.to}
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
            <div className="mt-auto flex flex-col items-center gap-2 pb-2">
              <div className="senpai-jp text-[10px] text-white/30 [writing-mode:vertical-rl]">
                先輩
              </div>
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

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
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
    violet: active
      ? "bg-violet-500/25 border-violet-300/50 text-violet-100"
      : "border-white/10 text-white/65 hover:text-white hover:border-white/20",
    teal: active
      ? "bg-teal-500/25 border-teal-300/50 text-teal-100"
      : "border-white/10 text-white/65 hover:text-white hover:border-white/20",
    fuchsia: active
      ? "bg-fuchsia-500/25 border-fuchsia-300/50 text-fuchsia-100"
      : "border-white/10 text-white/65 hover:text-white hover:border-white/20",
    amber: active
      ? "bg-amber-500/25 border-amber-300/50 text-amber-100"
      : "border-white/10 text-white/65 hover:text-white hover:border-white/20",
    orange: active
      ? "bg-orange-500/25 border-orange-300/50 text-orange-100"
      : "border-white/10 text-white/65 hover:text-white hover:border-white/20",
  };

  return (
    <span
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition font-medium ${colorMap[color]}`}
    >
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

