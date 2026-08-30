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

test('skips path-qualified and prefixed destructive commands', () => {
  for (const input of [
    '/usr/bin/rm -rf build/*',
    'CI=true rm -rf build/*',
    'env CI=true rm -rf build/*',
    'env -u HOME /bin/rm -rf build/*',
    'sudo -- /usr/bin/rm -rf build/*',
    "sudo -p 'Password:' env CI=true rm -rf build/*",
  ]) {
    const rewrite = rewriteCommand(input);
    assert.equal(rewrite.output, input, input);
    assert.equal(rewrite.changed, false, input);
    assert.match(rewrite.skipped.join('\n'), /command: rm/, input);
  }
});

test('continues to rewrite benign prefixed commands', () => {
  for (const input of [
    'CI=true cat $README_PATH',
    'env CI=true cat $README_PATH',
    'env -u HOME /usr/bin/cat $README_PATH',
  ]) {
    const rewrite = rewriteCommand(input);
    assert.equal(rewrite.changed, true, input);
    assert.match(rewrite.output, /"\$README_PATH"$/, input);
    assert.deepEqual(rewrite.skipped, [], input);
  }
});

test('preserves trailing comments and original spacing', () => {
  const source = 'cat   $README_PATH  # keep this explanation';
  const rewrite = rewriteCommand(source);

  assert.equal(rewrite.output, 'cat   "$README_PATH"  # keep this explanation');
  assert.equal(rewrite.changed, true);
});

test('rewrites executable tokens after a chain-operator comment', () => {
  const source = 'echo ready && # explain why this follows\ncat $README_PATH';
  const rewrite = rewriteCommand(source);

  assert.equal(rewrite.output, 'echo ready && # explain why this follows\ncat "$README_PATH"');
  assert.equal(rewrite.changed, true);
});

test('preserves multiline source when no safe rewrite is needed', () => {
  const source = 'echo first # one\nprintf second # two';
  const rewrite = rewriteCommand(source);

  assert.equal(rewrite.output, source);
  assert.equal(rewrite.changed, false);
});
