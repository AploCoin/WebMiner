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
  aaSessionAddress: string;
  hasErc7715Permission: boolean;
  isWalletConnecting: boolean;
  isMining: boolean;
  isRpcReady: boolean;
  onPrivateKeyChange: (key: string) => void;
  onWalletAddressChange: (address: string) => void;
  onConnectWallet: () => void;
  onRequestPermission: () => void;
}

export function WalletAccessPanel({ activeMode, privateKey, walletAddress, aaSessionAddress, hasErc7715Permission, isWalletConnecting, isMining, isRpcReady, onPrivateKeyChange, onWalletAddressChange, onConnectWallet, onRequestPermission }: WalletAccessPanelProps) {
  return (
    <>
      {activeMode === "legacy" ? (
        <div className="space-y-2 rounded-md border p-3">
          <label className="text-sm font-medium">Private Key</label>
          <Input
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
              <p className="text-xs text-muted-foreground">Private keys are not entered in Current mode. Stake/unstake uses wallet transaction signing; mining uses an ERC-7715 session permission when the wallet supports it.</p>
            </div>
            <Button type="button" onClick={onConnectWallet} disabled={isWalletConnecting || isMining || !isRpcReady}>
              <Wallet className="mr-2 h-4 w-4" />
              {walletAddress ? "Reconnect Wallet" : isWalletConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">ERC-7715 session key: <span className="font-mono">{aaSessionAddress || "created after wallet connect"}</span></p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className={hasErc7715Permission ? "text-xs text-green-600" : "text-xs text-yellow-600"}>
              {hasErc7715Permission ? "ERC-7715 mining permission is stored for automatic background submissions." : "Grant one ERC-7715 permission so Current mining can submit shares without repeated wallet popups."}
            </p>
            <Button type="button" variant="outline" onClick={onRequestPermission} disabled={!walletAddress || isMining || !isRpcReady}>
              Grant ERC-7715 Permission
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
