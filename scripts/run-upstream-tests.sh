#!/usr/bin/env bash
# Clone pinned DietrichGebert/ponytail and run npm test (node:test + pi-extension).
set -euo pipefail

UPSTREAM_REPO="https://github.com/DietrichGebert/ponytail.git"
# Pin: git ls-remote https://github.com/DietrichGebert/ponytail.git HEAD (at minilab ship)
UPSTREAM_SHA="2961b52fc1fe6a5a87c7a959a79512e5c2f3ffe5"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="${UPSTREAM_WORKDIR:-$(mktemp -d -t ponytail-upstream-XXXXXX)}"
CLEANUP="${UPSTREAM_KEEP:-0}"

cleanup() {
  if [[ "$CLEANUP" != "1" ]]; then
    rm -rf "$WORK"
  else
    echo "UPSTREAM_KEEP=1 — left clone at: $WORK"
  fi
}
trap cleanup EXIT

echo "==> Cloning ponytail @ ${UPSTREAM_SHA}"
git init "$WORK"
git -C "$WORK" remote add origin "$UPSTREAM_REPO"
git -C "$WORK" fetch --depth 1 origin "$UPSTREAM_SHA"
git -C "$WORK" checkout FETCH_HEAD

echo "==> Node $(node -v)"
cd "$WORK"

echo "==> Python venv + pandas (correctness.test.js csv probe)"
PY_VENV="$WORK/.venv-correctness"
python3 -m venv "$PY_VENV"
"$PY_VENV/bin/pip" install --quiet --disable-pip-version-check pandas
export PATH="$PY_VENV/bin:$PATH"

echo "==> npm install (pi-extension deps)"
npm install --prefix pi-extension --no-audit --no-fund 2>/dev/null || npm install --prefix pi-extension

echo "==> npm test (= node --test tests/*.test.js && npm test --prefix pi-extension)"
npm test

echo "==> PASS: upstream npm test exited 0"
