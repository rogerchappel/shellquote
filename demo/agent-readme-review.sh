#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

rm -rf .shellquote-demo
mkdir -p .shellquote-demo

npm run build

set +e
node dist/cli.js lint \
  --docs \
  --file examples/agent-readme-review-input.md \
  --format markdown > .shellquote-demo/agent-readme-review.md
lint_status=$?
set -e

if [ "$lint_status" -eq 0 ]; then
  echo "expected README review demo to report findings" >&2
  exit 1
fi

grep -q "pipe-to-shell-risk" .shellquote-demo/agent-readme-review.md
grep -q "environment-mutation" .shellquote-demo/agent-readme-review.md

echo "shellquote demo ok: wrote .shellquote-demo/agent-readme-review.md"
