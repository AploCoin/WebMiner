import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MinerNavigation } from "../MinerNavigation";

const items = [
  ["Miner", "/"],
  ["Staking", "/staking"],
  ["Legacy", "/legacy"],
] as const;

describe("MinerNavigation", () => {
  it.each(items)("links %s to its separate page", (label, href) => {
    render(<MinerNavigation activePath="/" />);
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("href", href);
  });

  it("marks only the active destination", () => {
    render(<MinerNavigation activePath="/staking" />);
    expect(screen.getByRole("link", { name: "Staking" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Miner" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Legacy" })).not.toHaveAttribute("aria-current");
  });
});
