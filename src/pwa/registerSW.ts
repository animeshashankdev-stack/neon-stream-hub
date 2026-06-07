/**
 * Guarded service-worker registration for the app shell + push.
 * NEVER registers in dev or Lovable preview contexts.
 */
import { registerSW } from "virtual:pwa-register";

const APP_SW_PATH = "/sw.js";
const PUSH_SW_PATH = "/push-sw.js";

function isRefusedContext(): boolean {
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const h = window.location.hostname;
  if (
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    h === "lovableproject.com" ||
    h.endsWith(".lovableproject.com") ||
    h === "lovableproject-dev.com" ||
    h.endsWith(".lovableproject-dev.com") ||
    h === "beta.lovable.dev" ||
    h.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }
  if (new URLSearchParams(window.location.search).has("sw")) {
    if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  }
  return false;
}

async function unregisterAppSW() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  for (const r of regs) {
    const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
    if (url.endsWith(APP_SW_PATH)) await r.unregister();
  }
}

export function initPWA() {
  if (typeof window === "undefined") return;
  if (isRefusedContext()) {
    unregisterAppSW().catch(() => {});
    return;
  }
  if (!("serviceWorker" in navigator)) return;

  registerSW({ immediate: true });

  // Register the push notification worker on a separate scope-safe URL.
  navigator.serviceWorker.register(PUSH_SW_PATH, { scope: "/push/" }).catch(() => {});
}

export async function ensurePushSubscription(vapidPublicKey: string): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  const perm = await Notification.requestPermission();
  if (perm !== "granted") return null;
  const reg = await navigator.serviceWorker.register(PUSH_SW_PATH, { scope: "/push/" });
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}