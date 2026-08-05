import { describe, expect, it, vi } from "vitest";
import { submitWalletMineTransaction } from "../wallet-mining";

describe("submitWalletMineTransaction", () => {
  it("waits for a transaction receipt after wallet submission", async () => {
    const receipt = { blockNumber: 42, transactionHash: "0xabc" };
    const provider = { request: vi.fn().mockResolvedValue("0xabc") };
    const waitForReceipt = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(receipt);
    const delay = vi.fn().mockResolvedValue(undefined);

    await expect(submitWalletMineTransaction({
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
});
