"use client";

import { WebMinerShell } from "@/features/webminer/components/WebMinerShell";

export default function StakingPage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <WebMinerShell surface="staking" />
    </main>
  );
}