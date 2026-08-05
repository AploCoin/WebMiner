"use client";

import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MinerMode } from "../types";
import { getAddressFromPrivateKey, validatePrivateKey } from "../utils";

interface WalletAccessPanelProps {
  activeMode: MinerMode;
  privateKey: string;
  walletAddress: string;
  isWalletConnecting: boolean;
  isMining: boolean;
  isRpcReady: boolean;
  onPrivateKeyChange: (key: string) => void;
  onWalletAddressChange: (address: string) => void;
  onConnectWallet: () => void;
}

export function WalletAccessPanel({ activeMode, privateKey, walletAddress, isWalletConnecting, isMining, isRpcReady, onPrivateKeyChange, onWalletAddressChange, onConnectWallet }: WalletAccessPanelProps) {
  return (
    <>
      {activeMode === "legacy" ? (
        <div className="space-y-2 rounded-md border p-3">
          <label htmlFor="legacy-private-key" className="text-sm font-medium">Private Key</label>
          <Input
            id="legacy-private-key"
            type="password"
            placeholder="Enter your private key"
            value={privateKey}
            onChange={(e) => {
              const newKey = e.target.value;
              onPrivateKeyChange(newKey);
              if (validatePrivateKey(newKey)) {
                onWalletAddressChange(getAddressFromPrivateKey(newKey));
              }
            }}
            disabled={isMining}
          />
          <p className="text-xs text-yellow-600">Legacy mode keeps the old local private-key signing flow.</p>
        </div>
      ) : (
        <div className="space-y-3 rounded-md border p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Connected Wallet</p>
              <p className="text-xs text-muted-foreground">Transactions are submitted through the connected wallet. The wallet asks for confirmation when a share is ready.</p>
            </div>
            <Button type="button" onClick={onConnectWallet} disabled={isWalletConnecting || isMining || !isRpcReady}>
              <Wallet className="mr-2 h-4 w-4" />
              {walletAddress ? "Reconnect Wallet" : isWalletConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Wallet Address</label>
        <Input placeholder={activeMode === "legacy" ? "Address will be generated automatically" : "Connect wallet to fill address"} value={walletAddress} disabled={true} />
      </div>
    </>
  );
}
