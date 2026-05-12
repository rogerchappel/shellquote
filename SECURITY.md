# Security Policy

`shellquote` is designed to be local-first and non-executing.

## Supported versions

Security fixes target the latest published version on `main`.

## Reporting a vulnerability

Please open a private GitHub security advisory if available, or file an issue with enough detail to reproduce the problem without including secrets.

## Safety guarantees

- The CLI never executes the command strings it analyzes.
- The CLI does not make network requests during analysis.
- Rewrite suggestions are deterministic and conservative.
- Approval-sensitive commands may be reported but are not automatically made "safe".

## Out of scope

`shellquote` is not a shell sandbox and cannot prove an arbitrary command is safe to run. Treat findings as review help, not authorization.
