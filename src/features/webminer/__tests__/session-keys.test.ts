import { describe, expect, it, vi } from "vitest";
import { createMinerClient } from "../services/client";
import { acceptanceProof, assertSession, createSessionSender, mineSelector, sessionLimits, type SessionRecord } from "../session-keys/protocol";
import vector from "../../../../docs/verification/session-proof-vector.json";

const client = createMinerClient("http://127.0.0.1:8545");
const record: SessionRecord = { ...vector, transactionHash: `0x${"a".repeat(64)}` };
const status = { owner: vector.owner, target: vector.target, aplo: BigInt(0), gaplo: BigInt(vector.budgetWei), nonce: BigInt(0), expiry: BigInt(vector.expiry) };

describe("native session key protocol", () => {
  it("matches the hash and raw low-S proof produced by AploNode's Go implementation", () => {
    expect(acceptanceProof(client, `0x${"2".repeat(64)}`, vector.owner, vector.address, BigInt(vector.chainId), BigInt(vector.budgetWei), BigInt(vector.expiry))).toEqual({ hash: vector.hash, proof: vector.proof });
    expect(mineSelector(client)).toBe(vector.selector);
    expect(Number(`0x${vector.proof.slice(-2)}`)).toBeLessThan(2);
  });

  it.each([
    ["other owner", { ...status, owner: vector.address }],
    ["other target", { ...status, target: "0x0000000000000000000000000000000000001235" }],
    ["native spending", { ...status, aplo: BigInt(1) }],
    ["modified expiry", { ...status, expiry: BigInt(301) }],
    ["exhausted budget", { ...status, gaplo: BigInt(0) }],
  ])("rejects %s", (_name, changed) => {
    expect(() => assertSession(record, changed, BigInt(vector.chainId), BigInt(200))).toThrow();
  });

  it("uses the next block for inclusive expiry and binds the chain ID", () => {
    expect(() => assertSession(record, status, BigInt(vector.chainId), BigInt(300))).not.toThrow();
    expect(() => assertSession(record, status, BigInt(vector.chainId), BigInt(301))).toThrow("expired");
    expect(() => assertSession(record, status, BigInt(1), BigInt(200))).toThrow("another chain");
  });

  it.each([["0", "200"], ["1", "1001"], ["1", "1"], ["1", "2.5"], ["-1", "200"], ["0.0000000000000000001", "200"]])("rejects invalid budget/lifetime %s/%s", (budget, lifetime) => {
    expect(() => sessionLimits(client, budget, lifetime)).toThrow();
  });

  it("rejects staking, other GAplo methods, and malformed calldata without accessing RPC", async () => {
    const call = vi.spyOn(client.web3.eth, "estimateGas");
    const send = createSessionSender(client, record, `0x${"2".repeat(64)}`);
    await expect(send("0x0000000000000000000000000000000000001235", `${vector.selector}${"0".repeat(64)}`)).rejects.toThrow("only allows");
    await expect(send(vector.target, "0x12345678")).rejects.toThrow("only allows");
    await expect(send(vector.target, `${vector.selector}${"0".repeat(66)}`)).rejects.toThrow("only allows");
    expect(call).not.toHaveBeenCalled();
  });
});


it("rejects a budget below intrinsic gas before estimateGas or signing", async () => {
  const encoded = client.web3.eth.abi.encodeParameters(
    ["address", "address", "uint256", "uint256", "uint256", "uint256"],
    [vector.owner, vector.target, "0", "1", "0", vector.expiry],
  );
  const local = createMinerClient({ request: async ({ method }) => {
    if (method === "eth_call") return encoded;
    throw new Error(`Unexpected RPC ${method}`);
  } });
  vi.spyOn(local.web3.eth, "getBlockNumber").mockResolvedValue(BigInt(200));
  vi.spyOn(local.web3.eth, "getChainId").mockResolvedValue(BigInt(vector.chainId));
  vi.spyOn(local.web3.eth, "getGasPrice").mockResolvedValue(BigInt(1));
  const estimate = vi.spyOn(local.web3.eth, "estimateGas");
  const broadcast = vi.spyOn(local.web3.eth, "sendSignedTransaction");
  await expect(createSessionSender(local, { ...record, budgetWei: "1" }, `0x${"2".repeat(64)}`)(vector.target, `${vector.selector}${"0".repeat(64)}`)).rejects.toThrow("Session gas budget cannot cover");
  expect(estimate).not.toHaveBeenCalled();
  expect(broadcast).not.toHaveBeenCalled();
});
