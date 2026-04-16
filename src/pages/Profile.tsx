import { Navigate, Link } from "react-router-dom";
import { User, Star, Clock, Bookmark, Play, Award, Settings } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useWatchHistory } from "@/hooks/useWatchHistory";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile } = useProfile();
  const { data: history } = useWatchHistory();
  const { data: watchlist } = useWatchlist();

  if (!authLoading && !user) return <Navigate to="/auth" replace />;

  const xp = profile?.xp || 0;
  const level = profile?.level || 1;
  const xpForNext = 100;
  const xpProgress = (xp % xpForNext) / xpForNext * 100;

  const totalWatched = history?.filter((h: any) => h.completed)?.length || 0;
  const totalHours = Math.round(
    (history?.reduce((acc: number, h: any) => acc + (h.progress_seconds || 0), 0) || 0) / 3600
  );

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A20] to-[#1A0A3E] text-white">
      <Navbar />

      <div className="pt-28 max-w-7xl mx-auto px-6 pb-24">
        {/* Profile Hero Card */}
        <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.15] rounded-[28px] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-400/10 via-cyan-400/5 to-transparent pointer-events-none mix-blend-screen" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-violet-500/20 blur-[100px] rounded-full pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 p-1 shadow-[0_0_30px_rgba(45,212,191,0.5)]">
                <div className="w-full h-full rounded-full bg-[#080810] flex items-center justify-center border-4 border-[#080810]/50 overflow-hidden">
                  <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-300 to-cyan-300">
                    {user?.email?.charAt(0).toUpperCase() || "?"}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 cursor-pointer transition-colors shadow-lg">
                <Settings className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left pt-2">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                <h1 className="text-3xl md:text-4xl font-display font-black text-white tracking-tight drop-shadow-sm">
                  {profile?.display_name || user?.email?.split("@")[0] || "User"}
                </h1>
                <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 border-none text-white font-black tracking-widest px-3 py-1 shadow-[0_0_15px_rgba(167,139,250,0.5)] flex items-center gap-1.5 rounded-full text-[10px]">
                  ⭐ LEVEL {level}
                </Badge>
              </div>
              <p className="text-white/60 font-medium mb-6 text-sm">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
              </p>

              {/* XP Bar */}
              <div className="max-w-md mx-auto md:mx-0 mb-6">
                <div className="flex justify-between text-xs font-bold text-white/50 mb-1">
                  <span>XP Progress</span>
                  <span>{xp % xpForNext} / {xpForNext}</span>
                </div>
                <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full relative shadow-[0_0_15px_rgba(45,212,191,0.6)]"
                    style={{ width: `${xpProgress}%` }}
                  >
                    <div className="absolute right-0 top-0 w-2 h-full bg-white opacity-50 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Stats pills */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-full px-5 py-2 flex items-center gap-2">
                  <Play className="w-4 h-4 text-teal-400" />
                  <span className="font-bold">{totalWatched} <span className="text-white/50 text-xs uppercase ml-1">Completed</span></span>
                </div>
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-full px-5 py-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold">{totalHours} <span className="text-white/50 text-xs uppercase ml-1">Hours</span></span>
                </div>
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-full px-5 py-2 flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-violet-400" />
                  <span className="font-bold">{watchlist?.length || 0} <span className="text-white/50 text-xs uppercase ml-1">Watchlist</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Watch History */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-teal-400 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
              <h3 className="text-xl font-display font-bold text-white tracking-tight">Watch History</h3>
            </div>

            {history && history.length > 0 ? (
              <div className="space-y-3">
                {history.map((h: any) => {
                  const ep = h.episodes;
                  const content = ep?.content;
                  const progress = h.total_seconds > 0 ? (h.progress_seconds / h.total_seconds) * 100 : 0;
                  return (
                    <Link
                      key={h.id}
                      to={`/watch/${content?.id}/${ep?.id}`}
                      className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] p-3 hover:bg-white/10 transition-colors group cursor-pointer"
                    >
                      <div className="w-20 aspect-video rounded-[12px] bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
                        <Play className="w-4 h-4 text-white/40 group-hover:text-teal-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors truncate">{content?.title}</p>
                        <p className="text-xs text-white/50 mb-1.5">
                          S{ep?.season_number} E{ep?.episode_number} • {ep?.title}
                        </p>
                        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 max-w-xs">
                          <div
                            className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-white/50 flex-shrink-0 font-medium">
                        {h.completed ? (
                          <span className="text-teal-400 font-bold">✓ Done</span>
                        ) : (
                          formatDuration(h.progress_seconds)
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-[24px] p-12 text-center">
                <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50 font-medium">No watch history yet. Start watching!</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-[380px] space-y-8 shrink-0">
            {/* Achievements */}
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 backdrop-blur-xl shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-violet-400 rounded-full shadow-[0_0_10px_rgba(167,139,250,0.8)]" />
                <h3 className="text-lg font-display font-bold text-white tracking-tight">Achievements</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Binge Watcher", desc: "10 eps in a day", icon: "📺", color: "from-pink-400/20 to-rose-400/20 border-pink-400/30" },
                  { title: `${totalHours}h Watched`, desc: "Keep going!", icon: "👑", color: "from-yellow-400/20 to-orange-400/20 border-yellow-400/30" },
                  { title: "Reviewer", desc: "Rate shows", icon: "✍️", color: "from-teal-400/20 to-cyan-400/20 border-teal-400/30" },
                  { title: "Pioneer", desc: "Early adopter", icon: "🚀", color: "from-violet-400/20 to-fuchsia-400/20 border-violet-400/30" },
                ].map((ach) => (
                  <div
                    key={ach.title}
                    className={`bg-gradient-to-br ${ach.color} border rounded-[16px] p-4 text-center flex flex-col items-center backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer`}
                  >
                    <div className="text-3xl mb-2 drop-shadow-md">{ach.icon}</div>
                    <h4 className="font-bold text-white text-xs mb-1 tracking-wide">{ach.title}</h4>
                    <p className="text-[9px] text-white/70 font-medium">{ach.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
