"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STAKE_PLAN_ROWS } from "../staking-plan";

export function StakeRewardTable() {
  return (
    <div className="space-y-2 rounded-md border p-3">
      <p className="text-sm font-medium">Stake → Reward table</p>
      <Table>
        <TableHeader>
          <TableRow><TableHead>Stake</TableHead><TableHead>Reward</TableHead><TableHead>Multiplier</TableHead><TableHead>Status</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {STAKE_PLAN_ROWS.map((row) => (
            <TableRow key={row.stake}><TableCell>{row.stake}</TableCell><TableCell>{row.reward}</TableCell><TableCell>{row.multiplier}</TableCell><TableCell>{row.status}</TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
