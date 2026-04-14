import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function usePageView() {
  const location = useLocation();

  useEffect(() => {
    supabase.from("page_views").insert({
      page_path: location.pathname,
      user_agent: navigator.userAgent,
    }).then(() => {});
  }, [location.pathname]);
}
