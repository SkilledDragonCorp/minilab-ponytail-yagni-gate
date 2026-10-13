/** Pinned upstream ponytail commit (see scripts/run-upstream-tests.sh). */
export const UPSTREAM_REPO =
  "https://github.com/DietrichGebert/ponytail.git" as const;

/** Frozen at minilab ship time via `git ls-remote … HEAD`. */
export const UPSTREAM_PINNED_SHA =
  "2961b52fc1fe6a5a87c7a959a79512e5c2f3ffe5" as const;

/** Upstream root test script (package.json). */
export const UPSTREAM_TEST_COMMAND =
  "node --test tests/*.test.js && npm test --prefix pi-extension" as const;

export const UPSTREAM_PASS_CRITERIA =
  "Exit code 0 from `npm test` at pinned SHA (node:test suite + pi-extension tests)." as const;
