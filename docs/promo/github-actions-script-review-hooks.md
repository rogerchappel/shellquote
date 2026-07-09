# GitHub Actions Script Review Hooks

- Before a copied `run:` block lands in CI, run it through a local shell-safety
  lens.
- `shellquote` does not execute workflow commands; it explains quoting,
  destructive cleanup, and download-piped-to-shell risk from the text alone.
- Demo angle: turn a risky Actions snippet into a Markdown review report that
  can be pasted into a PR.
- Best clip: show `curl ... | sh` and `rm -rf $RUNNER_TEMP/*` producing findings
  while an ordinary `npm ci && npm run build` command stays reviewable.

