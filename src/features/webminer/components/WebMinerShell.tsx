"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MinerNavigation } from "@/components/MinerNavigation";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useWebMinerController } from "../hooks/useWebMinerController";
import { MinedSharesTable } from "./MinedSharesTable";
import { MinerStatsPanel } from "./MinerStatsPanel";
import { MiningToggle } from "./MiningToggle";
import { RpcNodeSelector } from "./RpcNodeSelector";
import { StakeRewardTable } from "./StakeRewardTable";
import { StakingControls } from "./StakingControls";
import { WalletAccessPanel } from "./WalletAccessPanel";

export type MinerSurface = "miner" | "staking" | "legacy";

const surfaceMeta = {
  miner: { path: "/", title: "GAplo Web Miner", description: "Mine GAPLO with your connected wallet." },
  staking: { path: "/staking", title: "APLO Staking", description: "Manage APLO stake and review mining eligibility." },
  legacy: { path: "/legacy", title: "Legacy Miner", description: "Local private-key signing for dedicated mining wallets." },
} as const;

export function WebMinerShell({ surface = "miner" }: { surface?: MinerSurface }) {
  const activeMode = surface === "legacy" ? "legacy" : "current";
  const controller = useWebMinerController(activeMode);
  const meta = surfaceMeta[surface];

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MinerNavigation activePath={meta.path} />
        <ThemeSwitcher />
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-2xl font-bold">{meta.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <RpcNodeSelector selectedNodeType={controller.selectedNodeType} customRpcUrl={controller.customRpcUrl} currentRpcUrl={controller.currentRpcUrl} isMining={controller.isMining} onNodeChange={controller.handleNodeChange} onCustomRpcChange={controller.handleCustomRpcChange} />
          <WalletAccessPanel activeMode={activeMode} privateKey={controller.privateKey} walletAddress={controller.walletAddress} isWalletConnecting={controller.isWalletConnecting} isMining={controller.isMining} isRpcReady={controller.isRpcReady} onPrivateKeyChange={controller.setPrivateKey} onWalletAddressChange={controller.setWalletAddress} onConnectWallet={controller.connectWallet} />

          {surface === "staking" ? (
            <>
              <MinerStatsPanel minerStats={controller.minerStats} stakeStats={controller.stakeStats} variant="staking" />
              <StakingControls activeMode={activeMode} walletAddress={controller.walletAddress} privateKey={controller.privateKey} stakeAmount={controller.stakeAmount} isMining={controller.isMining} isStaking={controller.isStaking} isRpcReady={controller.isRpcReady} onStakeAmountChange={controller.setStakeAmount} onStake={controller.handleStake} onUnstake={controller.handleUnstake} />
              <StakeRewardTable />
            </>
          ) : (
            <>
              <MinerStatsPanel minerStats={controller.minerStats} stakeStats={controller.stakeStats} variant="mining" />
              <MiningToggle activeMode={activeMode} walletAddress={controller.walletAddress} privateKey={controller.privateKey} isMining={controller.isMining} isStaking={controller.isStaking} isRpcReady={controller.isRpcReady} onToggleMining={controller.toggleMining} />
            </>
          )}
        </CardContent>
      </Card>

      {surface !== "staking" && <MinedSharesTable minedShares={controller.minedShares} />}
    </div>
  );
}