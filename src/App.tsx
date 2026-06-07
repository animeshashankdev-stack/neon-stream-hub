import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePageView } from "@/hooks/usePageView";
import Index from "./pages/Index";
import Search from "./pages/Search";
import ContentDetail from "./pages/ContentDetail";
import Watch from "./pages/Watch";
import Auth from "./pages/Auth";
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";
import Genres from "./pages/Genres";
import Admin from "./pages/Admin";
import Live from "./pages/Live";
import LiveWatch from "./pages/LiveWatch";
import Manga from "./pages/Manga";
import MangaDetail from "./pages/MangaDetail";
import MangaReader from "./pages/MangaReader";
import NotFound from "./pages/NotFound";
import BottomNav from "./components/BottomNav";
import { RequireAuth } from "./components/RequireAuth";
import InstallPrompt from "./components/InstallPrompt";
import UpdatePrompt from "./components/pwa/UpdatePrompt";

const queryClient = new QueryClient();

const PageViewTracker = () => {
  usePageView();
  return null;
};

const GlobalBottomNav = () => {
  const { pathname } = useLocation();
  // Hide on immersive screens (player, reader, auth)
  if (/^\/watch\//.test(pathname) || /^\/live\/[^/]+/.test(pathname) || /^\/manga\/[^/]+\/[^/]+/.test(pathname) || pathname === "/auth") {
    return null;
  }
  return <BottomNav />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageViewTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/content/:id" element={<ContentDetail />} />
            <Route path="/watch/:contentId/:episodeId" element={<Watch />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/genres" element={<Genres />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/live" element={<RequireAuth><Live /></RequireAuth>} />
            <Route path="/live/:channelId" element={<RequireAuth><LiveWatch /></RequireAuth>} />
            <Route path="/manga" element={<RequireAuth><Manga /></RequireAuth>} />
            <Route path="/manga/:id" element={<RequireAuth><MangaDetail /></RequireAuth>} />
            <Route path="/manga/:id/:chapterId" element={<RequireAuth><MangaReader /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <GlobalBottomNav />
          <InstallPrompt />
          <UpdatePrompt />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
