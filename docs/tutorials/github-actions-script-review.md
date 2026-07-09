# Review GitHub Actions Script Blocks

GitHub Actions `run:` blocks are easy to copy from issue comments, release
notes, and setup guides. This recipe uses `shellquote` to review those shell
snippets locally before they become workflow code.

## Run the demo

```sh
bash demo/github-actions-script-review.sh
```

The script writes Markdown reports under `.shellquote-github-actions-review/`.
It expects risky fixture commands to exit with findings and treats that as the
success condition for the demo.

## What it covers

- An ordinary `npm ci && npm run build` command for comparison.
- A `curl ... | sh` bootstrap pattern that deserves human review.
- A broad `rm -rf $RUNNER_TEMP/*` cleanup command with an unquoted variable.

Use the generated Markdown report as PR evidence when reviewing workflow
changes that contain copied shell snippets.

