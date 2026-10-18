"use client";

import { ConnectedWalletPanel } from "../components/ConnectedWalletPanel";
import { MinerStatsPanel } from "../components/MinerStatsPanel";
import { PageFrame } from "../components/PageFrame";
import { Button } from "@/components/ui/button";
import { StakeRewardTable } from "../components/StakeRewardTable";
import { StakingControls } from "../components/StakingControls";
import { useAccountStats } from "../hooks/useAccountStats";
import { useStaking } from "../hooks/useStaking";
import { useWalletConnection } from "../hooks/useWalletConnection";

export function Staking() {
  const wallet = useWalletConnection(null, true);
  const stats = useAccountStats(wallet.client, wallet.walletAddress, false);
  const staking = useStaking(wallet.client, wallet.sendTransaction, stats.refresh);
  const busy = Boolean(staking.pendingAction);
  return (
    <PageFrame activePath="/staking" title="APLO Staking" description="Stake or unstake APLO and review your mining eligibility.">
      <ConnectedWalletPanel {...wallet} disabled={busy} onConnectWallet={wallet.connectWallet} />
      <p className="text-sm">Wallet network: {wallet.chainId ? `${wallet.chainId}${wallet.wrongNetwork ? " (unsupported)" : " — AploCoin"}` : "Connect to detect network"}</p>
      {wallet.wrongNetwork && <Button onClick={wallet.switchNetwork} disabled={busy || wallet.isWalletConnecting}>Switch to AploCoin</Button>}
      {wallet.networkError && <p role="alert">{wallet.networkError}</p>}
      {stats.error && <p role="alert" className="text-sm text-destructive">{stats.error}</p>}
      <MinerStatsPanel minerStats={stats.minerStats} stakeStats={stats.stakeStats} variant="staking" />
      <StakingControls {...staking} canSubmit={Boolean(wallet.sendTransaction)} onStakeAmountChange={staking.setStakeAmount} onStake={staking.handleStake} onUnstake={staking.handleUnstake} />
      <StakeRewardTable />
    </PageFrame>
  );
}
