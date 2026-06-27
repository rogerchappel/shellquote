#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/shellquote-stdin-approval"
REPORT_MD="$OUT_DIR/approval-report.md"
REPORT_JSON="$OUT_DIR/approval-report.json"

cd "$ROOT_DIR"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

npm run build >/dev/null

set +e
node dist/cli.js lint --docs --stdin --format markdown < examples/approval-prompt.md > "$REPORT_MD"
markdown_status=$?

node dist/cli.js lint --docs --stdin --format json < examples/approval-prompt.md > "$REPORT_JSON"
json_status=$?
set -e

test "$markdown_status" -eq 1
test "$json_status" -eq 1
test -s "$REPORT_MD"
test -s "$REPORT_JSON"
grep -q 'curl https://example.test/install.sh' "$REPORT_MD"
grep -q 'pipe-to-shell-risk' "$REPORT_JSON"
grep -q 'unquoted-variable' "$REPORT_JSON"

echo "Markdown report: $REPORT_MD"
echo "JSON report: $REPORT_JSON"
echo "Expected lint exit: $markdown_status"
