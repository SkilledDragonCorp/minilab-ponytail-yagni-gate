#!/usr/bin/env bun
/** CI gate: committed ponytail skill must exist; no mirror paths. */
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const CANONICAL = join(ROOT, ".claude", "skills", "ponytail", "SKILL.md");

const forbidden = [
  join(ROOT, ".agents", "skills", "ponytail", "SKILL.md"),
  join(ROOT, ".cursor", "skills", "ponytail", "SKILL.md"),
];

if (!statSync(CANONICAL, { throwIfNoEntry: false })?.isFile()) {
  console.error(
    `Missing ponytail skill at ${CANONICAL}. Install with:\n` +
      `  DISABLE_TELEMETRY=1 bun --bun x skills@1.7.2 add DietrichGebert/ponytail --skill ponytail -a claude-code -y --copy`,
  );
  process.exit(1);
}

for (const path of forbidden) {
  if (existsSync(path)) {
    console.error(`Forbidden mirror skill path (use .claude/skills only): ${path}`);
    process.exit(1);
  }
}

console.log(`OK ponytail skill gate: ${CANONICAL}`);
