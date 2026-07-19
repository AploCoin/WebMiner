import type { StakePlanRow } from "./types";

export const STAKE_PLAN_ROWS: StakePlanRow[] = [
  {
    stake: "< 1,000 APLO",
    level: "Locked",
    rewardFormula: "No mining reward",
    status: "Stake gate is not met",
  },
  {
    stake: "1,000+ APLO",
    level: "Mining enabled",
    rewardFormula: "gasUsed × effectiveGasPrice ÷ GAploRewardCoef",
    status: "Stake only unlocks rewards",
  },
];
