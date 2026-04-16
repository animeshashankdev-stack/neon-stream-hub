import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#080515] pt-16 pb-8 relative z-20">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-2xl font-display font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500">
          Neon Curator
        </div>
        <div className="flex gap-6 text-sm font-medium text-white/50">
          <Link to="/search" className="hover:text-teal-400 transition-colors">Browse</Link>
          <a href="#" className="hover:text-teal-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-teal-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-teal-400 transition-colors">Help</a>
        </div>
        <p className="text-white/30 text-sm">© 2026 Neon Curator. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
