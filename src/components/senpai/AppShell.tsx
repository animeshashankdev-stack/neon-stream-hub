/**
 * SENPAI.TV - Cinematic App Shell
 * Premium layout system with glassmorphism, gradients, and immersive design
 */

import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home, Compass, Tv, BookOpen, Heart, Bell, Search, Settings, User,
  Flame, Bookmark, ShieldCheck, Menu, X,
} from 'lucide-react';

type AppShellProps = {
  children: ReactNode;
  active?: 'home' | 'browse' | 'live' | 'manga' | 'library' | 'profile' | 'settings' | 'admin' | 'search' | 'genres';
  hideNav?: boolean;
  hideSidebar?: boolean;
  fullBleed?: boolean;
  hideAurora?: boolean;
};

const navItems = [
  { key: 'home', label: 'Home', icon: Home, to: '/' },
  { key: 'browse', label: 'Browse', icon: Compass, to: '/genres' },
  { key: 'live', label: 'Live', icon: Tv, to: '/live' },
  { key: 'manga', label: 'Manga', icon: BookOpen, to: '/manga' },
] as const;

const sideItems = [
  { key: 'library', label: 'Watchlist', icon: Heart, to: '/watchlist' },
  { key: 'genres', label: 'Genres', icon: Flame, to: '/genres' },
  { key: 'profile', label: 'Profile', icon: User, to: '/profile' },
  { key: 'settings', label: 'Settings', icon: Settings, to: '/settings' },
] as const;

