import { expect, test } from "@playwright/test";

const pages = [
  { route: "/", heading: "AploCoin Web Miner", screenshot: "home" },
  { route: "/mining", heading: "GAplo Web Miner", screenshot: "current-miner" },
  { route: "/legacy", heading: "Legacy Miner", screenshot: "legacy-miner" },
  { route: "/staking", heading: "APLO Staking", screenshot: "staking" },
];

for (const entry of pages) {
  test(`${entry.heading} renders and navigates`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(entry.route);
    await expect(page.getByRole("heading", { level: 1, name: entry.heading, exact: true })).toBeVisible();
    await expect(page.getByRole("navigation").locator('a[aria-current="page"]')).toHaveAttribute("href", entry.route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (entry.route === "/") {
      await expect(page.getByRole("button", { name: /Start Mining|Connect Wallet/ })).toHaveCount(0);
    } else if (entry.route === "/legacy") {
      await expect(page.getByLabel("Private Key")).toBeVisible();
      await expect(page.getByRole("button", { name: "Connect Wallet" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Start Mining" })).toBeDisabled();
    } else {
      await expect(page.getByRole("button", { name: "Connect Wallet" })).toBeVisible();
      await expect(page.getByLabel("Private Key")).toHaveCount(0);
    }
    if (process.env.CAPTURE_SCREENSHOTS === "1" && ["/", "/mining", "/staking"].includes(entry.route)) {
      await page.screenshot({ path: `docs/screenshots/${entry.screenshot}-${testInfo.project.name}.png`, fullPage: true, animations: "disabled" });
    }
    for (const link of ["Home", "Miner", "Legacy", "Staking"]) {
      await page.getByRole("navigation").getByRole("link", { name: link, exact: true }).click();
      await expect(page.getByRole("navigation").getByRole("link", { name: link, exact: true })).toHaveAttribute("aria-current", "page");
    }
    expect(errors).toEqual([]);
  });
}

test("custom RPC settings persist and invalid URLs cannot start mining", async ({ page }) => {
  await page.goto("/legacy");
  await page.getByRole("radio", { name: "Custom RPC URL" }).click();
  const input = page.getByPlaceholder("https://your-rpc-node.com");
  await input.fill("not-a-url");
  await expect(page.getByRole("button", { name: "Start Mining" })).toBeDisabled();
  await input.fill("http://127.0.0.1:8545");
  await page.reload();
  await expect(input).toHaveValue("http://127.0.0.1:8545");
  await page.getByRole("navigation").getByRole("link", { name: "Staking", exact: true }).click();
  await expect(page.getByPlaceholder("https://your-rpc-node.com")).toHaveCount(0);
});

test("dark theme applies without horizontal overflow", async ({ page }, testInfo) => {
  await page.goto("/legacy");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await page.getByRole("menuitem", { name: "Dark", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  if (process.env.CAPTURE_LEGACY_SCREENSHOTS === "1") {
    await page.screenshot({ path: `docs/screenshots/legacy-dark-${testInfo.project.name}.png`, fullPage: true, animations: "disabled" });
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
