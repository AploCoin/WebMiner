"use client";

import { useMemo, useState } from "react";
import { getAddressFromPrivateKey, validatePrivateKey } from "../utils";
import type { MinerClient } from "../services/client";
import { createPrivateKeySender } from "../services/transactions";

export function useLegacyWallet(client: MinerClient | null) {
  const [privateKey, setPrivateKey] = useState("");
  const walletAddress = useMemo(() => validatePrivateKey(privateKey)
    ? getAddressFromPrivateKey(privateKey) : "", [privateKey]);
  const sendTransaction = useMemo(() => client && walletAddress
    ? createPrivateKeySender(client, privateKey) : null, [client, privateKey, walletAddress]);
  return { privateKey, setPrivateKey, walletAddress, sendTransaction };
}
