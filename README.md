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
