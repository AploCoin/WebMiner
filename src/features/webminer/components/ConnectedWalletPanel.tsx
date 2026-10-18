"use client";

import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ConnectedWalletPanel({ walletAddress, isWalletConnecting, disabled, onConnectWallet, description = "Confirm each transaction in your wallet." }: {
  walletAddress: string; isWalletConnecting: boolean; disabled: boolean; onConnectWallet: () => void; description?: string;
}) {
  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Connected Wallet</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <Button type="button" onClick={onConnectWallet} disabled={isWalletConnecting || disabled}>
          <Wallet className="mr-2 h-4 w-4" />
          {isWalletConnecting ? "Connecting..." : walletAddress ? "Reconnect Wallet" : "Connect Wallet"}
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="wallet-address">Wallet Address</Label>
        <Input id="wallet-address" placeholder="Connect wallet to fill address" value={walletAddress} readOnly />
      </div>
    </div>
  );
}
