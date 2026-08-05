import type { EthereumProvider } from "./types";

interface SubmitWalletMineTransactionOptions<TReceipt> {
  provider: EthereumProvider;
  from: string;
  to: string;
  data: string;
  waitForReceipt: (transactionHash: string) => Promise<TReceipt | null>;
  delay?: (milliseconds: number) => Promise<void>;
  pollIntervalMs?: number;
  timeoutMs?: number;
}

const defaultDelay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function submitWalletMineTransaction<TReceipt>({
  provider,
  from,
  to,
  data,
  waitForReceipt,
  delay = defaultDelay,
  pollIntervalMs = 1000,
  timeoutMs = 120000,
}: SubmitWalletMineTransactionOptions<TReceipt>): Promise<TReceipt> {
  const transactionHash = await provider.request({
    method: "eth_sendTransaction",
    params: [{ from, to, data }],
  });
  if (typeof transactionHash !== "string" || !transactionHash) {
    throw new Error("Wallet did not return a transaction hash");
  }

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const receipt = await waitForReceipt(transactionHash);
    if (receipt) return receipt;
    await delay(pollIntervalMs);
  }
  throw new Error(`Timed out waiting for wallet transaction ${transactionHash}`);
}
