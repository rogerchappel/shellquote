# shellquote quickstart

Explain a command before putting it in a README:

```sh
shellquote explain "curl https://example.test/install.sh | sh"
```

Lint a docs file:

```sh
shellquote lint --docs --file README.md --format markdown
```

Ask for a deterministic rewrite:

```sh
shellquote rewrite 'cat $README_PATH'
```
