export interface MinerParams {
  lastBlock: bigint;
  currentDifficulty: bigint;
  totalMined: number;
  prevHash: bigint;
}

export interface MinedShare {
  blockNumber: number;
  txHash: string;
  timestamp: string;
}

export interface MinerStats {
  difficulty: string;
  totalMined: number;
  balance: string;
}

export interface TransactionReceipt {
  blockNumber: bigint | number | string;
  transactionHash: string;
  status: bigint | number | string | boolean;
}

export type SendTransaction = (
  to: string,
  data: string,
  signal?: AbortSignal,
) => Promise<TransactionReceipt>;

export interface StakePlanRow {
  stake: string;
  level: string;
  rewardFormula: string;
  status: string;
}

export interface StakeStatus {
  stakedWei: bigint;
  staked: string;
  multiplier: number;
  canMine: boolean;
}

export type MiningWorkerMessage =
  | { type: "found"; jobId: number; nonce: string; hash: string }
  | { type: "heartbeat"; jobId: number; at: number }
  | { type: "error"; jobId: number; message: string };


export interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
