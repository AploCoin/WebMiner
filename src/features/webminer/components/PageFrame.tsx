"use client";

import type { ReactNode } from "react";
import { MinerNavigation } from "@/components/MinerNavigation";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PageFrame({ activePath, title, description, children, footer }: {
  activePath: string; title: string; description: string; children: ReactNode; footer?: ReactNode;
}) {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <MinerNavigation activePath={activePath} />
          <div className="self-end"><ThemeSwitcher /></div>
        </div>
        <Card className="overflow-hidden shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle><h1 className="text-2xl font-bold">{title}</h1></CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">{children}</CardContent>
        </Card>
        {footer}
      </div>
    </main>
  );
}
