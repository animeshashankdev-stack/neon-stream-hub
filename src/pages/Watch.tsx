import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize2, Minimize, ArrowLeft, ChevronDown, Server,
  Settings, Subtitles, MessageSquare, Lock, Users, Loader2,
} from "lucide-react";
import { useContentDetail, useEpisodes, useVideoServers } from "@/hooks/useContent";
import { useStreamToken } from "@/hooks/useStreamToken";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEpisodeChapters } from "@/hooks/useEpisodeChapters";
import { WatchPartyPanel } from "@/components/WatchPartyPanel";
import { findPartyByCode } from "@/hooks/useWatchParty";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function isDirectStreamUrl(url: string): boolean {
  if (!url) return false;
  // Direct playable streams we can load into <video> or via HLS.
  return /\.(mp4|webm|ogv|m3u8)(\?|$)/i.test(url);
}

const AD_DOMAINS_RE = /(short\.icu|shrtfly|adfly|adf\.ly|linkvertise|ouo\.io|exe\.io|bc\.vc|cuty\.io|clk\.sh|sub2unlock|safelinkconverter)/i;

function resolveStreamUrl(url: string): string {
  if (!url) return url;
  const shortMatch = url.match(/short\.icu\/([A-Za-z0-9_-]+)/);
  if (shortMatch) return `https://abysscdn.com/?v=${shortMatch[1]}`;
  return url;
}

