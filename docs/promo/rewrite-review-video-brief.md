# Short Video Brief: Conservative Shell Rewrites

## Hook

"A command-safety tool should know when to stop."

## Demo beats

1. Open `demo/rewrite-review.sh`.
2. Run `bash demo/rewrite-review.sh`.
3. Show `rewrite.txt` with `cat "$README_PATH"`.
4. Show `skipped-rm.txt` for `rm -rf $BUILD_DIR/*`.
5. Explain that shellquote does not execute commands and only rewrites narrow,
   intent-preserving cases.

## Boundaries

- Do not present shellquote as a full Bash parser.
- Do not imply destructive commands are made safe automatically.
- Keep the message grounded in review assistance: explain, lint, and suggest
  conservative rewrites.
