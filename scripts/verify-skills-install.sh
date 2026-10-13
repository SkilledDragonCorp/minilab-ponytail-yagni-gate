#!/usr/bin/env bash
# Verify skills@1.7.2 installs ponytail into .claude/skills (disposable workspace).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${MINILAB_SKILLS_WORKDIR:-$ROOT/.throwaway-skills}"
CLEANUP=0
if [[ -z "${MINILAB_SKILLS_WORKDIR:-}" ]]; then
  rm -rf "$WORK"
  mkdir -p "$WORK"
  CLEANUP=1
  trap 'rm -rf "$WORK"' EXIT
fi

cd "$WORK"
echo "Skills install verify workspace: $WORK"

DISABLE_TELEMETRY=1 bun --bun x skills@1.7.2 add DietrichGebert/ponytail \
  --skill ponytail \
  -a claude-code \
  -y \
  --copy

SKILL_MD="$WORK/.claude/skills/ponytail/SKILL.md"
if [[ ! -f "$SKILL_MD" ]]; then
  echo "Missing $SKILL_MD after skills add" >&2
  exit 1
fi

if [[ -d "$WORK/.agents/skills" ]]; then
  echo "Unexpected .agents/skills mirror (use -a claude-code)" >&2
  exit 1
fi

echo "Skills CLI install verify OK"
