# Launch Note Draft

Shellquote is a local-first CLI for reviewing shell-ish commands before they land in READMEs, agent prompts, release notes, or CI documentation.

It explains and lints command strings and CommonMark backtick- or tilde-fenced shell snippets without executing them. Current checks cover quoting footguns, unquoted variables and globs, destructive commands, downloads piped directly into recognized shells or interpreters, and long chains that should be split for review. A download piped to a benign consumer such as `jq` remains an informational network finding rather than a pipe-to-shell error.

## What to show

- `node dist/cli.js explain "curl https://example.test/install.sh | sh"` for an immediate command explanation.
- `bash demo/readme-risk-scan.sh` for the existing README-snippet demo.
- `bash demo/ci-docs-lint.sh` for JSON and Markdown report output a CI job could archive.
- `node dist/cli.js rewrite 'cat $README_PATH'` for the conservative rewrite path.

## Positioning

Shellquote is a small command-safety lens for docs and agent-generated snippets. It is not a Bash-compatible AST and does not replace ShellCheck.

## Honest limits

Shellquote does not execute commands, fetch remote scripts, collect secrets, or guarantee that a command is safe. Approval-sensitive rewrites are intentionally skipped.
