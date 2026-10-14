import Web3 from "web3";
import { APLO_STAKING_ABI, APLO_STAKING_ADDRESS, CONTRACT_ABI, CONTRACT_ADDRESS, DEFAULT_DIFFICULTY, MIN_STAKE_WEI } from "../config";
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
    async getMinerParams(address: string): Promise<MinerParams> {
      const params = await withTimeout(mining.methods.miner_params(address).call(), 15000, "miner_params RPC");
      const difficulty = BigInt(params.current_difficulty);
      return {
        lastBlock: BigInt(params.last_block),
        currentDifficulty: difficulty === BigInt(0) ? DEFAULT_DIFFICULTY : difficulty,
        totalMined: Number(params.total_mined),
        prevHash: BigInt(params.prev_hash),
      };
    },
    async getStakeStatus(address: string): Promise<StakeStatus> {
      const [staked, multiplier] = await withTimeout(Promise.all([
        staking.methods.getStake(address).call(),
        staking.methods.getMultiplier(address).call(),
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
