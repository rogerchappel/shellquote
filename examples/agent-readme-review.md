# Agent README Review Demo

Use this fixture when you want to show how `shellquote` reviews shell snippets before an agent or maintainer copies them into a README, issue, or release note.

## Demo input

Create a short Markdown file with a safe install command, a risky cleanup command, and a download-piped-to-shell example:

````markdown
# Demo notes

```sh
npm install shellquote
shellquote lint "rm -rf $BUILD_DIR/*"
curl https://example.test/install.sh | sh
```
````

## Run it

```sh
npm run build
node dist/cli.js lint --docs --file examples/agent-readme-review-input.md --format markdown
```

For a self-contained run, use the checked-in input fixture:

```sh
node dist/cli.js lint --docs --file examples/agent-readme-review-input.md --format markdown
```

Or run the full demo script:

```sh
bash demo/agent-readme-review.sh
```

## Expected talking points

- `shellquote` does not execute the commands it reviews.
- Markdown mode scans fenced shell snippets with `--docs --file`.
- The `curl ... | sh` example is reported as `pipe-to-shell-risk`.
- The `npm install` example is treated as environment-mutating and receives a pinning/separation hint.
- Output can be rendered as Markdown for PR comments, release notes, or reviewer handoffs.
