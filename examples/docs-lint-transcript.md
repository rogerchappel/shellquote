# Docs Lint Transcript

This transcript pairs with `demo/ci-docs-lint.sh` and the fixture file
`fixtures/readme-snippets.md`.

## Demo Command

```bash
npm run build
bash demo/ci-docs-lint.sh
```

The script writes two reports under
`${TMPDIR:-/tmp}/shellquote-ci-docs-lint`:

- `readme-snippets.json`
- `readme-snippets.md`

Both reports are checked for `pipe-to-shell-risk`, which comes from the fixture
snippet:

```bash
curl https://example.test/install.sh | sh
```

## Review Story

Use this demo when a docs change adds install snippets, agent approval examples,
or CI runbook commands. shellquote does not execute the snippets. It reads the
Markdown, reports review-worthy command risks, and keeps output deterministic so
the report can be pasted into a pull request.

The fixture also includes a quoted `npm install shellquote` command and an
unquoted variable example in `examples/commands.txt`, making it useful for both
README scans and direct command-list reviews.
