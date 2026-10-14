import { CONTRACT_ADDRESS } from "../config";
import type { MinedShare, MinerParams, MiningWorkerMessage, SendTransaction } from "../types";
import type { MinerClient } from "./client";
import { withTimeout } from "../utils";
import { delay } from "./transactions";

export function findMiningNonce(address: string, params: MinerParams, signal: AbortSignal): Promise<bigint> {
  signal.throwIfAborted();
  const worker = new Worker(new URL("../../../workers/miningWorker.ts", import.meta.url));
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      signal.removeEventListener("abort", onAbort);
      worker.terminate();
    };
    const onAbort = () => { cleanup(); reject(signal.reason); };
    signal.addEventListener("abort", onAbort, { once: true });
    worker.onerror = (event) => { cleanup(); reject(new Error(event.message || "Mining worker crashed")); };
    worker.onmessage = (event: MessageEvent<MiningWorkerMessage>) => {
      if (event.data.jobId !== 1) return;
      if (event.data.type === "found") {
        cleanup();
        resolve(BigInt(event.data.nonce));
      } else if (event.data.type === "error") {
        cleanup();
        reject(new Error(event.data.message));
      }
    };
    worker.postMessage({
      type: "start", jobId: 1, sender: address,
      difficulty: params.currentDifficulty.toString(), prevHash: params.prevHash.toString(), totalMined: params.totalMined,
    });
  });
}

interface MiningSession {
  client: MinerClient;
  address: string;
  rpcCaller?: string;
  send: SendTransaction;
  signal: AbortSignal;
  onShare: (share: MinedShare) => void;
  onRefresh: () => Promise<void>;
}

export async function runMining({ client, address, rpcCaller, send, signal, onShare, onRefresh }: MiningSession) {
  while (!signal.aborted) {
    const params = await client.getMinerParams(address, rpcCaller);
    const block = await withTimeout(client.web3.eth.getBlockNumber(), 15000, "Block number RPC");
    signal.throwIfAborted();
    if (block - params.lastBlock < BigInt(20)) {
      await delay(10000, signal);
      continue;
    }
    const nonce = await findMiningNonce(address, params, signal);
    signal.throwIfAborted();
    const nonceHex = client.web3.utils.padLeft(client.web3.utils.toHex(nonce), 64);
    const receipt = await send(CONTRACT_ADDRESS, client.mining.methods.mine(nonceHex).encodeABI(), signal);
    signal.throwIfAborted();
    onShare({ blockNumber: Number(receipt.blockNumber), txHash: receipt.transactionHash, timestamp: new Date().toLocaleString() });
    await onRefresh();
  }
}
