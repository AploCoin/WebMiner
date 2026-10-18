import { signRaw } from "web3-eth-accounts";
import type { MinerClient } from "../services/client";
import { CONTRACT_ADDRESS, MAX_UINT256 } from "../config";
import { createPrivateKeySender } from "../services/transactions";
import { withTimeout } from "../utils";

export const SESSION_REGISTRY_ADDRESS = "0x0000000000000000000000000000000000001237";
export const MAX_SESSION_BLOCKS = 1000;
export const DEFAULT_SESSION_BLOCKS = "200";
export const DEFAULT_SESSION_BUDGET = "1";
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const SESSION_REGISTRY_ABI = [
  { type: "function", name: "CreateSessionKey", stateMutability: "nonpayable", inputs: [
    { name: "key", type: "address" }, { name: "target", type: "address" },
    { name: "selectors", type: "bytes4[]" }, { name: "aplo", type: "uint256" },
    { name: "gaplo", type: "uint256" }, { name: "expiry", type: "uint256" },
    { name: "proof", type: "bytes" },
  ], outputs: [] },
  { type: "function", name: "RevokeSessionKey", stateMutability: "nonpayable", inputs: [{ name: "key", type: "address" }], outputs: [] },
  { type: "function", name: "getSession", stateMutability: "view", inputs: [{ name: "key", type: "address" }], outputs: [
    { name: "owner", type: "address" }, { name: "target", type: "address" },
    { name: "aplo", type: "uint256" }, { name: "gaplo", type: "uint256" },
    { name: "nonce", type: "uint256" }, { name: "expiry", type: "uint256" },
  ] },
] as const;

export interface SessionRecord {
  owner: string;
  address: string;
  chainId: string;
  expiry: string;
  budgetWei: string;
  transactionHash: string;
}

export interface SessionStatus {
  owner: string; target: string;
  aplo: bigint; gaplo: bigint; nonce: bigint; expiry: bigint;
}

export const registryFor = (client: MinerClient) => new client.web3.eth.Contract(SESSION_REGISTRY_ABI, SESSION_REGISTRY_ADDRESS);
export const mineSelector = (client: MinerClient) => client.web3.eth.abi.encodeFunctionSignature("mine(bytes32)");

export async function readSession(client: MinerClient, address: string, owner: string): Promise<SessionStatus> {
  const value = await withTimeout(registryFor(client).methods.getSession(address).call({ from: owner }), 15000, "Session registry RPC");
  return { owner: value.owner, target: value.target, aplo: BigInt(value.aplo), gaplo: BigInt(value.gaplo), nonce: BigInt(value.nonce), expiry: BigInt(value.expiry) };
}

export async function requireNativeRegistry(client: MinerClient, owner: string) {
  try {
    const [nonce, code] = await withTimeout(Promise.all([
      client.web3.eth.getTransactionCount(SESSION_REGISTRY_ADDRESS), client.web3.eth.getCode(SESSION_REGISTRY_ADDRESS),
      readSession(client, ZERO_ADDRESS, owner),
    ]), 15000, "Native session registry probe");
    if (nonce !== BigInt(1) || code !== "0x") throw new Error("Invalid registry state");
  } catch {
    throw new Error("This RPC does not expose Aplo native session keys at 0x1237. Select a compatible AploNode RPC.");
  }
}

export function sessionLimits(client: MinerClient, budget: string, lifetime: string) {
  if (!/^\d+(?:\.\d{1,18})?$/.test(budget) || !/^\d+$/.test(lifetime)) throw new Error("Enter a positive GAPLO budget and a whole number of blocks");
  const budgetWei = BigInt(client.web3.utils.toWei(budget, "ether"));
  const blocks = Number(lifetime);
  if (budgetWei <= BigInt(0) || budgetWei > MAX_UINT256 || !Number.isSafeInteger(blocks) || blocks < 2 || blocks > MAX_SESSION_BLOCKS) {
    throw new Error(`Use a positive GAPLO budget and a lifetime of 2–${MAX_SESSION_BLOCKS} blocks`);
  }
  return { budgetWei, blocks };
}

