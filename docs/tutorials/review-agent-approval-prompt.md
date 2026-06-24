# Review an Agent Approval Prompt

This recipe shows how to use shellquote on the command snippets an agent asks a
human to approve.

## Run it

```sh
bash demo/approval-prompt-review.sh
```

The script writes a temporary Markdown approval prompt, builds the CLI, scans
the prompt's fenced shell blocks, explains the risky install command, and writes
a deterministic rewrite suggestion for an unquoted variable.

## Outputs

The generated files are written under `/tmp/shellquote-approval-demo` by default:

- `agent-approval-prompt.md`: temporary approval prompt fixture.
- `approval-lint.md`: Markdown report for the prompt snippets.
- `install-explain.json`: JSON explanation for the download-piped-to-shell command.
- `rewrite.txt`: safer rewrite suggestion for `cat $README_PATH`.

## Review note

The lint command is expected to exit nonzero because the fixture contains a
download-piped-to-shell pattern. The script captures that status and verifies the
report instead of treating the finding as a broken demo.
