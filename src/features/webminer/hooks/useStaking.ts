"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MIN_STAKE_APLO } from "../config";
import type { SendTransaction } from "../types";
import type { MinerClient } from "../services/client";
import { SubmittedTransactionError } from "../services/transactions";
import { stakeAplo, unstakeAplo } from "../services/staking";

export function useStaking(client: MinerClient | null, send: SendTransaction | null, refresh: () => Promise<void>) {
  const { toast } = useToast();
  const [stakeAmount, setStakeAmount] = useState(MIN_STAKE_APLO);
  const [pendingAction, setPendingAction] = useState<"stake" | "unstake" | null>(null);
  const pending = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => { pending.current?.abort(); };
  }, [client, send]);

  const submit = async (action: "stake" | "unstake") => {
    if (!client || !send || pending.current) return;
    const operation = new AbortController();
    pending.current = operation;
    setPendingAction(action);
    try {
      if (action === "stake") await stakeAplo(client, send, stakeAmount, operation.signal);
      else await unstakeAplo(client, send, operation.signal);
      operation.signal.throwIfAborted();
      await refresh();
      toast({ title: action === "stake" ? "Stake confirmed" : "Unstake confirmed" });
    } catch (error) {
      if (!operation.signal.aborted || error instanceof SubmittedTransactionError) toast({ variant: "destructive", title: "Staking Error", description: error instanceof Error ? error.message : "Transaction failed" });
    } finally {
      if (pending.current === operation) { pending.current = null; setPendingAction(null); }
    }
  };
  return { stakeAmount, setStakeAmount, pendingAction, handleStake: () => submit("stake"), handleUnstake: () => submit("unstake") };
}
