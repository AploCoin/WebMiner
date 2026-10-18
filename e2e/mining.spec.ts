import { expect, test, type Page } from "@playwright/test";
import Web3 from "web3";

const web3 = new Web3();
// Public synthetic test key. Never fund this account.
const testKey = "1".repeat(64);
const address = web3.eth.accounts.privateKeyToAccount(`0x${testKey}`).address;
const txHash = `0x${"a".repeat(64)}`;
const miningAddress = "0x0000000000000000000000000000000000001234";
const stakingAddress = "0x0000000000000000000000000000000000001235";

async function installWallet(page: Page, reject = false) {
  await page.addInitScript(({ address, txHash, reject }) => {
    const requests: { method: string; params?: unknown[] }[] = [];
    const handlers: Record<string, (() => void)[]> = {};
    Object.assign(window, {
      walletRequests: requests,
      emitWalletChange: (event: string) => handlers[event]?.forEach((handler) => handler()),
      ethereum: {
        request: async (request: { method: string; params?: unknown[] }) => {
          requests.push(request);
          if (request.method === "eth_requestAccounts" || request.method === "eth_accounts") return [address];
          if (request.method === "eth_chainId") return "0x1";
          if (request.method === "eth_sendTransaction") {
            if (reject) throw new Error("User rejected transaction");
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
  const rawTransactions: string[] = [];
  const receipt = {
    transactionHash: txHash, transactionIndex: "0x0", blockHash: `0x${"b".repeat(64)}`,
    blockNumber: "0x64", from: address, to: miningAddress, cumulativeGasUsed: "0x5208",
    gasUsed: "0x5208", effectiveGasPrice: "0x1", contractAddress: null,
    logs: [], logsBloom: `0x${"0".repeat(512)}`, status: "0x1", type: "0x0",
  };
  await page.route(/https:\/\/pub[12]\.aplocoin\.com\/?$/, async (route) => {
    const body = route.request().postDataJSON();
    const respond = (request: { id: number; method: string; params: unknown[] }) => {
      let result: unknown;
      switch (request.method) {
        case "eth_chainId": result = "0x1"; break;
        case "net_version": result = "1"; break;
        case "eth_getBalance": result = web3.utils.toHex(web3.utils.toWei("10000", "ether")); break;
        case "eth_blockNumber": result = "0x64"; break;
        case "eth_gasPrice": result = "0x1"; break;
        case "eth_estimateGas": result = "0x186a0"; break;
        case "eth_getTransactionCount": result = "0x0"; break;
        case "eth_call": {
          const call = request.params[0] as { to: string; data: string };
          if (call.to.toLowerCase() === miningAddress) {
            result = web3.eth.abi.encodeParameters(["uint256", "uint256", "uint256", "uint256"], [mined ? "100" : "0", difficulty, mined ? "1" : "0", "0"]);
          } else if (call.data.startsWith(web3.utils.sha3("getStake(address)")!.slice(0, 10))) {
            result = web3.eth.abi.encodeParameter("uint256", web3.utils.toWei(staked, "ether"));
          } else {
            result = web3.eth.abi.encodeParameter("uint256", "10");
          }
          break;
        }
        case "eth_sendRawTransaction": rawTransactions.push(String(request.params[0])); result = txHash; break;
        case "eth_getTransactionReceipt": mined = true; staked = "1000"; result = receipt; break;
        default: throw new Error(`Unexpected RPC method: ${request.method}`);
      }
      return { jsonrpc: "2.0", id: request.id, result };
    };
    await route.fulfill({ json: Array.isArray(body) ? body.map(respond) : respond(body) });
  });
  return { rawTransactions };
}

test("wallet miner computes a share with the real worker and requests a direct wallet transaction", async ({ page }) => {
  await installWallet(page);
  await installRpc(page);
  await page.goto("/mining");
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await expect(page.getByLabel("Wallet Address")).toHaveValue(address);
  await page.getByRole("button", { name: "Start Mining" }).click();
  await expect(page.getByRole("cell", { name: txHash, exact: true })).toBeVisible();
  const requests = await page.evaluate(() => (window as unknown as { walletRequests: { method: string; params: { to: string; data: string }[] }[] }).walletRequests);
  expect(requests.filter((request) => request.method === "eth_sendTransaction")).toEqual([
    { method: "eth_sendTransaction", params: [{ from: address, to: miningAddress, data: expect.stringMatching(/^0x[0-9a-f]{72}$/) }] },
  ]);
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

test("rejected wallet share stops mining without repeated prompts or a successful share log", async ({ page }) => {
  await installWallet(page, true);
  await installRpc(page);
  await page.goto("/mining");
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await page.getByRole("button", { name: "Start Mining" }).click();
  await expect(page.getByText("User rejected transaction", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start Mining" })).toBeVisible();
  await expect(page.getByText("No shares mined yet")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { walletRequests: { method: string }[] }).walletRequests.filter((r) => r.method === "eth_sendTransaction").length)).toBe(1);
});

test("changing the wallet account cancels active worker computation", async ({ page }) => {
  await installWallet(page);
  await installRpc(page, "1000", "1");
  await page.goto("/mining");
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await page.getByRole("button", { name: "Start Mining" }).click();
  await expect(page.getByRole("button", { name: "Stop Mining", exact: true })).toBeVisible();
  await page.evaluate(() => (window as unknown as { emitWalletChange: (event: string) => void }).emitWalletChange("accountsChanged"));
  await expect(page.getByLabel("Wallet Address")).toHaveValue("");
  await expect(page.getByRole("button", { name: "Start Mining" })).toBeDisabled();
  expect(await page.evaluate(() => (window as unknown as { walletRequests: { method: string }[] }).walletRequests.filter((r) => r.method === "eth_sendTransaction").length)).toBe(0);
});

test("mining stakes only the missing APLO before starting computation", async ({ page }) => {
  await installWallet(page);
  await installRpc(page, "250");
  await page.goto("/mining");
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await page.getByRole("button", { name: "Start Mining" }).click();
  await expect(page.getByText("Stake OK", { exact: true })).toBeVisible();
  const requests = await page.evaluate(() => (window as unknown as { walletRequests: { method: string; params: { to: string; data: string }[] }[] }).walletRequests);
  const transactions = requests.filter((request) => request.method === "eth_sendTransaction");
  expect(transactions).toHaveLength(1);
  expect(transactions[0].params[0].to).toBe(stakingAddress);
  expect(transactions[0].params[0].data).toBe(web3.eth.abi.encodeFunctionCall({ name: "stake", type: "function", inputs: [{ name: "amount", type: "uint256" }] }, [web3.utils.toWei("750", "ether")]));
  await page.getByRole("button", { name: "Stop Mining", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start Mining" })).toBeVisible();
});
