# Video Brief: README Command Review

## Angle

Show how `shellquote` gives maintainers and coding agents a quick local review pass for shell commands before they are copied into docs, release notes, or approval prompts.

## Demo flow

1. Open with a Markdown file that contains a normal install command and `curl https://example.test/install.sh | sh`.
2. Run:

   ```sh
   npm run build
   node dist/cli.js lint --docs --file fixtures/readme-snippets.md --format markdown
   ```

3. Point out the Markdown table with `pipe-to-shell-risk` and `network-command`.
4. Run:

   ```sh
   node dist/cli.js rewrite 'cat $README_PATH'
   ```

5. Show that the rewrite quotes the unambiguous variable path.

## What to say

- "`shellquote` reads command strings and Markdown snippets. It does not execute them."
- "The goal is not full Bash parsing. It is a lightweight safety lens for common docs and agent-generated snippets."
- "Rewrites are conservative, so risky commands stay visible for human review."

## Verification to show

```sh
npm test
npm run smoke
```
