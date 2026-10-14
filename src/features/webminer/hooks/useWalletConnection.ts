"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { EthereumProvider } from "../types";
import type { MinerClient } from "../services/client";
import { createWalletSender } from "../services/transactions";

export function useWalletConnection(client: MinerClient | null) {
  const { toast } = useToast();
  const [connection, setConnection] = useState<{ address: string; provider: EthereumProvider } | null>(null);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);

  useEffect(() => {
    const provider = connection?.provider;
    if (!provider) return;
    const disconnect = () => setConnection(null);
    // Reconnect explicitly after account/network changes so an active mining
    // session cannot submit a share for the previous account or chain.
    provider.on?.("accountsChanged", disconnect);
    provider.on?.("chainChanged", disconnect);
    provider.on?.("disconnect", disconnect);
    return () => {
      provider.removeListener?.("accountsChanged", disconnect);
      provider.removeListener?.("chainChanged", disconnect);
      provider.removeListener?.("disconnect", disconnect);
    };
  }, [connection]);

  const sendTransaction = useMemo(() => client && connection
    ? createWalletSender(client, connection.provider, connection.address) : null, [client, connection]);

  const connectWallet = async () => {
    setIsWalletConnecting(true);
    try {
      const provider = window.ethereum;
      if (!provider) throw new Error("Install MetaMask or another EIP-1193 wallet to connect");
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (!Array.isArray(accounts) || typeof accounts[0] !== "string" || !client?.web3.utils.isAddress(accounts[0])) {
        throw new Error("Wallet did not return a valid account");
      }
      setConnection({ address: accounts[0], provider });
    } catch (error) {
      toast({ variant: "destructive", title: "Wallet Error", description: error instanceof Error ? error.message : "Failed to connect wallet" });
    } finally {
      setIsWalletConnecting(false);
    }
  };

  return { walletAddress: connection?.address || "", isWalletConnecting, connectWallet, sendTransaction };
}
