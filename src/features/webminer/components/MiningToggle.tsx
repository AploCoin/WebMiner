"use client";

import { PlayCircle, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MiningToggle({ canStart, isMining, isStarting, isStopping, onToggleMining }: {
  canStart: boolean; isMining: boolean; isStarting: boolean; isStopping: boolean; onToggleMining: () => void;
}) {
  return (
    <div className="space-y-2">
      <Button className="w-full" onClick={onToggleMining} variant={isMining ? "destructive" : "default"} disabled={isStopping || (!isMining && !canStart)}>
        {isStopping ? "Stopping..." : isMining ? <><StopCircle className="mr-2 h-4 w-4" />{isStarting ? "Cancel Mining Start" : "Stop Mining"}</> : <><PlayCircle className="mr-2 h-4 w-4" />Start Mining</>}
      </Button>
      <p className="text-xs text-muted-foreground">Starting mining stakes any missing APLO to reach the 1,000 APLO minimum. Submitted transactions continue even if you stop mining.</p>
    </div>
  );
}
