import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Minimize, ArrowLeft, ChevronDown, Server,
} from "lucide-react";
import { useContentDetail, useEpisodes, useVideoServers } from "@/hooks/useContent";
import Navbar from "@/components/Navbar";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

/** Detect if a URL should be embedded as an iframe */
function isEmbedUrl(url: string): boolean {
  if (!url) return false;
  // Direct video files → use native player
  if (/\.(mp4|webm|ogv|m3u8)(\?|$)/i.test(url)) return false;
  // Known embed providers
  if (url.includes("as-cdn21.top/video/")) return true;
  if (url.includes("short.icu/")) return true;
  if (url.includes("abysscdn.com")) return true;
  if (url.includes("embed")) return true;
  if (url.includes("/e/")) return true;
  if (url.includes("player")) return true;
  // Default: treat unknown URLs as iframes (safer than failing)
  return true;
}

/** Convert short.icu URLs to abysscdn player URLs */
function resolveStreamUrl(url: string): string {
  if (!url) return url;
  // short.icu/ABC → abysscdn.com/?v=ABC
  const shortMatch = url.match(/short\.icu\/([A-Za-z0-9_-]+)/);
  if (shortMatch) {
    return `https://abysscdn.com/?v=${shortMatch[1]}`;
  }
  return url;
}

