import type { EthereumProvider, SendTransaction, TransactionReceipt } from "../types";
import type { MinerClient } from "./client";
import { formatPrivateKey, withTimeout } from "../utils";

export function delay(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, milliseconds);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export function requireSuccessfulReceipt<T extends TransactionReceipt>(receipt: T): T {
  if (![true, 1, BigInt(1), "1", "0x1"].includes(receipt.status)) {
    throw new Error(`Transaction reverted: ${receipt.transactionHash}`);
  }
  return receipt;
}

interface WalletTransactionOptions<T extends TransactionReceipt> {
  provider: EthereumProvider;
  from: string;
  to: string;
  data: string;
  waitForReceipt: (hash: string) => Promise<T | null | undefined>;
  signal?: AbortSignal;
  delay?: (milliseconds: number, signal?: AbortSignal) => Promise<void>;
  pollIntervalMs?: number;
  timeoutMs?: number;
  onSubmitted?: (hash: string) => void;
}

export async function submitWalletTransaction<T extends TransactionReceipt>({
  provider, from, to, data, waitForReceipt, signal,
  delay: wait = delay, pollIntervalMs = 1000, timeoutMs = 120000,
  onSubmitted,
}: WalletTransactionOptions<T>): Promise<T> {
  signal?.throwIfAborted();
  const hash = await provider.request({ method: "eth_sendTransaction", params: [{ from, to, data }] });
  if (typeof hash !== "string" || !hash) throw new Error("Wallet did not return a transaction hash");
  onSubmitted?.(hash);

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    // Submission cannot be undone. Finish observing its receipt even if mining
    // was stopped, so restarting cannot send the same pending stake/share twice.
    const receipt = await withTimeout(waitForReceipt(hash), 15000, "Transaction receipt RPC");
    if (receipt) return requireSuccessfulReceipt(receipt);
    await wait(pollIntervalMs);
  }
  throw new Error(`Timed out waiting for transaction ${hash}. Check its status before trying again.`);
}

export function createWalletSender(client: MinerClient, provider: EthereumProvider, address: string, onSubmitted?: (hash: string) => void): SendTransaction {
  return async (to, data, signal) => {
    const [walletChain, rpcChain] = await Promise.all([
      provider.request({ method: "eth_chainId" }),
      withTimeout(client.web3.eth.getChainId(), 15000, "Chain ID RPC"),
    ]);
    if (typeof walletChain !== "string" || BigInt(walletChain) !== rpcChain) {
      throw new Error("Wallet network does not match the selected RPC node. Switch the wallet network before continuing.");
    }
    signal?.throwIfAborted();
    return submitWalletTransaction({
      provider, from: address, to, data, signal, onSubmitted,
      waitForReceipt: (hash) => client.getTransactionReceipt(hash),
    });
  };
}

export interface PreparedTransaction {
  from: string; to: string; data: string;
  gas: bigint; gasPrice: bigint; nonce: bigint; chainId: bigint;
}

export function createPrivateKeySender(client: MinerClient, privateKey: string, beforeSign?: (tx: PreparedTransaction) => Promise<void>): SendTransaction {
  const account = client.web3.eth.accounts.privateKeyToAccount(formatPrivateKey(privateKey));
  return async (to, data, signal) => {
    const web3 = client.web3;
    const transaction = { from: account.address, to, data };
    const [gas, gasPrice, nonce, chainId] = await withTimeout(Promise.all([
      web3.eth.estimateGas(transaction), web3.eth.getGasPrice(),
      web3.eth.getTransactionCount(account.address, "pending"), web3.eth.getChainId(),
    ]), 15000, "Transaction preparation RPC");
    signal?.throwIfAborted();
    const prepared = { ...transaction, gas: gas + BigInt(10000), gasPrice, nonce, chainId };
    await beforeSign?.(prepared);
    signal?.throwIfAborted();
    const signed = await account.signTransaction({ ...prepared, value: BigInt(0), type: 0 });
    signal?.throwIfAborted();
    const receipt = await web3.eth.sendSignedTransaction(signed.rawTransaction);
    return requireSuccessfulReceipt({
      blockNumber: receipt.blockNumber,
      transactionHash: String(receipt.transactionHash),
      status: receipt.status,
    });
  };
}
