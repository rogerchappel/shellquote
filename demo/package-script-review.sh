#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out_dir="${1:-"$repo_root/.shellquote-package-review"}"

cd "$repo_root"
mkdir -p "$out_dir"
npm run build >/dev/null

node dist/cli.js explain "npm install && npm run build" \
  --format markdown > "$out_dir/expected-install.md"

set +e
node dist/cli.js lint --docs --file examples/package-script-review.md \
  --format markdown > "$out_dir/package-script-findings.md"
status=$?
set -e

if [ "$status" -ne 1 ]; then
  echo "expected lint findings to exit 1, got $status" >&2
  exit 1
fi

grep -q "curl" "$out_dir/package-script-findings.md"
grep -q "rm" "$out_dir/package-script-findings.md"

echo "shellquote package-script review wrote $out_dir"
