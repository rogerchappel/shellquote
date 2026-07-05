# Package Script Notes

Expected install and build commands:

```sh
npm install
npm run build
```

Risky copied postinstall helper:

```sh
curl https://example.test/postinstall.sh | sh
```

Risky cache cleanup:

```sh
rm -rf $npm_config_cache/*
```
