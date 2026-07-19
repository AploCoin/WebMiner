"use client";

import { MIN_STAKE_APLO } from "../config";
import { formatAplo, formatBalance } from "../utils";

interface MinerStatsPanelProps {
  minerStats: { difficulty: string; totalMined: number; balance: string };
  stakeStats: { staked: string; multiplier: number; canMine: boolean };
}

export function MinerStatsPanel({ minerStats, stakeStats }: MinerStatsPanelProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
        <div><p className="font-medium">Current Difficulty</p><p className="text-gray-600 truncate">{minerStats.difficulty}</p></div>
        <div><p className="font-medium">Total Mined</p><p className="text-gray-600">{minerStats.totalMined}</p></div>
        <div><p className="font-medium">Balance</p><p className="text-gray-600">{formatBalance(minerStats.balance)}</p></div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4 text-sm rounded-md border p-3">
        <div><p className="font-medium">Stake</p><p className="text-gray-600">{formatAplo(stakeStats.staked)}</p></div>
        <div><p className="font-medium">Reward Multiplier</p><p className="text-gray-600">{stakeStats.multiplier > 0 ? `${stakeStats.multiplier.toFixed(1)}x` : "Not staked"}</p></div>
        <div><p className="font-medium">Mining Status</p><p className={stakeStats.canMine ? "text-green-600" : "text-yellow-600"}>{stakeStats.canMine ? "Stake OK" : `Needs ${MIN_STAKE_APLO} APLO stake`}</p></div>
      </div>
    </>
  );
}
