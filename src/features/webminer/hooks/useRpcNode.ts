"use client";

import { useEffect, useMemo, useState } from "react";
import { PRESET_RPC_NODES } from "../config";
import { validateRpcUrl } from "../utils";
import { createMinerClient } from "../services/client";

export function useRpcNode() {
  const [selectedNodeType, setSelectedNodeType] = useState("pub1");
  const [customRpcUrl, setCustomRpcUrl] = useState("");
  useEffect(() => {
    const node = window.localStorage.getItem("rpcNodeType");
    if (node && ["pub1", "pub2", "custom"].includes(node)) setSelectedNodeType(node);
    setCustomRpcUrl(window.localStorage.getItem("customRpcUrl") || "");
  }, []);

  const currentRpcUrl = selectedNodeType === "custom" ? customRpcUrl : PRESET_RPC_NODES[selectedNodeType === "pub2" ? 1 : 0].url;
  const isRpcReady = validateRpcUrl(currentRpcUrl);
  const client = useMemo(() => isRpcReady ? createMinerClient(currentRpcUrl) : null, [currentRpcUrl, isRpcReady]);

  return {
    selectedNodeType, customRpcUrl, currentRpcUrl, isRpcReady, client,
    handleNodeChange(node: string) {
      setSelectedNodeType(node);
      window.localStorage.setItem("rpcNodeType", node);
    },
    handleCustomRpcChange(url: string) {
      setCustomRpcUrl(url);
      window.localStorage.setItem("customRpcUrl", url);
    },
  };
}
