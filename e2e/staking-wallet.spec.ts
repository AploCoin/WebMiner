import { expect, test, type Page } from "@playwright/test";
import Web3 from "web3";

const owner = "0x1111111111111111111111111111111111111111";
const second = "0x2222222222222222222222222222222222222222";
const hash = `0x${"a".repeat(64)}`;
const web3 = new Web3();
const word = (value: string) => web3.eth.abi.encodeParameter("uint256", value);

type Harness = {
  methods: string[]; transactions: { from: string; to: string }[];
  chain: string; account: string; release: boolean;
  emit: (event: string) => void;
};
async function wallet(page: Page, options: { chain?: string; reject?: string; unknown?: boolean; hold?: boolean } = {}) {
  // Any accidental use of the manual/public RPC fails this test.
  await page.route(/https:\/\/pub[12]\.aplocoin\.com/, () => { throw new Error("Staking escaped the wallet provider"); });
  await page.addInitScript(({ owner, hash, options, stakeSelector, stake, zero, multiplier }) => {
    let staked = false;
    let switched = false;
    const handlers: Record<string, (() => void)[]> = {};
    const state = {
      methods: [] as string[], transactions: [] as { from: string; to: string }[],
      chain: options.chain || "0x6e7a", account: owner, release: !options.hold,
      emit: (event: string) => handlers[event]?.slice().forEach((handler) => handler()),
    };
    Object.assign(window, { walletHarness: state, ethereum: {
      on: (event: string, handler: () => void) => { (handlers[event] ||= []).push(handler); },
      removeListener: (event: string, handler: () => void) => { handlers[event] = handlers[event]?.filter((h) => h !== handler); },
      request: async ({ method, params = [] }: { method: string; params?: unknown[] }) => {
        state.methods.push(method);
        if (options.reject === method) throw new Error("User rejected request");
        switch (method) {
          case "eth_requestAccounts": case "eth_accounts": return [state.account];
          case "eth_chainId": return state.chain;
          case "wallet_switchEthereumChain":
            if (options.unknown && !switched) throw Object.assign(new Error("Unknown chain"), { code: 4902 });
            state.chain = "0x6e7a"; state.emit("chainChanged"); return null;
          case "wallet_addEthereumChain": switched = true; return null;
          case "eth_getBalance": return "0x0";
          case "eth_call": {
            const call = params[0] as { to: string; data: string };
            if (!call.to.endsWith("1235")) throw new Error("Unrelated miner read must not hide stake");
            return call.data.startsWith(stakeSelector) ? (staked ? stake : zero) : multiplier;
          }
          case "eth_sendTransaction": state.transactions.push(params[0] as { from: string; to: string }); return hash;
          case "eth_getTransactionReceipt":
            if (!state.release) return null;
            staked = true;
            return { transactionHash: hash, transactionIndex: "0x0", blockHash: `0x${"b".repeat(64)}`, blockNumber: "0x1", from: owner,
              to: "0x0000000000000000000000000000000000001235", cumulativeGasUsed: "0x5208", gasUsed: "0x5208", logs: [],
              logsBloom: `0x${"0".repeat(512)}`, status: "0x1", type: "0x0" };
          default: throw new Error(`Unexpected wallet method ${method}`);
        }
      },
    } });
    // Staking must be usable even with invalid saved miner RPC configuration.
    localStorage.setItem("rpcNodeType", "custom"); localStorage.setItem("customRpcUrl", "broken");
  }, { owner, hash, options, stakeSelector: web3.utils.sha3("getStake(address)")!.slice(0, 10),
    stake: word(web3.utils.toWei("1000", "ether")), zero: word("0"), multiplier: word("10") });
  await page.goto("/staking");
}
const state = (page: Page) => page.evaluate(() => (window as unknown as { walletHarness: Harness }).walletHarness);

