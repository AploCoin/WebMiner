"use client";

import { useCallback } from "react";
import { SessionKeyPanel } from "../session-keys/SessionKeyPanel";
import { useSessionKey } from "../session-keys/useSessionKey";
import { ensureMinimumStake } from "../services/staking";
import { ConnectedWalletPanel } from "../components/ConnectedWalletPanel";
import { MinedSharesTable } from "../components/MinedSharesTable";
import { MinerStatsPanel } from "../components/MinerStatsPanel";
import { MiningToggle } from "../components/MiningToggle";
import { PageFrame } from "../components/PageFrame";
import { RpcNodeSelector } from "../components/RpcNodeSelector";
import { useAccountStats } from "../hooks/useAccountStats";
import { useMining } from "../hooks/useMining";
import { useRpcNode } from "../hooks/useRpcNode";
import { useWalletConnection } from "../hooks/useWalletConnection";

export function CurrentMiner() {
  const rpc = useRpcNode();
  const wallet = useWalletConnection(rpc.client);
  const session = useSessionKey(rpc.client, wallet.walletAddress, wallet.wrongNetwork ? null : wallet.provider);
  const stats = useAccountStats(rpc.client, wallet.walletAddress, true, session.record?.address || "");
  const prepare = useCallback(async (signal: AbortSignal) => {
    if (!rpc.client || !wallet.sendTransaction) throw new Error("Connect the owner wallet first");
    await ensureMinimumStake(rpc.client, wallet.walletAddress, wallet.sendTransaction, signal);
  }, [rpc.client, wallet.walletAddress, wallet.sendTransaction]);
  const mining = useMining(rpc.client, session.record?.address || "", session.sendTransaction, stats.refresh, prepare, wallet.walletAddress);
  return (
    <PageFrame activePath="/mining" title="GAplo Web Miner" description="Connect your wallet and authorize temporary mining access. Shares are signed automatically by the session key."
      footer={<MinedSharesTable minedShares={mining.minedShares} />}>
      <RpcNodeSelector {...rpc} isMining={mining.isMining || mining.isStopping || Boolean(session.busy)} onNodeChange={rpc.handleNodeChange} onCustomRpcChange={rpc.handleCustomRpcChange} />
      <ConnectedWalletPanel description="Confirm access, staking and revocation in your wallet. Mining shares are signed automatically." {...wallet} disabled={mining.isMining || mining.isStopping || Boolean(session.busy) || !rpc.isRpcReady} onConnectWallet={wallet.connectWallet} />
      <SessionKeyPanel session={session} connected={Boolean(wallet.provider && !wallet.wrongNetwork && rpc.isRpcReady)} miningBusy={mining.isMining || mining.isStopping} />
      {wallet.networkError && <p role="alert">{wallet.networkError}</p>}
      {stats.error && <p role="alert" className="text-sm text-destructive">{stats.error}</p>}
      <MinerStatsPanel minerStats={stats.minerStats} stakeStats={stats.stakeStats} />
      <MiningToggle {...mining} canStart={Boolean(session.sendTransaction) && !session.busy} onToggleMining={mining.toggleMining} />
    </PageFrame>
  );
}
