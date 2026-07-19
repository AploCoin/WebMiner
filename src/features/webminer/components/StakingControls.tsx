"use client";

import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MIN_STAKE_APLO } from "../config";
import type { MinerMode } from "../types";

interface StakingControlsProps {
  activeMode: MinerMode;
  walletAddress: string;
  privateKey: string;
  stakeAmount: string;
  isMining: boolean;
  isStaking: boolean;
  isRpcReady: boolean;
  onStakeAmountChange: (amount: string) => void;
  onStake: () => void;
  onUnstake: () => void;
}

export function StakingControls({ activeMode, walletAddress, privateKey, stakeAmount, isMining, isStaking, isRpcReady, onStakeAmountChange, onStake, onUnstake }: StakingControlsProps) {
  const walletBlocked = !walletAddress || (activeMode === "legacy" && !privateKey);
  return (
    <div className="space-y-2 rounded-md border p-3">
      <label className="text-sm font-medium">Stake / Unstake APLO</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input type="number" min="0" step="0.000000000000000001" placeholder={`Minimum ${MIN_STAKE_APLO} APLO to mine`} value={stakeAmount} onChange={(e) => onStakeAmountChange(e.target.value)} disabled={isMining || isStaking} />
        <Button type="button" onClick={onStake} disabled={walletBlocked || isMining || isStaking || !stakeAmount || !isRpcReady}>
          {isStaking ? <><PlayCircle className="mr-2 h-4 w-4 animate-spin" /> Staking...</> : "Stake APLO"}
        </Button>
        <Button type="button" variant="outline" onClick={onUnstake} disabled={walletBlocked || isMining || isStaking || !isRpcReady}>Unstake</Button>
      </div>
      <p className="text-xs text-gray-500">Mining starts only after at least {MIN_STAKE_APLO} APLO is staked.</p>
    </div>
  );
}
