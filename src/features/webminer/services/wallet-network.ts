import { APLO_CHAIN } from "../config";
import type { EthereumProvider } from "../types";

export async function walletChainId(provider: EthereumProvider): Promise<string> {
  const chain = await provider.request({ method: "eth_chainId" });
  if (typeof chain !== "string" || !/^0x[0-9a-f]+$/i.test(chain)) throw new Error("Wallet returned an invalid chain ID");
  return `0x${BigInt(chain).toString(16)}`;
}

export async function switchToAplo(provider: EthereumProvider) {
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: APLO_CHAIN.chainId }] });
  } catch (cause) {
    if (!cause || typeof cause !== "object" || !("code" in cause) || cause.code !== 4902) throw cause;
    await provider.request({ method: "wallet_addEthereumChain", params: [APLO_CHAIN] });
    // Adding does not imply selecting (EIP-3085).
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: APLO_CHAIN.chainId }] });
  }
  if (await walletChainId(provider) !== APLO_CHAIN.chainId) throw new Error("Select AploCoin in your wallet, then reconnect");
}
