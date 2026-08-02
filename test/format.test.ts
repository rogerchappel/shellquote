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

test('markdown formatter uses longer code spans around embedded backticks', () => {
  const output = formatResult(explainCommand('echo `date`', { includeRewrite: true }), 'markdown');

  assert.match(output, /- \*\*Input:\*\* ``echo `date```/);
  assert.match(output, /\*\*Rewrite:\*\* ``echo `date```/);
});

test('markdown formatter escapes pipes in findings table cells', () => {
  const result = explainCommand('cat $README_PATH');
  result.diagnostics[0]!.message = 'Use cat | less';
  result.diagnostics[0]!.hint = 'Prefer one | reviewed pipeline';

  const output = formatResult(result, 'markdown');

  assert.match(output, /Use cat \\\| less/);
  assert.match(output, /Prefer one \\\| reviewed pipeline/);
});
