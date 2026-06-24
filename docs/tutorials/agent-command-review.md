# Agent Command Review

This walkthrough turns the committed command fixtures into an approval-prompt
review flow. It is meant for README snippets, agent-generated terminal plans,
or CI notes where the reviewer wants evidence without executing the command.

## Run it

```sh
bash demo/agent-command-review.sh
```

The script builds the CLI, explains a download-piped-to-shell command, lints
`examples/commands.txt`, rewrites a simple variable command, and writes reports
under:

```text
/tmp/shellquote-agent-command-review
```

## What to look for

- `install-explain.md` should include `pipe-to-shell-risk` for the install
  command.
- `commands-lint.md` should include `unquoted-variable` from the committed
  command fixture.
- `rewrite.txt` should show a deterministic rewrite for `cat $README_PATH`.

The lint command is allowed to return non-zero because the fixture intentionally
contains review-worthy commands.

## Promotion angle

The demo shows the core shellquote promise in one local flow: explain risky
shell text, lint a fixture, and rewrite only the simple command that can be
changed deterministically. It does not execute the reviewed commands.