const Watch = () => {
  const { contentId, episodeId } = useParams();
  const { data: content } = useContentDetail(contentId);
  const { data: episodes } = useEpisodes(contentId);
  const { data: servers } = useVideoServers(episodeId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimerRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [selectedServerIdx, setSelectedServerIdx] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);

  const epList = episodes || [];
  const currentEpIdx = epList.findIndex((e) => e.id === episodeId);
  const currentEp = epList[currentEpIdx >= 0 ? currentEpIdx : 0];

  // Seasons
  const seasons = useMemo(() => {
    const s = [...new Set(epList.map((e) => e.season_number))].sort((a, b) => a - b);
    return s;
  }, [epList]);

  // Auto-select current episode's season
  useEffect(() => {
    if (currentEp && selectedSeason === null) {
      setSelectedSeason(currentEp.season_number);
    }
  }, [currentEp, selectedSeason]);

  const filteredEpisodes = useMemo(() => {
    if (selectedSeason === null) return epList;
    return epList.filter((e) => e.season_number === selectedSeason);
  }, [epList, selectedSeason]);

  // Determine stream URL and mode
  const serverList = servers || [];
  const activeServer = serverList[selectedServerIdx] || serverList[0];
  const rawUrl = activeServer?.stream_url || "";
  const streamUrl = resolveStreamUrl(rawUrl);
  const useIframe = isEmbedUrl(streamUrl);

  // Attach native video source (non-iframe only)
  useEffect(() => {
    if (useIframe || !streamUrl) return;
    const video = videoRef.current;
    if (!video) return;

    if (streamUrl.endsWith(".m3u8")) {
      // HLS - dynamic import
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        }
      });
    } else {
      video.src = streamUrl;
    }
  }, [streamUrl, useIframe]);

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
  }, [useIframe, streamUrl]);

  // Volume sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  // Playback speed sync
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Fullscreen change listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }, []);

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    video.currentTime = pct * duration;
  };

  const skip = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.duration || 0, Math.max(0, video.currentTime + delta));
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "SELECT") return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          if (!useIframe) togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (!useIframe) skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (!useIframe) skip(10);
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
        case "M":
          e.preventDefault();
          if (!useIframe) setIsMuted((prev) => !prev);
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [useIframe, togglePlay, skip, toggleFullscreen]);

  const nextEp = currentEpIdx >= 0 && currentEpIdx < epList.length - 1 ? epList[currentEpIdx + 1] : null;
  const prevEp = currentEpIdx > 0 ? epList[currentEpIdx - 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Video Player Container */}
        <div
          ref={containerRef}
          className="relative w-full bg-black aspect-video max-h-[80vh]"
          onMouseMove={handleMouseMove}
        >
          {/* Video or Iframe */}
          {useIframe && streamUrl ? (
            <iframe
              src={streamUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
              frameBorder="0"
            />
          ) : streamUrl ? (
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-contain bg-black"
              playsInline
              onClick={togglePlay}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Play className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">
                  {servers === undefined ? "Loading video..." : "No video servers available for this episode"}
                </p>
              </div>
            </div>
          )}

          {/* Top bar overlay */}
          <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <Link to={`/content/${contentId}`} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{content?.title}</span>
            </Link>
            <div className="text-center">
              <p className="text-white/60 text-xs">
                {currentEp ? `S${currentEp.season_number} E${currentEp.episode_number}${currentEp.title ? ` • ${currentEp.title}` : ""}` : ""}
              </p>
            </div>

            {/* Server selector */}
            {serverList.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowServerMenu(!showServerMenu)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Server className="w-3 h-3" />
                  {activeServer?.server_name || `Server ${selectedServerIdx + 1}`}
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showServerMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-black/90 backdrop-blur-lg border border-white/10 rounded-lg p-1 z-50">
                    {serverList.map((srv, idx) => (
                      <button
                        key={srv.id}
                        onClick={() => { setSelectedServerIdx(idx); setShowServerMenu(false); }}
                        className={`block w-full text-left px-3 py-2 rounded text-xs transition-colors ${
                          idx === selectedServerIdx ? "bg-primary/30 text-primary" : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {srv.server_name} • {srv.language} • {srv.quality}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {serverList.length <= 1 && <div className="w-10" />}
          </div>

          {/* Center play button */}
          {!useIframe && streamUrl && (
            <button
              onClick={togglePlay}
              className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300 ${showControls && !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors">
                <Play className="w-7 h-7 text-white fill-current ml-1" />
              </div>
            </button>
          )}

          {/* Bottom controls (native video only) */}
          {!useIframe && streamUrl && (
            <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-12 pb-3 px-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer group mb-3" onClick={seekTo}>
                <div className="h-full bg-primary rounded-full relative transition-all" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => skip(-10)} className="text-white/70 hover:text-white p-1"><SkipBack className="w-4 h-4" /></button>
                  <button onClick={togglePlay} className="text-white hover:text-white/80 p-1">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>
                  <button onClick={() => skip(10)} className="text-white/70 hover:text-white p-1"><SkipForward className="w-4 h-4" /></button>

                  <button onClick={() => setIsMuted(!isMuted)} className="text-white/70 hover:text-white p-1 ml-1">
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input type="range" min={0} max={100} value={isMuted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }} className="w-16 accent-primary h-1" />

                  <span className="text-white/50 text-[11px] ml-1">{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Speed */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="px-2 py-1 text-[11px] text-white/70 hover:text-white font-medium rounded hover:bg-white/10 transition-colors"
                    >
                      {playbackSpeed}x
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-1 bg-black/90 backdrop-blur-lg border border-white/10 rounded-lg p-1 z-50">
                        {SPEEDS.map((s) => (
                          <button
                            key={s}
                            onClick={() => { setPlaybackSpeed(s); setShowSpeedMenu(false); }}
                            className={`block w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                              playbackSpeed === s ? "bg-primary/30 text-primary" : "text-white/70 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fullscreen */}
                  <button onClick={toggleFullscreen} className="text-white/70 hover:text-white p-1">
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fullscreen button for iframe mode too */}
          {useIframe && (
            <button
              onClick={toggleFullscreen}
              className={`absolute bottom-3 right-3 z-30 text-white/50 hover:text-white p-2 rounded-lg bg-black/50 hover:bg-black/70 transition-all ${showControls ? "opacity-100" : "opacity-0"}`}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Content Info & Episode Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navigation buttons */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {prevEp && (
                <Link
                  to={`/watch/${contentId}/${prevEp.id}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <SkipBack className="w-3.5 h-3.5" /> Previous
                </Link>
              )}
              {nextEp && (
                <Link
                  to={`/watch/${contentId}/${nextEp.id}`}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Next <SkipForward className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            <div className="text-right">
              <h2 className="font-display font-bold text-lg">{content?.title}</h2>
              {currentEp && (
                <p className="text-xs text-muted-foreground">
                  Season {currentEp.season_number} • Episode {currentEp.episode_number}
                  {currentEp.title ? ` — ${currentEp.title}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* Season Tabs */}
          {seasons.length > 1 && (
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {seasons.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSeason(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedSeason === s
                      ? "bg-primary text-primary-foreground"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Season {s}
                </button>
              ))}
            </div>
          )}

          {/* Episodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredEpisodes.map((ep) => (
              <Link
                key={ep.id}
                to={`/watch/${contentId}/${ep.id}`}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  ep.id === episodeId
                    ? "glass shadow-[0_0_15px_hsl(var(--primary)/0.3)] ring-1 ring-primary/30"
                    : "hover:bg-secondary/50"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  {ep.id === episodeId ? (
                    <Pause className="w-4 h-4 text-primary" />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">{ep.episode_number}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    Ep {ep.episode_number}{ep.title ? `: ${ep.title}` : ""}
                  </p>
                  {ep.duration_seconds && (
                    <p className="text-[11px] text-muted-foreground">{formatTime(ep.duration_seconds)}</p>
                  )}
                </div>
                {ep.id === episodeId && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold flex-shrink-0">NOW</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
