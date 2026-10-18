import { expect, test } from "@playwright/test";
import Web3 from "web3";
import { createMinerClient } from "../src/features/webminer/services/client";
import { createSessionSender, prepareRegistration, readSession, registryFor, ZERO_ADDRESS } from "../src/features/webminer/session-keys/protocol";
import { CONTRACT_ADDRESS, MIN_STAKE_WEI } from "../src/features/webminer/config";
import { writeFile } from "node:fs/promises";

const rpcUrl = process.env.APLO_NATIVE_RPC;
test.describe.configure({ mode: "serial" });

test("native AploNode: owner registration, session-signed mining, and revocation", async ({ page }, testInfo) => {
  test.skip(!rpcUrl || testInfo.project.name !== "desktop", "Requires an isolated AploNode --dev chain");
  test.setTimeout(90000);
  expect(new URL(rpcUrl!).hostname).toMatch(/^(127\.0\.0\.1|localhost)$/);
  const web3 = new Web3(rpcUrl!);
  const client = createMinerClient(rpcUrl!);
  const owner = (await web3.eth.getAccounts())[0];
  const initialStake = BigInt(await web3.eth.call({ from: owner, to: "0x0000000000000000000000000000000000001235", data: web3.eth.abi.encodeFunctionCall({ type: "function", name: "getStake", inputs: [{ name: "account", type: "address" }] }, [owner]) }));
  const balanceData = (address: string) => web3.eth.abi.encodeFunctionCall({ type: "function", name: "balanceOf", inputs: [{ name: "account", type: "address" }] }, [address]);
  const balanceAt = async (address: string, block: bigint | string = "latest") => BigInt(await web3.eth.call({ to: CONTRACT_ADDRESS, data: balanceData(address) }, block));
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
  const registered = await readSession(client, publicRecord.address, owner);
  expect(registered.owner.toLowerCase()).toBe(owner.toLowerCase());
  expect(registered.target.toLowerCase()).toBe(CONTRACT_ADDRESS);
  expect(registered.aplo).toBe(BigInt(0));
  expect(registered.gaplo).toBe(BigInt(publicRecord.budgetWei));
  await expect(page.getByLabel("Private Key", { exact: true })).toHaveCount(0);
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
  const minedBlock = BigInt(receipt.blockNumber);
  const budgetBefore = BigInt((await registryFor(client).methods.getSession(publicRecord.address).call({ from: owner }, minedBlock - BigInt(1))).gaplo);
  const budgetAfter = BigInt((await registryFor(client).methods.getSession(publicRecord.address).call({ from: owner }, minedBlock)).gaplo);
  const fee = receipt.gasUsed * BigInt(transaction.gasPrice!);
  expect(budgetBefore - budgetAfter).toBe(fee);
  expect(budgetAfter).toBeGreaterThan(BigInt(0));
  expect(budgetAfter).toBeLessThan(BigInt(publicRecord.budgetWei));
  const ownerBefore = await balanceAt(owner, minedBlock - BigInt(1));
  const ownerAfter = await balanceAt(owner, minedBlock);
  const sessionBefore = await balanceAt(publicRecord.address, minedBlock - BigInt(1));
  const sessionAfter = await balanceAt(publicRecord.address, minedBlock);
  // Compare exact share block to avoid counting subsequent browser shares.
  expect(ownerAfter + fee).toBeGreaterThan(ownerBefore);
  expect(sessionAfter).toBe(sessionBefore);
  expect((await client.getStakeStatus(owner)).stakedWei).toBe(MIN_STAKE_WEI);
  expect(await web3.eth.getBalance(publicRecord.address)).toBe(BigInt(0));
  if (process.env.CAPTURE_SCREENSHOTS === "1") await page.screenshot({ path: "docs/screenshots/session-mining-desktop.png", fullPage: true, animations: "disabled" });
  const walletCount = await page.evaluate(() => (window as unknown as { ownerWalletMethods: string[] }).ownerWalletMethods.filter((method) => method === "eth_sendTransaction").length);
  expect(walletCount).toBe(initialStake < BigInt(web3.utils.toWei("1000", "ether")) ? 2 : 1); // Registry authorization and owner stake; no wallet-signed mining share.
  await page.getByRole("button", { name: "Revoke Mining Access", exact: true }).click();
  await expect(page.getByRole("button", { name: "Authorize Mining", exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("button", { name: "Start Mining", exact: true })).toBeDisabled();
  const ownerTransactions = await page.evaluate(() => (window as unknown as { ownerWalletTransactions: string[] }).ownerWalletTransactions);
  const revokeReceipt = await web3.eth.getTransactionReceipt(ownerTransactions.at(-1)!);
  expect(revokeReceipt.status).toBe(BigInt(1));
  expect((await readSession(client, publicRecord.address, owner)).owner.toLowerCase()).toBe(ZERO_ADDRESS);
  const publicStorage = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  expect(publicStorage).not.toMatch(/privateKey/);
  expect(await page.getByLabel("Private Key", { exact: true }).count()).toBe(0);
  const evidence = JSON.stringify({
    source: process.env.APLO_NODE_REVISION || "see APLO_NODE_BINARY and node-fix-status.json", binary: process.env.APLO_NODE_BINARY, rpc: rpcUrl,
    wallet: "synthetic EIP-1193 adapter forwarding only owner signing to the unlocked localhost faucet; no real extension",
    initialStakeWei: initialStake.toString(), finalStakeWei: MIN_STAKE_WEI.toString(),
    feeWei: fee.toString(), budgetBeforeWei: budgetBefore.toString(), budgetAfterWei: budgetAfter.toString(),
    rewardWei: (ownerAfter + fee - ownerBefore).toString(), ownerBeforeWei: ownerBefore.toString(), ownerAfterWei: ownerAfter.toString(), sessionBeforeWei: sessionBefore.toString(), sessionAfterWei: sessionAfter.toString(),
    chainId: (await web3.eth.getChainId()).toString(), owner, session: publicRecord.address,
    registrationHash: publicRecord.transactionHash, registrationOwner: registration.from,
    miningHash: hash, miningStatus: receipt.status.toString(), signer: transaction.from,
    miningNonce: transaction.nonce.toString(), revokeHash: ownerTransactions.at(-1), revokeStatus: revokeReceipt.status.toString(),
    ownerWalletTransactions: walletCount + 1, sessionPrivateKeyPersisted: false,
  }, null, 2);
  await testInfo.attach("native-chain-transactions", { body: evidence, contentType: "application/json" });
  if (process.env.SAVE_NATIVE_EVIDENCE === "1") await writeFile("docs/verification/native-session-smoke.json", evidence + "\n");
});


test("native AploNode: expired, revoked and insufficient-budget sessions fail closed", async ({}, testInfo) => {
  test.skip(!rpcUrl || testInfo.project.name !== "desktop", "Requires an isolated AploNode --dev chain");
  test.setTimeout(45000);
  expect(new URL(rpcUrl!).hostname).toMatch(/^(127\.0\.0\.1|localhost)$/);
  const client = createMinerClient(rpcUrl!);
  const web3 = client.web3;
  const owner = (await web3.eth.getAccounts())[0];
  const data = client.mining.methods.mine(`0x${"0".repeat(64)}`).encodeABI();
  const register = async (budget: string, lifetime: string) => {
    const prepared = await prepareRegistration(client, owner, budget, lifetime);
    const receipt = await web3.eth.sendTransaction({ from: owner, to: "0x0000000000000000000000000000000000001237", data: prepared.data, gas: BigInt(1000000), gasPrice: await web3.eth.getGasPrice(), type: 0 });
    expect(receipt.status).toBe(BigInt(1));
    return { ...prepared, record: { ...prepared.record, transactionHash: String(receipt.transactionHash) } };
  };
  const expired = await register("1", "2");
  await expect.poll(async () => Number(await web3.eth.getBlockNumber()), { timeout: 10000 }).toBeGreaterThan(Number(expired.record.expiry));
  await expect(createSessionSender(client, expired.record, expired.privateKey)(CONTRACT_ADDRESS, data)).rejects.toThrow(/expired|revoked, absent/);
  expect(await web3.eth.getTransactionCount(expired.record.address, "pending")).toBe(BigInt(0));

  const revoked = await register("1", "100");
  await registryFor(client).methods.RevokeSessionKey(revoked.record.address).send({ from: owner, gas: "1000000", gasPrice: (await web3.eth.getGasPrice()).toString(), type: "0x0" });
  expect((await readSession(client, revoked.record.address, owner)).owner.toLowerCase()).toBe(ZERO_ADDRESS);
  await expect(createSessionSender(client, revoked.record, revoked.privateKey)(CONTRACT_ADDRESS, data)).rejects.toThrow(/revoked, absent/);
  expect(await web3.eth.getTransactionCount(revoked.record.address, "pending")).toBe(BigInt(0));

  const tiny = await register("0.000000000000000001", "100");
  expect((await readSession(client, tiny.record.address, owner)).gaplo).toBe(BigInt(1));
  await expect(createSessionSender(client, tiny.record, tiny.privateKey)(CONTRACT_ADDRESS, data)).rejects.toThrow(/budget|allowance|gas/i);
  expect(await web3.eth.getTransactionCount(tiny.record.address, "pending")).toBe(BigInt(0));
  await registryFor(client).methods.RevokeSessionKey(tiny.record.address).send({ from: owner, gas: "1000000", gasPrice: (await web3.eth.getGasPrice()).toString(), type: "0x0" });
  const evidence = JSON.stringify({ rpc: rpcUrl, expired: expired.record.address, revoked: revoked.record.address, insufficientBudget: tiny.record.address,
    rejectedSessionPendingNonces: ["0", "0", "0"], signing: "real local session keys with protocol guards", owner: "unlocked synthetic dev faucet" }, null, 2);
  await testInfo.attach("native-negative-session-checks", { body: evidence, contentType: "application/json" });
  if (process.env.SAVE_NATIVE_EVIDENCE === "1") await writeFile("docs/verification/native-session-negative.json", evidence + "\n");
});
