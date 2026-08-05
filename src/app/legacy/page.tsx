"use client";

import { WebMinerShell } from "@/features/webminer/components/WebMinerShell";

export default function LegacyPage() {
  return (
    <main className="min-h-screen w-full bg-background">
      <WebMinerShell surface="legacy" />
    </main>
  );
}