import { afterEach, describe, expect, it, vi } from "vitest";
import { findMiningNonce, runMining } from "../services/mining";
import type { MinerClient } from "../services/client";

const params = { lastBlock: BigInt(0), currentDifficulty: BigInt(100), totalMined: 0, prevHash: BigInt(0) };

class TestWorker {
  static latest: TestWorker;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: { message: string }) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
  constructor() { TestWorker.latest = this; }
}

afterEach(() => vi.unstubAllGlobals());

describe("shared mining worker lifecycle", () => {
  it("terminates computation immediately when stopped", async () => {
    vi.stubGlobal("Worker", TestWorker);
    const session = new AbortController();
    const result = findMiningNonce("0x1", params, session.signal);
    session.abort();
    await expect(result).rejects.toThrow();
    expect(TestWorker.latest.terminate).toHaveBeenCalledTimes(1);
  });

  it("accepts nonce zero as a valid result and releases the worker", async () => {
    vi.stubGlobal("Worker", TestWorker);
    const result = findMiningNonce("0x1", params, new AbortController().signal);
    TestWorker.latest.onmessage?.({ data: { type: "found", jobId: 1, nonce: "0", hash: "1" } });
    await expect(result).resolves.toBe(BigInt(0));
    expect(TestWorker.latest.terminate).toHaveBeenCalledTimes(1);
  });

  it("does not send a transaction after cancellation during RPC preparation", async () => {
    const session = new AbortController();
    const send = vi.fn();
    const client = {
      getMinerParams: vi.fn().mockResolvedValue(params),
      web3: { eth: { getBlockNumber: vi.fn().mockImplementation(() => { session.abort(); return BigInt(100); }) } },
    } as unknown as MinerClient;
    await expect(runMining({ client, address: "0x1", send, signal: session.signal, onShare: vi.fn(), onRefresh: vi.fn() })).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
  });
});
