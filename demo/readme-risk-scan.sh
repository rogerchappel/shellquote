#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/shellquote-demo"
DOC_REPORT="$OUT_DIR/readme-snippets.md"
COMMAND_REPORT="$OUT_DIR/commands.md"

mkdir -p "$OUT_DIR"
cd "$ROOT_DIR"

npm run build

set +e
node dist/cli.js lint --docs --file fixtures/readme-snippets.md --format markdown > "$DOC_REPORT"
docs_status=$?
node dist/cli.js lint --file examples/commands.txt --format markdown > "$COMMAND_REPORT"
commands_status=$?
set -e

test -s "$DOC_REPORT"
test -s "$COMMAND_REPORT"
grep -q "pipe-to-shell-risk" "$DOC_REPORT"
grep -q "unquoted-variable" "$COMMAND_REPORT"

echo "Markdown scan report: $DOC_REPORT"
echo "Command-list report: $COMMAND_REPORT"
echo "Expected docs lint exit: $docs_status"
echo "Expected command lint exit: $commands_status"
