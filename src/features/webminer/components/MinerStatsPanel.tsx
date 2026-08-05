"use client";

import { MIN_STAKE_APLO } from "../config";
import { formatAplo, formatBalance } from "../utils";

interface MinerStatsPanelProps {
  minerStats: { difficulty: string; totalMined: number; balance: string };
  stakeStats: { staked: string; multiplier: number; canMine: boolean };
  variant?: "mining" | "staking";
}

export function MinerStatsPanel({ minerStats, stakeStats, variant = "mining" }: MinerStatsPanelProps) {
  return (
    <>
      {variant === "mining" && <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <div><p className="font-medium">Current Difficulty</p><p className="text-gray-600 truncate">{minerStats.difficulty}</p></div>
        <div><p className="font-medium">Total Mined</p><p className="text-gray-600">{minerStats.totalMined}</p></div>
        <div><p className="font-medium">Balance</p><p className="text-gray-600">{formatBalance(minerStats.balance)}</p></div>
      </div>}
      <div className="grid grid-cols-1 gap-3 rounded-md border p-4 text-sm sm:grid-cols-3">
        <div><p className="font-medium">Stake</p><p className="text-gray-600">{formatAplo(stakeStats.staked)}</p></div>
        <div><p className="font-medium">Stake Level</p><p className="text-gray-600">{stakeStats.multiplier > 0 ? "Mining enabled" : "Not staked"}</p></div>
        <div><p className="font-medium">Mining Status</p><p className={stakeStats.canMine ? "text-green-600" : "text-yellow-600"}>{stakeStats.canMine ? "Stake OK" : `Needs ${MIN_STAKE_APLO} APLO stake`}</p></div>
      </div>
    </>
  );
}
