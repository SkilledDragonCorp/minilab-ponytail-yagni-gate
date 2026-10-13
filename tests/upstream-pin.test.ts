import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  UPSTREAM_PINNED_SHA,
  UPSTREAM_REPO,
  UPSTREAM_TEST_COMMAND,
} from "../src/upstream.ts";

const ROOT = join(import.meta.dir, "..");

describe("upstream pin", () => {
  test("SHA matches scripts/run-upstream-tests.sh", () => {
    const script = readFileSync(
      join(ROOT, "scripts/run-upstream-tests.sh"),
      "utf8",
    );
    expect(script).toContain(UPSTREAM_PINNED_SHA);
    expect(script).toContain(UPSTREAM_REPO);
    expect(script).toContain("npm test");
    expect(script).toContain("pi-extension");
  });

  test("documented test command matches upstream package.json", () => {
    expect(UPSTREAM_TEST_COMMAND).toBe(
      "node --test tests/*.test.js && npm test --prefix pi-extension",
    );
  });

  test("SHA is 40-char hex", () => {
    expect(UPSTREAM_PINNED_SHA).toMatch(/^[0-9a-f]{40}$/);
  });
});
