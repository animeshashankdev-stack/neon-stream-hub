import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function usePageView() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    supabase.from("page_views").insert({
      page_path: location.pathname,
      user_agent: navigator.userAgent,
      user_id: user.id,
    }).then(() => {});
  }, [location.pathname, user]);
}
