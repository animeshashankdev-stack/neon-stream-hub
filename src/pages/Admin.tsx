import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Users, Eye, Film, TrendingUp, Shield, Sparkles, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Tab = "overview" | "users" | "content" | "analytics";

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const [tab, setTab] = useState<Tab>("overview");
  const [enriching, setEnriching] = useState(false);
  const queryClient = useQueryClient();

  const runJikanEnrich = async () => {
    setEnriching(true);
    try {
      const { data, error } = await supabase.functions.invoke("jikan-enrich");
      if (error) throw error;
      toast({ title: "Enrichment complete", description: `Updated ${data.updated}, episodes ${data.episodesUpdated}, skipped ${data.skipped}, failed ${data.failed}` });
      queryClient.invalidateQueries({ queryKey: ["admin_content"] });
    } catch (e: any) {
      toast({ title: "Enrichment failed", description: e?.message || "Unknown error", variant: "destructive" });
    } finally {
      setEnriching(false);
    }
  };

  // Page views
  const { data: pageViews } = useQuery({
    queryKey: ["admin_page_views"],
    queryFn: async () => {
      const { data } = await supabase.from("page_views").select("*").order("created_at", { ascending: false }).limit(1000);
      return data || [];
    },
    enabled: !!isAdmin,
  });

  // Profiles
  const { data: profiles } = useQuery({
    queryKey: ["admin_profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!isAdmin,
  });

  // User roles
  const { data: userRoles } = useQuery({
    queryKey: ["admin_user_roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("*");
      return data || [];
    },
    enabled: !!isAdmin,
  });

  // Content
  const { data: contentList } = useQuery({
    queryKey: ["admin_content"],
    queryFn: async () => {
      const { data } = await supabase.from("content").select("*").order("title");
      return data || [];
    },
    enabled: !!isAdmin,
  });

  // Analytics computations
  const stats = useMemo(() => {
    if (!pageViews) return { today: 0, week: 0, month: 0, total: 0, daily: [] as any[] };
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    const today = pageViews.filter((v: any) => v.created_at?.startsWith(todayStr)).length;
    const week = pageViews.filter((v: any) => new Date(v.created_at) >= weekAgo).length;
    const month = pageViews.filter((v: any) => new Date(v.created_at) >= monthAgo).length;

    // Daily breakdown for last 14 days
    const dailyMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
      dailyMap.set(d, 0);
    }
    pageViews.forEach((v: any) => {
      const d = v.created_at?.slice(0, 10);
      if (dailyMap.has(d)) dailyMap.set(d, (dailyMap.get(d) || 0) + 1);
    });
    const daily = Array.from(dailyMap.entries()).map(([date, views]) => ({ date: date.slice(5), views }));

    return { today, week, month, total: pageViews.length, daily };
  }, [pageViews]);

  // Top pages
  const topPages = useMemo(() => {
    if (!pageViews) return [];
    const map = new Map<string, number>();
    pageViews.forEach((v: any) => map.set(v.page_path, (map.get(v.page_path) || 0) + 1));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, views]) => ({ path, views }));
  }, [pageViews]);

  if (authLoading || adminLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  }
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users },
    { id: "content", label: "Content", icon: Film },
    { id: "analytics", label: "Analytics", icon: Eye },
  ];

  const roleForUser = (userId: string) => {
    const r = (userRoles || []).find((r: any) => r.user_id === userId);
    return r?.role || "user";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-display font-extrabold">Admin Panel</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border/30 pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                tab === t.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Today", value: stats.today, color: "text-primary" },
                { label: "This Week", value: stats.week, color: "text-accent" },
                { label: "This Month", value: stats.month, color: "text-green-400" },
                { label: "Total", value: stats.total, color: "text-foreground" },
              ].map((s) => (
                <div key={s.label} className="glass-card p-4 rounded-xl">
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className={`text-2xl font-display font-extrabold ${s.color}`}>{s.value.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">page views</p>
                </div>
              ))}
            </div>

            <div className="glass-card p-6 rounded-xl">
              <h3 className="font-display font-bold text-sm mb-4">Views (Last 14 Days)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.daily}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-card p-4 rounded-xl">
                <h3 className="font-display font-bold text-sm mb-3">Quick Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Users</span><span className="font-bold">{profiles?.length || 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total Content</span><span className="font-bold">{contentList?.length || 0}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Admins</span><span className="font-bold">{(userRoles || []).filter((r: any) => r.role === "admin").length}</span></div>
                </div>
              </div>
              <div className="glass-card p-4 rounded-xl">
                <h3 className="font-display font-bold text-sm mb-3">Top Pages</h3>
                <div className="space-y-1">
                  {topPages.slice(0, 5).map((p) => (
                    <div key={p.path} className="flex justify-between text-xs">
                      <span className="text-muted-foreground truncate mr-2">{p.path}</span>
                      <span className="font-bold">{p.views}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-left">
                  <th className="p-3 text-xs text-muted-foreground font-medium">User</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Level</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">XP</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Role</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {(profiles || []).map((p: any) => (
                  <tr key={p.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                          {(p.display_name || "?").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium">{p.display_name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs">{p.level}</td>
                    <td className="p-3 text-xs">{p.xp}</td>
                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        roleForUser(p.user_id) === "admin" ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"
                      }`}>
                        {roleForUser(p.user_id)}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Content */}
        {tab === "content" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={runJikanEnrich}
                disabled={enriching}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary text-sm font-bold transition-colors disabled:opacity-50"
              >
                {enriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {enriching ? "Enriching…" : "Enrich images from Jikan"}
              </button>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-left">
                  <th className="p-3 text-xs text-muted-foreground font-medium">Title</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Type</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Year</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Rating</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Status</th>
                  <th className="p-3 text-xs text-muted-foreground font-medium">Featured</th>
                </tr>
              </thead>
              <tbody>
                {(contentList || []).map((c: any) => (
                  <tr key={c.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                    <td className="p-3 text-xs font-medium">{c.title}</td>
                    <td className="p-3"><span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{c.type}</span></td>
                    <td className="p-3 text-xs">{c.release_year}</td>
                    <td className="p-3 text-xs text-amber-400">★ {c.rating}</td>
                    <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded ${c.status === "ongoing" ? "bg-green-500/20 text-green-400" : c.status === "completed" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"}`}>{c.status}</span></td>
                    <td className="p-3 text-xs">{c.featured ? "⭐" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}

        {/* Analytics */}
        {tab === "analytics" && (
          <div className="space-y-8">
            <div className="glass-card p-6 rounded-xl">
              <h3 className="font-display font-bold text-sm mb-4">Daily Traffic (14 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.daily}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <h3 className="font-display font-bold text-sm mb-4">Page Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topPages} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="path" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={120} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="views" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
