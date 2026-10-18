"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { utils } from "web3";
import { useToast } from "@/hooks/use-toast";
import { APLO_CHAIN } from "../config";
import type { EthereumProvider } from "../types";
import { createMinerClient, type MinerClient } from "../services/client";
import { createWalletSender } from "../services/transactions";
import { switchToAplo, walletChainId } from "../services/wallet-network";

// Only staking uses walletDriven; mining retains its independently selected RPC.
export function useWalletConnection(rpcClient: MinerClient | null, walletDriven = false) {
  const { toast } = useToast();
  const [connection, setConnection] = useState<{ address: string; provider: EthereumProvider; chain: string; expected: string } | null>(null);
  const [isWalletConnecting, setIsWalletConnecting] = useState(false);
  const [networkError, setNetworkError] = useState("");
  const generation = useRef(0);
  const connecting = useRef(false);
  const provider = connection?.provider;
  useEffect(() => {
    if (!provider) return;
    const disconnect = () => { generation.current++; setConnection(null); setNetworkError("Wallet account or network changed. Reconnect before continuing."); };
    provider.on?.("accountsChanged", disconnect);
    provider.on?.("chainChanged", disconnect);
    provider.on?.("disconnect", disconnect);
    return () => {
      provider.removeListener?.("accountsChanged", disconnect);
      provider.removeListener?.("chainChanged", disconnect);
      provider.removeListener?.("disconnect", disconnect);
    };
  }, [provider]);
  useEffect(() => {
    const invalidate = () => { generation.current++; };
    invalidate(); setConnection(null);
    return invalidate;
  }, [rpcClient]);

  const ready = Boolean(connection && connection.chain === connection.expected);
  const client = useMemo(() => walletDriven ? (ready && connection ? createMinerClient(connection.provider) : null) : rpcClient,
    [walletDriven, ready, connection, rpcClient]);
  const sendTransaction = useMemo(() => {
    if (!client || !connection || !ready) return null;
    const context = generation.current;
    const send = createWalletSender(client, connection.provider, connection.address, undefined, connection.expected);
    return (...args: Parameters<typeof send>) => {
      if (generation.current !== context) return Promise.reject(new Error("Wallet changed. Reconnect before continuing."));
      return send(...args);
    };
  }, [client, connection, ready]);

  const connectWallet = async () => {
    if (connecting.current) return;
    connecting.current = true; setIsWalletConnecting(true); setNetworkError("");
    const context = ++generation.current;
    const provider = window.ethereum;
    let changed = false;
    let announcedAccounts: unknown = null;
    const accountUpdate = (...args: unknown[]) => { announcedAccounts = args[0]; };
    const invalidate = () => { changed = true; };
    provider?.on?.("accountsChanged", accountUpdate); provider?.on?.("chainChanged", invalidate); provider?.on?.("disconnect", invalidate);
    try {
      if (!provider) throw new Error("Install MetaMask or another EIP-1193 wallet to connect");
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      if (!Array.isArray(accounts) || typeof accounts[0] !== "string" || !utils.isAddress(accounts[0])) throw new Error("Wallet did not return a valid account");
      const chain = await walletChainId(provider);
      const expected = walletDriven ? APLO_CHAIN.chainId : `0x${(await rpcClient!.web3.eth.getChainId()).toString(16)}`;
      if (announcedAccounts !== null && (!Array.isArray(announcedAccounts) || announcedAccounts[0] !== accounts[0])) changed = true;
      if (changed || generation.current !== context) throw new Error("Wallet changed during connection. Reconnect before continuing.");
      setConnection({ address: accounts[0], provider, chain, expected });
      if (chain !== expected) setNetworkError(`Wallet network ${chain} does not match required chain ${expected}. Select the required network in your wallet, then reconnect.`);
    } catch (error) {
      setConnection(null);
      const description = error instanceof Error ? error.message : "Failed to connect wallet";
      setNetworkError(description);
      toast({ variant: "destructive", title: "Wallet Error", description });
    } finally {
      provider?.removeListener?.("accountsChanged", accountUpdate); provider?.removeListener?.("chainChanged", invalidate); provider?.removeListener?.("disconnect", invalidate);
      connecting.current = false; setIsWalletConnecting(false);
    }
  };
  const switchNetwork = async () => {
    if (connecting.current) return;
    connecting.current = true; setIsWalletConnecting(true); setNetworkError("");
    try {
      if (!window.ethereum) throw new Error("Connect a wallet first");
      await switchToAplo(window.ethereum);
      setConnection(null); setNetworkError("AploCoin selected. Reconnect your wallet to continue.");
    } catch (cause) { setNetworkError(cause instanceof Error ? cause.message : "Wallet refused the network change. Select AploCoin manually."); }
    finally { connecting.current = false; setIsWalletConnecting(false); }
  };
  return { client, walletAddress: connection?.address || "", provider: provider || null, isWalletConnecting, connectWallet, sendTransaction,
    chainId: connection?.chain || "", wrongNetwork: Boolean(connection && !ready), networkError, switchNetwork };
}
