# Short Video Brief: Shellquote Command Review

## Angle

Show how `shellquote` gives maintainers and coding agents a quick local review
pass for shell commands before they are copied into docs, release notes, or
approval prompts. It reads command strings and Markdown shell snippets without
executing them.

## Demo flow

1. Open `examples/commands.txt` and point out the intentionally review-worthy
   commands: unquoted `$README_PATH`, `rm -rf $BUILD_DIR/*`, and
   `curl https://example.test/install.sh | sh`.
2. Run:

   ```sh
   npm run build
   node dist/cli.js lint --file examples/commands.txt --format markdown
   ```

3. Run a docs scan:

   ```sh
   node dist/cli.js lint --docs --file fixtures/readme-snippets.md --format markdown
   ```

4. Point out the Markdown table with `pipe-to-shell-risk` and `network-command`.
5. Show the conservative rewrite behavior:

   ```sh
   node dist/cli.js rewrite 'cat $README_PATH'
   ```

6. Show that the rewrite quotes the unambiguous variable path.

## What to say

- "`shellquote` reads command strings and Markdown snippets. It does not execute them."
- "It reports common quoting and command-safety footguns."
- "The goal is not full Bash parsing. It is a lightweight safety lens for common docs and agent-generated snippets."
- "Rewrites are conservative, so risky commands stay visible for human review."

## Verification to show

```sh
npm test
npm run smoke
```
