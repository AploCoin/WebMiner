"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EthereumProvider } from "../types";
import type { MinerClient } from "../services/client";
import { createWalletSender, requireSuccessfulReceipt } from "../services/transactions";
import { withTimeout } from "../utils";
import {
  assertSession, createSessionSender, DEFAULT_SESSION_BLOCKS, DEFAULT_SESSION_BUDGET,
  prepareRegistration, readSession, registryFor, SESSION_REGISTRY_ADDRESS, ZERO_ADDRESS,
  type SessionRecord, type SessionStatus,
} from "./protocol";
import { loadSession, removeSession, saveSession } from "./storage";

interface SessionView {
  record: SessionRecord; status: SessionStatus;
  valid: boolean; pending: boolean; canClear: boolean; message: string;
}

export function useSessionKey(client: MinerClient | null, owner: string, provider: EthereumProvider | null) {
  const [chainId, setChainId] = useState("");
  const [record, setRecord] = useState<SessionRecord | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [view, setView] = useState<SessionView | null>(null);
  const [budget, setBudget] = useState(DEFAULT_SESSION_BUDGET);
  const [lifetime, setLifetime] = useState(DEFAULT_SESSION_BLOCKS);
  const [busy, setBusy] = useState<"authorize" | "revoke" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const operationRef = useRef<AbortController | null>(null);
  const contextRef = useRef(0);

  useEffect(() => {
    const context = ++contextRef.current;
    setChainId(""); setRecord(null); setPrivateKey(null); setView(null); setError(""); setBusy(null);
    if (client && owner && provider) {
      setLoading(true);
      void withTimeout(client.web3.eth.getChainId(), 15000, "Chain ID RPC").then((id) => {
        if (contextRef.current !== context) return;
        setChainId(id.toString());
        setRecord(loadSession(owner, id.toString()));
      }).catch((cause) => {
        if (contextRef.current === context) setError(cause instanceof Error ? cause.message : "Cannot read the selected chain");
      }).finally(() => { if (contextRef.current === context) setLoading(false); });
    } else setLoading(false);
    return () => { contextRef.current = context + 1; operationRef.current?.abort(); operationRef.current = null; };
  }, [client, owner, provider]);

  const refresh = useCallback(async (isActive: () => boolean = () => true) => {
    if (!client || !record) return;
    const [status, block, currentChain, receipt] = await withTimeout(Promise.all([
      readSession(client, record.address, record.owner), client.web3.eth.getBlockNumber(), client.web3.eth.getChainId(),
      client.getTransactionReceipt(record.transactionHash),
    ]), 15000, "Session status RPC");
    if (!isActive()) return;
    if (currentChain.toString() !== record.chainId) throw new Error("RPC chain changed. Reconnect the wallet before using session keys.");
    let valid = false;
    let message = "";
    const absent = status.owner.toLowerCase() === ZERO_ADDRESS;
    if (!receipt && absent) message = "Registration is awaiting confirmation. Refresh status before authorizing again.";
    else if (absent) message = "Session is revoked, expired, or registration failed. Clear this record to authorize a new key.";
    else {
      try { assertSession(record, status, currentChain, block + BigInt(1)); valid = true; }
      catch (cause) { message = cause instanceof Error ? cause.message : "Session is not usable"; }
    }
    setView({ record, status, valid, pending: absent && !receipt, canClear: absent && Boolean(receipt), message });
  }, [client, record]);

  useEffect(() => {
    let active = true;
    const update = () => refresh(() => active).catch((cause) => {
      if (active) { setView(null); setError(cause instanceof Error ? cause.message : "Cannot verify session status"); }
    });
    void update();
    const interval = setInterval(update, 5000);
    return () => { active = false; clearInterval(interval); };
  }, [refresh]);

  const currentView = view?.record === record ? view : null;
  const sendTransaction = useMemo(() => client && record && privateKey && currentView?.valid
    ? createSessionSender(client, record, privateKey) : null, [client, record, privateKey, currentView?.valid]);

  const authorize = async () => {
    if (!client || !provider || !owner || !chainId || record || operationRef.current) return;
    const operation = new AbortController();
    const context = contextRef.current;
    operationRef.current = operation;
    setBusy("authorize"); setError("");
    let submitted = false;
    try {
      const prepared = await prepareRegistration(client, owner, budget, lifetime);
      if (prepared.record.chainId !== chainId) throw new Error("RPC chain changed. Reconnect before authorizing.");
      operation.signal.throwIfAborted();
      setPrivateKey(prepared.privateKey);
      const sender = createWalletSender(client, provider, owner, (hash) => {
        submitted = true;
        const publicRecord = { ...prepared.record, transactionHash: hash };
        // Retain public revocation information even if the page was left while
        // the wallet prompt was open. Never persist prepared.privateKey.
        try { saveSession(publicRecord); } catch { /* Public address remains visible in this page. */ }
        if (contextRef.current === context) setRecord(publicRecord);
      });
      const receipt = await sender(SESSION_REGISTRY_ADDRESS, prepared.data, operation.signal);
      requireSuccessfulReceipt(receipt);
      operation.signal.throwIfAborted();
      const status = await readSession(client, prepared.record.address, owner);
      const block = await client.web3.eth.getBlockNumber();
      assertSession(prepared.record, status, BigInt(prepared.record.chainId), block + BigInt(1));
    } catch (cause) {
      if (contextRef.current === context && !operation.signal.aborted) {
        if (!submitted) setPrivateKey(null);
        setError(cause instanceof Error ? cause.message : "Session authorization failed");
      }
    } finally {
      if (operationRef.current === operation) { operationRef.current = null; setBusy(null); }
    }
  };

  const revoke = async () => {
    if (!client || !provider || !record || operationRef.current) return;
    const operation = new AbortController();
    operationRef.current = operation;
    setBusy("revoke"); setError("");
    try {
      await createWalletSender(client, provider, owner)(SESSION_REGISTRY_ADDRESS, registryFor(client).methods.RevokeSessionKey(record.address).encodeABI(), operation.signal);
      operation.signal.throwIfAborted();
      const status = await readSession(client, record.address, record.owner);
      if (status.owner.toLowerCase() !== ZERO_ADDRESS) throw new Error("Session is still active; refresh its status before retrying");
      removeSession(record);
      setRecord(null); setPrivateKey(null); setView(null);
    } catch (cause) {
      if (!operation.signal.aborted) setError(cause instanceof Error ? cause.message : "Session revocation failed");
    } finally {
      if (operationRef.current === operation) { operationRef.current = null; setBusy(null); }
    }
  };

  const clearInactive = async () => {
    if (!client || !record || busy) return;
    try {
      const [status, receipt] = await Promise.all([readSession(client, record.address, record.owner), client.getTransactionReceipt(record.transactionHash)]);
      if (status.owner.toLowerCase() !== ZERO_ADDRESS || !receipt) throw new Error("Cannot clear an active or unconfirmed session. Revoke it or wait for confirmation.");
      removeSession(record); setRecord(null); setPrivateKey(null); setView(null); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Cannot clear session"); }
  };

  return {
    record, budget, setBudget, lifetime, setLifetime, busy, loading, error,
    status: currentView?.status || null, message: currentView?.message || "",
    hasPrivateKey: Boolean(privateKey), canClear: Boolean(currentView?.canClear),
    canRevoke: Boolean(currentView && !currentView.pending && currentView.status.owner.toLowerCase() === owner.toLowerCase()),
    sendTransaction, authorize, revoke, clearInactive,
    refresh: () => refresh().catch((cause) => { setView(null); setError(cause instanceof Error ? cause.message : "Cannot read session status"); }),
  };
}
