import { useState } from "react";
import { Search, Crown, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Series", to: "/search?type=series" },
  { label: "Movies", to: "/search?type=movie" },
  { label: "Anime", to: "/search" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
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
          <div className="flex items-center gap-3">
            <Link to="/search" className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            <button className="p-2 rounded-lg text-neon-cyan hover:text-neon-cyan/80 transition-colors">
              <Crown className="w-5 h-5" />
            </button>
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
                location.pathname === link.to
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground"
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
