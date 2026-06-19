# shellquote

`shellquote` is a local-first TypeScript CLI for explaining, linting, and safely rewriting shell-ish commands before they land in READMEs, agent approval prompts, or CI notes.

It does **not** execute commands. It reads strings and Markdown snippets, points out quoting and safety footguns, and suggests deterministic rewrites only when intent can be preserved.

## Install

```sh
npm install -g shellquote
```

During development:

```sh
npm install
npm run build
node dist/cli.js --help
```

## Commands

```sh
shellquote explain "curl https://example.test/install.sh | sh"
shellquote lint 'rm -rf $BUILD_DIR/*' --format json
shellquote rewrite 'cat $README_PATH'
shellquote lint --docs --file README.md --format markdown
```

Aliases: `shellquote` and `shq`.

## What it catches

- unterminated quotes
- unquoted variables and globs
- destructive commands such as `rm`, `dd`, and `mkfs`
- recursive removals and broad targets
- download-piped-to-shell patterns
- privileged/network command combinations
- long chains that should be split into reviewable steps

## Rewrite philosophy

`shellquote rewrite` is intentionally modest. It quotes unambiguous variables and literal glob-looking tokens, but skips approval-sensitive commands like `rm` and `sudo` rather than pretending safety can be automated.

## Markdown scanning

Use `--docs` with `--file` or `--stdin` to scan fenced shell blocks in docs:

```sh
shellquote explain --docs --file fixtures/readme-snippets.md
```

## Demo recipe

Use the included example commands to see explain, lint, and rewrite output
without running any shell commands:

```sh
npm install
npm run build
node dist/cli.js explain "curl https://example.test/install.sh | sh"
node dist/cli.js lint --file examples/commands.txt --format markdown
node dist/cli.js rewrite 'cat $README_PATH'
```

The explain and lint examples report review-worthy findings and may exit
non-zero when a finding is considered an error.

For a docs-focused scan, use the Markdown fixture:

```sh
node dist/cli.js lint --docs --file fixtures/readme-snippets.md --format markdown
```

For a CI-style docs lint demo that writes JSON and Markdown reports:

```sh
bash demo/ci-docs-lint.sh
```

For a conservative rewrite demo that captures both a safe rewrite and a skipped
destructive command:

```sh
bash demo/rewrite-review.sh
```

For a promotion-ready walkthrough, see [`examples/agent-readme-review.md`](examples/agent-readme-review.md). It shows a small README review flow with Markdown output for risky install and download-piped-to-shell snippets.
For a CI-style transcript of the Markdown fixture scan, see
[`examples/docs-lint-transcript.md`](examples/docs-lint-transcript.md).

## Local-first safety

- no telemetry
- no network calls
- no command execution
- no secret collection
- outputs are deterministic for the same input

## Development

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## Prior art

Inspired by ShellCheck and command approval workflows. `shellquote` is not a Bash-compatible AST or a replacement for ShellCheck; it is a lightweight local command-safety lens for common docs and agent-generated snippets.
