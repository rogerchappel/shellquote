# Social Hooks

Short, grounded post drafts for `shellquote`.

## Hook pack

1. Before you paste a shell command into a README, let a local tool explain what reviewers will worry about. `shellquote` flags quoting, glob, destructive-command, and download-piped-to-shell risks without executing anything.

2. Docs snippets are executable-looking promises. `shellquote lint --docs --file README.md --format markdown` turns fenced shell blocks into reviewable Markdown findings.

3. `shellquote rewrite` is intentionally modest: it quotes obvious variables and glob-looking literals, but skips approval-sensitive commands such as `rm` and `sudo` instead of pretending automation can make them safe.

4. Local-first command review for agents: no telemetry, no network calls, no command execution, deterministic output for the same input.

5. A useful demo: scan a README containing `curl https://example.test/install.sh | sh` and show the `pipe-to-shell-risk` finding before the command reaches a release note.

## Suggested CTA

Try the quickstart:

```sh
npm install
npm run build
node dist/cli.js explain "curl https://example.test/install.sh | sh"
```
