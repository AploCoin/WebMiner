import { expect, test, type Page } from "@playwright/test";
import Web3 from "web3";

const web3 = new Web3();
// Public synthetic test key. Never fund this account.
const testKey = "1".repeat(64);
const address = web3.eth.accounts.privateKeyToAccount(`0x${testKey}`).address;
const txHash = `0x${"a".repeat(64)}`;
const miningAddress = "0x0000000000000000000000000000000000001234";
const ownerSubmissions = new WeakMap<Page, { data: string }[]>();
const stakingAddress = "0x0000000000000000000000000000000000001235";

async function installWallet(page: Page, reject = false) {
  ownerSubmissions.set(page, []);
  await page.exposeFunction("recordWalletTransaction", (transaction: { data: string }) => ownerSubmissions.get(page)!.push(transaction));
  await page.addInitScript(({ address, txHash, reject }) => {
    const requests: { method: string; params?: unknown[] }[] = [];
    const handlers: Record<string, (() => void)[]> = {};
    Object.assign(window, {
      walletRequests: requests,
      emitWalletChange: (event: string) => handlers[event]?.forEach((handler) => handler()),
      ethereum: {
        request: async (request: { method: string; params?: unknown[] }) => {
          requests.push(request);
          if (request.method === "eth_requestAccounts") return [address];
          if (request.method === "eth_chainId") return "0x1";
          if (request.method === "eth_sendTransaction") {
            if (reject) throw new Error("User rejected transaction");
            await (window as unknown as { recordWalletTransaction: (transaction: unknown) => Promise<void> }).recordWalletTransaction(request.params![0]);
            return txHash;
          }
          throw new Error(`Unexpected wallet method: ${request.method}`);
        },
        on: (event: string, handler: () => void) => { (handlers[event] ||= []).push(handler); },
        removeListener: (event: string, handler: () => void) => { handlers[event] = handlers[event]?.filter((item) => item !== handler); },
      },
    });
  }, { address, txHash, reject });
}

async function installRpc(page: Page, initialStake = "1000", difficulty = (BigInt(2) ** BigInt(256) - BigInt(1)).toString()) {
  let mined = false;
  let staked = initialStake;
  let session: { address: string; budget: string; expiry: string } | null = null;
  let processedData = "";
  const rawTransactions: string[] = [];
  const miningReads: { address: string; from?: string }[] = [];
  const registryAddress = "0x0000000000000000000000000000000000001237";
  const createSelector = web3.eth.abi.encodeFunctionSignature("CreateSessionKey(address,address,bytes4[],uint256,uint256,uint256,bytes)");
  const revokeSelector = web3.eth.abi.encodeFunctionSignature("RevokeSessionKey(address)");
  const receipt = {
    transactionHash: txHash, transactionIndex: "0x0", blockHash: `0x${"b".repeat(64)}`,
    blockNumber: "0x64", from: address, to: miningAddress, cumulativeGasUsed: "0x5208",
    gasUsed: "0x5208", effectiveGasPrice: "0x1", contractAddress: null,
    logs: [], logsBloom: `0x${"0".repeat(512)}`, status: "0x1", type: "0x0",
  };
  await page.route(/https:\/\/pub[12]\.aplocoin\.com\/?$/, async (route) => {
    const body = route.request().postDataJSON();
    const walletData = ownerSubmissions.get(page)?.at(-1)?.data;
    const respond = (request: { id: number; method: string; params: unknown[] }) => {
      let result: unknown;
      switch (request.method) {
        case "eth_chainId": result = "0x1"; break;
        case "net_version": result = "1"; break;
        case "eth_getCode": result = "0x"; break;
        case "eth_getBalance": result = web3.utils.toHex(web3.utils.toWei("10000", "ether")); break;
        case "eth_blockNumber": result = "0x64"; break;
        case "eth_gasPrice": result = "0x1"; break;
        case "eth_estimateGas": result = "0x186a0"; break;
        case "eth_getTransactionCount": result = request.params[0] === registryAddress ? "0x1" : "0x0"; break;
        case "eth_call": {
          const call = request.params[0] as { to: string; data: string; from?: string };
          if (call.to.toLowerCase() === registryAddress) {
            const queriedKey = `0x${call.data.slice(-40)}`;
            const active = session && session.address.toLowerCase() === queriedKey.toLowerCase();
            result = web3.eth.abi.encodeParameters(["address", "address", "uint256", "uint256", "uint256", "uint256"],
              active ? [address, miningAddress, "0", session!.budget, mined ? "1" : "0", session!.expiry]
                : ["0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0", "0", "0", "0"]);
          } else if (call.to.toLowerCase() === miningAddress) {
            if (call.data.startsWith(web3.eth.abi.encodeFunctionSignature("mine(bytes32)"))) { result = "0x"; break; }
            miningReads.push({ address: `0x${call.data.slice(-40)}`, from: call.from });
            result = web3.eth.abi.encodeParameters(["uint256", "uint256", "uint256", "uint256"], [mined ? "100" : "0", difficulty, mined ? "1" : "0", "0"]);
          } else if (call.data.startsWith(web3.utils.sha3("getStake(address)")!.slice(0, 10))) {
            result = web3.eth.abi.encodeParameter("uint256", web3.utils.toWei(staked, "ether"));
          } else result = web3.eth.abi.encodeParameter("uint256", "10");
          break;
        }
        case "eth_sendRawTransaction": rawTransactions.push(String(request.params[0])); result = txHash; break;
        case "eth_getTransactionReceipt": {
          if (walletData && walletData !== processedData) {
            processedData = walletData;
            if (walletData.startsWith(createSelector)) {
              const args = web3.eth.abi.decodeParameters(["address", "address", "bytes4[]", "uint256", "uint256", "uint256", "bytes"], `0x${walletData.slice(10)}`);
              session = { address: String(args[0]), budget: String(args[4]), expiry: String(args[5]) };
            } else if (walletData.startsWith(revokeSelector)) session = null;
            else staked = "1000";
          }
          if (rawTransactions.length) mined = true;
          result = receipt;
          break;
        }
        default: throw new Error(`Unexpected RPC method: ${request.method}`);
      }
      return { jsonrpc: "2.0", id: request.id, result };
    };
    await route.fulfill({ json: Array.isArray(body) ? body.map(respond) : respond(body) });
  });
  return { rawTransactions, miningReads, get session() { return session; } };
}

