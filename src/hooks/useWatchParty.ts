import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PartyMessage {
  id: string;
  party_id: string;
  user_id: string;
  display_name: string | null;
  body: string;
  created_at: string;
}

export interface SyncEvent {
  type: "play" | "pause" | "seek";
  t: number; // currentTime in seconds
  at: number; // sender timestamp
  by: string;
}

function code() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function createParty(args: { contentId: string; episodeId: string; hostId: string }) {
  const { data, error } = await supabase
    .from("watch_parties" as never)
    .insert({
      code: code(),
      host_id: args.hostId,
      content_id: args.contentId,
      episode_id: args.episodeId,
    } as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as { id: string; code: string };
}

export async function findPartyByCode(code: string) {
  const { data } = await supabase
    .from("watch_parties" as never)
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();
  return (data as unknown as { id: string; code: string; episode_id: string; content_id: string } | null) || null;
}

export function useWatchPartyChannel(partyId: string | null, onSync: (e: SyncEvent) => void) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<PartyMessage[]>([]);
  const [participants, setParticipants] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!partyId) return;
    let cancelled = false;

    // initial messages
    (async () => {
      const { data } = await supabase
        .from("watch_party_messages" as never)
        .select("*")
        .eq("party_id", partyId)
        .order("created_at", { ascending: true })
        .limit(200);
      if (!cancelled) setMessages((data as unknown as PartyMessage[]) || []);
    })();

    const channel = supabase.channel(`party:${partyId}`, {
      config: { presence: { key: user?.id || "anon" } },
    });
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "sync" }, ({ payload }) => {
        if (payload?.by && payload.by !== user?.id) onSync(payload as SyncEvent);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "watch_party_messages", filter: `party_id=eq.${partyId}` }, (p) => {
        setMessages((prev) => [...prev, p.new as unknown as PartyMessage]);
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setParticipants(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && user) {
          await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
        }
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [partyId, user, onSync]);

  const sendSync = useCallback((e: Omit<SyncEvent, "by" | "at">) => {
    if (!channelRef.current || !user) return;
    channelRef.current.send({
      type: "broadcast",
      event: "sync",
      payload: { ...e, by: user.id, at: Date.now() },
    });
  }, [user]);

  const sendMessage = useCallback(async (body: string, displayName?: string) => {
    if (!partyId || !user || !body.trim()) return;
    await supabase.from("watch_party_messages" as never).insert({
      party_id: partyId,
      user_id: user.id,
      display_name: displayName || null,
      body: body.trim(),
    } as never);
  }, [partyId, user]);

  return { messages, participants, sendSync, sendMessage };
}