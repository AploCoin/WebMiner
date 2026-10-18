"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_DIFFICULTY } from "../config";
import type { MinerStats, StakeStatus } from "../types";
import type { MinerClient } from "../services/client";
import { formatMiningDifficulty, withTimeout } from "../utils";

const initialMinerStats: MinerStats = { difficulty: formatMiningDifficulty(DEFAULT_DIFFICULTY), totalMined: 0, balance: "0" };
const initialStakeStats: StakeStatus = { stakedWei: BigInt(0), staked: "0", multiplier: 0, canMine: false };

export function useAccountStats(client: MinerClient | null, address: string, includeMining = true) {
  const [snapshot, setSnapshot] = useState<{ client: MinerClient; address: string; minerStats: MinerStats; stakeStats: StakeStatus } | null>(null);
  const [error, setError] = useState("");
  const refresh = useCallback(async (isActive: () => boolean = () => true) => {
    if (!client || !address) return;
    const [params, balance, stakeStats] = await Promise.all([
      includeMining ? client.getMinerParams(address) : Promise.resolve({ currentDifficulty: DEFAULT_DIFFICULTY, totalMined: 0 }),
      withTimeout(client.web3.eth.getBalance(address), 15000, "Balance RPC"),
      client.getStakeStatus(address),
    ]);
    if (!isActive()) return;
    setSnapshot({ client, address, stakeStats, minerStats: {
      difficulty: formatMiningDifficulty(params.currentDifficulty), totalMined: params.totalMined,
      balance: client.web3.utils.fromWei(balance, "ether"),
    } });
    setError("");
  }, [client, address, includeMining]);

  useEffect(() => {
    let active = true;
    setError("");
    const update = () => refresh(() => active).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Unable to refresh account stats");
    });
    void update();
    const interval = setInterval(update, 30000);
    const onVisible = () => { if (!document.hidden) void update(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { active = false; clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, [refresh]);

  const current = snapshot?.client === client && snapshot?.address === address ? snapshot : null;
  return { minerStats: current?.minerStats || initialMinerStats, stakeStats: current?.stakeStats || initialStakeStats, error, refresh };
}
