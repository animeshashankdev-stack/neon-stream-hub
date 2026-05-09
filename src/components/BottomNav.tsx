import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Tv, BookOpen, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/search", label: "Browse", Icon: Compass },
  { to: "/live", label: "Live", Icon: Tv },
  { to: "/manga", label: "Manga", Icon: BookOpen },
  { to: "/profile", label: "Profile", Icon: User },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5">
        {items.map(({ to, label, Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                active ? "text-accent" : "text-white/50 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;