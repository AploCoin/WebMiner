"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useToast } from "@/hooks/use-toast";
import { useWebMinerController } from "../hooks/useWebMinerController";
import { MinedSharesTable } from "./MinedSharesTable";
import { MinerStatsPanel } from "./MinerStatsPanel";
import { MiningToggle } from "./MiningToggle";
import { ModeSelector } from "./ModeSelector";
import { RpcNodeSelector } from "./RpcNodeSelector";
import { StakeRewardTable } from "./StakeRewardTable";
import { StakingControls } from "./StakingControls";
import { WalletAccessPanel } from "./WalletAccessPanel";

export function WebMinerShell() {
  const controller = useWebMinerController();
  const { toast } = useToast();

  const requestPermission = () => {
    controller.requestErc7715MiningPermission().catch((error) => {
      const message = error instanceof Error ? error.message : "Failed to request ERC-7715 permission";
      toast({ variant: "destructive", title: "ERC-7715 Error", description: message });
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex flex-row justify-between"><span>GAplo Web Miner</span> <ThemeSwitcher /></CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ModeSelector activeMode={controller.activeMode} isMining={controller.isMining} onSwitchMode={controller.switchMode} />
          <RpcNodeSelector selectedNodeType={controller.selectedNodeType} customRpcUrl={controller.customRpcUrl} currentRpcUrl={controller.currentRpcUrl} isMining={controller.isMining} onNodeChange={controller.handleNodeChange} onCustomRpcChange={controller.handleCustomRpcChange} />
          <WalletAccessPanel activeMode={controller.activeMode} privateKey={controller.privateKey} walletAddress={controller.walletAddress} aaSessionAddress={controller.aaSessionAddress} hasErc7715Permission={Boolean(controller.erc7715Permission)} isWalletConnecting={controller.isWalletConnecting} isMining={controller.isMining} isRpcReady={controller.isRpcReady} onPrivateKeyChange={controller.setPrivateKey} onWalletAddressChange={controller.setWalletAddress} onConnectWallet={controller.connectWallet} onRequestPermission={requestPermission} />
          <MinerStatsPanel minerStats={controller.minerStats} stakeStats={controller.stakeStats} />
          <StakeRewardTable />
          <StakingControls activeMode={controller.activeMode} walletAddress={controller.walletAddress} privateKey={controller.privateKey} stakeAmount={controller.stakeAmount} isMining={controller.isMining} isStaking={controller.isStaking} isRpcReady={controller.isRpcReady} onStakeAmountChange={controller.setStakeAmount} onStake={controller.handleStake} onUnstake={controller.handleUnstake} />
          <MiningToggle activeMode={controller.activeMode} walletAddress={controller.walletAddress} privateKey={controller.privateKey} isMining={controller.isMining} isStaking={controller.isStaking} isRpcReady={controller.isRpcReady} onToggleMining={controller.toggleMining} />
        </CardContent>
      </Card>
      <MinedSharesTable minedShares={controller.minedShares} />
    </div>
  );
}
