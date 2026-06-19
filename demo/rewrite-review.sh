#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/shellquote-rewrite-review"
REWRITE_JSON="$OUT_DIR/rewrite.json"
REWRITE_TEXT="$OUT_DIR/rewrite.txt"
SKIPPED_TEXT="$OUT_DIR/skipped-rm.txt"

cd "$ROOT_DIR"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

npm run build

node dist/cli.js rewrite 'cat $README_PATH' --format json > "$REWRITE_JSON"
node dist/cli.js rewrite 'cat $README_PATH' > "$REWRITE_TEXT"

set +e
node dist/cli.js rewrite 'rm -rf $BUILD_DIR/*' > "$SKIPPED_TEXT"
skipped_status=$?
set -e

test -s "$REWRITE_JSON"
test -s "$REWRITE_TEXT"
test -s "$SKIPPED_TEXT"
grep -q '"changed": true' "$REWRITE_JSON"
grep -Fq '"output": "cat \"$README_PATH\""' "$REWRITE_JSON"
grep -q 'cat "$README_PATH"' "$REWRITE_TEXT"
grep -qi "skipped" "$SKIPPED_TEXT"
test "$skipped_status" -eq 1

echo "Rewrite JSON: $REWRITE_JSON"
echo "Rewrite text: $REWRITE_TEXT"
echo "Skipped destructive rewrite: $SKIPPED_TEXT"
echo "Expected skipped exit: $skipped_status"
