import assert from 'node:assert/strict';
import test from 'node:test';
import { rewriteCommand } from '../src/rewrite.js';

test('quotes unquoted variables', () => {
  const rewrite = rewriteCommand('cat $README_PATH');
  assert.equal(rewrite.output, 'cat "$README_PATH"');
  assert.equal(rewrite.changed, true);
});

test('skips destructive commands', () => {
  const rewrite = rewriteCommand('rm -rf build/*');
  assert.equal(rewrite.changed, false);
  assert.match(rewrite.skipped.join('\n'), /rm/);
});
