"use client";

import { LegacyKeyPanel } from "../components/LegacyKeyPanel";
import { MinedSharesTable } from "../components/MinedSharesTable";
import { MinerStatsPanel } from "../components/MinerStatsPanel";
import { MiningToggle } from "../components/MiningToggle";
import { PageFrame } from "../components/PageFrame";
import { RpcNodeSelector } from "../components/RpcNodeSelector";
import { useAccountStats } from "../hooks/useAccountStats";
import { useLegacyWallet } from "../hooks/useLegacyWallet";
import { useMining } from "../hooks/useMining";
import { useRpcNode } from "../hooks/useRpcNode";

export function LegacyMiner() {
  const rpc = useRpcNode();
  const wallet = useLegacyWallet(rpc.client);
  const stats = useAccountStats(rpc.client, wallet.walletAddress);
  const mining = useMining(rpc.client, wallet.walletAddress, wallet.sendTransaction, stats.refresh);
  return (
    <PageFrame activePath="/legacy" title="Legacy Miner" description="Mine GAPLO using a manually entered private key for local signing."
      footer={<MinedSharesTable minedShares={mining.minedShares} />}>
      <RpcNodeSelector {...rpc} isMining={mining.isMining || mining.isStopping} onNodeChange={rpc.handleNodeChange} onCustomRpcChange={rpc.handleCustomRpcChange} />
      <LegacyKeyPanel {...wallet} disabled={mining.isMining || mining.isStopping} onPrivateKeyChange={wallet.setPrivateKey} />
      {stats.error && <p role="alert" className="text-sm text-destructive">{stats.error}</p>}
      <MinerStatsPanel minerStats={stats.minerStats} stakeStats={stats.stakeStats} />
      <MiningToggle {...mining} canStart={Boolean(wallet.sendTransaction)} onToggleMining={mining.toggleMining} />
    </PageFrame>
  );
}
