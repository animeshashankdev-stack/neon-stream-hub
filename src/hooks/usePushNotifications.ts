import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ensurePushSubscription } from "@/pwa/registerSW";

const VAPID_KEY = (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ?? "";

type Status = "idle" | "unsupported" | "denied" | "granted" | "loading";

export function usePushNotifications() {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    setStatus(Notification.permission === "granted" ? "granted" : Notification.permission === "denied" ? "denied" : "idle");
  }, []);

  const subscribe = useCallback(async () => {
    if (!VAPID_KEY) {
      console.warn("[push] VITE_VAPID_PUBLIC_KEY not set");
      return null;
    }
    setStatus("loading");
    try {
      const sub = await ensurePushSubscription(VAPID_KEY);
      if (!sub) {
        setStatus(Notification.permission === "denied" ? "denied" : "idle");
        return null;
      }
      const { data } = await supabase.auth.getUser();
      try {
        await supabase.from("push_subscriptions" as never).upsert({
          user_id: data.user?.id ?? null,
          endpoint: sub.endpoint,
          subscription: sub.toJSON() as never,
        } as never, { onConflict: "endpoint" } as never);
      } catch (e) {
        // Table may not exist yet — keep the local subscription anyway.
        console.warn("[push] could not persist subscription", e);
      }
      setStatus("granted");
      return sub;
    } catch (e) {
      console.error("[push] subscribe failed", e);
      setStatus("idle");
      return null;
    }
  }, []);

  return { status, subscribe };
}