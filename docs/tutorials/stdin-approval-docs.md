# Stdin Approval Docs Review

Use this recipe when an agent or chat tool presents a Markdown approval prompt
and you want to lint the shell fences without saving a temporary project file.

## Fixture

`examples/approval-prompt.md` includes one ordinary install command, one
unquoted variable, and one download-piped-to-shell command.

## Run it

```sh
bash demo/stdin-approval-docs.sh
```

The script builds the CLI, pipes the Markdown fixture into `shellquote lint
--docs --stdin`, writes Markdown and JSON reports, and expects exit status `1`
because the fixture contains error-level findings.

## Manual command

```sh
npm run build
node dist/cli.js lint --docs --stdin --format markdown < examples/approval-prompt.md
```

## Review angle

This works well for approval workflows because shellquote does not execute the
commands. It only explains and flags review-worthy command text.
