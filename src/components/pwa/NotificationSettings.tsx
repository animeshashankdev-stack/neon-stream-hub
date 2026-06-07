import { Bell, BellOff, Check } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function NotificationSettings() {
  const { status, subscribe } = usePushNotifications();

  const granted = status === "granted";
  const denied = status === "denied";
  const unsupported = status === "unsupported";

  return (
    <div className="bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 ${
          granted
            ? "bg-gradient-to-br from-teal-400 to-cyan-500"
            : "bg-white/10"
        }`}
      >
        {granted ? <Check className="text-white" size={20} /> : <Bell className="text-white" size={20} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white">Push notifications</div>
        <div className="text-xs text-white/60">
          {unsupported && "Your browser does not support push notifications."}
          {denied && "Notifications are blocked — enable them in your browser settings."}
          {granted && "You'll get pings for new episodes, drops and watch-party invites."}
          {status === "idle" && "Get notified when new episodes drop or your party starts."}
          {status === "loading" && "Requesting permission…"}
        </div>
      </div>
      {granted ? (
        <span className="text-xs font-bold px-3 py-2 rounded-xl bg-teal-400/20 text-teal-200 border border-teal-300/30">
          Enabled
        </span>
      ) : denied || unsupported ? (
        <span className="text-xs font-bold px-3 py-2 rounded-xl bg-white/5 text-white/40 border border-white/10 flex items-center gap-1.5">
          <BellOff size={14} /> Off
        </span>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={subscribe}
            disabled={status === "loading"}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 text-white disabled:opacity-60"
          >
            Enable
          </button>
          <button
            onClick={() => {
              try {
                localStorage.setItem("senpai:push-snoozed-at", String(Date.now()));
              } catch {}
              // Force re-render by reloading — minimal but explicit dismissal.
              window.dispatchEvent(new CustomEvent("senpai:push-dismissed"));
            }}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
          >
            Not now
          </button>
        </div>
      )}
    </div>
  );
}