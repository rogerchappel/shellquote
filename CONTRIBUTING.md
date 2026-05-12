# Contributing

Thanks for helping make copied shell commands less surprising.

## Development loop

```sh
npm install
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## Rule changes

When adding or changing a rule:

1. Add a fixture in `fixtures/commands.json` or `fixtures/readme-snippets.md`.
2. Add or update a deterministic test.
3. Prefer conservative warnings over clever rewrites.
4. Never add command execution, telemetry, or secret collection.

## Commit style

Use small commits such as `feat: add markdown scanner` or `test: cover destructive rm rule`.
