import { useState, useEffect } from "react";
import { Search, Menu, X, User, LogOut, Bookmark, Shield, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Anime", to: "/search?genre=Anime" },
  { label: "Cartoon", to: "/search?genre=Cartoon" },
  { label: "Series", to: "/search?type=series" },
  { label: "Movies", to: "/search?type=movie" },
  { label: "Live TV", to: "/live" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: isAdmin } = useIsAdmin();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 h-16 ${
      scrolled
        ? "bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
        : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Senpai.tv" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(45,212,191,0.4)]" />
            <div className="text-lg sm:text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-300 via-cyan-300 to-fuchsia-400">
              Senpai<span className="text-white/50 font-light">.tv</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.to ||
                (link.to !== "/" && location.pathname + location.search === link.to);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-teal-400 font-bold"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/search" className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <Search className="w-5 h-5" />
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center p-[2px] shadow-[0_0_15px_rgba(45,212,191,0.4)]"
              >
                <div className="w-full h-full rounded-full bg-[#080810] flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-bold text-teal-400">{user.email?.charAt(0).toUpperCase()}</span>
                </div>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-52 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 space-y-1 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors font-medium">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link to="/watchlist" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors font-medium">
                    <Bookmark className="w-4 h-4" /> Watchlist
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-teal-400 hover:bg-teal-400/10 transition-colors font-medium">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setShowUserMenu(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10 h-9 px-5 bg-transparent text-xs font-medium">
                  Log in
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 text-black font-bold h-9 px-5 hover:shadow-[0_0_15px_rgba(45,212,191,0.5)] border-0 text-xs">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          <button
            className="md:hidden p-2 rounded-full text-white/70 hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-white/5 backdrop-blur-2xl border-t border-white/10 px-4 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium ${
                location.pathname === link.to ? "text-teal-400 bg-teal-400/10" : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
