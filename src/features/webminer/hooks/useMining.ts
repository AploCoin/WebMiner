"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { MinedShare, SendTransaction } from "../types";
import type { MinerClient } from "../services/client";
import { runMining } from "../services/mining";
import { ensureMinimumStake } from "../services/staking";

export function useMining(client: MinerClient | null, address: string, send: SendTransaction | null, refresh: () => Promise<void>) {
  const { toast } = useToast();
  const sessionRef = useRef<AbortController | null>(null);
  const [isMining, setIsMining] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [shares, setShares] = useState<{ address: string; entries: MinedShare[] }>({ address: "", entries: [] });

  useEffect(() => {
    setIsMining(false);
    setIsStarting(false);
    setIsStopping(false);
    return () => { sessionRef.current?.abort(); sessionRef.current = null; };
  }, [client, address, send]);

  const toggleMining = async () => {
    if (sessionRef.current) {
      sessionRef.current.abort();
      // Keep the session locked until any submitted transaction settles.
      setIsMining(false);
      setIsStopping(true);
      return;
    }
    if (!client || !address || !send) return;
    const session = new AbortController();
    sessionRef.current = session;
    setIsMining(true);
    setIsStarting(true);
    try {
      await ensureMinimumStake(client, address, send, session.signal);
      session.signal.throwIfAborted();
      setIsStarting(false);
      await refresh();
      await runMining({
        client, address, send, signal: session.signal, onRefresh: refresh,
        onShare: (share) => setShares((prev) => ({ address, entries: [share, ...(prev.address === address ? prev.entries : [])] })),
      });
    } catch (error) {
      if (!session.signal.aborted) toast({ variant: "destructive", title: "Mining stopped", description: error instanceof Error ? error.message : "Mining failed" });
    } finally {
      if (sessionRef.current === session) {
        sessionRef.current = null;
        setIsMining(false);
        setIsStarting(false);
        setIsStopping(false);
      }
    }
  };

  return { isMining, isStarting, isStopping, minedShares: shares.address === address ? shares.entries : [], toggleMining };
}
