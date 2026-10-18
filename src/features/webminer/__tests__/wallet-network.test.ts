import { describe, expect, it, vi } from "vitest";
import { APLO_CHAIN } from "../config";
import { switchToAplo, walletChainId } from "../services/wallet-network";
import { createWalletSender } from "../services/transactions";
import type { MinerClient } from "../services/client";

const address = "0x1111111111111111111111111111111111111111";
describe("wallet network", () => {
  it("normalizes chain IDs and rejects malformed RPC values", async () => {
    await expect(walletChainId({ request: vi.fn().mockResolvedValue("0x06E7A") })).resolves.toBe(APLO_CHAIN.chainId);
    await expect(walletChainId({ request: vi.fn().mockResolvedValue(28282) })).rejects.toThrow("invalid chain ID");
  });
  it("adds only an unknown chain and explicitly switches after adding", async () => {
    const request = vi.fn().mockRejectedValueOnce({ code: 4902 }).mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce(APLO_CHAIN.chainId);
    await switchToAplo({ request });
    expect(request.mock.calls.map(([call]) => call.method)).toEqual(["wallet_switchEthereumChain", "wallet_addEthereumChain", "wallet_switchEthereumChain", "eth_chainId"]);
    expect(request.mock.calls[1][0].params).toEqual([expect.objectContaining({
      chainId: "0x6e7a",
      nativeCurrency: { name: "GAPLO", symbol: "GAPLO", decimals: 18 },
    })]);
  });
  it.each([4001, -32601, -32002])("respects rejection/unsupported/pending code %s without adding or retrying", async (code) => {
    const request = vi.fn().mockRejectedValue({ code });
    await expect(switchToAplo({ request })).rejects.toEqual({ code });
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("verifies the active chain after a wallet claims switch success", async () => {
    const request = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce("0x1");
    await expect(switchToAplo({ request })).rejects.toThrow("Select AploCoin");
  });
  it("refuses an unexpected chain even when all reads use that same provider", async () => {
    const request = vi.fn().mockImplementation(async ({ method }) => method === "eth_chainId" ? "0x1" : [address]);
    const client = { web3: { eth: { getChainId: async () => BigInt(1) } } } as unknown as MinerClient;
    await expect(createWalletSender(client, { request }, address, undefined, APLO_CHAIN.chainId)("0x2", "0x")).rejects.toThrow("Wallet network");
    expect(request.mock.calls.map(([call]) => call.method)).not.toContain("eth_sendTransaction");
  });
  it("refuses a stale account without falling back to the wallet's new signer", async () => {
    const request = vi.fn().mockImplementation(async ({ method }) => method === "eth_chainId" ? "0x1" : ["0x2222222222222222222222222222222222222222"]);
    const client = { web3: { eth: { getChainId: async () => BigInt(1) } } } as unknown as MinerClient;
    await expect(createWalletSender(client, { request }, address)("0x2", "0x")).rejects.toThrow("Wallet account changed");
    expect(request.mock.calls.map(([call]) => call.method)).not.toContain("eth_sendTransaction");
  });
});
