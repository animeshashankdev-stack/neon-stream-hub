import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { PWA_EVENTS, triggerAppUpdate } from "@/pwa/registerSW";

export default function UpdatePrompt() {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const onNeed = () => setNeedsRefresh(true);
    window.addEventListener(PWA_EVENTS.needRefresh, onNeed);
    return () => window.removeEventListener(PWA_EVENTS.needRefresh, onNeed);
  }, []);

  if (!needsRefresh) return null;

  const update = async () => {
    setUpdating(true);
    try {
      await triggerAppUpdate();
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] max-w-md w-[92%]">
      <div className="senpai-glass rounded-2xl border border-white/10 px-4 py-3 flex items-center gap-3 shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 grid place-items-center text-white shrink-0">
          <RefreshCw size={18} className={updating ? "animate-spin" : ""} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white">New version available</div>
          <div className="text-xs text-white/60 truncate">Reload to get the latest Senpai.tv.</div>
        </div>
        <button
          onClick={update}
          disabled={updating}
          className="text-xs font-bold px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 text-white disabled:opacity-60"
        >
          {updating ? "Updating…" : "Update & Reload"}
        </button>
        <button
          onClick={() => setNeedsRefresh(false)}
          aria-label="Dismiss"
          className="text-white/50 hover:text-white p-1"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}