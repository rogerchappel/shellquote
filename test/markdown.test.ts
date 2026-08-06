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
