import { useEffect, useRef, useState } from "react";
import { X, Maximize2, Minimize, Volume2, VolumeX, Loader2, AlertTriangle, Star } from "lucide-react";
import type { ResolvedChannel } from "@/hooks/useIPTV";
import { useChannelFavorites, markChannelBroken } from "@/hooks/useChannelFavorites";
import { useEPG, getNowNext } from "@/hooks/useEPG";

interface Props {
  channel: ResolvedChannel;
  onClose: () => void;
}

const fmt = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const LiveChannelPlayer = ({ channel, onClose }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { has, toggle } = useChannelFavorites();
  const { data: epg } = useEPG(channel.id);
  const { now, next } = getNowNext(epg);
  const nowProgress = now ? Math.min(100, ((Date.now() - now.start.getTime()) / (now.stop.getTime() - now.start.getTime())) * 100) : 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !document.fullscreenElement) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let hls: any = null;
    const video = videoRef.current;
    if (!video) return;
    setLoading(true); setError(null);

    const url = channel.stream.url;
    let cancelled = false;

    (async () => {
      const { default: Hls } = await import("hls.js");
      if (cancelled) return;

      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_e: any, data: any) => {
          if (data.fatal) {
            markChannelBroken(channel.id);
            setError("Stream unavailable. This channel has been hidden from the list.");
            setLoading(false);
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", () => { setLoading(false); video.play().catch(() => {}); });
        video.addEventListener("error", () => { markChannelBroken(channel.id); setError("Stream unavailable."); setLoading(false); });
      } else {
        setError("HLS not supported in this browser.");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (hls) hls.destroy();
      if (video) { video.pause(); video.removeAttribute("src"); video.load(); }
    };
  }, [channel.stream.url]);

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <video ref={videoRef} className="w-full h-full" playsInline autoPlay muted={muted} controls={false} />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {channel.logo && (
              <img src={channel.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1 shrink-0" />
            )}
            <div className="min-w-0">
              <h3 className="text-white font-bold truncate">{channel.name}</h3>
              <p className="text-xs text-white/60 truncate">
                {channel.flag} {channel.countryName} · LIVE
                {channel.stream.quality ? ` · ${channel.stream.quality}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggle(channel.id)}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${has(channel.id) ? "bg-amber-400/20 border-amber-400/40 text-amber-300" : "bg-white/10 border-white/10 text-white hover:text-amber-300"}`}
              aria-label="Favorite"
            >
              <Star className="w-4 h-4" fill={has(channel.id) ? "currentColor" : "none"} />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* EPG strip */}
        {(now || next) && (
          <div className="absolute top-[72px] left-0 right-0 px-4 pointer-events-none">
            <div className="bg-black/60 backdrop-blur border border-white/10 rounded-xl p-2.5 text-xs">
              {now && (
                <div className="mb-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-teal-300 font-bold uppercase tracking-widest text-[10px]">Now · {fmt(now.start)}–{fmt(now.stop)}</span>
                    <span className="text-white/40 text-[10px]">{Math.round(nowProgress)}%</span>
                  </div>
                  <p className="text-white font-semibold truncate">{now.title}</p>
                  <div className="mt-1 h-0.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-300 to-cyan-300" style={{ width: `${nowProgress}%` }} />
                  </div>
                </div>
              )}
              {next && (
                <p className="text-white/60 text-[11px] truncate"><span className="text-white/40 font-bold uppercase tracking-widest">Next · {fmt(next.start)}</span> — {next.title}</p>
              )}
            </div>
          </div>
        )}

        {/* Loading / error */}
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center max-w-sm px-6">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-white font-bold mb-1">{error}</p>
              <p className="text-white/50 text-sm">Some channels may be geo-restricted or temporarily offline.</p>
            </div>
          </div>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> Live
            </span>
            <button
              onClick={() => setMuted((m) => !m)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white"
          >
            {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveChannelPlayer;
