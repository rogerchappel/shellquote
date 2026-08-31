import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { analyzeMarkdown, shellLinesFromMarkdown } from '../src/index.js';

test('extracts shell commands from markdown fences', () => {
  const markdown = readFileSync('fixtures/readme-snippets.md', 'utf8');
  const lines = shellLinesFromMarkdown(markdown);
  assert.ok(lines.includes('npm install shellquote'));
  assert.ok(lines.some((line) => line.includes('curl')));
});

test('analyzes markdown snippets', () => {
  const results = analyzeMarkdown(readFileSync('fixtures/readme-snippets.md', 'utf8'));
  assert.ok(results.some((result) => result.diagnostics.some((diagnostic) => diagnostic.code === 'pipe-to-shell-risk')));
});

test('preserves backslash-continued commands for cross-line analysis', () => {
  const markdown = ['~~~sh', 'curl https://example.test/install.sh \\', '  | sh', '~~~'].join('\n');

  assert.deepEqual(shellLinesFromMarkdown(markdown), ['curl https://example.test/install.sh | sh']);
  assert.ok(analyzeMarkdown(markdown)[0]?.diagnostics.some((diagnostic) => diagnostic.code === 'pipe-to-shell-risk'));
});

test('joins continued console prompts but keeps independent lines separate', () => {
  const markdown = ['```console', '$ printf "%s\\n" \\', '>   first second', '$ echo independent', '```'].join('\n');

  assert.deepEqual(shellLinesFromMarkdown(markdown), ['printf "%s\\n" first second', 'echo independent']);
});

test('preserves leading shell syntax outside console fences', () => {
  const markdown = [
    '```sh',
    '$CMD --flag',
    '> output.txt',
    '```',
    '',
    '```',
    '$OTHER --value',
    '> another.txt',
    '```',
  ].join('\n');

  assert.deepEqual(shellLinesFromMarkdown(markdown), [
    '$CMD --flag',
    '> output.txt',
    '$OTHER --value',
    '> another.txt',
  ]);
});

test('removes console prompts including on continuation lines', () => {
  const markdown = ['```terminal', '$ printf "%s\\n" \\', '>   first second', '> output.txt', '```'].join('\n');

  assert.deepEqual(shellLinesFromMarkdown(markdown), ['printf "%s\\n" first second', 'output.txt']);
});

test('does not treat an escaped trailing backslash as a continuation', () => {
  const markdown = ['```bash', 'printf path\\\\', 'echo next', '```'].join('\n');

  assert.deepEqual(shellLinesFromMarkdown(markdown), ['printf path\\\\', 'echo next']);
});

test('extracts tilde-fenced shell blocks with CommonMark closing rules', () => {
  const markdown = [
    '~~~~bash',
    'echo before',
    '~~~',
    'echo after',
    '~~~~~',
    '',
    '~~~sh',
    'echo tilde',
    '```',
    'echo still-inside',
    '~~~',
  ].join('\n');

  assert.deepEqual(shellLinesFromMarkdown(markdown), [
    'echo before',
    '~~~',
    'echo after',
    'echo tilde',
    '```',
    'echo still-inside',
  ]);
});

test('does not close backtick fences with a different or shorter marker', () => {
  const markdown = ['````shell', 'echo one', '~~~', '```', 'echo two', '````'].join('\n');

  assert.deepEqual(shellLinesFromMarkdown(markdown), ['echo one', '~~~', '```', 'echo two']);
});
