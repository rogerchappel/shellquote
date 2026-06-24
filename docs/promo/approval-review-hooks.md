# Approval Review Hooks

These drafts are grounded in the approval-prompt demo and current CLI behavior.

## Agent Approval Angle

Before approving a command suggested by an agent, run it through a local lens
that does not execute anything.

shellquote can explain risky shell-ish strings, scan Markdown approval prompts,
and suggest modest rewrites when intent is unambiguous.

Demo: `bash demo/approval-prompt-review.sh`.

## Docs Safety Angle

The risky command is often not in a script yet. It is in a README, CI note, or
agent approval prompt.

shellquote scans fenced shell blocks and names review signals like
download-piped-to-shell patterns and unquoted variables before they become copy
paste instructions.

## Limitation-Aware Post

shellquote is not a Bash-compatible AST and does not execute commands.

That constraint is intentional: it is a local review lens for common command
snippets, not a replacement for ShellCheck or a sandbox.
