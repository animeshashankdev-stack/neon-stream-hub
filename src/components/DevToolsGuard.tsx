import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

/**
 * Best-effort DevTools detection. When devtools open (size heuristic or
 * debugger timing), warns the user and redirects to home. This is a
 * deterrent, not real DRM — determined users can bypass it.
 */
const DevToolsGuard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (import.meta.env.DEV) return; // don't run in dev preview
    let triggered = false;

    const trigger = () => {
      if (triggered) return;
      triggered = true;
      try {
        toast({
          title: "Developer tools detected",
          description: "Please close DevTools to continue browsing Senpai.tv.",
          variant: "destructive",
        });
      } catch {}
      try { navigate("/", { replace: true }); } catch { window.location.href = "/"; }
    };

    const sizeCheck = () => {
      const threshold = 170;
      const wDiff = window.outerWidth - window.innerWidth;
      const hDiff = window.outerHeight - window.innerHeight;
      if (wDiff > threshold || hDiff > threshold) trigger();
    };

    const timingCheck = () => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      if (performance.now() - start > 100) trigger();
    };

    const id = window.setInterval(() => {
      sizeCheck();
      timingCheck();
    }, 1500);

    return () => window.clearInterval(id);
  }, [navigate]);

  return null;
};

export default DevToolsGuard;