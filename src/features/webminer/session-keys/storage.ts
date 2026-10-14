import type { SessionRecord } from "./protocol";

const storageKey = (owner: string, chainId: string) => `webminer.session.public:${chainId}:${owner.toLowerCase()}`;

// Public metadata only. The private key is intentionally never serialized.
export function saveSession(record: SessionRecord) {
  const { owner, address, chainId, expiry, budgetWei, transactionHash } = record;
  localStorage.setItem(storageKey(owner, chainId), JSON.stringify({ owner, address, chainId, expiry, budgetWei, transactionHash }));
}

export function loadSession(owner: string, chainId: string): SessionRecord | null {
  try {
    const record = JSON.parse(localStorage.getItem(storageKey(owner, chainId)) || "null") as SessionRecord | null;
    if (!record || record.owner.toLowerCase() !== owner.toLowerCase() || record.chainId !== chainId ||
      !/^0x[0-9a-fA-F]{40}$/.test(record.address) || !/^0x[0-9a-fA-F]{64}$/.test(record.transactionHash) ||
      !/^\d+$/.test(record.expiry) || !/^\d+$/.test(record.budgetWei)) return null;
    return record;
  } catch { return null; }
}

export function removeSession(record: SessionRecord) {
  localStorage.removeItem(storageKey(record.owner, record.chainId));
}
