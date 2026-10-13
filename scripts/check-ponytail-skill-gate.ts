#!/usr/bin/env bun
/** CI gate: committed ponytail skill must exist; no mirror paths. Prints one `rule <ok|fail> <id>` line per rule. */
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..");
const CANONICAL = join(ROOT, ".claude", "skills", "ponytail", "SKILL.md");

const rules: Array<{ id: string; ok: boolean; detail: string }> = [
  {
    id: "canonical-skill-present",
    ok: statSync(CANONICAL, { throwIfNoEntry: false })?.isFile() ?? false,
    detail: CANONICAL,
  },
  {
    id: "no-agents-mirror",
    ok: !existsSync(join(ROOT, ".agents", "skills", "ponytail", "SKILL.md")),
    detail: ".agents/skills/ponytail/SKILL.md",
  },
  {
    id: "no-cursor-mirror",
    ok: !existsSync(join(ROOT, ".cursor", "skills", "ponytail", "SKILL.md")),
    detail: ".cursor/skills/ponytail/SKILL.md",
  },
];

for (const r of rules) console.log(`rule ${r.ok ? "ok" : "fail"} ${r.id} ${r.detail}`);

const failed = rules.filter((r) => !r.ok);
if (failed.length) {
  if (!rules[0].ok) {
    console.error(
      `Missing ponytail skill at ${CANONICAL}. Install with:\n` +
        `  DISABLE_TELEMETRY=1 bun --bun x skills@1.7.2 add DietrichGebert/ponytail --skill ponytail -a claude-code -y --copy`,
    );
  }
  for (const r of failed.slice(rules[0].ok ? 0 : 1)) {
    console.error(`Forbidden mirror skill path (use .claude/skills only): ${r.detail}`);
  }
  process.exit(1);
}

console.log(`OK ponytail skill gate: ${rules.length} rules, ${CANONICAL}`);
