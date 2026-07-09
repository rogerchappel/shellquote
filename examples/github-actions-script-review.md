# GitHub Actions Script Review Fixture

Use this fixture to show how `shellquote` reviews shell snippets before they
are copied into a workflow `run:` block.

```sh
npm ci && npm run build
```

```sh
curl https://example.test/ci-bootstrap.sh | sh
```

```sh
rm -rf $RUNNER_TEMP/*
```

