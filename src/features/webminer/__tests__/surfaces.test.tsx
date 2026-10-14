import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "@/app/page";
import { CurrentMiner } from "../pages/CurrentMiner";
import { LegacyMiner } from "../pages/LegacyMiner";
import { Staking } from "../pages/Staking";

vi.mock("../hooks/useAccountStats", () => ({
  useAccountStats: () => ({
    minerStats: { difficulty: "0", totalMined: 0, balance: "0" },
    stakeStats: { staked: "0", multiplier: 0, canMine: false },
    error: "", refresh: vi.fn(),
  }),
}));

describe("separate pages", () => {
  it("keeps home as navigation without mounting wallet or mining controls", () => {
    render(<Home />);
    expect(screen.getByRole("link", { name: /Open Miner/ })).toHaveAttribute("href", "/mining");
    expect(screen.getByRole("link", { name: /Open Legacy/ })).toHaveAttribute("href", "/legacy");
    expect(screen.getByRole("link", { name: /Open Staking/ })).toHaveAttribute("href", "/staking");
    expect(screen.queryByRole("button", { name: /Connect Wallet|Start Mining/ })).not.toBeInTheDocument();
    expect(screen.queryByText("RPC Node")).not.toBeInTheDocument();
  });

  it("uses wallet connection on current miner without exposing a private key", () => {
    render(<CurrentMiner />);
    expect(screen.getByRole("button", { name: "Connect Wallet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Mining" })).toBeDisabled();
    expect(screen.queryByLabelText("Private Key")).not.toBeInTheDocument();
    expect(screen.queryByText("Stake / Unstake APLO")).not.toBeInTheDocument();
  });

  it("shows staking controls without mounting mining controls", () => {
    render(<Staking />);
    expect(screen.getByText("Stake / Unstake APLO")).toBeInTheDocument();
    expect(screen.getByText("Stake level → Mining reward rule")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start Mining" })).not.toBeInTheDocument();
    expect(screen.queryByText("Mined Shares (Logs)")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Private Key")).not.toBeInTheDocument();
  });

  it("uses manual private-key input only on legacy miner", () => {
    render(<LegacyMiner />);
    expect(screen.getByLabelText("Private Key")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Start Mining" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Connect Wallet" })).not.toBeInTheDocument();
  });
});
