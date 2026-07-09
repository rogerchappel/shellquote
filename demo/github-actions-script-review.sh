#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${1:-"$repo_root/.shellquote-github-actions-review"}"

cd "$repo_root"
mkdir -p "$out_dir"
npm run build >/dev/null

set +e
node dist/cli.js lint --docs --file examples/github-actions-script-review.md \
  --format markdown > "$out_dir/github-actions-findings.md"
status=$?
set -e

if [ "$status" -ne 1 ]; then
  echo "expected lint findings to exit 1, got $status" >&2
  exit 1
fi

grep -q "curl" "$out_dir/github-actions-findings.md"
grep -q "rm" "$out_dir/github-actions-findings.md"
grep -q "RUNNER_TEMP" "$out_dir/github-actions-findings.md"

node dist/cli.js explain "npm ci && npm run build" \
  --format markdown > "$out_dir/ordinary-ci-command.md"

echo "shellquote GitHub Actions script review wrote $out_dir"

