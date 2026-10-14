"use client";

import { ConnectedWalletPanel } from "../components/ConnectedWalletPanel";
import { MinerStatsPanel } from "../components/MinerStatsPanel";
import { PageFrame } from "../components/PageFrame";
import { RpcNodeSelector } from "../components/RpcNodeSelector";
import { StakeRewardTable } from "../components/StakeRewardTable";
import { StakingControls } from "../components/StakingControls";
import { useAccountStats } from "../hooks/useAccountStats";
import { useRpcNode } from "../hooks/useRpcNode";
import { useStaking } from "../hooks/useStaking";
import { useWalletConnection } from "../hooks/useWalletConnection";

export function Staking() {
  const rpc = useRpcNode();
  const wallet = useWalletConnection(rpc.client);
  const stats = useAccountStats(rpc.client, wallet.walletAddress);
  const staking = useStaking(rpc.client, wallet.sendTransaction, stats.refresh);
  const busy = Boolean(staking.pendingAction);
  return (
    <PageFrame activePath="/staking" title="APLO Staking" description="Stake or unstake APLO and review your mining eligibility.">
      <RpcNodeSelector {...rpc} isMining={busy} onNodeChange={rpc.handleNodeChange} onCustomRpcChange={rpc.handleCustomRpcChange} />
      <ConnectedWalletPanel {...wallet} disabled={busy || !rpc.isRpcReady} onConnectWallet={wallet.connectWallet} />
      {stats.error && <p role="alert" className="text-sm text-destructive">{stats.error}</p>}
      <MinerStatsPanel minerStats={stats.minerStats} stakeStats={stats.stakeStats} variant="staking" />
      <StakingControls {...staking} canSubmit={Boolean(wallet.sendTransaction)} onStakeAmountChange={staking.setStakeAmount} onStake={staking.handleStake} onUnstake={staking.handleUnstake} />
      <StakeRewardTable />
    </PageFrame>
  );
}
