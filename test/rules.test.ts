import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { explainCommand } from '../src/analyze.js';

interface Fixture { name: string; input: string; expectCodes: string[] }
const fixtures = JSON.parse(readFileSync('fixtures/commands.json', 'utf8')) as Fixture[];

for (const fixture of fixtures) {
  test(`fixture: ${fixture.name}`, () => {
    const result = explainCommand(fixture.input, { includeRewrite: true });
    const codes = result.diagnostics.map((diagnostic) => diagnostic.code);
    for (const expected of fixture.expectCodes) assert.ok(codes.includes(expected), `${expected} missing from ${codes.join(', ')}`);
  });
}