// Matches builtin/sessionkeys.ProofHash exactly: raw Keccak, no personal-message
// prefix. signRaw hashes the preimage once; the registry expects recovery v=0/1.
export function acceptanceProof(client: MinerClient, privateKey: string, owner: string, address: string, chainId: bigint, budgetWei: bigint, expiry: bigint) {
  const payload = client.web3.eth.abi.encodeParameters(
    ["address", "address", "bytes4[]", "uint256", "uint256", "uint256"],
    [address, CONTRACT_ADDRESS, [mineSelector(client)], "0", budgetWei.toString(), expiry.toString()],
  );
  const preimage = client.web3.utils.utf8ToHex("APLO_SESSION_KEYS_ACCEPT_V1") +
    SESSION_REGISTRY_ADDRESS.slice(2) + chainId.toString(16).padStart(64, "0") + owner.slice(2) + payload.slice(2);
  const signed = signRaw(preimage, privateKey);
  const proof = signed.signature.slice(0, -2) + (Number(signed.v) - 27).toString(16).padStart(2, "0");
  return { hash: signed.messageHash, proof };
}

export async function prepareRegistration(client: MinerClient, owner: string, budget: string, lifetime: string) {
  const { budgetWei, blocks } = sessionLimits(client, budget, lifetime);
  await requireNativeRegistry(client, owner);
  const [chainId, block, code] = await withTimeout(Promise.all([
    client.web3.eth.getChainId(), client.web3.eth.getBlockNumber(), client.web3.eth.getCode(owner),
  ]), 15000, "Session preparation RPC");
  if (code !== "0x") throw new Error("Only an ordinary owner wallet can register a native session key");
  const account = client.web3.eth.accounts.create();
  const expiry = block + BigInt(blocks);
  const { proof } = acceptanceProof(client, account.privateKey, owner, account.address, chainId, budgetWei, expiry);
  const data = registryFor(client).methods.CreateSessionKey(
    account.address, CONTRACT_ADDRESS, [mineSelector(client)], "0", budgetWei.toString(), expiry.toString(), proof,
  ).encodeABI();
  return { privateKey: account.privateKey, data, record: {
    owner, address: account.address, chainId: chainId.toString(), expiry: expiry.toString(), budgetWei: budgetWei.toString(), transactionHash: "",
  } satisfies SessionRecord };
}

export function assertSession(record: SessionRecord, status: SessionStatus, chainId: bigint, nextBlock: bigint) {
  if (chainId.toString() !== record.chainId) throw new Error("The session belongs to another chain. Reconnect and authorize a new session.");
  if (status.owner.toLowerCase() !== record.owner.toLowerCase() || status.target.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase() || status.aplo !== BigInt(0) || status.expiry.toString() !== record.expiry || status.gaplo > BigInt(record.budgetWei)) {
    throw new Error("Session is revoked, absent, or does not match the authorized mining scope");
  }
  if (nextBlock > status.expiry) throw new Error("Session expired. Revoke or clear it and authorize a fresh session.");
  if (status.gaplo <= BigInt(0)) throw new Error("Session GAPLO gas budget is exhausted");
}

export function createSessionSender(client: MinerClient, record: SessionRecord, privateKey: string) {
  const address = client.web3.eth.accounts.privateKeyToAccount(privateKey).address;
  if (address.toLowerCase() !== record.address.toLowerCase()) throw new Error("Session key does not match its authorization");
  const send = createPrivateKeySender(client, privateKey, async (tx) => {
    const [status, block, chainId] = await Promise.all([
      readSession(client, record.address, record.owner), client.web3.eth.getBlockNumber(), client.web3.eth.getChainId(),
    ]);
    assertSession(record, status, chainId, block + BigInt(1));
    if (tx.chainId !== chainId || tx.gas * tx.gasPrice > status.gaplo) throw new Error("Session gas budget cannot cover this transaction's maximum fee");
  });
  return async (to: string, data: string, signal?: AbortSignal) => {
    if (to.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase() || !new RegExp(`^${mineSelector(client)}[0-9a-fA-F]{64}$`).test(data)) {
      throw new Error("Session permission only allows GAplo mine(bytes32)");
    }
    signal?.throwIfAborted();
    // Check before estimateGas as well: stale/revoked sessions must fail closed.
    const [status, block, chainId, gasPrice] = await Promise.all([
      readSession(client, record.address, record.owner), client.web3.eth.getBlockNumber(), client.web3.eth.getChainId(), client.web3.eth.getGasPrice(),
    ]);
    assertSession(record, status, chainId, block + BigInt(1));
    // Even an empty transaction needs intrinsic gas. Reject an obviously too
    // small budget before estimateGas can turn a native allowance error into a
    // generic contract revert. The full gas limit is checked again before signing.
    if (BigInt(21000) * gasPrice > status.gaplo) throw new Error("Session gas budget cannot cover this transaction's maximum fee");
    return send(to, data, signal);
  };
}
