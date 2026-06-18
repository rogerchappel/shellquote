# Short Video Brief: Agent Command Review

## Hook

"Before an agent runs a shell command, I want a deterministic second opinion
that does not execute anything."

## Demo Path

1. Open `examples/commands.txt`.
2. Point out `cat $README_PATH`, `rm -rf $BUILD_DIR/*`, and
   `curl https://example.test/install.sh | sh`.
3. Run `node dist/cli.js lint --file examples/commands.txt --format markdown`
   after `npm run build`.
4. Show the Markdown report and the stable finding names, including
   `unquoted-variable` and `pipe-to-shell-risk`.
5. Run `node dist/cli.js rewrite 'cat $README_PATH'` to show the conservative
   rewrite path.

## Boundaries

- shellquote is not a Bash-compatible parser.
- It does not run commands.
- Rewrites are intentionally narrow and should stay reviewable.

## CTA

Use shellquote for README snippets, agent approval prompts, and CI notes where a
small deterministic command-safety report is easier to review than a raw shell
string.