async function authorizeMining(page: Page) {
  await page.getByRole("button", { name: "Authorize Mining", exact: true }).click();
  await expect(page.getByText("Mining access active", { exact: true })).toBeVisible();
}

test("wallet delegates once and the real worker submits a session-signed share", async ({ page }) => {
  await installWallet(page);
  const rpc = await installRpc(page);
  await page.goto("/mining");
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await expect(page.getByLabel("Wallet Address")).toHaveValue(address);
  await authorizeMining(page);
  await page.getByRole("button", { name: "Start Mining" }).click();
  await expect(page.getByRole("cell", { name: txHash, exact: true })).toBeVisible();
  const requests = await page.evaluate(() => (window as unknown as { walletRequests: { method: string; params: { to: string; data: string }[] }[] }).walletRequests);
  const registrations = requests.filter((request) => request.method === "eth_sendTransaction");
  expect(registrations).toHaveLength(1);
  expect(registrations[0].params[0].to).toBe("0x0000000000000000000000000000000000001237");
  expect(rpc.rawTransactions).toHaveLength(1);
  expect(web3.eth.accounts.recoverTransaction(rpc.rawTransactions[0]).toLowerCase()).toBe(rpc.session!.address.toLowerCase());
  expect(rpc.miningReads.every((call) => call.address.toLowerCase() === rpc.session!.address.toLowerCase() && call.from?.toLowerCase() === address.toLowerCase())).toBe(true);
  expect(requests.map((request) => request.method)).not.toContain("wallet_requestExecutionPermissions");
  await page.getByRole("button", { name: "Stop Mining" }).click();
  await expect(page.getByRole("button", { name: "Start Mining" })).toBeVisible();
});

test("legacy miner uses the same worker and sends a locally signed transaction without a wallet extension", async ({ page }) => {
  const rpc = await installRpc(page);
  await page.goto("/legacy");
  await page.getByLabel("Private Key", { exact: true }).fill(testKey);
  await expect(page.getByLabel("Wallet Address")).toHaveValue(address);
  await page.getByRole("button", { name: "Start Mining" }).click();
  await expect(page.getByRole("cell", { name: txHash, exact: true })).toBeVisible({ timeout: 15000 });
  expect(rpc.rawTransactions).toHaveLength(1);
  expect(web3.eth.accounts.recoverTransaction(rpc.rawTransactions[0])).toBe(address);
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).not.toContain(testKey);
  await page.getByRole("button", { name: "Stop Mining" }).click();
  await expect(page.getByRole("button", { name: "Start Mining" })).toBeVisible();
  await page.getByLabel("Private Key", { exact: true }).fill("1");
  await expect(page.getByLabel("Wallet Address")).toHaveValue("");
  await expect(page.getByRole("button", { name: "Start Mining" })).toBeDisabled();
});

test("rejected wallet authorization leaves mining disabled without repeated prompts", async ({ page }) => {
  await installWallet(page, true);
  await installRpc(page);
  await page.goto("/mining");
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await page.getByRole("button", { name: "Authorize Mining", exact: true }).click();
  await expect(page.getByText("User rejected transaction", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Mining" })).toBeDisabled();
  await expect(page.getByText("No shares mined yet")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { walletRequests: { method: string }[] }).walletRequests.filter((r) => r.method === "eth_sendTransaction").length)).toBe(1);
});

