import { ReactNode, useState } from "react";
import { SenpaiLogo } from "./Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  Tv,
  BookOpen,
  Heart,
  User,
  Settings,
  Search,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

type NavKey =
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

type Props = {
  children: ReactNode;
  mode?: "full" | "immersive";
  active: NavKey;
  hideTopbar?: boolean;
  hideSidebar?: boolean;
  hideAurora?: boolean;
  fullBleed?: boolean;
};

const navItems: Array<{ key: NavKey; label: string; to: string; Icon?: any }> = [
  { key: "home", label: "Home", to: "/" },
  { key: "browse", label: "Browse", to: "/genres", Icon: Compass },
  { key: "live", label: "Live TV", to: "/live", Icon: Tv },
  { key: "manga", label: "Manga", to: "/manga", Icon: BookOpen },
];

const sideItems: Array<{ key: NavKey; label: string; to: string; Icon?: any }> = [
  { key: "library", label: "Watchlist", to: "/watchlist", Icon: Heart },
  { key: "genres", label: "Genres", to: "/genres", Icon: Compass },
  { key: "profile", label: "Profile", to: "/profile", Icon: User },
  { key: "settings", label: "Settings", to: "/settings", Icon: Settings },
];

export function CinematicPageShell({
  children,
  mode = "full",
  active,
  hideTopbar,
  hideSidebar,
  hideAurora,
  fullBleed,
}: Props) {
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const initial = (user?.email?.[0] ?? "S").toUpperCase();
  const handle =
    user?.user_metadata?.display_name ?? user?.email?.split("@")[0] ?? "Guest";

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="senpai-root min-h-screen relative overflow-hidden text-white selection:bg-accent/30">
      {!hideAurora && (
        <>
          <div className="pointer-events-none fixed inset-0 senpai-aurora opacity-90" />
          <div className="pointer-events-none fixed inset-0 senpai-bg-grid opacity-40" />
          <div
            className="pointer-events-none fixed inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06), transparent 62%)",
            }}
          />
        </>
      )}

      {!hideTopbar && mode !== "immersive" && (
        <header className="sticky top-0 z-50">
          <div className="senpai-glass border-b border-white/5 px-4 sm:px-6 py-3">
            <div className="max-w-[1480px] mx-auto flex items-center gap-4">
              <SenpaiLogo size={36} tagline />

              <nav className="hidden md:flex items-center gap-1 ml-2">
                {navItems.map((it) => {
                  const isActive = active === it.key;
                  const Icon = it.Icon;
                  return (
                    <Link
                      key={it.key}
                      to={it.to}
                      className={
                        "relative px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition " +
                        (isActive
                          ? "bg-white/10 text-white"
                          : "text-white/65 hover:text-white hover:bg-white/5")
                      }
                    >
                      {Icon ? <Icon size={16} className="text-white/70" /> : null}
                      {it.label}
                      {isActive && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(255,72,214,0.8)]" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex-1" />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const q = String(fd.get("q") ?? "").trim();
                  navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
                }}
                className="hidden lg:flex items-center gap-2 max-w-xl"
              >
                <div className="relative group">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-fuchsia-300 transition"
                  />
                  <input
                    name="q"
                    placeholder="Search anime, movies, manga, channels…"
                    className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-400/60 focus:bg-white/[0.06] text-sm text-white placeholder:text-white/40 outline-none transition"
                  />
                  <kbd className="senpai-mono absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/50 border border-white/10 rounded px-1.5 py-0.5 bg-white/5">
                    ⌘K
                  </kbd>
                </div>
              </form>

              <div className="flex items-center gap-2">
                {user ? (
                  <Link
                    to="/profile"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 grid place-items-center text-xs font-black text-white/95 shadow-[0_0_18px_rgba(255,72,214,0.35)]">
                      {initial}
                    </div>
                    <span className="text-xs text-white/85 font-medium max-w-[120px] truncate">
                      {handle}
                    </span>
                    <ChevronDown size={12} className="text-white/40" />
                  </Link>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link
                      to="/auth"
                      className="px-4 py-2 rounded-full border border-white/15 text-xs font-bold text-white/85 bg-white/[0.03] hover:bg-white/10 transition"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/auth"
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 text-black font-bold text-xs hover:shadow-[0_0_15px_rgba(45,212,191,0.5)] border-0 transition"
                    >
                      Sign up
                    </Link>
                  </div>
                )}

                <button
                  className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition grid place-items-center"
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label="Open menu"
                >
                  {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </div>

            {mobileOpen && (
              <div className="md:hidden mt-3">
                <div className="senpai-glass border border-white/10 rounded-2xl p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {navItems.map((it) => (
                      <Link
                        key={it.key}
                        to={it.to}
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition flex items-center justify-center"
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {sideItems.slice(0, 2).map((it) => (
                      <Link
                        key={it.key}
                        to={it.to}
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition flex items-center justify-center"
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>

                  {user ? (
                    <div className="mt-3 flex flex-col gap-2">
                      <Link
                        to="/watchlist"
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-2 rounded-xl text-sm font-bold text-teal-300 hover:bg-teal-400/10 border border-white/10 bg-white/5 transition"
                      >
                        Watchlist
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="px-3 py-2 rounded-xl text-sm font-bold text-violet-300 hover:bg-violet-400/10 border border-white/10 bg-white/5 transition"
                        >
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          signOut();
                          setMobileOpen(false);
                        }}
                        className="px-3 py-2 rounded-xl text-sm font-bold text-red-300 hover:bg-red-400/10 border border-white/10 bg-white/5 transition text-left"
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-col gap-2">
                      <Link
                        to="/auth"
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-2 rounded-xl text-sm font-bold text-white/85 hover:bg-white/10 border border-white/10 bg-white/5 transition"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/auth"
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-2 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-teal-400 to-cyan-500 hover:shadow-[0_0_15px_rgba(45,212,191,0.5)] border-0 transition"
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      <div className="relative z-10">
        <div className="max-w-[1480px] mx-auto flex">
          {!hideSidebar && mode !== "immersive" && (
            <aside className="hidden lg:flex flex-col w-[76px] py-6 sticky top-[72px] h-[calc(100vh-72px)] items-center gap-2">
              <div className="flex flex-col gap-2 w-full items-center">
                {sideItems.map((it) => {
                  const isActive = active === it.key;
                  const Icon = it.Icon;
                  return (
                    <Link
                      key={it.key}
                      to={it.to}
                      className={
                        "group relative w-[64px] h-[64px] mx-auto rounded-2xl grid place-items-center transition border " +
                        (isActive
                          ? "bg-gradient-to-br from-violet-500/35 to-fuchsia-500/20 border-violet-300/45 text-white shadow-[0_0_40px_rgba(161,107,255,0.25)]"
                          : "bg-white/0 hover:bg-white/5 border-transparent hover:border-white/10 text-white/70")
                      }
                    >
                      {Icon ? <Icon size={18} className="opacity-90" /> : null}
                      <span className="absolute left-[72px] whitespace-nowrap px-2 py-1 rounded-md bg-black/85 text-[10px] text-white/85 opacity-0 group-hover:opacity-100 pointer-events-none border border-white/10">
                        {it.label}
                      </span>
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={
                      "group relative w-[64px] h-[64px] mx-auto rounded-2xl grid place-items-center transition border " +
                      (active === "admin"
                        ? "bg-gradient-to-br from-violet-500/35 to-fuchsia-500/20 border-violet-300/45 text-white shadow-[0_0_40px_rgba(161,107,255,0.25)]"
                        : "bg-white/0 hover:bg-white/5 border-transparent hover:border-white/10 text-white/70")
                    }
                  >
                    <ShieldCheck size={18} />
                    <span className="absolute left-[72px] whitespace-nowrap px-2 py-1 rounded-md bg-black/85 text-[10px] text-white/85 opacity-0 group-hover:opacity-100 pointer-events-none border border-white/10">
                      Admin
                    </span>
                  </Link>
                )}
              </div>

              <div className="mt-auto pb-3">
                <div className="senpai-jp text-[10px] text-white/30 [writing-mode:vertical-rl]">先輩</div>
              </div>
            </aside>
          )}

          <main
            className={
              "flex-1 min-w-0 " +
              (fullBleed ? "" : "px-4 sm:px-6 lg:px-8 py-6") +
              (mode === "immersive" ? "p-0" : "")
            }
            key={location.pathname}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

