"use client";

import { PlayCircle, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MinerMode } from "../types";

interface MiningToggleProps {
  activeMode: MinerMode;
  walletAddress: string;
  privateKey: string;
  isMining: boolean;
  isStaking: boolean;
  isRpcReady: boolean;
  onToggleMining: () => void;
}

export function MiningToggle({ activeMode, walletAddress, privateKey, isMining, isStaking, isRpcReady, onToggleMining }: MiningToggleProps) {
  return (
    <Button className="w-full mt-4" onClick={onToggleMining} variant={isMining ? "destructive" : "default"} disabled={!walletAddress || (activeMode === "legacy" && !privateKey) || isStaking || !isRpcReady}>
      {isStaking ? <><PlayCircle className="mr-2 h-4 w-4 animate-spin" /> Staking...</> : isMining ? <><StopCircle className="mr-2 h-4 w-4" /> Stop Mining</> : <><PlayCircle className="mr-2 h-4 w-4" /> Start Mining</>}
    </Button>
  );
}
