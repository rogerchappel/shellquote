# Command Review Demo

This tutorial uses the repository's example command list to show how
Shellquote explains risky command strings, lints command batches, and suggests
small deterministic rewrites.

## Build the local CLI

```sh
npm install
npm run build
```

## Explain one command

```sh
node dist/cli.js explain "curl https://example.test/install.sh | sh"
```

The command is not executed. Shellquote parses the string and reports the
review-worthy pattern. It may exit non-zero because the fixture intentionally
contains a pipe-to-shell error.

## Lint example commands

```sh
node dist/cli.js lint --file examples/commands.txt --format markdown > /tmp/shellquote-commands.md
test -s /tmp/shellquote-commands.md
```

The fixture includes unquoted variables, recursive removal, and download-to-
shell content so the report has visible findings. Treat a non-zero lint exit as
expected for this risky fixture.

## Scan Markdown snippets

```sh
node dist/cli.js lint --docs --file fixtures/readme-snippets.md --format markdown > /tmp/shellquote-docs.md
test -s /tmp/shellquote-docs.md
```

Use this mode when reviewing README snippets, agent approval prompts, or CI
notes that include fenced shell blocks.

## Try a rewrite

```sh
node dist/cli.js rewrite 'cat $README_PATH'
```

Rewrites are intentionally conservative. Shellquote quotes unambiguous values
but does not pretend to make destructive commands safe automatically.
