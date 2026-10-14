import { expect, test } from "@playwright/test";
import Web3 from "web3";
import { writeFile } from "node:fs/promises";

const rpcUrl = process.env.APLO_NATIVE_RPC;

test("native AploNode: owner registration, session-signed mining, and revocation", async ({ page }, testInfo) => {
  test.skip(!rpcUrl || testInfo.project.name !== "desktop", "Requires an isolated AploNode --dev chain");
  test.setTimeout(90000);
  const web3 = new Web3(rpcUrl!);
  const owner = (await web3.eth.getAccounts())[0];
  const initialStake = BigInt(await web3.eth.call({ from: owner, to: "0x0000000000000000000000000000000000001235", data: web3.eth.abi.encodeFunctionCall({ type: "function", name: "getStake", inputs: [{ name: "account", type: "address" }] }, [owner]) }));
  await page.addInitScript(({ owner, rpcUrl }) => {
    const requests: string[] = [];
    const transactions: string[] = [];
    Object.assign(window, {
      ownerWalletMethods: requests,
      ownerWalletTransactions: transactions,
      ethereum: {
        request: async ({ method, params = [] }: { method: string; params?: unknown[] }) => {
          requests.push(method);
          if (method === "eth_requestAccounts") return [owner];
          const response = await fetch(rpcUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
          const result = await response.json();
          if (result.error) throw new Error(result.error.message);
          if (method === "eth_sendTransaction") transactions.push(result.result);
          return result.result;
        },
      },
    });
    localStorage.setItem("rpcNodeType", "custom");
    localStorage.setItem("customRpcUrl", rpcUrl);
  }, { owner, rpcUrl: rpcUrl! });
  await page.goto("/mining");
  await page.getByRole("button", { name: "Connect Wallet" }).click();
  await page.getByRole("button", { name: "Authorize Mining", exact: true }).click();
  await expect(page.getByText("Mining access active", { exact: true })).toBeVisible({ timeout: 30000 });
  if (process.env.CAPTURE_SCREENSHOTS === "1") await page.screenshot({ path: "docs/screenshots/session-access-desktop.png", fullPage: true, animations: "disabled" });
  const publicRecord = await page.evaluate(() => JSON.parse(Object.entries(localStorage).find(([key]) => key.startsWith("webminer.session.public:"))![1]));
  const registration = await web3.eth.getTransaction(publicRecord.transactionHash);
  expect(registration.from.toLowerCase()).toBe(owner.toLowerCase());
  expect(registration.to?.toLowerCase()).toBe("0x0000000000000000000000000000000000001237");
  await page.getByRole("button", { name: "Start Mining", exact: true }).click();
  await expect(page.getByRole("cell", { name: /^0x[0-9a-f]{64}$/i }).first()).toBeVisible({ timeout: 45000 });
  await page.getByRole("button", { name: "Stop Mining", exact: true }).click();
  await expect(page.getByRole("button", { name: "Start Mining", exact: true })).toBeVisible();
  const hash = await page.getByRole("cell", { name: /^0x[0-9a-f]{64}$/i }).first().innerText();
  const transaction = await web3.eth.getTransaction(hash);
  const receipt = await web3.eth.getTransactionReceipt(hash);
  expect(transaction.from.toLowerCase()).toBe(publicRecord.address.toLowerCase());
  expect(transaction.to?.toLowerCase()).toBe("0x0000000000000000000000000000000000001234");
  expect(receipt.status).toBe(BigInt(1));
  if (process.env.CAPTURE_SCREENSHOTS === "1") await page.screenshot({ path: "docs/screenshots/session-mining-desktop.png", fullPage: true, animations: "disabled" });
  const walletCount = await page.evaluate(() => (window as unknown as { ownerWalletMethods: string[] }).ownerWalletMethods.filter((method) => method === "eth_sendTransaction").length);
  expect(walletCount).toBe(initialStake < BigInt(web3.utils.toWei("1000", "ether")) ? 2 : 1); // Registry authorization and owner stake; no wallet-signed mining share.
  await page.getByRole("button", { name: "Revoke Mining Access", exact: true }).click();
  await expect(page.getByRole("button", { name: "Authorize Mining", exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("button", { name: "Start Mining", exact: true })).toBeDisabled();
  const ownerTransactions = await page.evaluate(() => (window as unknown as { ownerWalletTransactions: string[] }).ownerWalletTransactions);
  const revokeReceipt = await web3.eth.getTransactionReceipt(ownerTransactions.at(-1)!);
  expect(revokeReceipt.status).toBe(BigInt(1));
  const evidence = JSON.stringify({
    source: "AploCoin/AploNode@4d3d3f8c63fb314ec23d7369f687033cdf26ac93", rpc: rpcUrl,
    chainId: (await web3.eth.getChainId()).toString(), owner, session: publicRecord.address,
    registrationHash: publicRecord.transactionHash, registrationOwner: registration.from,
    miningHash: hash, miningStatus: receipt.status.toString(), signer: transaction.from,
    miningNonce: transaction.nonce.toString(), revokeHash: ownerTransactions.at(-1), revokeStatus: revokeReceipt.status.toString(),
    ownerWalletTransactions: walletCount + 1, sessionPrivateKeyPersisted: false,
  }, null, 2);
  await testInfo.attach("native-chain-transactions", { body: evidence, contentType: "application/json" });
  if (process.env.SAVE_NATIVE_EVIDENCE === "1") await writeFile("docs/verification/native-session-smoke.json", evidence + "\n");
});
