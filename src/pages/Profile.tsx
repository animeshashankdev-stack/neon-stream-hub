import { Navigate, Link } from "react-router-dom";
import { User, Star, Clock, Bookmark, Play, Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useWatchHistory } from "@/hooks/useWatchHistory";
import { useWatchlist } from "@/hooks/useWatchlist";

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
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="font-display font-extrabold text-2xl">{profile?.display_name || user?.email}</h1>
              <p className="text-sm text-muted-foreground">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}
              </p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-6 glass p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-accent" />
                <span className="font-display font-bold text-sm">Level {level}</span>
              </div>
              <span className="text-xs text-muted-foreground">{xp % xpForNext} / {xpForNext} XP</span>
            </div>
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="glass p-4 rounded-xl text-center">
              <Star className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-display font-bold text-lg">{totalWatched}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <Bookmark className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="font-display font-bold text-lg">{watchlist?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Watchlist</p>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <Clock className="w-5 h-5 text-neon-pink mx-auto mb-1" />
              <p className="font-display font-bold text-lg">{totalHours}</p>
              <p className="text-xs text-muted-foreground">Hours Watched</p>
            </div>
          </div>
        </div>

        {/* Watch History */}
        <section className="mb-8">
          <h2 className="font-display font-bold text-xl mb-4">Watch History</h2>
          {history && history.length > 0 ? (
            <div className="space-y-2">
              {history.map((h: any) => {
                const ep = h.episodes;
                const content = ep?.content;
                const progress = h.total_seconds > 0 ? (h.progress_seconds / h.total_seconds) * 100 : 0;
                return (
                  <Link
                    key={h.id}
                    to={`/watch/${content?.id}/${ep?.id}`}
                    className="flex items-center gap-4 p-3 rounded-xl glass hover:bg-secondary/50 transition-colors group"
                  >
                    <div className="w-16 aspect-video rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-display font-semibold truncate">{content?.title}</p>
                      <p className="text-xs text-muted-foreground">
                        S{ep?.season_number} E{ep?.episode_number} • {ep?.title}
                      </p>
                      <div className="mt-1 w-full h-1 rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {h.completed ? (
                        <span className="text-accent">Completed</span>
                      ) : (
                        formatDuration(h.progress_seconds)
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <Clock className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No watch history yet. Start watching to track your progress!</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
