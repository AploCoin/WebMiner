"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LegacyKeyPanel({ privateKey, walletAddress, disabled, onPrivateKeyChange }: {
  privateKey: string; walletAddress: string; disabled: boolean; onPrivateKeyChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="space-y-2">
        <Label htmlFor="legacy-private-key">Private Key</Label>
        <Input id="legacy-private-key" type="password" autoComplete="off" spellCheck={false}
          placeholder="Enter your private key" value={privateKey}
          onChange={(event) => onPrivateKeyChange(event.target.value)} disabled={disabled}
          aria-invalid={Boolean(privateKey && !walletAddress)} />
        <p className="text-xs text-muted-foreground">Signed locally in your browser. Use a dedicated mining wallet. The key is never saved.</p>
        {privateKey && !walletAddress && <p role="alert" className="text-xs text-destructive">Enter a valid 64-character hex private key, with or without 0x.</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="legacy-wallet-address">Wallet Address</Label>
        <Input id="legacy-wallet-address" placeholder="Address will be generated automatically" value={walletAddress} readOnly />
      </div>
    </div>
  );
}
