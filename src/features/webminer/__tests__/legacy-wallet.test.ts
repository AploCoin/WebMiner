import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLegacyWallet } from "../hooks/useLegacyWallet";

describe("legacy private key", () => {
  it("clears the derived address when a valid key is erased or becomes invalid", () => {
    const { result } = renderHook(() => useLegacyWallet(null));
    act(() => result.current.setPrivateKey("1".repeat(64)));
    expect(result.current.walletAddress).toMatch(/^0x[0-9a-fA-F]{40}$/);
    act(() => result.current.setPrivateKey("1"));
    expect(result.current.walletAddress).toBe("");
    act(() => result.current.setPrivateKey(""));
    expect(result.current.walletAddress).toBe("");
  });

  it("rejects a zero key even though it has the correct hex length", () => {
    const { result } = renderHook(() => useLegacyWallet(null));
    act(() => result.current.setPrivateKey("0".repeat(64)));
    expect(result.current.walletAddress).toBe("");
  });
});
