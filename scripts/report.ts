#!/usr/bin/env bun
/**
 * Keyless gate report: skill gate + skills-install verify + upstream npm test.
 * Writes reports/gate.json + reports/gate.md. Deterministic apart from timings and generated_at.
 * If the upstream step needs network and fails, the failure is recorded and the report is still written.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { UPSTREAM_PINNED_SHA, UPSTREAM_TEST_COMMAND } from "../src/upstream.ts";

const ROOT = join(import.meta.dir, "..");
const REPORTS = join(ROOT, "reports");

type Step = { id: string; ok: boolean; exit_code: number; elapsed_ms: number; output: string };

function run(id: string, cmd: string[]): Step {
  const t0 = performance.now();
  const r = Bun.spawnSync(cmd, { cwd: ROOT, stdout: "pipe", stderr: "pipe", env: { ...process.env } });
  const output = `${r.stdout?.toString() ?? ""}${r.stderr?.toString() ?? ""}`;
  return { id, ok: r.exitCode === 0, exit_code: r.exitCode ?? 1, elapsed_ms: Math.round(performance.now() - t0), output };
}

/** Sum every `ℹ <key> N` summary line node --test prints (one block per suite run). */
function sumNodeTest(out: string, key: string): number {
  let n = 0;
  for (const m of out.matchAll(new RegExp(`^[ℹ#]\\s*${key}\\s+(\\d+)\\s*$`, "gm"))) n += Number(m[1]);
  return n;
}

const tAll = performance.now();
const skillGate = run("gate:skill", ["bun", "run", "scripts/check-ponytail-skill-gate.ts"]);
const verifyInstall = run("verify:skills-install", ["bash", "scripts/verify-skills-install.sh"]);
const upstream = run("test:upstream", ["bash", "scripts/run-upstream-tests.sh"]);
const elapsed_ms = Math.round(performance.now() - tAll);

const ruleLines = [...skillGate.output.matchAll(/^rule (ok|fail) (\S+)/gm)];
const gate_rules = ruleLines.map((m) => ({ id: m[2], ok: m[1] === "ok" }));
const gate_rules_checked = gate_rules.length;
const gate_rules_passed = gate_rules.filter((r) => r.ok).length;

const skills = ["ponytail"];
const skills_verified = verifyInstall.ok ? skills.length : 0;

const upstream_tests = sumNodeTest(upstream.output, "tests");
const upstream_passed = sumNodeTest(upstream.output, "pass");
const upstream_failed = sumNodeTest(upstream.output, "fail");
const upstream_suites = (upstream.output.match(/^[ℹ#]\s*tests\s+\d+\s*$/gm) || []).length;
const upstream_network_error = !upstream.ok && /fatal: (unable to access|Could not read)|Could not resolve host|ENOTFOUND|ETIMEDOUT|network/i.test(upstream.output);

const steps = [skillGate, verifyInstall, upstream];
const steps_passed = steps.filter((s) => s.ok).length;
const steps_failed = steps.length - steps_passed;
const ok = steps_failed === 0;

const payload = {
  generated_at: new Date().toISOString(),
  lab: "minilab-ponytail-yagni-gate",
  keyless: true,
  ok,
  steps_passed,
  steps_failed,
  elapsed_ms,
  elapsed_s: Math.round(elapsed_ms / 100) / 10,
  gate: { rules_checked: gate_rules_checked, rules_passed: gate_rules_passed, rules: gate_rules },
  skills: { verified: skills_verified, names: skills, cli: "skills@1.7.2", agent: "claude-code" },
  upstream: {
    repo: "DietrichGebert/ponytail",
    pinned_commit: UPSTREAM_PINNED_SHA,
    test_command: UPSTREAM_TEST_COMMAND,
    ok: upstream.ok,
    suites: upstream_suites,
    tests: upstream_tests,
    passed: upstream_passed,
    failed: upstream_failed,
    network_error: upstream_network_error,
    note: upstream.ok
      ? "node --test counts summed over the root suite and pi-extension"
      : upstream_network_error
        ? "upstream step needs network (git fetch / npm install / pip) and failed; counts are partial"
        : "upstream step failed; see exit code",
  },
  steps: steps.map(({ id, ok, exit_code, elapsed_ms }) => ({ id, ok, exit_code, elapsed_ms })),
};

mkdirSync(REPORTS, { recursive: true });
writeFileSync(join(REPORTS, "gate.json"), JSON.stringify(payload, null, 2) + "\n");

const md = [
  "# Ponytail YAGNI gate — keyless report",
  "",
  `- **Generated:** ${payload.generated_at}`,
  `- **Result:** ${ok ? "GREEN" : "RED"} — ${steps_passed} steps passed / ${steps_failed} failed`,
  `- **Gate rules:** ${gate_rules_passed} / ${gate_rules_checked} passed`,
  `- **Skills verified:** ${skills_verified} (${skills.join(", ")}) via ${payload.skills.cli} \`-a ${payload.skills.agent}\``,
  `- **Upstream:** ${payload.upstream.repo} @ \`${UPSTREAM_PINNED_SHA}\` — ${upstream.ok ? "passed" : "FAILED"} (${upstream_passed} / ${upstream_tests} tests, ${upstream_failed} failed, ${upstream_suites} node:test runs)`,
  `- **Elapsed:** ${elapsed_ms} ms (~${payload.elapsed_s} s)`,
  "",
  "## Steps",
  "",
  ...steps.map((s) => `- \`${s.id}\`: ${s.ok ? "PASS" : "FAIL"} (exit ${s.exit_code}, ${s.elapsed_ms} ms)`),
  "",
  "## Gate rules",
  "",
  ...gate_rules.map((r) => `- ${r.ok ? "PASS" : "FAIL"} \`${r.id}\``),
  "",
  `## Upstream`,
  "",
  `\`${UPSTREAM_TEST_COMMAND}\``,
  "",
  payload.upstream.note,
  "",
].join("\n");
writeFileSync(join(REPORTS, "gate.md"), md);

console.log(JSON.stringify({ ok, elapsed_ms, gate_rules_checked, gate_rules_passed, skills_verified, upstream_ok: upstream.ok, upstream_tests, upstream_passed, upstream_failed }, null, 2));
if (!ok) process.exit(1);
