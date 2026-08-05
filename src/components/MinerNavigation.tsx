"use client";

import Link from "next/link";
import { Pickaxe, ShieldCheck, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

const destinations = [
  { href: "/", label: "Miner", icon: Pickaxe },
  { href: "/staking", label: "Staking", icon: Coins },
  { href: "/legacy", label: "Legacy", icon: ShieldCheck },
];

export function MinerNavigation({ activePath }: { activePath: string }) {
  return (
    <nav aria-label="Miner navigation" className="inline-flex w-full gap-1 rounded-lg border bg-muted/40 p-1 sm:w-auto">
      {destinations.map(({ href, label, icon: Icon }) => {
        const active = activePath === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:flex-none",
              active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}