import { expect, it, vi } from "vitest";
import { createMinerClient } from "../services/client";

it("loads the contract target for fresh session mining metadata and reads as the owner", async () => {
  const client = createMinerClient("http://127.0.0.1:8545");
  const owner = `0x${"1".repeat(40)}`;
  const session = `0x${"2".repeat(40)}`;
  const paramsCall = vi.fn().mockResolvedValue({ last_block: BigInt(0), current_difficulty: BigInt(0), total_mined: BigInt(0), prev_hash: BigInt(0) });
  const targetCall = vi.fn().mockResolvedValue(BigInt(123));
  vi.spyOn(client.mining.methods, "miner_params").mockReturnValue({ call: paramsCall } as never);
  vi.spyOn(client.mining.methods, "DEFAULT_DIFFICULTY").mockReturnValue({ call: targetCall } as never);
  expect((await client.getMinerParams(session, owner)).currentDifficulty).toBe(BigInt(123));
  expect(paramsCall).toHaveBeenCalledWith({ from: owner });
  expect(targetCall).toHaveBeenCalledWith({ from: owner });
});

it("treats Web3 TransactionNotFound as an unconfirmed receipt, while preserving real RPC errors", async () => {
  const { errors } = await import("web3");
  const client = createMinerClient("http://127.0.0.1:8545");
  const getReceipt = vi.spyOn(client.web3.eth, "getTransactionReceipt");
  getReceipt.mockRejectedValueOnce(new errors.TransactionNotFound());
  await expect(client.getTransactionReceipt("0xabc")).resolves.toBeNull();
  getReceipt.mockRejectedValueOnce(new Error("RPC offline"));
  await expect(client.getTransactionReceipt("0xabc")).rejects.toThrow("RPC offline");
});
