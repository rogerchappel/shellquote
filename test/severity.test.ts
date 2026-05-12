import assert from 'node:assert/strict';
import test from 'node:test';
import { countFindings, hasError } from '../src/severity.js';
import type { Diagnostic } from '../src/types.js';

test('counts findings by severity', () => {
  const diagnostics: Diagnostic[] = [
    { code: 'a', severity: 'info', message: 'a' },
    { code: 'b', severity: 'warning', message: 'b' },
    { code: 'c', severity: 'error', message: 'c' },
  ];
  assert.deepEqual(countFindings(diagnostics), { info: 1, warning: 1, error: 1 });
  assert.equal(hasError(diagnostics), true);
});
