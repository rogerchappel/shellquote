# shellquote PRD

Status: in-progress

## Summary

`shellquote` explains, validates, and safely rewrites shell commands for docs, agents, and CI. It catches quoting footguns before they become “works on my terminal” folklore. 🐚

## Problem

Many agent-generated or README commands break because of platform-specific quoting, unsafe interpolation, or confusing chained operators. Reviewing these commands manually is slow and error-prone.

## Users

- Developers writing README/CI shell snippets.
- Agents preparing commands for humans to approve.
- Maintainers checking copy-paste safety before publishing docs.

## Goals

- Parse shell-ish command strings into readable segments.
- Flag risky constructs, unquoted globs, variable interpolation, and destructive chains.
- Provide safer rewrites where deterministic.
- Render terminal, JSON, and Markdown explanations.
- Include fixtures for POSIX shell command examples.

## Non-goals

- Executing commands.
- Full Bash AST compatibility.
- PowerShell support in V1.

## V1 requirements

- TypeScript CLI commands: `explain`, `lint`, `rewrite`.
- Lightweight tokenizer/parser for common shell syntax.
- Rule engine with severity levels.
- Markdown doc scanner mode.
- Fixture-backed tests and CLI smoke.

## Safety

- Never executes commands.
- Treat destructive commands and approval-sensitive chains conservatively.
- Rewrites must preserve intent or explain why they are skipped.

## Attribution

Inspired by shellcheck, explainer tools, and command approval workflows; renamed and scoped as an approachable local command-safety lens.
