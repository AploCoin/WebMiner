"use client";

import Link from "next/link";
import { ArrowUpRight, Coins, KeyRound, Pickaxe } from "lucide-react";
import { PageFrame } from "@/features/webminer/components/PageFrame";

const destinations = [
  { href: "/mining", title: "Wallet Mining", icon: Pickaxe, description: "Connect your wallet to mine GAPLO. Confirm each transaction when a share is ready.", action: "Open Miner" },
  { href: "/legacy", title: "Legacy Mining", icon: KeyRound, description: "Enter a dedicated mining wallet’s private key. Shares are signed locally in your browser.", action: "Open Legacy" },
  { href: "/staking", title: "APLO Staking", icon: Coins, description: "Manage your APLO stake and check the requirements to unlock mining rewards.", action: "Open Staking" },
];

export default function Home() {
  return (
    <PageFrame activePath="/" title="AploCoin Web Miner" description="Choose how you want to mine or manage your APLO stake.">
      <div className="grid gap-4 sm:grid-cols-3">
        {destinations.map(({ href, title, icon: Icon, description, action }) => (
          <Link key={href} href={href} className="group flex flex-col rounded-lg border p-5 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
            <Icon className="mb-4 h-7 w-7 text-primary" />
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mb-6 mt-2 flex-1 text-sm text-muted-foreground">{description}</p>
            <span className="flex items-center gap-2 text-sm font-medium text-primary">{action}<ArrowUpRight className="h-4 w-4" /></span>
          </Link>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Mining requires at least 1,000 APLO staked. You can manage your stake on the staking page.</p>
    </PageFrame>
  );
}
