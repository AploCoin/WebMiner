import assert from "node:assert/strict";
import test from "node:test";

import { MINING_ELIGIBILITY_POLL_INTERVAL_MS } from "./miningTiming.ts";

test("rechecks promptly while waiting for the next eligible mining block", () => {
  assert.equal(MINING_ELIGIBILITY_POLL_INTERVAL_MS, 500);
  assert.ok(
    MINING_ELIGIBILITY_POLL_INTERVAL_MS < 1000,
    "eligible work must be noticed in under one second",
  );
});
