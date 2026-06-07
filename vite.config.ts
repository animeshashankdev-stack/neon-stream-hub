import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      manifestFilename: "manifest.webmanifest",
      devOptions: { enabled: false },
      includeAssets: [
        "favicon.png",
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "logo.svg",
        "push-sw.js",
      ],
      manifest: false,
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/~oauth/,
          /^\/api\//,
          /^\/auth\/v1\//,
          /^\/functions\//,
          /^\/storage\//,
          /^\/rest\//,
          /^\/realtime\//,
          /^\/push\//,
          /^\/push-sw\.js$/,
        ],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        // Precache critical routes — these all resolve to /index.html via SPA fallback,
        // but warming the cache keys speeds up the first cold navigation.
        additionalManifestEntries: [
          { url: "/", revision: null },
          { url: "/search", revision: null },
          { url: "/genres", revision: null },
          { url: "/watchlist", revision: null },
        ],
        // Never cache streams / large media / API responses.
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
            handler: "NetworkFirst",
            options: {
              cacheName: "senpai-html",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\.(?:js|css|woff2?|ttf|otf)$/i.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "senpai-static",
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url }) =>
              /\.(?:png|jpg|jpeg|webp|avif|gif|svg|ico)$/i.test(url.pathname),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "senpai-img",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 },
            },
          },
          // Stream safety: explicitly do NOT cache video/audio/HLS/DASH/range requests.
          {
            urlPattern: ({ request, url }) =>
              request.destination === "video" ||
              request.destination === "audio" ||
              /\.(?:m3u8|ts|mp4|m4s|mpd|webm|mkv|aac|mp3|vtt)(\?|$)/i.test(url.pathname),
            handler: "NetworkOnly",
          },
          // Supabase / API: network-only.
          {
            urlPattern: ({ url }) =>
              /supabase\.co$/i.test(url.hostname) ||
              url.pathname.startsWith("/functions/") ||
              url.pathname.startsWith("/rest/") ||
              url.pathname.startsWith("/auth/v1/") ||
              url.pathname.startsWith("/realtime/") ||
              url.pathname.startsWith("/storage/"),
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
}));
