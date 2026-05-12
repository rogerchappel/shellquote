#!/usr/bin/env bash
set -euo pipefail

node dist/src/cli.js explain "echo 'hello shellquote'" | grep -q "Looks straightforward"
node dist/src/cli.js lint 'rm -rf $BUILD_DIR/*' --format json > /tmp/shellquote-lint.json || status=$?
: "${status:=0}"
if [[ "$status" -ne 1 ]]; then
  echo "expected lint to exit 1 for destructive command" >&2
  exit 1
fi
grep -q "recursive-remove" /tmp/shellquote-lint.json
node dist/src/cli.js rewrite 'cat $README_PATH' | grep -q 'cat "\$README_PATH"'
node dist/src/cli.js explain --docs --file fixtures/readme-snippets.md --format markdown | grep -q "pipe-to-shell-risk"
echo "shellquote smoke ok"
