# Stdin Approval Video Brief

## Hook

"Paste an agent approval prompt into a command-safety linter before you approve
the run."

## Demo beats

1. Open `examples/approval-prompt.md`.
2. Point out the shell fence with `npm install`, `cat $README_PATH`, and
   `curl ... | sh`.
3. Run `bash demo/stdin-approval-docs.sh`.
4. Open the Markdown report path.
5. Explain that shellquote reads command text and Markdown; it does not execute
   the commands.

## Boundaries

- shellquote is a lightweight review helper, not a full Bash interpreter.
- It should complement, not replace, human approval for destructive or networked
  commands.
