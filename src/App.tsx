import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PageViewTracker = () => {
  usePageView();
  return null;
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
            <Route path="/live" element={<Live />} />
            <Route path="/live/:channelId" element={<LiveWatch />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
