# Launch Note Draft: Agent README Review

`shellquote` now has a self-contained README-review demo for shell snippets that
agents and maintainers often copy into docs.

## What to run

```sh
bash demo/agent-readme-review.sh
```

The demo builds the CLI, scans
`examples/agent-readme-review-input.md`, and writes
`.shellquote-demo/agent-readme-review.md`.

## What it shows

- Markdown scanning with `--docs --file`.
- A download-piped-to-shell finding for `curl ... | sh`.
- Environment mutation guidance for install-style commands.
- Review output that can be pasted into a PR comment or release checklist.

## Limits

`shellquote` does not execute commands and does not try to be a full shell AST.
It is a local-first review lens for common command-safety and quoting risks.
