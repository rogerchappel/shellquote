# Agent Command Review Launch Note

shellquote now includes a one-command demo for reviewing agent-proposed shell
commands without executing them.

## What changed

- `demo/agent-command-review.sh` explains a risky install command, lints
  `examples/commands.txt`, and rewrites a simple variable command.
- `docs/tutorials/agent-command-review.md` describes the generated reports.
- `README.md` links the approval-prompt style flow.

## Suggested post

When an agent proposes shell commands, review the text before anything runs.
The new shellquote demo explains a curl-to-shell install, lints a committed
command fixture, and rewrites only the simple variable command it can change
deterministically.

Run it:

```sh
bash demo/agent-command-review.sh
```

## Do not claim

- Bash AST completeness
- ShellCheck replacement
- command execution or sandboxing
