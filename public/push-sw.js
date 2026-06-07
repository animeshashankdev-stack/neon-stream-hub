/* Senpai push notifications worker — separate from app-shell SW. */
/* eslint-disable no-restricted-globals */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Senpai", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Senpai.tv";
  const options = {
    body: data.body || "Something new just dropped.",
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    image: data.image,
    tag: data.tag || "senpai-update",
    renotify: !!data.renotify,
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if ("focus" in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});