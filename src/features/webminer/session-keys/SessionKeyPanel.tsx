"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { useSessionKey } from "./useSessionKey";
import { MAX_SESSION_BLOCKS } from "./protocol";
import Web3 from "web3";

type SessionControls = ReturnType<typeof useSessionKey>;

export function SessionKeyPanel({ session, connected, miningBusy }: { session: SessionControls; connected: boolean; miningBusy: boolean }) {
  const blocked = miningBusy || Boolean(session.busy) || session.loading || !connected;
  return (
    <section aria-label="Mining delegation" className="space-y-3 rounded-md border p-4">
      <h2 className="text-sm font-semibold">Mining Access</h2>
      <p className="text-xs text-muted-foreground">Authorize a temporary key to submit GAplo mining shares automatically. It can only mine GAplo and has no permission to spend APLO.</p>
      {!session.record ? <>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="session-budget">Gas budget (GAPLO)</Label>
            <Input id="session-budget" inputMode="decimal" value={session.budget} onChange={(e) => session.setBudget(e.target.value)} disabled={blocked} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session-lifetime">Lifetime (blocks)</Label>
            <Input id="session-lifetime" type="number" min="2" max={MAX_SESSION_BLOCKS} value={session.lifetime} onChange={(e) => session.setLifetime(e.target.value)} disabled={blocked} />
          </div>
        </div>
        <Button onClick={session.authorize} disabled={blocked}>{session.busy === "authorize" ? "Authorizing..." : "Authorize Mining"}</Button>
      </> : <>
        <div className="space-y-2 text-xs">
          <p>Session address: <span className="break-all font-mono">{session.record.address}</span></p>
          <p>Expires at block: <span className="font-mono">{session.record.expiry}</span></p>
          <p>Remaining gas budget: {session.status ? Web3.utils.fromWei(session.status.gaplo, "ether") : "Checking..."} GAPLO</p>
          {session.sendTransaction && <p className="font-medium text-green-600">Mining access active</p>}
          {!session.hasPrivateKey && !session.canClear && <p>The private session key is unavailable after leaving or reloading this page. Revoke the previous access before authorizing a new key.</p>}
          {session.message && <p role="status">{session.message}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={session.revoke} disabled={blocked || !session.canRevoke}>{session.busy === "revoke" ? "Revoking..." : "Revoke Mining Access"}</Button>
          <Button variant="outline" onClick={session.refresh} disabled={Boolean(session.busy)}>Refresh Session Status</Button>
          {session.canClear && <Button variant="outline" onClick={session.clearInactive} disabled={blocked}>Clear Inactive Session</Button>}
        </div>
      </>}
      {session.error && <p role="alert" className="text-sm text-destructive">{session.error}</p>}
      <p className="text-xs text-muted-foreground">The owner pays mining gas and receives rewards. The key stays only in this page’s memory; public session details are saved so you can revoke access after a reload.</p>
    </section>
  );
}
