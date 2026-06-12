# README Risk Scan Demo

This demo turns the checked-in risky README snippets into Markdown findings a
maintainer can paste into a review comment.

## Run it

```sh
bash demo/readme-risk-scan.sh
```

The script builds the CLI, scans `fixtures/readme-snippets.md`, scans
`examples/commands.txt`, and checks that the generated reports include expected
finding IDs.

## Why the script exits successfully

The fixture content is intentionally risky, so the lint commands may return
non-zero statuses. The demo captures those statuses, verifies that reports were
created, and exits successfully after proving the expected findings are present.

## Useful review moment

Use this flow before publishing a README, agent runbook, or release note that
contains shell blocks. Shellquote does not run the commands; it only explains
review-worthy quoting, glob, and command-safety signals.
