import { useEffect, useRef, useState } from "react";
import { Users, Send, Copy, X, PartyPopper } from "lucide-react";
import { createParty, findPartyByCode, useWatchPartyChannel, type SyncEvent } from "@/hooks/useWatchParty";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  contentId: string;
  episodeId: string;
  partyId: string | null;
  setPartyId: (id: string | null, code?: string) => void;
  partyCode: string | null;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function WatchPartyPanel({ open, onClose, contentId, episodeId, partyId, setPartyId, partyCode, videoRef }: Props) {
  const { user } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastAppliedRef = useRef(0);

  const onSync = (e: SyncEvent) => {
    const v = videoRef.current;
    if (!v) return;
    // throttle to avoid loops
    if (Date.now() - lastAppliedRef.current < 250) return;
    lastAppliedRef.current = Date.now();
    if (Math.abs((v.currentTime || 0) - e.t) > 1.5) v.currentTime = e.t;
    if (e.type === "play" && v.paused) v.play().catch(() => {});
    if (e.type === "pause" && !v.paused) v.pause();
  };

  const { messages, participants, sendSync, sendMessage } = useWatchPartyChannel(partyId, onSync);

  // attach local player listeners → broadcast
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !partyId) return;
    const onPlay = () => sendSync({ type: "play", t: v.currentTime });
    const onPause = () => sendSync({ type: "pause", t: v.currentTime });
    const onSeeked = () => sendSync({ type: "seek", t: v.currentTime });
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("seeked", onSeeked);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("seeked", onSeeked);
    };
  }, [partyId, sendSync, videoRef]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  const handleCreate = async () => {
    if (!user) return;
    try {
      const p = await createParty({ contentId, episodeId, hostId: user.id });
      setPartyId(p.id, p.code);
      toast({ title: "Watch party created", description: `Share code: ${p.code}` });
    } catch {
      toast({ title: "Couldn't create party", variant: "destructive" });
    }
  };

  const handleJoin = async () => {
    const p = await findPartyByCode(joinCode.trim());
    if (!p) { toast({ title: "Party not found", variant: "destructive" }); return; }
    setPartyId(p.id, p.code);
    setJoinCode("");
  };

  const handleLeave = () => setPartyId(null);

  if (!open) return null;

  return (
    <aside className="fixed right-0 top-0 bottom-0 z-[60] w-full sm:w-[380px] bg-[#0d0a14]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col text-white shadow-[0_0_60px_rgba(122,61,245,0.4)]">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 font-bold">
          <PartyPopper className="w-4 h-4 text-fuchsia-400" />
          Watch Party
          {partyId && <span className="ml-2 text-[10px] uppercase tracking-widest text-white/60 flex items-center gap-1"><Users className="w-3 h-3" />{participants}</span>}
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10"><X className="w-4 h-4" /></button>
      </header>

      {!user ? (
        <div className="p-6 text-sm text-white/70">Sign in to start or join a watch party.</div>
      ) : !partyId ? (
        <div className="p-4 space-y-4">
          <button
            onClick={handleCreate}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(255,72,214,0.4)] hover:opacity-90"
          >
            Start a new party
          </button>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/40">
            <div className="h-px flex-1 bg-white/10" /> or join <div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="PARTY CODE"
              maxLength={8}
              className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-mono tracking-widest focus:outline-none focus:border-fuchsia-400/50"
            />
            <button onClick={handleJoin} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold">Join</button>
          </div>
          <p className="text-xs text-white/40">Playback (play, pause, seek) syncs across everyone in the party. Chat below.</p>
        </div>
      ) : (
        <>
          <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="text-xs">
              <span className="text-white/50">Code</span>{" "}
              <span className="font-mono tracking-widest text-fuchsia-300">{partyCode}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { if (partyCode) { navigator.clipboard.writeText(partyCode); toast({ title: "Copied!" }); } }}
                className="p-1.5 rounded-full hover:bg-white/10"
              ><Copy className="w-3.5 h-3.5" /></button>
              <button onClick={handleLeave} className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30">Leave</button>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
            {messages.length === 0 && (
              <p className="text-xs text-white/40 text-center mt-8">Say hi 👋</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.user_id === user.id ? "items-end" : "items-start"}`}>
                <span className="text-[10px] text-white/40 mb-0.5">{m.display_name || (m.user_id === user.id ? "You" : "Guest")}</span>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.user_id === user.id ? "bg-fuchsia-500/30 border border-fuchsia-400/30" : "bg-white/5 border border-white/10"}`}>{m.body}</div>
              </div>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(draft, user.email?.split("@")[0]); setDraft(""); }}
            className="p-3 border-t border-white/10 flex gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message…"
              className="flex-1 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-fuchsia-400/50"
            />
            <button type="submit" className="p-2 rounded-full bg-fuchsia-500 hover:bg-fuchsia-400 text-white"><Send className="w-4 h-4" /></button>
          </form>
        </>
      )}
    </aside>
  );
}