test("staking waits for confirmation and sends only to the staking contract", async ({ page }) => {
  await installWallet(page);
  await installRpc(page, "0");
  await page.goto("/staking");
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await page.getByRole("button", { name: "Stake APLO", exact: true }).click();
  await expect(page.getByText("Stake confirmed", { exact: true })).toBeVisible();
  await expect(page.getByText("Stake OK", { exact: true })).toBeVisible();
  const requests = await page.evaluate(() => (window as unknown as { walletRequests: { method: string; params: { to: string }[] }[] }).walletRequests);
  expect(requests.find((request) => request.method === "eth_sendTransaction")?.params[0].to).toBe(stakingAddress);
});

test("changing the wallet account cancels active worker computation", async ({ page }) => {
  await installWallet(page);
  await installRpc(page, "1000", "1");
  await page.goto("/mining");
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await authorizeMining(page);
  await page.getByRole("button", { name: "Start Mining" }).click();
  await expect(page.getByRole("button", { name: "Stop Mining", exact: true })).toBeVisible();
  await page.evaluate(() => (window as unknown as { emitWalletChange: (event: string) => void }).emitWalletChange("accountsChanged"));
  await expect(page.getByLabel("Wallet Address")).toHaveValue("");
  await expect(page.getByRole("button", { name: "Start Mining" })).toBeDisabled();
  expect(await page.evaluate(() => (window as unknown as { walletRequests: { method: string }[] }).walletRequests.filter((r) => r.method === "eth_sendTransaction").length)).toBe(1);
});

test("mining stakes only the missing APLO before starting computation", async ({ page }) => {
  await installWallet(page);
  await installRpc(page, "250");
  await page.goto("/mining");
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await authorizeMining(page);
  await page.getByRole("button", { name: "Start Mining" }).click();
  await expect(page.getByText("Stake OK", { exact: true })).toBeVisible();
  const requests = await page.evaluate(() => (window as unknown as { walletRequests: { method: string; params: { to: string; data: string }[] }[] }).walletRequests);
  const transactions = requests.filter((request) => request.method === "eth_sendTransaction" && request.params[0].to === stakingAddress);
  expect(transactions).toHaveLength(1);
  expect(transactions[0].params[0].to).toBe(stakingAddress);
  expect(transactions[0].params[0].data).toBe(web3.eth.abi.encodeFunctionCall({ name: "stake", type: "function", inputs: [{ name: "amount", type: "uint256" }] }, [web3.utils.toWei("750", "ether")]));
  await page.getByRole("button", { name: "Stop Mining", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start Mining" })).toBeVisible();
});

test("reload discards the private key and preserves only public revocation metadata", async ({ page }) => {
  await installWallet(page);
  await installRpc(page);
  await page.goto("/mining");
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await authorizeMining(page);
  const stored = await page.evaluate(() => JSON.parse(Object.entries(localStorage).find(([key]) => key.startsWith("webminer.session.public:"))![1]));
  expect(Object.keys(stored).sort()).toEqual(["address", "budgetWei", "chainId", "expiry", "owner", "transactionHash"]);
  await page.reload();
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await expect(page.getByText(/private session key is unavailable/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Mining", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Revoke Mining Access", exact: true }).click();
  await expect(page.getByRole("button", { name: "Authorize Mining", exact: true })).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith("webminer.session.public:")))).toEqual([]);
});

test("insufficient session gas budget stops before signing or broadcasting a share", async ({ page }) => {
  await installWallet(page);
  const rpc = await installRpc(page);
  await page.goto("/mining");
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await page.getByLabel("Gas budget (GAPLO)").fill("0.000000000000000001");
  await authorizeMining(page);
  await page.getByRole("button", { name: "Start Mining", exact: true }).click();
  await expect(page.getByText("Session gas budget cannot cover this transaction's maximum fee", { exact: true })).toBeVisible();
  expect(rpc.rawTransactions).toHaveLength(0);
  await expect(page.getByText("No shares mined yet")).toBeVisible();
});

test("unsupported native registry blocks authorization without a direct-wallet mining fallback", async ({ page }) => {
  await installWallet(page);
  const rpc = await installRpc(page);
  await page.route(/https:\/\/pub[12]\.aplocoin\.com\/?$/, async (route) => {
    const request = route.request().postDataJSON();
    if (request.method === "eth_call" && request.params[0].to === "0x0000000000000000000000000000000000001237") {
      await route.fulfill({ json: { jsonrpc: "2.0", id: request.id, result: "0x" } });
    } else await route.fallback();
  });
  await page.goto("/mining");
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await page.getByRole("button", { name: "Authorize Mining", exact: true }).click();
  await expect(page.getByText(/does not expose Aplo native session keys/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Mining", exact: true })).toBeDisabled();
  expect(rpc.rawTransactions).toHaveLength(0);
  expect(await page.evaluate(() => (window as unknown as { walletRequests: { method: string }[] }).walletRequests.filter((r) => r.method === "eth_sendTransaction").length)).toBe(0);
});
