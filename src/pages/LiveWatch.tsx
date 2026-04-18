import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Maximize2, Minimize, Volume2, VolumeX, Star, AlertTriangle, Radio, Tv } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useIPTV } from "@/hooks/useIPTV";
import { useChannelFavorites, markChannelBroken } from "@/hooks/useChannelFavorites";
import { useEPG, getNowNext } from "@/hooks/useEPG";

const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const LiveWatch = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useIPTV();
  const { has, toggle } = useChannelFavorites();
  const { data: epg } = useEPG(channelId);

  const channel = data?.channels.find((c) => c.id === channelId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!channel) return;
    let hls: any = null;
    let cancelled = false;
    const video = videoRef.current;
    if (!video) return;
    setLoading(true); setError(null);

    (async () => {
      const { default: Hls } = await import("hls.js");
      if (cancelled) return;
      if (Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(channel.stream.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_e: any, d: any) => {
          if (d.fatal) {
            markChannelBroken(channel.id);
            setError("Stream unavailable. This channel has been hidden.");
            setLoading(false);
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = channel.stream.url;
        video.addEventListener("loadedmetadata", () => { setLoading(false); video.play().catch(() => {}); });
        video.addEventListener("error", () => {
          markChannelBroken(channel.id);
          setError("Stream unavailable.");
          setLoading(false);
        });
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
  }, [channel?.id, channel?.stream.url]);

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

  const { now, next } = getNowNext(epg);
  const nowProgress = now ? Math.min(100, ((Date.now() - now.start.getTime()) / (now.stop.getTime() - now.start.getTime())) * 100) : 0;

  const related = (data?.channels || [])
    .filter((c) => channel && c.id !== channel.id && (c.country === channel.country || c.categories.some((cat) => channel.categories.includes(cat))))
    .slice(0, 8);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080818] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-[#080818] text-white">
        <Navbar />
        <div className="pt-32 text-center">
          <Tv className="w-12 h-12 mx-auto text-white/30 mb-4" />
          <p className="text-white/70 mb-4">Channel not found.</p>
          <Link to="/live" className="text-teal-300 underline">Back to Live TV</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080818] text-white font-body">
      <Navbar />
      <main className="pt-20 sm:pt-24 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto pb-20">
        <button
          onClick={() => navigate("/live")}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Live TV
        </button>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div>
            <div ref={containerRef} className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
              <video ref={videoRef} className="w-full h-full" playsInline autoPlay muted={muted} controls={false} />

              {loading && !error && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
                </div>
              )}
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                  <div className="text-center max-w-sm px-6">
                    <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <p className="text-white font-bold mb-1">{error}</p>
                    <Link to="/live" className="text-teal-300 underline text-sm">Pick another channel</Link>
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-bold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> Live
                  </span>
                  <button onClick={() => setMuted((m) => !m)} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center">
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
                <button onClick={toggleFullscreen} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center">
                  {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* EPG strip */}
            {(now || next) && (
              <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                {now && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-teal-300 font-bold uppercase tracking-widest">Now · {fmtTime(now.start)}–{fmtTime(now.stop)}</span>
                      <span className="text-white/40">{Math.round(nowProgress)}%</span>
                    </div>
                    <p className="text-sm font-bold text-white truncate">{now.title}</p>
                    <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-teal-300 to-cyan-300" style={{ width: `${nowProgress}%` }} />
                    </div>
                  </div>
                )}
                {next && (
                  <div>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">Next · {fmtTime(next.start)}</p>
                    <p className="text-sm text-white/80 truncate">{next.title}</p>
                  </div>
                )}
              </div>
            )}

            {/* Channel info */}
            <div className="mt-4 flex items-start gap-4">
              {channel.logo && <img src={channel.logo} alt="" className="w-16 h-16 rounded-xl object-contain bg-white/10 p-2 shrink-0" />}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{channel.name}</h1>
                <p className="text-white/60 text-sm mt-1">{channel.flag} {channel.countryName}{channel.stream.quality ? ` · ${channel.stream.quality}` : ""}</p>
                {channel.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {channel.categories.slice(0, 4).map((c) => (
                      <span key={c} className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">{c}</span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => toggle(channel.id)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${has(channel.id) ? "bg-amber-400/20 border-amber-400/40 text-amber-300" : "bg-white/5 border-white/10 text-white/60 hover:text-amber-300"}`}
                aria-label="Favorite"
              >
                <Star className="w-4 h-4" fill={has(channel.id) ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          {/* Related */}
          <aside>
            <h3 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-teal-300" /> Related channels
            </h3>
            <div className="space-y-2">
              {related.map((c) => (
                <Link
                  key={c.id}
                  to={`/live/${encodeURIComponent(c.id)}`}
                  className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-400/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center overflow-hidden p-1 shrink-0">
                    {c.logo ? <img src={c.logo} alt="" className="max-w-full max-h-full object-contain" loading="lazy" /> : <Radio className="w-4 h-4 text-white/30" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{c.name}</p>
                    <p className="text-[11px] text-white/50 truncate">{c.flag} {c.countryName}</p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default LiveWatch;
