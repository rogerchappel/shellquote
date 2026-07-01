# Demo Runbook

Use this runbook for a short shellquote walkthrough grounded in the checked-in examples, fixtures, and demo scripts.

## Prep

- Run `npm install` and `npm run build`.
- Keep `examples/commands.txt` and `fixtures/readme-snippets.md` open.
- Run `bash demo/readme-risk-scan.sh` once before recording to confirm report generation.

## Demo Flow

1. Run `node dist/cli.js explain "curl https://example.test/install.sh | sh"` to show command explanation without execution.
2. Run `node dist/cli.js lint --file examples/commands.txt --format markdown` to show command-list findings.
3. Run `node dist/cli.js lint --docs --file fixtures/readme-snippets.md --format markdown` to show fenced Markdown shell-block scanning.
4. Run `node dist/cli.js rewrite 'cat $README_PATH'` to show the conservative rewrite path.
5. Run `bash demo/ci-docs-lint.sh` to generate JSON and Markdown reports a CI job could archive.

## Sound Bites

- shellquote reads command text; it does not execute commands.
- The docs mode helps review README snippets and agent-generated install steps.
- Rewrites stay conservative and skip approval-sensitive commands.

## Honest Limits

shellquote is not a Bash-compatible AST and does not replace ShellCheck. It is a lightweight safety lens for common docs and approval-prompt command patterns.
