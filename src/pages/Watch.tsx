import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Hls from "hls.js";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Settings, ArrowLeft, Subtitles,
  FastForward,
} from "lucide-react";
import { useContentDetail, useEpisodes, useVideoServers } from "@/hooks/useContent";

const qualities = ["1080p", "720p", "480p"];
const subtitleLangs = ["Off", "English", "Japanese", "Spanish"];

const Watch = () => {
  const { contentId, episodeId } = useParams();
  const { data: content } = useContentDetail(contentId);
  const { data: episodes } = useEpisodes(contentId);
  const { data: servers } = useVideoServers(episodeId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimerRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState("1080p");
  const [selectedSubtitle, setSelectedSubtitle] = useState("English");
  const [showSettings, setShowSettings] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(true);
  const [useIframe, setUseIframe] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");

  const epList = episodes || [];
  const currentEpIdx = epList.findIndex((e) => e.id === episodeId);
  const currentEp = epList[currentEpIdx >= 0 ? currentEpIdx : 0];

  // Attach video source
  useEffect(() => {
    if (!servers || servers.length === 0) return;
    const server = servers[0];
    const url = server.stream_url;
    setStreamUrl(url);

    const video = videoRef.current;
    if (!video) {
      // If URL looks like an embed page, use iframe
      if (url.includes("embed") || url.includes("/e/") || url.includes("player")) {
        setUseIframe(true);
      }
      return;
    }

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (url.endsWith(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hlsRef.current = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      }
    } else if (url.match(/\.(mp4|webm|ogv)(\?|$)/i)) {
      video.src = url;
    } else {
      // Treat as embed URL
      setUseIframe(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [servers]);

  // Sync video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video || useIframe) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("durationchange", onDurationChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("durationchange", onDurationChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [useIframe]);

  // Volume sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * duration;
  };

  const skip = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(duration, Math.max(0, video.currentTime + delta));
  };

  const handleFullscreen = () => {
    const el = document.querySelector(".watch-container") as HTMLElement;
    if (el) el.requestFullscreen?.();
  };

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  return (
    <div className="watch-container fixed inset-0 bg-black flex flex-col" onMouseMove={handleMouseMove}>
      <div className="relative flex-1 flex items-center justify-center">
        {/* Video or iframe */}
        {useIframe ? (
          <iframe
            src={streamUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media"
            frameBorder="0"
          />
        ) : (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            playsInline
            onClick={togglePlay}
          />
        )}

        {/* Overlay gradient when no video loaded */}
        {!servers?.length && (
          <div className="absolute inset-0 bg-gradient-to-br from-background via-black to-background flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Loading video...</p>
          </div>
        )}

        {/* Top bar */}
        <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <Link to={`/content/${contentId}`} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-center">
            <p className="text-white font-display font-bold text-sm">{content?.title || "Loading..."}</p>
            <p className="text-white/60 text-xs">
              {currentEp ? `S${currentEp.season_number} : E${currentEp.episode_number} • ${currentEp.title}` : ""}
            </p>
          </div>
          <div className="w-10" />
        </div>

        {/* Center play (only when not iframe) */}
        {!useIframe && (
          <button
            onClick={togglePlay}
            className={`relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 transition-opacity duration-300 hover:bg-white/20 ${showControls && !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <Play className="w-7 h-7 text-white fill-current ml-1" />
          </button>
        )}

        {/* Skip intro */}
        {!useIframe && showSkipIntro && showControls && currentTime < 120 && (
          <button
            onClick={() => { skip(90); setShowSkipIntro(false); }}
            className="absolute bottom-28 right-6 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
          >
            SKIP INTRO <FastForward className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bottom controls (hidden for iframe) */}
        {!useIframe && (
          <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-4 px-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer group mb-3 relative" onClick={seekTo}>
              <div className="h-full bg-primary rounded-full relative transition-all" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => skip(-10)} className="text-white/70 hover:text-white transition-colors">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button onClick={togglePlay} className="text-white hover:text-white/80 transition-colors">
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>
                <button onClick={() => skip(10)} className="text-white/70 hover:text-white transition-colors">
                  <SkipForward className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 ml-2">
                  <button onClick={() => setIsMuted(!isMuted)} className="text-white/70 hover:text-white transition-colors">
                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input type="range" min={0} max={100} value={isMuted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }} className="w-20 accent-primary h-1" />
                </div>
                <span className="text-white/60 text-xs ml-2">{formatTime(currentTime)} / {formatTime(duration)}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent/20 text-accent">{selectedQuality}</span>
                <div className="relative">
                  <button onClick={() => setShowSettings(!showSettings)} className="text-white/70 hover:text-white transition-colors p-1">
                    <Settings className="w-4 h-4" />
                  </button>
                  {showSettings && (
                    <div className="absolute bottom-8 right-0 w-56 glass-card p-3 space-y-3 z-30">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Quality</p>
                        <div className="flex flex-wrap gap-1">
                          {qualities.map((q) => (
                            <button key={q} onClick={() => setSelectedQuality(q)} className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${selectedQuality === q ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>{q}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative group/sub">
                  <button className="text-white/70 hover:text-white transition-colors p-1"><Subtitles className="w-4 h-4" /></button>
                  <div className="absolute bottom-8 right-0 w-36 glass-card p-2 hidden group-hover/sub:block z-30">
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Subtitles</p>
                    {subtitleLangs.map((s) => (
                      <button key={s} onClick={() => setSelectedSubtitle(s)} className={`block w-full text-left px-2 py-1 rounded text-xs transition-colors ${selectedSubtitle === s ? "bg-primary/20 text-primary" : "text-foreground hover:bg-secondary/50"}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <button onClick={handleFullscreen} className="text-white/70 hover:text-white transition-colors p-1"><Maximize className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Side panel */}
      <div className="absolute top-0 right-0 bottom-0 w-80 z-30 glass border-l border-border/30 overflow-y-auto scrollbar-hide hidden lg:block">
        <div className="p-4">
          <h3 className="font-display font-bold text-sm mb-4">Episodes</h3>
          <div className="space-y-1.5">
            {epList.map((ep) => (
              <Link
                key={ep.id}
                to={`/watch/${contentId}/${ep.id}`}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${ep.id === episodeId ? "glass shadow-[0_0_15px_hsl(265_90%_60%/0.2)]" : "hover:bg-secondary/30"}`}
              >
                <div className="relative w-20 aspect-video rounded-md overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center">
                  <Play className="w-4 h-4 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  {ep.id === episodeId && <span className="text-[9px] px-1 py-0.5 rounded bg-primary/20 text-primary font-bold">Playing</span>}
                  <p className="text-xs font-semibold truncate">{String(ep.episode_number).padStart(2, "0")}. {ep.title}</p>
                  {ep.duration_seconds && <p className="text-[10px] text-muted-foreground">{formatTime(ep.duration_seconds)}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
