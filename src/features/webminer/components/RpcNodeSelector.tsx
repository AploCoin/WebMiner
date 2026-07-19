"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RpcNodeSelectorProps {
  selectedNodeType: string;
  customRpcUrl: string;
  currentRpcUrl: string;
  isMining: boolean;
  onNodeChange: (nodeType: string) => void;
  onCustomRpcChange: (url: string) => void;
}

export function RpcNodeSelector({ selectedNodeType, customRpcUrl, currentRpcUrl, isMining, onNodeChange, onCustomRpcChange }: RpcNodeSelectorProps) {
  return (
    <div className="space-y-3 rounded-md border p-4 bg-muted/50">
      <Label className="text-sm font-medium">RPC Node</Label>
      <RadioGroup value={selectedNodeType} onValueChange={onNodeChange}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pub1" id="pub1" disabled={isMining} />
          <Label htmlFor="pub1" className="font-normal cursor-pointer">Pub1 (https://pub1.aplocoin.com)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pub2" id="pub2" disabled={isMining} />
          <Label htmlFor="pub2" className="font-normal cursor-pointer">Pub2 (https://pub2.aplocoin.com)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="custom" disabled={isMining} />
          <Label htmlFor="custom" className="font-normal cursor-pointer">Custom RPC URL</Label>
        </div>
      </RadioGroup>
      {selectedNodeType === "custom" && (
        <Input type="text" placeholder="https://your-rpc-node.com" value={customRpcUrl} onChange={(e) => onCustomRpcChange(e.target.value)} disabled={isMining} className="mt-2" />
      )}
      <p className="text-xs text-muted-foreground">Current RPC: <span className="font-mono">{currentRpcUrl || "Not set"}</span></p>
    </div>
  );
}
