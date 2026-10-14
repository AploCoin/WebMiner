"use client";

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
  const stats = useAccountStats(rpc.client, wallet.walletAddress);
  const mining = useMining(rpc.client, wallet.walletAddress, wallet.sendTransaction, stats.refresh);
  return (
    <PageFrame activePath="/mining" title="GAplo Web Miner" description="Mine GAPLO with your connected wallet. Confirm each ready share in your wallet."
      footer={<MinedSharesTable minedShares={mining.minedShares} />}>
      <RpcNodeSelector {...rpc} isMining={mining.isMining || mining.isStopping} onNodeChange={rpc.handleNodeChange} onCustomRpcChange={rpc.handleCustomRpcChange} />
      <ConnectedWalletPanel {...wallet} disabled={mining.isMining || mining.isStopping || !rpc.isRpcReady} onConnectWallet={wallet.connectWallet} />
      {stats.error && <p role="alert" className="text-sm text-destructive">{stats.error}</p>}
      <MinerStatsPanel minerStats={stats.minerStats} stakeStats={stats.stakeStats} />
      <MiningToggle {...mining} canStart={Boolean(wallet.sendTransaction)} onToggleMining={mining.toggleMining} />
    </PageFrame>
  );
}
