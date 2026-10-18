import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useWalletConnection } from "../hooks/useWalletConnection";

const address = "0x1111111111111111111111111111111111111111";
afterEach(() => { delete window.ethereum; });
it("accepts the initial accountsChanged emitted by wallet authorization, then invalidates captured senders", async () => {
  const handlers: Record<string, ((...args: unknown[]) => void)[]> = {};
  window.ethereum = {
    on: (event, handler) => { (handlers[event] ||= []).push(handler); },
    removeListener: (event, handler) => { handlers[event] = handlers[event].filter((h) => h !== handler); },
    request: vi.fn(async ({ method }) => {
      if (method === "eth_requestAccounts") {
        handlers.accountsChanged?.slice().forEach((h) => h([address]));
        return [address];
      }
      if (method === "eth_chainId") return "0x6e7a";
      throw new Error(`Unexpected ${method}`);
    }),
  };
  const { result } = renderHook(() => useWalletConnection(null, true));
  await act(async () => { await result.current.connectWallet(); });
  await waitFor(() => expect(result.current.sendTransaction).not.toBeNull());
  const capturedSender = result.current.sendTransaction!;
  act(() => handlers.accountsChanged.slice().forEach((h) => h([])));
  expect(result.current.walletAddress).toBe("");
  await expect(capturedSender("0x2", "0x")).rejects.toThrow("Wallet changed");
});
