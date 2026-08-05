import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WebMinerShell } from "../components/WebMinerShell";

vi.mock("../hooks/useWebMinerController", () => ({
  useWebMinerController: () => ({
    activeMode: "current",
    walletAddress: "",
    privateKey: "",
    isWalletConnecting: false,
    isMining: false,
    minedShares: [],
    minerStats: { difficulty: "0", totalMined: 0, balance: "0" },
    stakeStats: { staked: "0", multiplier: 0, canMine: false },
    isStaking: false,
    stakeAmount: "1000",
    selectedNodeType: "pub1",
    customRpcUrl: "",
    currentRpcUrl: "https://pub1.aplocoin.com",
    isRpcReady: true,
    setPrivateKey: vi.fn(),
    setWalletAddress: vi.fn(),
    setStakeAmount: vi.fn(),
    handleNodeChange: vi.fn(),
    handleCustomRpcChange: vi.fn(),
    connectWallet: vi.fn(),
    handleStake: vi.fn(),
    handleUnstake: vi.fn(),
    toggleMining: vi.fn(),
  }),
}));

describe("separate miner surfaces", () => {
  it("keeps staking controls and reward table off the miner page", () => {
    render(<WebMinerShell surface="miner" />);
    expect(screen.queryByText("Stake / Unstake APLO")).not.toBeInTheDocument();
    expect(screen.queryByText("Stake level → Mining reward rule")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start Mining/i })).toBeInTheDocument();
  });

  it("shows staking controls and information only on staking page", () => {
    render(<WebMinerShell surface="staking" />);
    expect(screen.getByText("Stake / Unstake APLO")).toBeInTheDocument();
    expect(screen.getByText("Stake level → Mining reward rule")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Start Mining/i })).not.toBeInTheDocument();
  });

  it("shows private-key mining only on legacy page", () => {
    render(<WebMinerShell surface="legacy" />);
    expect(screen.getByLabelText("Private Key")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start Mining/i })).toBeInTheDocument();
    expect(screen.queryByText(/ERC-7715/i)).not.toBeInTheDocument();
  });
});
