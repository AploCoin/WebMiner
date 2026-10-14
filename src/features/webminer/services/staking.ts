import { APLO_STAKING_ADDRESS, MIN_STAKE_APLO, MIN_STAKE_WEI } from "../config";
import type { SendTransaction } from "../types";
import type { MinerClient } from "./client";
import { isValidStakeAmount } from "../utils";

export function stakeAplo(client: MinerClient, send: SendTransaction, amount: string, signal?: AbortSignal) {
  const normalized = amount.trim().replace(",", ".");
  if (!isValidStakeAmount(normalized)) throw new Error("Enter a positive APLO amount to stake");
  const wei = client.web3.utils.toWei(normalized, "ether");
  return send(APLO_STAKING_ADDRESS, client.staking.methods.stake(wei).encodeABI(), signal);
}

export function unstakeAplo(client: MinerClient, send: SendTransaction, signal?: AbortSignal) {
  return send(APLO_STAKING_ADDRESS, client.staking.methods.unstake().encodeABI(), signal);
}

export async function ensureMinimumStake(client: MinerClient, address: string, send: SendTransaction, signal: AbortSignal) {
  const status = await client.getStakeStatus(address);
  signal.throwIfAborted();
  if (status.canMine) return;
  const missingWei = MIN_STAKE_WEI - status.stakedWei;
  await send(APLO_STAKING_ADDRESS, client.staking.methods.stake(missingWei.toString()).encodeABI(), signal);
  signal.throwIfAborted();
  const updated = await client.getStakeStatus(address);
  if (!updated.canMine) throw new Error(`At least ${MIN_STAKE_APLO} APLO must be staked before mining`);
}
