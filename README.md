# shellquote

`shellquote` is a local-first TypeScript CLI for explaining, linting, and safely rewriting shell-ish commands before they land in READMEs, agent approval prompts, or CI notes.

It does **not** execute commands. It reads strings and Markdown snippets, points out quoting and safety footguns, and suggests deterministic rewrites only when intent can be preserved.

## Install

shellquote is currently distributed from its GitHub source repository, not the
npm registry. Install the current release-ready source with:

```sh
git clone --depth 1 https://github.com/rogerchappel/shellquote.git
cd shellquote
npm ci
npm run build
npm install --global .
shellquote --version
```

The global install provides both the `shellquote` and `shq` commands. An npm
registry install will be documented if registry publishing is enabled.

During development, use the same checkout without the global install:

```sh
npm ci
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

Unknown long options and options missing required values are rejected with exit
status `2`. To analyze command text that begins with `--`, place it after the
option delimiter:

```sh
shellquote explain -- --version
```

## What it catches

- unterminated quotes
- unquoted variables and globs
- destructive commands such as `rm`, `dd`, and `mkfs`
- recursive removals and broad targets
- downloads piped directly to a shell or interpreter (for example, `curl ... | sh` or `wget ... | python3`)
- privileged/network command combinations
- long chains that should be split into reviewable steps

Executable checks use the command basename, so path-qualified forms such as
`/bin/rm` and Windows-style `C:\Tools\curl.exe` receive the same findings as
`rm` and `curl`. Privileged/network findings are based on parsed commands,
including a command delegated through `sudo`; words that appear only in quoted
arguments or comments do not trigger the combination.

## Rewrite philosophy

`shellquote rewrite` is intentionally modest. It quotes unambiguous variables
and literal glob-looking tokens, but skips approval-sensitive commands like
`rm` rather than pretending safety can be automated. The same executable
resolution used by linting applies here: paths, leading assignments, and
common `env`/`sudo` wrapper forms cannot hide an approval-sensitive command.
Skipped rewrites preserve the original segment, name the effective command,
and exit with status `1`. Other rewrites preserve shell comments, whitespace,
and line structure around the executable tokens they change.

## Markdown scanning

Use `--docs` with `--file` or `--stdin` to scan fenced shell blocks in docs:

```sh
shellquote explain --docs --file fixtures/readme-snippets.md
```

Markdown scanning is supported by `explain` and `lint`. `rewrite --docs` is
rejected because rewrites operate on one command at a time.

Shell blocks may use CommonMark backtick or tilde fences of three or more
matching characters. A closing fence must use the same character and be at
least as long as its opener. Both unlabeled fences and fences labeled `sh`,
`bash`, `shell`, `zsh`, `console`, or `terminal` are scanned.

Commands continued with a trailing backslash are scanned as one logical
command, including across `$` and `>` console prompts. Commands on independent
lines remain separate. Prompt prefixes are removed only from `console` and
`terminal` fences. In `sh`, `bash`, `shell`, `zsh`, and unlabeled fences,
leading syntax such as `$CMD --flag` or `> output.txt` is preserved literally.
For example, this docs lint exits `1` because the continued pipeline is
analyzed together:

````sh
cat > /tmp/shellquote-continued.md <<'MARKDOWN'
```sh
curl https://example.test/install.sh \
  | sh
```
MARKDOWN
shellquote lint --docs --file /tmp/shellquote-continued.md
````

The `pipe-to-shell-risk` error is limited to `curl` or `wget` output piped
directly into a recognized shell or interpreter. Benign consumers such as
`jq`, `grep`, and `cat` retain the informational `network-command` finding but
do not produce that execution error.

Command checks resolve leading `NAME=value` assignments and common `env` and
`sudo` wrappers, including their options, before classifying the effective
executable. This applies consistently to destructive, network, package, and
pipe-consumer checks; quoted wrapper option values remain arguments rather than
being mistaken for commands.

Markdown output wraps input and rewrite commands in code spans whose delimiter
is longer than any backtick run in the command. Command substitutions such as
``echo `date` `` therefore remain intact when the report is rendered, and
pipes in findings-table cells are escaped so they do not create extra columns.

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

For an agent approval prompt review demo:

```sh
bash demo/approval-prompt-review.sh
```

For a conservative rewrite demo that captures both a safe rewrite and a skipped
destructive command:

```sh
bash demo/rewrite-review.sh
```

For a promotion-ready walkthrough, see [`examples/agent-readme-review.md`](examples/agent-readme-review.md). It shows a small README review flow with Markdown output for risky install and download-piped-to-shell snippets.
For a CI-style transcript of the Markdown fixture scan, see
[`examples/docs-lint-transcript.md`](examples/docs-lint-transcript.md).

For a GitHub Actions-focused variant that reviews copied workflow `run:` blocks,
run:

```sh
bash demo/github-actions-script-review.sh
```

The companion tutorial is
[`docs/tutorials/github-actions-script-review.md`](docs/tutorials/github-actions-script-review.md).

For an approval-prompt style demo that explains a risky install command, lints
the committed command fixture, and rewrites a simple variable command:

```sh
bash demo/agent-command-review.sh
```

See [docs/tutorials/agent-command-review.md](docs/tutorials/agent-command-review.md)
for the review flow and expected report files.

To review Markdown copied from an agent approval prompt over stdin:

```sh
bash demo/stdin-approval-docs.sh
```

See [docs/tutorials/stdin-approval-docs.md](docs/tutorials/stdin-approval-docs.md)
for the stdin workflow and report files.

To run that review from checked-in fixtures:

```sh
bash demo/agent-readme-review.sh
```

To review package-script style commands before they land in release notes or
agent prompts:

```sh
bash demo/package-script-review.sh
```

See [docs/tutorials/package-script-review.md](docs/tutorials/package-script-review.md)
for the fixture behavior and generated reports.

For a concise recording flow based on the checked-in examples and demo scripts,
see [`docs/promo/demo-runbook.md`](docs/promo/demo-runbook.md).

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
npm run package:smoke
npm run install:smoke
npm run release:check
bash scripts/validate.sh
```

`npm run release:check` is the promotion gate for maintainers. It combines the
test suite, type checks, build, CLI smoke script, dry-run package review, and a
clean-checkout smoke test of the documented GitHub installation.

## Prior art

Inspired by ShellCheck and command approval workflows. `shellquote` is not a Bash-compatible AST or a replacement for ShellCheck; it is a lightweight local command-safety lens for common docs and agent-generated snippets.
