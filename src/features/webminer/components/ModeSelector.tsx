"use client";

import { Button } from "@/components/ui/button";
import type { MinerMode } from "../types";

interface ModeSelectorProps {
  activeMode: MinerMode;
  isMining: boolean;
  onSwitchMode: (mode: MinerMode) => void;
}

export function ModeSelector({ activeMode, isMining, onSwitchMode }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-md border bg-muted/30 p-1">
      <Button type="button" variant={activeMode === "current" ? "default" : "ghost"} onClick={() => onSwitchMode("current")} disabled={isMining}>
        Current
      </Button>
      <Button type="button" variant={activeMode === "legacy" ? "default" : "ghost"} onClick={() => onSwitchMode("legacy")} disabled={isMining}>
        Legacy
      </Button>
    </div>
  );
}