export function AppShell({
  children,
  active = 'home',
  hideNav,
  hideSidebar,
  fullBleed,
  hideAurora,
}: AppShellProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // TODO: Connect to auth context
  // const { user } = useAuth();
  // const { data: isAdmin } = useIsAdmin();

  const user = null;
  const isAdmin = false;
  const initial = (user?.email?.[0] ?? 'S').toUpperCase();
  const handle = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'Guest';

  return (
    <div className="senpai-root min-h-screen relative overflow-hidden">
      {/* Aurora Background */}
      {!hideAurora && (
        <div className="fixed inset-0 pointer-events-none">
          {/* Primary gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-senpai-violet/5 via-senpai-bg to-senpai-teal/5" />
          {/* Glow effect */}
          <div
            className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #a16bff 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #2af0d9 0%, transparent 70%)',
            }}
          />
        </div>
      )}

      {/* Header Navigation */}
      {!hideNav && (
        <header className="sticky top-0 z-40 border-b border-white/5 bg-senpai-bg/40 backdrop-blur-md">
          <div className="max-w-full px-4 md:px-6 py-4 flex items-center gap-4 md:gap-6">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-senpai-violet to-senpai-teal flex items-center justify-center font-bold text-senpai-text glow-violet group-hover:glow-violet-xl transition-all">
                先
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-display text-lg text-senpai-text">SENPAI</span>
                <span className="text-xs text-senpai-text-dim">Stream Beyond</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 ml-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <Link
                    key={item.key}
                    to={item.to}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${
                      isActive
                        ? 'bg-senpai-violet/20 text-senpai-violet border border-senpai-violet/40 glow-violet'
                        : 'text-senpai-text-dim hover:text-senpai-text hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const q = String(fd.get('q') ?? '').trim();
                navigate(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
              }}
              className="flex-1 max-w-md mx-auto hidden sm:block"
            >
              <div className="relative group">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-senpai-text-dim group-focus-within:text-senpai-violet transition"
                />
                <input
                  name="q"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-senpai-surface border border-white/10 focus:border-senpai-violet/40 text-sm text-senpai-text placeholder:text-senpai-text-dim outline-none transition-all duration-300"
                  placeholder="Search anime, manga..."
                />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button className="hidden sm:flex relative w-10 h-10 items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-senpai-text-dim hover:text-senpai-text transition-all">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-senpai-red" />
              </button>

              <Link
                to={user ? '/profile' : '/auth'}
                className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-lg bg-senpai-surface border border-white/10 hover:border-senpai-violet/40 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-senpai-violet to-senpai-teal flex items-center justify-center font-bold text-senpai-text">
                  {initial}
                </div>
                <span className="hidden sm:inline text-xs text-senpai-text-dim group-hover:text-senpai-text transition">
                  {handle}
                </span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-senpai-text-dim hover:text-senpai-text transition"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/5 bg-senpai-bg/80 backdrop-blur-sm px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.key;
                return (
                  <Link
                    key={item.key}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${
                      isActive
                        ? 'bg-senpai-violet/20 text-senpai-violet border border-senpai-violet/40'
                        : 'text-senpai-text-dim hover:text-senpai-text'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </header>
      )}

      {/* Main Layout */}
      <div className={`relative ${fullBleed ? '' : 'max-w-[1600px] mx-auto'} flex`}>
        {/* Sidebar */}
        {!hideSidebar && (
          <aside className="hidden lg:flex flex-col w-20 py-6 sticky top-20 h-[calc(100vh-5rem)] items-center gap-3 border-r border-white/5 bg-gradient-to-b from-senpai-bg-2/50 to-transparent">
            {sideItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`group relative w-12 h-12 rounded-lg grid place-items-center transition-all duration-300 ${
                    isActive
                      ? 'bg-senpai-violet/20 border border-senpai-violet/40 text-senpai-violet glow-violet'
                      : 'text-senpai-text-dim hover:text-senpai-text hover:bg-white/5 border border-transparent'
                  }`}
                  title={item.label}
                >
                  <Icon size={20} />
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                className={`group relative w-12 h-12 rounded-lg grid place-items-center transition-all duration-300 ${
                  active === 'admin'
                    ? 'bg-senpai-violet/20 border border-senpai-violet/40 text-senpai-violet'
                    : 'text-senpai-text-dim hover:text-senpai-text hover:bg-white/5 border border-transparent'
                }`}
                title="Admin"
              >
                <ShieldCheck size={20} />
              </Link>
            )}

            {/* Footer Text */}
            <div className="mt-auto text-xs text-senpai-text-dim/50 font-jp writing-vertical">先輩</div>
          </aside>
        )}

        {/* Main Content */}
        <main className={`flex-1 relative z-10 min-w-0 ${fullBleed ? '' : 'px-4 md:px-6 lg:px-8 py-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

/* Presentational Components */

export function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`glass-card rounded-xl ${className}`}
      style={{
        background: 'rgba(20, 15, 32, 0.4)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      {children}
    </div>
  );
}

export function NeonButton({
  children,
  color = 'violet',
  size = 'md',
  className = '',
  ...props
}: {
  children: ReactNode;
  color?: 'violet' | 'teal' | 'pink' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  [key: string]: any;
}) {
  const colorMap = {
    violet: 'bg-senpai-violet hover:bg-senpai-violet-2 text-senpai-text glow-violet',
    teal: 'bg-senpai-teal hover:bg-senpai-teal text-senpai-bg glow-teal',
    pink: 'bg-senpai-pink hover:bg-senpai-fuchsia text-senpai-text glow-pink',
    amber: 'bg-senpai-amber hover:bg-senpai-orange text-senpai-bg',
  };

  const sizeMap = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`font-bold rounded-lg transition-all duration-300 active:scale-95 ${colorMap[color]} ${sizeMap[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function NeonChip({
  children,
  active = false,
  color = 'violet',
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  color?: 'violet' | 'teal' | 'fuchsia' | 'amber' | 'orange';
  onClick?: () => void;
}) {
  const colorMap: Record<string, string> = {
    violet: active
      ? 'bg-senpai-violet/20 border-senpai-violet/40 text-senpai-violet glow-violet'
      : 'border-white/10 text-senpai-text-dim hover:text-senpai-text hover:border-white/20',
    teal: active
      ? 'bg-senpai-teal/20 border-senpai-teal/40 text-senpai-teal'
      : 'border-white/10 text-senpai-text-dim hover:text-senpai-text',
    fuchsia: active
      ? 'bg-senpai-fuchsia/20 border-senpai-fuchsia/40 text-senpai-fuchsia'
      : 'border-white/10 text-senpai-text-dim hover:text-senpai-text',
    amber: active
      ? 'bg-senpai-amber/20 border-senpai-amber/40 text-senpai-amber'
      : 'border-white/10 text-senpai-text-dim hover:text-senpai-text',
    orange: active
      ? 'bg-senpai-orange/20 border-senpai-orange/40 text-senpai-orange'
      : 'border-white/10 text-senpai-text-dim hover:text-senpai-text',
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${colorMap[color]}`}
    >
      {children}
    </button>
  );
}