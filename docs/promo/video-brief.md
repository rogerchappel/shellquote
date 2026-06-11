# Short Video Brief: Shellquote Command Review

## Angle

Show how Shellquote reviews command strings and Markdown shell snippets without
executing them.

## Demo beats

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

4. Show the conservative rewrite behavior:

   ```sh
   node dist/cli.js rewrite 'cat $README_PATH'
   ```

## Claims to keep factual

- Shellquote reads command strings and Markdown snippets.
- It does not execute commands or make network calls.
- It reports common quoting and command-safety footguns.

## Limitation to mention

Shellquote is not a full Bash AST and is not a replacement for ShellCheck. It
is a lightweight review lens for docs, prompts, and command snippets.
