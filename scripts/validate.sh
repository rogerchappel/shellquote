#!/usr/bin/env bash
set -euo pipefail

npm test
npm run check
npm run build
npm run smoke
npm run package:smoke
npm run install:smoke
npm run release:artifact:test
