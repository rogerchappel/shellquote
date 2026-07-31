import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCommand } from '../src/parser.js';

test('parses chained command segments', () => {
  const parsed = parseCommand('npm test && npm run build || echo failed');
  assert.equal(parsed.segments.length, 3);
  assert.equal(parsed.segments[1]?.operatorBefore, '&&');
  assert.equal(parsed.segments[2]?.operatorBefore, '||');
});

test('preserves embedded hashes while excluding ordinary comments', () => {
  const embedded = parseCommand('echo foo#bar');
  assert.deepEqual(embedded.segments[0]?.tokens.map((token) => token.value), ['echo', 'foo#bar']);
  assert.equal(embedded.segments[0]?.text, 'echo foo#bar');

  const commented = parseCommand('echo foo # ordinary comment');
  assert.deepEqual(commented.segments[0]?.tokens.map((token) => token.value), ['echo', 'foo']);
});