const Watch = () => {
  const { contentId, episodeId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: content } = useContentDetail(contentId);
  const { data: episodes } = useEpisodes(contentId);
  const { data: servers } = useVideoServers(episodeId);
  const { data: chapters = [] } = useEpisodeChapters(episodeId);

  // Watch party state
  const [partyOpen, setPartyOpen] = useState(false);
  const [partyId, setPartyIdState] = useState<string | null>(null);
  const [partyCode, setPartyCode] = useState<string | null>(null);
  const setPartyId = useCallback((id: string | null, code?: string) => {
    setPartyIdState(id);
    setPartyCode(id ? (code || null) : null);
    const next = new URLSearchParams(searchParams);
    if (id && code) next.set("party", code); else next.delete("party");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // Auto-join from ?party= query
  useEffect(() => {
    const code = searchParams.get("party");
    if (!code || partyId) return;
    findPartyByCode(code).then((p) => {
      if (p) { setPartyIdState(p.id); setPartyCode(p.code); setPartyOpen(true); }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
  // Smart fallback state
  const [iframeMode, setIframeMode] = useState<"sandboxed" | "unsafe">("sandboxed");
  const [iframeKey, setIframeKey] = useState(0);
  const [autoTried, setAutoTried] = useState<Set<string>>(new Set());
  const loadTimerRef = useRef<number | null>(null);

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

  const serverList = useMemo(
    () => (servers || []).filter((s) => s.stream_url && !AD_DOMAINS_RE.test(s.stream_url)),
    [servers]
  );
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
  // Use <video> for direct playable streams. Everything else is treated as embed/iframe.
  const useIframe = streamUrl ? !isDirectStreamUrl(streamUrl) : false;


  // Hardened streaming: for direct video streams, route through signed proxy
  const { mutateAsync: issueToken } = useStreamToken();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  useEffect(() => {
    setSignedUrl(null);
    if (useIframe || !activeServer?.id || !episodeId) return;
    let cancelled = false;
    issueToken({ episodeId, serverId: activeServer.id })
      .then((r) => { if (!cancelled) setSignedUrl(r.url); })
      .catch(() => { if (!cancelled) setSignedUrl(streamUrl); /* fall back to raw */ });
    return () => { cancelled = true; };
  }, [useIframe, activeServer?.id, episodeId, issueToken, streamUrl]);

  // reset error + restart attempt when switching server / episode
  useEffect(() => {
    setIframeError(false);
    setIframeMode("sandboxed");
    setIframeKey((k) => k + 1);
  }, [streamUrl, episodeId]);
  // reset server idx + auto-tried set when language or episode changes
  useEffect(() => {
    setSelectedServerIdx(0);
    setAutoTried(new Set());
  }, [selectedLang, episodeId]);

  // Smart fallback: if iframe/embed doesn't load in 8s, advance to next server (sandboxed).
  // If all servers tried sandboxed, fall back to unsafe mode on the first server.
  useEffect(() => {
    if (!useIframe || !streamUrl || iframeError) return;

    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    loadTimerRef.current = window.setTimeout(() => {
      // load took too long → treat as failure
      handleIframeFail();
    }, 6000);
    return () => { if (loadTimerRef.current) clearTimeout(loadTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamUrl, useIframe, iframeKey]);

  const handleIframeFail = useCallback(() => {
    if (loadTimerRef.current) { clearTimeout(loadTimerRef.current); loadTimerRef.current = null; }
    const currentKey = `${selectedLang}-${selectedServerIdx}-${iframeMode}`;
    setAutoTried((prev) => {
      const next = new Set(prev);
      next.add(currentKey);
      return next;
    });
    // Try next sandboxed server
    if (iframeMode === "sandboxed") {
      const nextIdx = selectedServerIdx + 1;
      if (nextIdx < langServers.length) {
        setSelectedServerIdx(nextIdx);
        setIframeKey((k) => k + 1);
        return;
      }
      // All sandboxed servers tried → last resort: unsafe on first server
      if (langServers.length > 0) {
        setSelectedServerIdx(0);
        setIframeMode("unsafe");
        setIframeKey((k) => k + 1);
        return;
      }
    }
    // Already in unsafe mode and still failed → show manual picker
    setIframeError(true);
  }, [iframeMode, selectedServerIdx, langServers.length, selectedLang]);

  const handleIframeLoad = useCallback(() => {
    if (loadTimerRef.current) { clearTimeout(loadTimerRef.current); loadTimerRef.current = null; }
  }, []);

  const backToSafeMode = useCallback(() => {
    setIframeMode("sandboxed");
    setSelectedServerIdx(0);
    setAutoTried(new Set());
    setIframeError(false);
    setIframeKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (useIframe || !streamUrl) return;
    const video = videoRef.current;
    if (!video) return;
    const playUrl = signedUrl || streamUrl;
    if (streamUrl.endsWith(".m3u8") || (signedUrl && signedUrl.includes("stream-proxy"))) {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(playUrl);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playUrl;
        }
      });
    } else {
      video.src = playUrl;
    }
  }, [streamUrl, useIframe, signedUrl]);

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

  const backdropImage = content?.banner_url || content?.poster_url || "";
  const posterImage = content?.poster_url || content?.thumbnail_url || "";
  const epFallback = content?.thumbnail_url || content?.poster_url || "";

  // Are we still discovering / cycling servers silently?
  const isDiscovering =
    !user
      ? false
      : servers === undefined || (useIframe && !!streamUrl && !iframeError && autoTried.size < langServers.length);
  const canonicalUrl = typeof window !== "undefined"
    ? `${window.location.origin}/watch/${contentId}/${episodeId}`
    : `/watch/${contentId}/${episodeId}`;
  const episodeTitle = currentEp
    ? `${content?.title || "Watch"} — S${currentEp.season_number}E${currentEp.episode_number}${currentEp.title ? `: ${currentEp.title}` : ""}`
    : content?.title || "Watch";
  const episodeDesc = currentEp?.description || content?.description || `Stream ${content?.title || "episode"} on Senpai.tv`;

  return (
    <div className="senpai-root min-h-screen bg-[#080818] text-white font-body selection:bg-accent/30 flex flex-col">
      {content && (
        <Helmet>
          <title>{episodeTitle}</title>
          <meta name="description" content={episodeDesc.slice(0, 155)} />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:title" content={episodeTitle} />
          <meta property="og:description" content={episodeDesc.slice(0, 155)} />
          <meta property="og:type" content="video.episode" />
          <meta property="og:url" content={canonicalUrl} />
          {(content.banner_url || content.poster_url) && (
            <meta property="og:image" content={content.banner_url || content.poster_url || ""} />
          )}
          <meta name="twitter:card" content="summary_large_image" />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TVEpisode",
              name: currentEp?.title || `Episode ${currentEp?.episode_number || 1}`,
              episodeNumber: currentEp?.episode_number,
              partOfSeason: currentEp ? { "@type": "TVSeason", seasonNumber: currentEp.season_number } : undefined,
              partOfSeries: { "@type": "TVSeries", name: content.title },
              image: content.banner_url || content.poster_url || undefined,
              url: canonicalUrl,
            })}
          </script>
        </Helmet>
      )}
      {/* Video Player Area */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video lg:aspect-auto lg:h-[60vh] xl:h-[65vh] max-h-[80vh] bg-black flex flex-col justify-center items-center group cursor-pointer overflow-hidden border-b border-white/5 shrink-0"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowControls(true)}
      >
        {/* Video or Iframe */}
        {useIframe && streamUrl && !iframeError ? (
          <iframe
            key={iframeKey}
            src={streamUrl}
            className="absolute inset-0 w-full h-full z-0"
            allowFullScreen
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            sandbox={iframeMode === "sandboxed" ? "allow-scripts allow-same-origin allow-presentation allow-forms" : undefined}
            referrerPolicy="no-referrer"
            onLoad={handleIframeLoad}
            onError={handleIframeFail}
            frameBorder="0"
          />
        ) : !useIframe && streamUrl ? (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain bg-black z-0"
            playsInline
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture={false}
            onContextMenu={(e) => e.preventDefault()}
            onClick={togglePlay}
          />
        ) : null}

        {/* Unsafe-mode ad warning banner */}
        {useIframe && streamUrl && !iframeError && iframeMode === "unsafe" && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-[92%] px-4 py-2 rounded-full bg-red-500/90 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold flex items-center gap-2 shadow-[0_10px_30px_rgba(239,68,68,0.4)] border border-red-300/30">
            <span>⚠ Ads may appear — this provider requires it to play.</span>
            <button
              onClick={backToSafeMode}
              className="ml-1 px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-[10px] uppercase tracking-wider whitespace-nowrap"
            >
              Safe mode
            </button>
          </div>
        )}

        {/* Empty placeholder fallback */}
        {(!streamUrl || iframeError || langServers.length === 0) && (

          <div className="absolute inset-0 flex items-center justify-center z-0 px-6">
            {backdropImage && (
              <img
                src={backdropImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xl scale-110"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/80 to-black/90" />
            <div className="z-10 text-center flex flex-col items-center max-w-md">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/10 flex items-center justify-center mb-6 backdrop-blur-xl bg-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                {!user ? (
                  <Lock className="w-8 h-8 md:w-10 md:h-10 text-accent" />
                ) : isDiscovering ? (
                  <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-accent animate-spin" />
                ) : (
                  <Server className="w-8 h-8 md:w-10 md:h-10 text-white/60" />
                )}
              </div>
              <p className="font-mono text-[11px] md:text-xs tracking-[0.2em] text-white/60 uppercase font-bold mb-2">
        {!user
                  ? "Sign in required"
                  : isDiscovering
                    ? "Finding the best server…"
                    : iframeError
                      ? "All servers blocked"
                      : langServers.length === 0
                        ? "No server available"
                        : "We couldn't load this source. Try another server."}

              </p>
              <p className="text-white/50 text-xs md:text-sm leading-relaxed mb-5">
                {!user
                  ? "Video playback requires an account. Create one or sign in — it's free and unlocks streaming, manga, watchlist sync and more."
                  : isDiscovering
                    ? "Checking sources and quality in the background. This usually takes a few seconds."
                    : iframeError
                    ? "Every source either timed out or required ads. Pick one below to retry."
                    : serverList.length === 0
                      ? "We couldn't find a working source for this episode yet. Pick another episode or check back soon."
                      : "Pick a different language or server."}
              </p>
              {!user && (
                <Link
                  to={`/auth?next=${encodeURIComponent(`/watch/${contentId}/${episodeId || ""}`)}`}
                  className="px-5 py-2.5 rounded-full bg-accent text-black font-bold text-sm hover:bg-accent/80 transition-colors mb-3"
                >
                  Sign in to watch
                </Link>
              )}
              {!isDiscovering && iframeError && langServers.length > 1 && (
                <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                  {langServers.map((srv, idx) => (
                    <button
                      key={srv.id}
                      onClick={() => {
                        setSelectedServerIdx(idx);
                        setIframeMode("sandboxed");
                        setIframeError(false);
                        setIframeKey((k) => k + 1);
                      }}
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
            {langServers.length > 1 && !isDiscovering && (
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
                        onClick={() => {
                          setSelectedServerIdx(idx);
                          setIframeMode("sandboxed");
                          setIframeError(false);
                          setIframeKey((k) => k + 1);
                          setShowServerMenu(false);
                        }}
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
            {user && (
              <button
                onClick={() => setPartyOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs backdrop-blur-md border transition-colors font-medium ${
                  partyId
                    ? "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/40"
                    : "bg-white/10 hover:bg-white/20 text-white/80 border-white/10"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{partyId ? "Party" : "Watch Party"}</span>
              </button>
            )}
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
                  {/* Chapter markers */}
                  {duration > 0 && chapters.map((c) => {
                    const left = Math.min(100, (c.start_seconds / duration) * 100);
                    const width = c.end_seconds ? Math.max(0.5, ((c.end_seconds - c.start_seconds) / duration) * 100) : 0;
                    const color = c.kind === "intro" ? "bg-fuchsia-400/70" : c.kind === "outro" ? "bg-amber-400/70" : c.kind === "recap" ? "bg-cyan-400/70" : "bg-violet-400/70";
                    return (
                      <div key={c.id} className="absolute top-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${left}%`, width: width ? `${width}%` : "3px" }}>
                        <div className={`h-2.5 ${color} ${width ? "rounded-sm" : "rounded-full w-[3px]"}`} title={c.label || c.kind} />
                      </div>
                    );
                  })}
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

        {/* Skip intro / outro button */}
        {!useIframe && (() => {
          const active = chapters.find((c) => (c.kind === "intro" || c.kind === "outro" || c.kind === "recap") && currentTime >= c.start_seconds && currentTime < (c.end_seconds ?? c.start_seconds + 90));
          if (!active || !active.end_seconds) return null;
          return (
            <button
              onClick={() => { const v = videoRef.current; if (v && active.end_seconds) v.currentTime = active.end_seconds; }}
              className="absolute bottom-28 right-6 z-40 px-4 py-2.5 rounded-full bg-fuchsia-500/90 hover:bg-fuchsia-400 text-white text-xs font-bold shadow-[0_0_25px_rgba(255,72,214,0.5)] flex items-center gap-2 animate-fade-in"
            >
              Skip {active.kind === "intro" ? "Intro" : active.kind === "outro" ? "Outro" : "Recap"} <SkipForward className="w-3.5 h-3.5" />
            </button>
          );
        })()}
      </div>

      <WatchPartyPanel
        open={partyOpen}
        onClose={() => setPartyOpen(false)}
        contentId={contentId || ""}
        episodeId={episodeId || ""}
        partyId={partyId}
        setPartyId={setPartyId}
        partyCode={partyCode}
        videoRef={videoRef}
      />

      {/* Info Section Below Player */}
      <div className="flex-1 relative z-10 p-4 sm:p-6 md:p-8 lg:p-12 senpai-aurora">
        <div className="pointer-events-none absolute inset-0 senpai-bg-grid opacity-30" />
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 md:gap-8 xl:gap-12">

          {/* Left Main Info */}
          <div className="flex-1 space-y-5 flex flex-col md:flex-row md:gap-6">
            {posterImage && (
              <img
                src={posterImage}
                alt={content?.title || ""}
                className="hidden md:block w-40 lg:w-48 aspect-[2/3] object-cover rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] shrink-0"
                loading="lazy"
              />
            )}
            <div className="flex-1 space-y-5 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[11px] senpai-mono uppercase tracking-[0.3em] text-white/55">
              <Link to={`/content/${contentId}`} className="text-fuchsia-300 hover:text-fuchsia-200">{content?.title}</Link>
              <span className="text-white/30">/</span>
              <span>Season {currentEp?.season_number || 1}</span>
              <span className="text-white/30">/</span>
              <span className="senpai-jp text-white/70">第{currentEp?.episode_number || 1}話</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-black text-white tracking-tight drop-shadow-md">
              {currentEp?.title || `Episode ${currentEp?.episode_number || 1}`}
            </h2>

            {content?.description && (
              <p className="text-white/70 font-light leading-relaxed max-w-3xl text-sm md:text-base line-clamp-4 md:line-clamp-none">
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
          </div>

          {/* Right Sidebar — Episodes */}
            <div className="w-full xl:w-[380px] shrink-0 space-y-4">
              <h3 className="text-lg font-display font-black text-white tracking-wide uppercase flex items-center gap-3">
                Episodes
                <span className="senpai-mono text-[10px] text-white/40 tracking-[0.3em]">{filteredEpisodes.length} EPS</span>
              </h3>

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
            <div className="senpai-glass rounded-[20px] p-2 flex flex-col gap-1.5 max-h-[60vh] xl:max-h-[70vh] overflow-y-auto scrollbar-hide">
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
                  <div className={`relative w-24 sm:w-28 aspect-video rounded-[10px] overflow-hidden shrink-0 flex items-center justify-center ${
                    ep.id === episodeId ? "bg-gradient-to-br from-accent/30 to-primary/30" : "bg-gradient-to-br from-white/5 to-white/10"
                  }`}>
                    {(ep.thumbnail_url || epFallback) && (
                      <img
                        src={ep.thumbnail_url || epFallback}
                        alt={ep.title || `Episode ${ep.episode_number}`}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    {ep.id === episodeId ? (
                      <div className="relative w-8 h-8 rounded-full bg-accent/40 flex items-center justify-center backdrop-blur-sm border border-accent/50">
                        <Pause className="w-3 h-3 text-accent fill-current" />
                      </div>
                    ) : (
                      <div className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
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
