#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/shellquote-agent-command-review"
EXPLAIN_REPORT="$OUT_DIR/install-explain.md"
LINT_REPORT="$OUT_DIR/commands-lint.md"
REWRITE_REPORT="$OUT_DIR/rewrite.txt"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cd "$ROOT_DIR"
npm run build

node dist/cli.js explain "curl https://example.test/install.sh | sh" --format markdown >"$EXPLAIN_REPORT"

set +e
node dist/cli.js lint --file examples/commands.txt --format markdown >"$LINT_REPORT"
lint_status=$?
set -e

node dist/cli.js rewrite 'cat $README_PATH' >"$REWRITE_REPORT"

test -s "$EXPLAIN_REPORT"
test -s "$LINT_REPORT"
test -s "$REWRITE_REPORT"
grep -q "pipe-to-shell-risk" "$EXPLAIN_REPORT"
grep -q "unquoted-variable" "$LINT_REPORT"
grep -q "cat" "$REWRITE_REPORT"

printf 'Explain report: %s\n' "$EXPLAIN_REPORT"
printf 'Command lint report: %s\n' "$LINT_REPORT"
printf 'Rewrite output: %s\n' "$REWRITE_REPORT"
printf 'Expected command lint exit: %s\n' "$lint_status"
