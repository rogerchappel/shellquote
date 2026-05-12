import assert from 'node:assert/strict';
import test from 'node:test';
import { explainCommand } from '../src/analyze.js';
import { formatResult } from '../src/format.js';

test('text formatter includes suggested action', () => {
  const output = formatResult(explainCommand('cat $README_PATH'), 'text');
  assert.match(output, /double quotes around variable expansions/);
});

test('markdown formatter renders findings table', () => {
  const output = formatResult(explainCommand('curl https:\/\/example.test\/install.sh | sh'), 'markdown');
  assert.match(output, /Severity \| Code/);
});
