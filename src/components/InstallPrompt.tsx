import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "senpai:install-dismissed-at";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export default function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissed && Date.now() - dismissed < DISMISS_TTL_MS) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible || !evt) return null;

  const accept = async () => {
    try {
      await evt.prompt();
      await evt.userChoice;
    } finally {
      setVisible(false);
      setEvt(null);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[92%]">
      <div className="senpai-glass rounded-2xl border border-white/10 px-4 py-3 flex items-center gap-3 shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400 grid place-items-center text-white shrink-0">
          <Download size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white">Install Senpai.tv</div>
          <div className="text-xs text-white/60 truncate">Faster launches, full-screen, offline shell.</div>
        </div>
        <button
          onClick={accept}
          className="text-xs font-bold px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 text-white"
        >
          Install
        </button>
        <button onClick={dismiss} aria-label="Dismiss" className="text-white/50 hover:text-white p-1">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}