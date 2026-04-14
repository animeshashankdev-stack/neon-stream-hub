import { Link } from "react-router-dom";
import { Twitter, Instagram, Youtube, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 mt-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.svg" alt="Neon Curator" className="w-7 h-7" />
              <h3 className="font-display font-extrabold text-lg text-gradient-neon">Neon Curator</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The premium anime streaming experience. Curated content, cinematic quality, neon-powered design.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-3">Browse</h4>
            <div className="space-y-2">
              <Link to="/search" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">All Anime</Link>
              <Link to="/search?type=series" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Series</Link>
              <Link to="/search?type=movie" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Movies</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-3">Legal</h4>
            <div className="space-y-2">
              <a href="#" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="block text-xs text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-3">Connect</h4>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg glass text-muted-foreground hover:text-foreground transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg glass text-muted-foreground hover:text-foreground transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg glass text-muted-foreground hover:text-foreground transition-colors"><Youtube className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg glass text-muted-foreground hover:text-foreground transition-colors"><Globe className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/20 text-center">
          <p className="text-xs text-muted-foreground">© 2026 Neon Curator. The Cinematic Glass Canvas. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
