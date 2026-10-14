import Web3, { errors } from "web3";
import { APLO_STAKING_ABI, APLO_STAKING_ADDRESS, CONTRACT_ABI, CONTRACT_ADDRESS, MIN_STAKE_WEI } from "../config";
import type { MinerParams, StakeStatus } from "../types";
import { withTimeout } from "../utils";

export function createMinerClient(rpcUrl: string) {
  const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
  const mining = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  const staking = new web3.eth.Contract(APLO_STAKING_ABI, APLO_STAKING_ADDRESS);

  return {
    web3,
    mining,
    staking,
    async getTransactionReceipt(hash: string) {
      try { return await web3.eth.getTransactionReceipt(hash); }
      catch (cause) {
        if (cause instanceof errors.TransactionNotFound) return null;
        throw cause;
      }
    },
    async getMinerParams(address: string, caller = address): Promise<MinerParams> {
      const params = await withTimeout(mining.methods.miner_params(address).call({ from: caller }), 15000, "miner_params RPC");
      const difficulty = BigInt(params.current_difficulty);
      // A fresh session has zeroed mining metadata. Use the contract's real
      // initial target, rather than the UI placeholder (MAX_UINT256).
      const initialDifficulty = difficulty === BigInt(0)
        ? BigInt(await withTimeout(mining.methods.DEFAULT_DIFFICULTY().call({ from: caller }), 15000, "Default difficulty RPC")) : difficulty;
      return {
        lastBlock: BigInt(params.last_block),
        currentDifficulty: initialDifficulty,
        totalMined: Number(params.total_mined),
        prevHash: BigInt(params.prev_hash),
      };
    },
    async getStakeStatus(address: string): Promise<StakeStatus> {
      const [staked, multiplier] = await withTimeout(Promise.all([
        staking.methods.getStake(address).call({ from: address }),
        staking.methods.getMultiplier(address).call({ from: address }),
      ]), 15000, "Stake status RPC");
      const stakedWei = BigInt(staked);
      return {
        stakedWei,
        staked: web3.utils.fromWei(stakedWei, "ether"),
        multiplier: Number(multiplier) / 10,
        canMine: stakedWei >= MIN_STAKE_WEI,
      };
    },
  };
}

export type MinerClient = ReturnType<typeof createMinerClient>;
