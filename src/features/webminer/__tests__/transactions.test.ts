import { describe, expect, it, vi } from "vitest";
import { createWalletSender, submitWalletTransaction } from "../services/transactions";
import type { MinerClient } from "../services/client";

describe("submitWalletTransaction", () => {
  it("waits for a transaction receipt after wallet submission", async () => {
    const receipt = { blockNumber: 42, transactionHash: "0xabc", status: 1 };
    const provider = { request: vi.fn().mockResolvedValue("0xabc") };
    const waitForReceipt = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(receipt);
    const delay = vi.fn().mockResolvedValue(undefined);

    await expect(submitWalletTransaction({
      provider,
      from: "0x1111111111111111111111111111111111111111",
      to: "0x2222222222222222222222222222222222222222",
      data: "0x1234",
      waitForReceipt,
      delay,
      timeoutMs: 100,
    })).resolves.toEqual(receipt);

    expect(provider.request).toHaveBeenCalledWith({
      method: "eth_sendTransaction",
      params: [{
        from: "0x1111111111111111111111111111111111111111",
        to: "0x2222222222222222222222222222222222222222",
        data: "0x1234",
      }],
    });
    expect(waitForReceipt).toHaveBeenCalledWith("0xabc");
  });

  it("rejects reverted receipts instead of recording them as mined shares", async () => {
    await expect(submitWalletTransaction({
      provider: { request: vi.fn().mockResolvedValue("0xabc") },
      from: "0x1", to: "0x2", data: "0x",
      waitForReceipt: vi.fn().mockResolvedValue({ blockNumber: 42, transactionHash: "0xabc", status: BigInt(0) }),
    })).rejects.toThrow("Transaction reverted");
  });

  it("does not send a wallet transaction on the wrong network", async () => {
    const provider = { request: vi.fn().mockResolvedValue("0x2") };
    const client = { web3: { eth: { getChainId: vi.fn().mockResolvedValue(BigInt(1)) } } } as unknown as MinerClient;
    await expect(createWalletSender(client, provider, "0x1")("0x2", "0x")).rejects.toThrow("Wallet network does not match");
    expect(provider.request).toHaveBeenCalledTimes(1);
    expect(provider.request).toHaveBeenCalledWith({ method: "eth_chainId" });
  });

  it("does not retry a rejected wallet prompt", async () => {
    const request = vi.fn().mockRejectedValue(new Error("User rejected"));
    await expect(submitWalletTransaction({
      provider: { request }, from: "0x1", to: "0x2", data: "0x", waitForReceipt: vi.fn(),
    })).rejects.toThrow("User rejected");
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("does not submit a cancelled operation", async () => {
    const operation = new AbortController();
    operation.abort();
    const request = vi.fn();
    await expect(submitWalletTransaction({
      provider: { request }, from: "0x1", to: "0x2", data: "0x", waitForReceipt: vi.fn(), signal: operation.signal,
    })).rejects.toThrow();
    expect(request).not.toHaveBeenCalled();
  });

  it("times out without resubmitting the transaction", async () => {
    const request = vi.fn().mockResolvedValue("0xabc");
    await expect(submitWalletTransaction({
      provider: { request }, from: "0x1", to: "0x2", data: "0x", waitForReceipt: vi.fn(), timeoutMs: 0,
    })).rejects.toThrow("Timed out waiting for transaction 0xabc");
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("continues observing an already-submitted transaction when mining is stopped", async () => {
    const operation = new AbortController();
    const receipt = { blockNumber: 42, transactionHash: "0xabc", status: 1 };
    const waitForReceipt = vi.fn().mockImplementationOnce(async () => {
      operation.abort();
      return null;
    }).mockResolvedValueOnce(receipt);
    await expect(submitWalletTransaction({
      provider: { request: vi.fn().mockResolvedValue("0xabc") },
      from: "0x1", to: "0x2", data: "0x", waitForReceipt,
      signal: operation.signal, delay: vi.fn().mockResolvedValue(undefined),
    })).resolves.toEqual(receipt);
    expect(waitForReceipt).toHaveBeenCalledTimes(2);
  });
});
