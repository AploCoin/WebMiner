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
  reward: string;
  multiplier: string;
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

export interface Erc7715PermissionResponse {
  chainId: string;
  from: string;
  to: string;
  context: string;
  delegationManager: string;
  dependencies?: { factory?: string; factoryData?: string }[];
}

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