test("staking uses wallet reads and receipt polling, without a manual RPC or miner metadata", async ({ page }) => {
  await wallet(page);
  await expect(page.getByText("RPC Node", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Connect Wallet", exact: true }).click();
  await expect(page.getByText(/Wallet network:.*AploCoin/)).toBeVisible();
  await page.getByRole("button", { name: "Stake APLO", exact: true }).click();
  await expect(page.getByText("Stake confirmed", { exact: true })).toBeVisible();
  await expect(page.getByText("Stake OK", { exact: true })).toBeVisible();
  expect((await state(page)).transactions).toEqual([{ from: owner, to: "0x0000000000000000000000000000000000001235", data: expect.any(String) }]);
  expect((await state(page)).methods).toContain("eth_getTransactionReceipt");
});

test("wrong network blocks stake until explicit switch/add and reconnect", async ({ page }) => {
  await wallet(page, { chain: "0x1", unknown: true });
  await page.getByRole("button", { name: "Connect Wallet", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stake APLO", exact: true })).toBeDisabled();
  expect((await state(page)).methods).not.toContain("wallet_switchEthereumChain");
  await page.getByRole("button", { name: "Switch to AploCoin", exact: true }).click();
  await expect(page.getByText(/AploCoin selected/)).toBeVisible();
  expect((await state(page)).methods.filter((m) => m.startsWith("wallet_"))).toEqual(["wallet_switchEthereumChain", "wallet_addEthereumChain", "wallet_switchEthereumChain"]);
  await page.getByRole("button", { name: "Connect Wallet", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stake APLO", exact: true })).toBeEnabled();
});

for (const method of ["eth_requestAccounts", "wallet_switchEthereumChain", "eth_sendTransaction"]) {
  test(`respects rejection of ${method}`, async ({ page }) => {
    await wallet(page, { chain: method === "wallet_switchEthereumChain" ? "0x1" : "0x6e7a", reject: method });
    await page.getByRole("button", { name: "Connect Wallet", exact: true }).click();
    if (method === "wallet_switchEthereumChain") await page.getByRole("button", { name: "Switch to AploCoin", exact: true }).click();
    if (method === "eth_sendTransaction") await page.getByRole("button", { name: "Stake APLO", exact: true }).click();
    await expect(page.getByText("User rejected request", { exact: true }).first()).toBeVisible();
    expect((await state(page)).methods.filter((m) => m === method)).toHaveLength(1);
    expect((await state(page)).transactions).toHaveLength(0);
  });
}

for (const event of ["accountsChanged", "chainChanged", "disconnect"]) {
  test(`invalidates connection on ${event}`, async ({ page }) => {
    await wallet(page);
    await page.getByRole("button", { name: "Connect Wallet", exact: true }).click();
    await expect(page.getByRole("button", { name: "Stake APLO", exact: true })).toBeEnabled();
    await page.evaluate((event) => (window as unknown as { walletHarness: Harness }).walletHarness.emit(event), event);
    await expect(page.getByLabel("Wallet Address")).toHaveValue("");
    await expect(page.getByRole("button", { name: "Stake APLO", exact: true })).toBeDisabled();
  });
}

test("pending receipt stays locked after account change and is never resubmitted", async ({ page }) => {
  await wallet(page, { hold: true });
  await page.getByRole("button", { name: "Connect Wallet", exact: true }).click();
  await page.getByRole("button", { name: "Stake APLO", exact: true }).click();
  await expect.poll(async () => (await state(page)).methods.includes("eth_getTransactionReceipt")).toBe(true);
  await page.evaluate((second) => { const h = (window as unknown as { walletHarness: Harness }).walletHarness; h.account = second; h.emit("accountsChanged"); }, second);
  await expect(page.getByRole("button", { name: "Confirming stake...", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Connect Wallet", exact: true })).toBeDisabled();
  await page.evaluate(() => { (window as unknown as { walletHarness: Harness }).walletHarness.release = true; });
  await expect(page.getByRole("button", { name: "Connect Wallet", exact: true })).toBeEnabled();
  expect((await state(page)).transactions).toHaveLength(1);
});

test("network change while pending reports original submitted hash", async ({ page }) => {
  await wallet(page, { hold: true });
  await page.getByRole("button", { name: "Connect Wallet", exact: true }).click();
  await page.getByRole("button", { name: "Stake APLO", exact: true }).click();
  await expect.poll(async () => (await state(page)).methods.includes("eth_getTransactionReceipt")).toBe(true);
  await page.evaluate(() => { const h = (window as unknown as { walletHarness: Harness }).walletHarness; h.chain = "0x1"; h.emit("chainChanged"); });
  await expect(page.getByText(new RegExp(`Transaction ${hash} was submitted`)).first()).toBeVisible();
  expect((await state(page)).transactions).toHaveLength(1);
});
