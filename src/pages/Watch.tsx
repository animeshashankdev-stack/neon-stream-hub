import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Maximize, Settings, ArrowLeft, Subtitles, ChevronRight,
  FastForward, Users
} from "lucide-react";

import voidImg from "@/assets/poster-void-horizon.jpg";
import bloomImg from "@/assets/poster-ethereal-bloom.jpg";
import scarletImg from "@/assets/poster-scarlet-night.jpg";
import cyberImg from "@/assets/poster-cyber-pulse.jpg";
import frostImg from "@/assets/poster-frost-heart.jpg";
import stormImg from "@/assets/poster-storm-soul.jpg";

const mockEpisodes = [
  { id: "e1", number: 1, title: "Awakening Protocol", duration: "24:00" },
  { id: "e2", number: 2, title: "Signal Lost", duration: "23:00" },
  { id: "e3", number: 3, title: "Neural Drift", duration: "25:00" },
  { id: "e4", number: 4, title: "The Glitch in the Machine", duration: "24:10" },
  { id: "e5", number: 5, title: "Resonance Frequency", duration: "23:55" },
  { id: "e6", number: 6, title: "Shadow Protocol", duration: "24:30" },
];

const qualities = ["4K ULTRA HD", "1080p", "720p", "480p"];
const subtitleLangs = ["Off", "English", "Japanese", "Spanish"];
const audioLangs = ["Japanese", "English", "Korean"];

const Watch = () => {
  const { contentId, episodeId } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(842); // 14:02
  const totalTime = 1455; // 24:15
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState("4K ULTRA HD");
  const [selectedSubtitle, setSelectedSubtitle] = useState("English");
  const [selectedAudio, setSelectedAudio] = useState("Japanese");
  const [showSettings, setShowSettings] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(true);
  const [showSkipIntro, setShowSkipIntro] = useState(true);
  const controlsTimerRef = useRef<number | null>(null);

  const currentEpIdx = mockEpisodes.findIndex((e) => e.id === episodeId) ?? 3;
  const currentEp = mockEpisodes[currentEpIdx] ?? mockEpisodes[3];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = (currentTime / totalTime) * 100;

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.floor(pct * totalTime));
  };

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col"
      onMouseMove={handleMouseMove}
    >
      {/* Video area */}
      <div className="relative flex-1 flex items-center justify-center bg-gradient-to-br from-background via-black to-background">
        {/* Simulated video frame */}
        <img
          src={cyberImg}
          alt="Video frame"
          className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm"
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Top bar */}
        <div
          className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Link to={`/content/${contentId}`} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="text-center">
            <p className="text-white font-display font-bold text-sm">Cyber-Gen: Genesis Row</p>
            <p className="text-white/60 text-xs">S1 : E{currentEp.number} • {currentEp.title}</p>
          </div>
          <div className="w-10" />
        </div>

        {/* Center play button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 transition-opacity duration-300 hover:bg-white/20 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {isPlaying ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white fill-current ml-1" />}
        </button>

        {/* Skip intro button */}
        {showSkipIntro && showControls && (
          <button
            onClick={() => {
              setCurrentTime(Math.min(currentTime + 90, totalTime));
              setShowSkipIntro(false);
            }}
            className="absolute bottom-28 right-6 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
          >
            SKIP INTRO <FastForward className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Bottom controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-16 pb-4 px-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Progress bar */}
          <div
            className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer group mb-3 relative"
            onClick={seekTo}
          >
            <div
              className="h-full bg-primary rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Rewind */}
              <button
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                className="text-white/70 hover:text-white transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              {/* Play/Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:text-white/80 transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>
              {/* Forward */}
              <button
                onClick={() => setCurrentTime(Math.min(totalTime, currentTime + 10))}
                className="text-white/70 hover:text-white transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 ml-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                  className="w-20 accent-primary h-1"
                />
              </div>

              {/* Time */}
              <span className="text-white/60 text-xs ml-2">
                {formatTime(currentTime)} / {formatTime(totalTime)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Quality badge */}
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neon-cyan/20 text-neon-cyan">
                {selectedQuality}
              </span>

              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white/70 hover:text-white transition-colors p-1"
                >
                  <Settings className="w-4 h-4" />
                </button>
                {showSettings && (
                  <div className="absolute bottom-8 right-0 w-56 glass-card p-3 space-y-3 z-30">
                    {/* Quality */}
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Quality</p>
                      <div className="flex flex-wrap gap-1">
                        {qualities.map((q) => (
                          <button
                            key={q}
                            onClick={() => setSelectedQuality(q)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                              selectedQuality === q
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Audio */}
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Audio</p>
                      <div className="flex flex-wrap gap-1">
                        {audioLangs.map((l) => (
                          <button
                            key={l}
                            onClick={() => setSelectedAudio(l)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                              selectedAudio === l
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Audio label */}
              <span className="text-white/60 text-[10px]">ENG (JP)</span>

              {/* Subtitles */}
              <div className="relative group/sub">
                <button className="text-white/70 hover:text-white transition-colors p-1">
                  <Subtitles className="w-4 h-4" />
                </button>
                <div className="absolute bottom-8 right-0 w-36 glass-card p-2 hidden group-hover/sub:block z-30">
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Subtitles</p>
                  {subtitleLangs.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSubtitle(s)}
                      className={`block w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                        selectedSubtitle === s ? "bg-primary/20 text-primary" : "text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fullscreen */}
              <button className="text-white/70 hover:text-white transition-colors p-1">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Side panel — Episodes */}
      {showEpisodes && (
        <div className="absolute top-0 right-0 bottom-0 w-80 z-30 glass border-l border-border/30 overflow-y-auto scrollbar-hide hidden lg:block">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setShowEpisodes(true)}
                className="text-xs font-semibold text-foreground border-b-2 border-primary pb-1"
              >
                Episodes
              </button>
              <button className="text-xs font-semibold text-muted-foreground pb-1">
                Similar
              </button>
            </div>

            <div className="space-y-1.5">
              {mockEpisodes.map((ep, idx) => (
                <Link
                  key={ep.id}
                  to={`/watch/${contentId}/${ep.id}`}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    ep.id === episodeId
                      ? "glass neon-glow-purple"
                      : "hover:bg-secondary/30"
                  }`}
                >
                  <div className="relative w-20 aspect-video rounded-md overflow-hidden flex-shrink-0 bg-secondary">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white/70" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      {ep.id === episodeId && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-primary/20 text-primary font-bold">Playing Now</span>
                      )}
                      {idx === currentEpIdx + 1 && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan font-bold">Next Up</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold truncate">
                      {String(ep.number).padStart(2, "0")}. {ep.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{ep.duration}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Similar section preview */}
            <div className="mt-6">
              <p className="text-xs text-muted-foreground mb-2">You might also like</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { img: bloomImg, title: "Neon Knights", match: "98% Match" },
                  { img: stormImg, title: "Circuit Breaker", match: "94% Match" },
                ].map((item) => (
                  <div key={item.title} className="glass-card overflow-hidden rounded-lg">
                    <img src={item.img} alt={item.title} className="w-full aspect-[3/4] object-cover" />
                    <div className="p-2">
                      <p className="text-[10px] font-semibold truncate">{item.title}</p>
                      <p className="text-[9px] text-neon-cyan">{item.match}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Watch party */}
            <div className="mt-4 glass-card p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3.5 h-3.5 text-neon-cyan" />
                <span className="text-[10px] font-semibold text-neon-cyan">WATCH PARTY</span>
              </div>
              <p className="text-[10px] text-muted-foreground">+12 watching now</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Watch;
