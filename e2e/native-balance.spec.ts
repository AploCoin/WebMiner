import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";

const rpcUrl = process.env.APLO_NATIVE_RPC;
// Direct HTTP RPC, deliberately independent of the browser signing adapter.
// Run with APLO_EXPECT_CALL_REVERT=1 against the preserved broken binary.
test("native AploNode: wallet-shaped balanceOf without from", async ({ request }, testInfo) => {
  test.skip(!rpcUrl || testInfo.project.name !== "desktop", "Requires isolated localhost AploNode");
  expect(new URL(rpcUrl!).hostname).toMatch(/^(127\.0\.0\.1|localhost)$/);
  const rows: unknown[] = [];
  const data = "0x70a08231000000000000000000000000cd086110af6b5c2e81fe9860bd023d1bfc33aeea";
  for (const to of ["0x0000000000000000000000000000000000001234", "0x0000000000000000000000000000000000001235"]) {
    for (const block of ["latest", "0x0"]) {
      for (const from of [undefined, "0x0000000000000000000000000000000000000000", "0xcd086110af6b5c2e81fe9860bd023d1bfc33aeea"]) {
        const call = { to, data, ...(from ? { from } : {}) };
        const response = await request.post(rpcUrl!, { data: { jsonrpc: "2.0", id: 1, method: "eth_call", params: [call, block] } });
        const body = await response.json();
        rows.push({ call, block, response: body });
        if (process.env.APLO_EXPECT_CALL_REVERT === "1" && (!from || BigInt(from) === BigInt(0))) {
          expect(body.error?.message).toMatch(/execution reverted/);
        } else {
          expect(body.error).toBeUndefined();
          expect(body.result).toMatch(/^0x[0-9a-f]{64}$/i);
          expect(BigInt(body.result)).toBe(BigInt(0)); // Deliberately unfunded reported owner.
        }
      }
    }
  }
  const evidence = JSON.stringify({ source: process.env.APLO_NODE_REVISION, binary: process.env.APLO_NODE_BINARY, nodeBinarySha256: process.env.APLO_NODE_BINARY_SHA256,
    frontendRevision: process.env.APLO_FRONTEND_REVISION, rpc: rpcUrl, expectedBroken: process.env.APLO_EXPECT_CALL_REVERT === "1", adapter: false, rows }, null, 2);
  await testInfo.attach("wallet-balance-rpc-matrix", { body: evidence, contentType: "application/json" });
  if (process.env.SAVE_NATIVE_EVIDENCE === "1") await writeFile("docs/verification/native-balance-rpc.json", evidence + "\n");
});
