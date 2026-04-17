import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize2, Minimize, ArrowLeft, ChevronDown, Server,
  Settings, Subtitles, MessageSquare,
} from "lucide-react";
import { useContentDetail, useEpisodes, useVideoServers } from "@/hooks/useContent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function isEmbedUrl(url: string): boolean {
  if (!url) return false;
  if (/\.(mp4|webm|ogv|m3u8)(\?|$)/i.test(url)) return false;
  return true; // treat all non-direct URLs as embeddable
}

function resolveStreamUrl(url: string): string {
  if (!url) return url;
  const shortMatch = url.match(/short\.icu\/([A-Za-z0-9_-]+)/);
  if (shortMatch) return `https://abysscdn.com/?v=${shortMatch[1]}`;
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
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const epList = episodes || [];
  const currentEpIdx = epList.findIndex((e) => e.id === episodeId);
  const currentEp = epList[currentEpIdx >= 0 ? currentEpIdx : 0];

  const seasons = useMemo(() => {
    return [...new Set(epList.map((e) => e.season_number))].sort((a, b) => a - b);
  }, [epList]);

  useEffect(() => {
    if (currentEp && selectedSeason === null) setSelectedSeason(currentEp.season_number);
  }, [currentEp, selectedSeason]);

  const filteredEpisodes = useMemo(() => {
    if (selectedSeason === null) return epList;
    return epList.filter((e) => e.season_number === selectedSeason);
  }, [epList, selectedSeason]);

  const serverList = servers || [];
  const languages = useMemo(
    () => [...new Set(serverList.map((s) => s.language).filter(Boolean))],
    [serverList]
  );
  // pick default language once servers load
  useEffect(() => {
    if (!selectedLang && languages.length) setSelectedLang(languages[0]);
  }, [languages, selectedLang]);

  const langServers = useMemo(
    () => (selectedLang ? serverList.filter((s) => s.language === selectedLang) : serverList),
    [serverList, selectedLang]
  );
  const activeServer = langServers[selectedServerIdx] || langServers[0];
  const rawUrl = activeServer?.stream_url || "";
  const streamUrl = resolveStreamUrl(rawUrl);
  const useIframe = isEmbedUrl(streamUrl);

  // reset error when switching server / episode
  useEffect(() => { setIframeError(false); }, [streamUrl, episodeId]);
  // reset server idx when language changes
  useEffect(() => { setSelectedServerIdx(0); }, [selectedLang, episodeId]);

  useEffect(() => {
    if (useIframe || !streamUrl) return;
    const video = videoRef.current;
    if (!video) return;
    if (streamUrl.endsWith(".m3u8")) {
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

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
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "SELECT") return;
      switch (e.key) {
        case " ": e.preventDefault(); if (!useIframe) togglePlay(); break;
        case "ArrowLeft": e.preventDefault(); if (!useIframe) skip(-10); break;
        case "ArrowRight": e.preventDefault(); if (!useIframe) skip(10); break;
        case "f": case "F": e.preventDefault(); toggleFullscreen(); break;
        case "m": case "M": e.preventDefault(); if (!useIframe) setIsMuted((prev) => !prev); break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [useIframe, togglePlay, skip, toggleFullscreen]);

  const nextEp = currentEpIdx >= 0 && currentEpIdx < epList.length - 1 ? epList[currentEpIdx + 1] : null;
  const prevEp = currentEpIdx > 0 ? epList[currentEpIdx - 1] : null;

  return (
    <div className="min-h-screen bg-[#080818] text-white font-body selection:bg-accent/30 flex flex-col">
      {/* Video Player Area */}
      <div
        ref={containerRef}
        className="relative w-full h-[58vh] bg-black flex flex-col justify-center items-center group cursor-pointer overflow-hidden border-b border-white/5 shrink-0"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowControls(true)}
      >
        {/* Video or Iframe */}
        {useIframe && streamUrl && !iframeError ? (
          <iframe
            src={streamUrl}
            className="absolute inset-0 w-full h-full z-0"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            referrerPolicy="no-referrer"
            onError={() => setIframeError(true)}
            frameBorder="0"
          />
        ) : !useIframe && streamUrl ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain bg-black z-0"
            playsInline
            onClick={togglePlay}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-0 px-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-black" />
            <div className="z-10 text-center flex flex-col items-center max-w-md">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/10 flex items-center justify-center mb-6 backdrop-blur-xl bg-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <Server className="w-8 h-8 md:w-10 md:h-10 text-white/60" />
              </div>
              <p className="font-mono text-[11px] md:text-xs tracking-[0.2em] text-white/60 uppercase font-bold mb-2">
                {servers === undefined ? "Loading server…" : iframeError ? "Server blocked playback" : "No server available"}
              </p>
              <p className="text-white/50 text-xs md:text-sm leading-relaxed mb-5">
                {iframeError
                  ? "This source tried to redirect to ads. Try another server below."
                  : serverList.length === 0
                    ? "We couldn't find a working source for this episode yet. Pick another episode or check back soon."
                    : "Pick a different language or server."}
              </p>
              {langServers.length > 1 && (
                <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                  {langServers.map((srv, idx) => (
                    <button
                      key={srv.id}
                      onClick={() => { setSelectedServerIdx(idx); setIframeError(false); }}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                        idx === selectedServerIdx
                          ? "bg-accent/20 text-accent border-accent/40"
                          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {srv.server_name} · {srv.quality}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Navigation Overlay */}
        <div className={`absolute top-0 left-0 w-full p-4 md:p-6 z-40 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              to={`/content/${contentId}`}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <div>
              <p className="text-[10px] md:text-xs font-bold text-accent uppercase tracking-widest mb-0.5 drop-shadow-[0_0_5px_hsl(var(--accent)/0.5)]">
                {content?.title} {currentEp ? `• Season ${currentEp.season_number}` : ""}
              </p>
              <h1 className="text-sm md:text-xl font-bold text-white drop-shadow-md tracking-tight">
                {currentEp ? `E${currentEp.episode_number}${currentEp.title ? `: ${currentEp.title}` : ""}` : ""}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Language selector */}
            {languages.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => { setShowLangMenu(!showLangMenu); setShowServerMenu(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-colors font-medium"
                >
                  🌐 <span className="hidden sm:inline">{selectedLang}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 top-full mt-2 w-44 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {languages.map((lng) => (
                      <button
                        key={lng}
                        onClick={() => { setSelectedLang(lng); setShowLangMenu(false); }}
                        className={`block w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                          lng === selectedLang ? "bg-accent/20 text-accent" : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {lng}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Server selector */}
            {langServers.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => { setShowServerMenu(!showServerMenu); setShowLangMenu(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-colors font-medium"
                >
                  <Server className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{activeServer?.server_name || `Server ${selectedServerIdx + 1}`}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showServerMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {langServers.map((srv, idx) => (
                      <button
                        key={srv.id}
                        onClick={() => { setSelectedServerIdx(idx); setShowServerMenu(false); }}
                        className={`block w-full text-left px-4 py-2.5 rounded-xl text-xs transition-colors font-medium ${
                          idx === selectedServerIdx ? "bg-accent/20 text-accent" : "text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {srv.server_name} • {srv.quality}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 backdrop-blur-xl tracking-widest px-3 py-1 font-bold rounded-full text-[10px]">
              {activeServer?.quality || "HD"}
            </Badge>
          </div>
        </div>

        {/* Center play button (native video only) */}
        {!useIframe && streamUrl && (
          <button
            onClick={togglePlay}
            className={`absolute inset-0 flex items-center justify-center z-10 transition-opacity duration-300 ${showControls && !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <Play className="w-7 h-7 md:w-9 md:h-9 text-white fill-current ml-1" />
            </div>
          </button>
        )}

        {/* Glassmorphism Control Bar (native video only) */}
        {!useIframe && streamUrl && (
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[98%] max-w-6xl z-40 transition-all duration-300 ${showControls ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}>
            <div className="bg-black/60 backdrop-blur-2xl rounded-t-[20px] p-3 md:p-4 pb-4 md:pb-6 border-t border-l border-r border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
              {/* Progress Bar */}
              <div className="w-full flex items-center gap-3 md:gap-4 mb-3 md:mb-4 px-1 md:px-2">
                <span className="text-[11px] md:text-sm font-medium text-white/70 w-10 md:w-12 text-right font-mono">{formatTime(currentTime)}</span>
                <div className="flex-1 relative group/slider cursor-pointer py-3" onClick={seekTo}>
                  <div className="h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden absolute w-full top-1/2 -translate-y-1/2 group-hover/slider:h-2.5 transition-all shadow-inner">
                    <div className="h-full bg-gradient-to-r from-accent to-primary w-full shadow-[0_0_15px_hsl(var(--accent)/0.6)]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_hsl(var(--accent)/0.8)] opacity-0 group-hover/slider:opacity-100 group-hover/slider:scale-125 transition-all" style={{ left: `${progress}%` }} />
                </div>
                <span className="text-[11px] md:text-sm font-medium text-white/70 w-10 md:w-12 font-mono">{formatTime(duration)}</span>
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between px-2 md:px-4">
                <div className="flex items-center gap-1 md:gap-2">
                  <button className="text-white hover:bg-white/20 bg-white/10 rounded-full transition-colors p-1.5 md:p-2" onClick={() => skip(-10)}>
                    <SkipBack className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  </button>
                  <button
                    className="text-black bg-white hover:bg-accent/80 hover:scale-105 transition-all p-2 md:p-3 rounded-full mx-0.5 md:mx-1 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Play className="w-5 h-5 md:w-6 md:h-6 fill-current ml-0.5" />}
                  </button>
                  <button className="text-white hover:bg-white/20 bg-white/10 rounded-full transition-colors p-1.5 md:p-2" onClick={() => skip(10)}>
                    <SkipForward className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  </button>

                  <div className="w-px h-5 md:h-6 bg-white/20 mx-1 md:mx-2 hidden sm:block" />

                  <div className="hidden sm:flex items-center gap-2 group/vol">
                    <button className="text-white hover:bg-white/20 bg-white/10 rounded-full transition-colors p-1.5 md:p-2" onClick={() => setIsMuted(!isMuted)}>
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                    <div className="w-0 overflow-hidden group-hover/vol:w-20 md:group-hover/vol:w-24 transition-all duration-300 ease-in-out">
                      <input type="range" min={0} max={100} value={isMuted ? 0 : volume} onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }} className="w-20 md:w-24 accent-accent h-1" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 md:gap-3">
                  {/* Speed */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="text-white hover:bg-white/20 bg-white/10 rounded-full transition-colors px-2.5 py-1.5 text-[10px] md:text-xs font-bold"
                    >
                      {playbackSpeed}x
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        {SPEEDS.map((s) => (
                          <button
                            key={s}
                            onClick={() => { setPlaybackSpeed(s); setShowSpeedMenu(false); }}
                            className={`block w-full text-left px-4 py-2 rounded-xl text-xs transition-colors font-medium ${
                              playbackSpeed === s ? "bg-accent/20 text-accent" : "text-white/70 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-px h-5 md:h-6 bg-white/20 mx-0.5 md:mx-1 hidden sm:block" />

                  <button className="text-white hover:bg-white/20 bg-white/10 rounded-full transition-colors p-1.5 md:p-2" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen button for iframe mode */}
        {useIframe && (
          <button
            onClick={toggleFullscreen}
            className={`absolute bottom-4 right-4 z-40 text-white/60 hover:text-white p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/10 transition-all ${showControls ? "opacity-100" : "opacity-0"}`}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Info Section Below Player */}
      <div className="flex-1 bg-gradient-to-br from-[#080818] to-[#0A0A1A] p-4 md:p-8 lg:p-12 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Left Main Info */}
          <div className="flex-1 space-y-5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm font-semibold text-white/60 tracking-wide">
              <Link to={`/content/${contentId}`} className="text-accent hover:underline">{content?.title}</Link>
              <span>/</span>
              <span>Season {currentEp?.season_number || 1}</span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-white tracking-tight drop-shadow-md">
              {currentEp?.title || `Episode ${currentEp?.episode_number || 1}`}
            </h2>

            {content?.description && (
              <p className="text-white/70 font-light leading-relaxed max-w-3xl text-sm md:text-base">
                {content.description}
              </p>
            )}

            {/* Navigation buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
              {prevEp && (
                <Link
                  to={`/watch/${contentId}/${prevEp.id}`}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-xs font-bold text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-md transition-colors"
                >
                  <SkipBack className="w-3.5 h-3.5" /> Previous
                </Link>
              )}
              {nextEp && (
                <Link
                  to={`/watch/${contentId}/${nextEp.id}`}
                  className="flex items-center gap-2 bg-gradient-to-r from-accent to-primary text-black font-bold rounded-full px-5 py-2.5 text-xs shadow-[0_0_20px_hsl(var(--accent)/0.4)] hover:shadow-[0_0_30px_hsl(var(--accent)/0.6)] transition-all"
                >
                  Next Episode <SkipForward className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Right Sidebar — Episodes */}
          <div className="w-full lg:w-[400px] shrink-0 space-y-4">
            <h3 className="text-lg font-display font-black text-white tracking-wide uppercase">Episodes</h3>

            {/* Season Tabs */}
            {seasons.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {seasons.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSeason(s)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedSeason === s
                        ? "bg-accent/20 text-accent border-accent/40 shadow-[0_0_10px_hsl(var(--accent)/0.3)]"
                        : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Season {s}
                  </button>
                ))}
              </div>
            )}

            {/* Episode List */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] p-2 flex flex-col gap-1.5 max-h-[500px] overflow-y-auto scrollbar-hide">
              {filteredEpisodes.map((ep) => (
                <Link
                  key={ep.id}
                  to={`/watch/${contentId}/${ep.id}`}
                  className={`flex gap-3 p-2.5 rounded-[16px] transition-all duration-300 cursor-pointer group items-center ${
                    ep.id === episodeId
                      ? "bg-accent/10 border border-accent/30 shadow-[0_0_15px_hsl(var(--accent)/0.2)]"
                      : "border border-transparent hover:bg-white/5 hover:border-white/10"
                  }`}
                >
                  <div className={`relative w-24 md:w-28 aspect-video rounded-[10px] overflow-hidden shrink-0 flex items-center justify-center ${
                    ep.id === episodeId ? "bg-gradient-to-br from-accent/30 to-primary/30" : "bg-gradient-to-br from-white/5 to-white/10"
                  }`}>
                    {ep.id === episodeId ? (
                      <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center backdrop-blur-sm border border-accent/30">
                        <Pause className="w-3 h-3 text-accent fill-current" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        <Play className="w-3 h-3 text-white fill-current ml-0.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center min-w-0 py-0.5">
                    <h4 className={`text-sm font-bold leading-snug mb-0.5 line-clamp-2 transition-colors ${
                      ep.id === episodeId ? "text-accent" : "text-white/90 group-hover:text-accent"
                    }`}>
                      {ep.episode_number}. {ep.title || `Episode ${ep.episode_number}`}
                    </h4>
                    <span className="text-[11px] text-white/50 font-medium">
                      {ep.duration_seconds ? formatTime(ep.duration_seconds) : ""}
                      {ep.id === episodeId && <span className="ml-2 text-accent font-bold">● NOW PLAYING</span>}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
