export interface MinerParams {
  lastBlock: number;
  currentDifficulty: bigint;
  totalMined: number;
  prevHash: bigint;
}

export interface MinedShare {
  blockNumber: number;
  txHash: string;
  timestamp: string;
}

export type MinerMode = "current" | "legacy";

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
  request: (args: { method: string; params?: unknown[] }) => Promise<any>;
  on?: (event: string, handler: (...args: any[]) => void) => void;
  removeListener?: (event: string, handler: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
