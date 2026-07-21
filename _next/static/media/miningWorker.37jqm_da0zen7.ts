import Web3 from "web3";

interface StartMiningMessage {
  type: "start";
  jobId: number;
  sender: string;
  difficulty: string;
  prevHash: string;
  totalMined: number;
}

interface StopMiningMessage {
  type: "stop";
}

type MiningMessage = StartMiningMessage | StopMiningMessage;

const web3 = new Web3();
let activeJobId = 0;
let activeMessage: StartMiningMessage | null = null;
let shouldMine = false;
const HEARTBEAT_INTERVAL_MS = 1000;

const randomNonce = (): bigint => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return BigInt(
    "0x" + Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
  );
};

const hashNonce = (
  nonce: bigint,
  sender: string,
  difficulty: bigint,
  prevHash: bigint,
  totalMined: number
): bigint => {
  const packedData = web3.utils.encodePacked(
    { value: sender, type: "address" },
    {
      value: web3.utils.padLeft(web3.utils.toHex(nonce), 64),
      type: "bytes32",
    },
    { value: difficulty.toString(), type: "uint256" },
    { value: prevHash.toString(), type: "uint256" },
    { value: totalMined.toString(), type: "uint256" }
  );
  const hash = web3.utils.sha3(packedData);
  if (!hash) throw new Error("Failed to compute hash");
  return BigInt("0x" + hash.slice(2));
};

const mineLoop = () => {
  if (!shouldMine || !activeMessage) return;

  const message = activeMessage;
  const difficulty = BigInt(message.difficulty);
  const prevHash = BigInt(message.prevHash);
  const totalMined = message.totalMined;
  let lastHeartbeatAt = Date.now();

  try {
    while (shouldMine && activeJobId === message.jobId) {
      if (!shouldMine || activeJobId !== message.jobId) return;

      const nonce = randomNonce();
      const hashResult = hashNonce(
        nonce,
        message.sender,
        difficulty,
        prevHash,
        totalMined
      );

      if (hashResult < difficulty) {
        shouldMine = false;
        self.postMessage({
          type: "found",
          jobId: message.jobId,
          nonce: nonce.toString(),
          hash: hashResult.toString(),
        });
        return;
      }

      const now = Date.now();
      if (now - lastHeartbeatAt >= HEARTBEAT_INTERVAL_MS) {
        lastHeartbeatAt = now;
        self.postMessage({ type: "heartbeat", jobId: message.jobId, at: now });
      }
    }
  } catch (error) {
    shouldMine = false;
    self.postMessage({
      type: "error",
      jobId: message.jobId,
      message: error instanceof Error ? error.message : "Unknown mining worker error",
    });
  }
};

self.onmessage = (event: MessageEvent<MiningMessage>) => {
  const message = event.data;

  if (message.type === "stop") {
    shouldMine = false;
    activeMessage = null;
    activeJobId += 1;
    return;
  }

  activeJobId = message.jobId;
  activeMessage = message;
  shouldMine = true;
  mineLoop();
};
