# Short Video Brief: README Risk Scan

## Angle

Show a maintainer catching risky shell snippets before they land in public docs.

## Demo beats

1. Open `fixtures/readme-snippets.md` and point out the install-style command
   that pipes a download to a shell.
2. Run `bash demo/readme-risk-scan.sh`.
3. Open the generated Markdown report from `/tmp/shellquote-demo`.
4. Highlight the `pipe-to-shell-risk` and `unquoted-variable` finding IDs.
5. Run `node dist/cli.js rewrite 'cat $README_PATH'` to show a conservative
   rewrite that quotes an unambiguous variable.

## What to say plainly

Shellquote is a local command-review lens. It does not execute shell snippets,
does not call a network service, and does not replace ShellCheck for full Bash
analysis.

## Caption draft

README shell blocks are copy-paste interfaces. `shellquote` scans them locally
and turns risky snippets into reviewable findings before they ship.
