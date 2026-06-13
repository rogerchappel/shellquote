#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/shellquote-ci-docs-lint"
JSON_REPORT="$OUT_DIR/readme-snippets.json"
MARKDOWN_REPORT="$OUT_DIR/readme-snippets.md"

mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build

set +e
node dist/cli.js lint --docs --file fixtures/readme-snippets.md --format json >"$JSON_REPORT"
json_status=$?
node dist/cli.js lint --docs --file fixtures/readme-snippets.md --format markdown >"$MARKDOWN_REPORT"
markdown_status=$?
set -e

test -s "$JSON_REPORT"
test -s "$MARKDOWN_REPORT"
grep -q "pipe-to-shell-risk" "$JSON_REPORT"
grep -q "pipe-to-shell-risk" "$MARKDOWN_REPORT"

echo "JSON report: $JSON_REPORT"
echo "Markdown report: $MARKDOWN_REPORT"
echo "Expected JSON lint exit: $json_status"
echo "Expected Markdown lint exit: $markdown_status"
