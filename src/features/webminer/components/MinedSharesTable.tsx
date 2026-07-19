"use client";

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MinedShare } from "../types";

const columns: ColumnDef<MinedShare>[] = [
  { accessorKey: "timestamp", header: "Timestamp" },
  { accessorKey: "blockNumber", header: "Block Number", cell: ({ row }) => <div>{row.getValue<number>("blockNumber")}</div> },
  { accessorKey: "txHash", header: "Transaction Hash", cell: ({ row }) => <div className="break-all">{row.getValue<string>("txHash")}</div> },
];

interface MinedSharesTableProps {
  minedShares: MinedShare[];
}

export function MinedSharesTable({ minedShares }: MinedSharesTableProps) {
  const table = useReactTable({ data: minedShares, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <Card>
      <CardHeader><CardTitle className="text-xl font-bold">Mined Shares (Logs)</CardTitle></CardHeader>
      <CardContent>
        {minedShares.length === 0 ? (
          <p className="text-center text-gray-500">No shares mined yet</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
