# minilab-ponytail-yagni-gate

**Built by [SkilledDragon LLC](https://skilleddragon.com)** — Bun/TypeScript minilab: install the [ponytail](https://github.com/DietrichGebert/ponytail) agent skill, CI gate if it is missing, YAGNI fixture checks, and a pinned upstream `npm test` harness.

Featured upstream: [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) (MIT) · skills CLI: [`skills@1.7.2`](https://www.npmjs.com/package/skills)

## What we built

| Piece | Purpose |
| --- | --- |
| `.claude/skills/ponytail/SKILL.md` | Canonical ponytail skill (lazy senior dev / YAGNI) |
| `scripts/check-ponytail-skill-gate.ts` | Fails CI if the skill file or layout is wrong |
| `scripts/run-upstream-tests.sh` | Clone pinned ponytail SHA → `npm test` |
| `tests/yagni-skill.test.ts` | Fixture: frontmatter + YAGNI / smallest-change strings |
| CI | gitleaks 8.30.1, `bun audit`, skill gate, skills CLI verify job, upstream tests |

## Benchmark hedge

Ponytail’s author reports roughly **~53% less code** in their benchmarks. That is an **author benchmark** — reproduce on your repo and task before citing. This minilab does not re-run or certify those numbers.

## What we tested (real commands)

Pin at ship time:

```text
$ git ls-remote https://github.com/DietrichGebert/ponytail.git HEAD
2961b52fc1fe6a5a87c7a959a79512e5c2f3ffe5	HEAD
```

Local minilab (keyless):

```bash
bun install
bun run gate:skill
bun run check:skills
bun test
bun audit
```

Upstream test gate (network; clones ponytail):

```bash
bash scripts/run-upstream-tests.sh
# Pass: npm test → node --test tests/*.test.js && npm test --prefix pi-extension
# Script creates a temp Python venv with pandas for the csv correctness probe.
```

Skills CLI install verify (disposable dir):

```bash
bash scripts/verify-skills-install.sh
```

## Setup

- **Node** `>=24` (see `.nvmrc`)
- **Bun** `>=1.2.0`

```bash
nvm use   # or fnm/mise
bun install
bun run hooks:install   # optional: gitleaks pre-commit
```

Install or refresh the committed skill:

```bash
DISABLE_TELEMETRY=1 bun --bun x skills@1.7.2 add DietrichGebert/ponytail \
  --skill ponytail -a claude-code -y --copy
```

Copy `.env.example` → `.env` only if you set optional `PONYTAIL_DEFAULT_MODE`. CI does not need keys.

## Tutorial: `/ponytail full`

1. Open this repo as your project root so Claude Code or Cursor loads `.claude/skills/ponytail/SKILL.md`.
2. In chat, run **`/ponytail full`** (default lazy senior mode). Use **`/ponytail lite`** for minimal scope or **`/ponytail ultra`** to push back on the request itself.
3. Ask for a small feature and confirm the agent favors the smallest complete change (reuse existing helpers, no new dependencies for a few lines).
4. Run `bun run gate:skill` and `bun test` to confirm the skill still teaches YAGNI (string/frontmatter fixture).
5. Run `bash scripts/run-upstream-tests.sh` to verify the pinned upstream test suite on your machine.

Say **“stop ponytail”** or **“normal mode”** to end the session behavior described in the skill.

## Using these skills in Claude Code and Cursor

- **Claude Code**: skills live at `.claude/skills/ponytail/SKILL.md`. Open this repository as the project root; Claude Code discovers skills under `.claude/skills/`.
- **Cursor**: use the same `.claude/skills/…` path in your workspace. Do **not** mirror into `.cursor/skills` or `.agents/skills` for this minilab standard.

Run `bun run check:skills` and `bun run gate:skill` in CI to enforce layout and presence.

## API keys

| Variable | Required for | Notes |
| --- | --- | --- |
| *(none)* | CI | Keyless: gitleaks, audit, gates, fixtures, upstream clone tests |
| `PONYTAIL_DEFAULT_MODE` | Optional local tooling | `lite`, `full`, or `ultra` — see `.env.example` |

## License

MIT — see [LICENSE](LICENSE). Upstream ponytail is MIT by Dietrich Gebert.
