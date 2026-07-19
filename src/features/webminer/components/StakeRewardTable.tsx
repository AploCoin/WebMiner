"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STAKE_PLAN_ROWS } from "../staking-plan";

export function StakeRewardTable() {
  return (
    <div className="space-y-2 rounded-md border p-3">
      <p className="text-sm font-medium">Stake level → Mining reward rule</p>
      <p className="text-xs text-muted-foreground">
        APLO stake is a level gate for mining access. Reward size is calculated from gas used, not from stake size.
      </p>
      <Table>
        <TableHeader>
          <TableRow><TableHead>Stake</TableHead><TableHead>Level</TableHead><TableHead>Reward formula</TableHead><TableHead>Status</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {STAKE_PLAN_ROWS.map((row) => (
            <TableRow key={row.stake}><TableCell>{row.stake}</TableCell><TableCell>{row.level}</TableCell><TableCell>{row.rewardFormula}</TableCell><TableCell>{row.status}</TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground">
        Node logic: if stake multiplier is above zero, reward is based on gasUsed × effectiveGasPrice ÷ GAploRewardCoef. When miner is not the coinbase, the spent gas amount is added back to the reward.
      </p>
    </div>
  );
}
