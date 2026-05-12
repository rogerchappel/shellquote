import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCommand } from '../src/parser.js';

test('parses chained command segments', () => {
  const parsed = parseCommand('npm test && npm run build || echo failed');
  assert.equal(parsed.segments.length, 3);
  assert.equal(parsed.segments[1]?.operatorBefore, '&&');
  assert.equal(parsed.segments[2]?.operatorBefore, '||');
});
