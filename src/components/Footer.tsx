import { Globe, Share2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 mt-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-display font-extrabold text-lg text-gradient-neon">Neon Curator</h3>
            <p className="text-xs text-muted-foreground mt-1">© 2024 Neon Curator. The Cinematic Glass Canvas.</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Help Center</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg glass text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg glass text-muted-foreground hover:text-foreground transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
