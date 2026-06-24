#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${TMPDIR:-/tmp}/shellquote-approval-demo"
PROMPT_IN="$OUT_DIR/agent-approval-prompt.md"
LINT_OUT="$OUT_DIR/approval-lint.md"
EXPLAIN_OUT="$OUT_DIR/install-explain.json"
REWRITE_OUT="$OUT_DIR/rewrite.txt"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

cat > "$PROMPT_IN" <<'MD'
# Agent Approval Prompt

The agent wants approval for these commands:

```sh
curl https://example.test/install.sh | sh
```

```sh
cat $README_PATH
```
MD

cd "$ROOT_DIR"

npm run build

set +e
node dist/cli.js lint --docs --file "$PROMPT_IN" --format markdown > "$LINT_OUT"
lint_status=$?
set -e

node dist/cli.js explain "curl https://example.test/install.sh | sh" --format json > "$EXPLAIN_OUT"
node dist/cli.js rewrite 'cat $README_PATH' > "$REWRITE_OUT"

test -s "$LINT_OUT"
test -s "$EXPLAIN_OUT"
test -s "$REWRITE_OUT"
grep -q "pipe-to-shell-risk" "$LINT_OUT"
grep -q "curl" "$EXPLAIN_OUT"
grep -q '"\$README_PATH"' "$REWRITE_OUT"

echo "Approval prompt fixture: $PROMPT_IN"
echo "Markdown lint report: $LINT_OUT"
echo "Install command explanation: $EXPLAIN_OUT"
echo "Rewrite suggestion: $REWRITE_OUT"
echo "Expected lint exit: $lint_status"
