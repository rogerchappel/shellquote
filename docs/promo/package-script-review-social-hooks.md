# Package Script Review Social Hooks

Grounded promotion notes for `demo/package-script-review.sh`.

## Short posts

1. Package scripts often become approval prompts. `shellquote` can review the
   shell strings first and leave a Markdown report beside the release notes.
2. This demo compares routine `npm install` commands with `curl | sh` and
   broad `rm -rf` patterns, without executing any of them.
3. The useful behavior is boring and local: read commands, explain findings,
   exit non-zero only when review-worthy errors are present.

## Video beat

- Open `examples/package-script-review.md`.
- Run `bash demo/package-script-review.sh`.
- Show `.shellquote-package-review/package-script-findings.md`.
- Point out that the denied-looking commands were only parsed and reported,
  never executed.

## Caption

`shellquote` turns package-script command review into local Markdown evidence
before risky snippets reach a README or approval prompt.
