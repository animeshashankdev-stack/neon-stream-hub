import { useState } from "react";
import { Search, Crown, Menu, X } from "lucide-react";

const navLinks = ["Home", "Series", "Movies", "Anime", "Cartoon"];

const Navbar = () => {
  const [active, setActive] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="font-display font-extrabold text-lg text-gradient-neon tracking-tight">
              Neon Curator
            </h1>
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link}
                  onClick={() => setActive(link)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active === link
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-5 h-5" />
            </button>
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
            <button
              key={link}
              onClick={() => { setActive(link); setMobileOpen(false); }}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                active === link
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
