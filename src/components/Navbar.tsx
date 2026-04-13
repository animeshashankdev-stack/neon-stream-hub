import { useState, useEffect } from "react";
import { Search, Crown, Menu, X, User, LogOut, Bookmark } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Series", to: "/search?type=series" },
  { label: "Movies", to: "/search?type=movie" },
  { label: "Anime", to: "/search" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-lg shadow-background/50" : "bg-gradient-to-b from-background/80 to-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-display font-extrabold text-lg text-gradient-neon tracking-tight">
              Neon Curator
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.to || (link.to !== "/" && location.pathname.startsWith(link.to.split("?")[0]))
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/search" className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-5 h-5" />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xs font-bold"
                >
                  {user.email?.charAt(0).toUpperCase()}
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-10 w-48 glass-card p-2 space-y-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link
                      to="/watchlist"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      <Bookmark className="w-4 h-4" /> Watchlist
                    </Link>
                    <button
                      onClick={() => { signOut(); setShowUserMenu(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-display font-bold hover:bg-primary/90 transition-colors"
              >
                Sign In
              </Link>
            )}

            <button
              className="md:hidden p-2 rounded-lg text-muted-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border/30 px-4 pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                location.pathname === link.to ? "bg-primary/20 text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <Link to="/auth" onClick={() => setMobileOpen(false)} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-primary">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
