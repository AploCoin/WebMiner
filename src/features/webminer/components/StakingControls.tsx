"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MIN_STAKE_APLO } from "../config";

export function StakingControls({ canSubmit, stakeAmount, pendingAction, onStakeAmountChange, onStake, onUnstake }: {
  canSubmit: boolean; stakeAmount: string; pendingAction: "stake" | "unstake" | null;
  onStakeAmountChange: (amount: string) => void; onStake: () => void; onUnstake: () => void;
}) {
  return (
    <div className="space-y-3 rounded-md border p-4">
      <p className="text-sm font-medium">Stake / Unstake APLO</p>
      <Label htmlFor="stake-amount">Amount (APLO)</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input id="stake-amount" type="number" min="0" step="0.000000000000000001" value={stakeAmount} onChange={(e) => onStakeAmountChange(e.target.value)} disabled={Boolean(pendingAction)} />
        <Button type="button" onClick={onStake} disabled={!canSubmit || Boolean(pendingAction) || !stakeAmount}>
          {pendingAction === "stake" ? "Confirming stake..." : "Stake APLO"}
        </Button>
        <Button type="button" variant="outline" onClick={onUnstake} disabled={!canSubmit || Boolean(pendingAction)}>
          {pendingAction === "unstake" ? "Confirming unstake..." : "Unstake"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Mining requires at least {MIN_STAKE_APLO} APLO staked.</p>
    </div>
  );
}
