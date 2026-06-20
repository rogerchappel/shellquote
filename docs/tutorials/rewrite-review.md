# Conservative Rewrite Review

This demo shows the narrow rewrite path shellquote is willing to take, plus a
destructive command it refuses to rewrite automatically.

## Run

```sh
npm install
bash demo/rewrite-review.sh
```

The script builds the CLI, rewrites `cat $README_PATH` in text and JSON formats,
then attempts to rewrite `rm -rf $BUILD_DIR/*`.

## Expected evidence

- `rewrite.txt` contains `cat "$README_PATH"`.
- `rewrite.json` contains the same rewrite in structured output.
- `skipped-rm.txt` records the skipped destructive rewrite.
- The destructive rewrite exits `1`, which is expected for review-sensitive
  commands.

Use this recipe in reviews where a small, deterministic before/after is more
useful than an automated fix for every shell string.
