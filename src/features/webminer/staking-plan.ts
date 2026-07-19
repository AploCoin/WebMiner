import type { StakePlanRow } from "./types";

export const STAKE_PLAN_ROWS: StakePlanRow[] = [
  { stake: "< 1,000 APLO", reward: "No mining reward", multiplier: "0", status: "Below minimum" },
  { stake: "1,000 APLO", reward: "Base reward", multiplier: "1.0x", status: "Minimum to mine" },
  { stake: "2,000 APLO", reward: "+10% reward", multiplier: "1.1x", status: "Tier 2" },
  { stake: "3,000 APLO", reward: "+20% reward", multiplier: "1.2x", status: "Tier 3" },
  { stake: "4,000 APLO", reward: "+30% reward", multiplier: "1.3x", status: "Tier 4" },
  { stake: "5,000 APLO", reward: "+40% reward", multiplier: "1.4x", status: "Tier 5" },
  { stake: "6,000 APLO", reward: "+50% reward", multiplier: "1.5x", status: "Tier 6" },
  { stake: "7,000 APLO", reward: "+60% reward", multiplier: "1.6x", status: "Tier 7" },
  { stake: "8,000+ APLO", reward: "+70% reward", multiplier: "1.7x", status: "Max tier" },
];
