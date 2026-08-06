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

test('only flags a pipe directly fed by curl or wget', () => {
  const separated = explainCommand('curl https://example.test/file; echo ok | cat');
  assert.ok(!separated.diagnostics.some((diagnostic) => diagnostic.code === 'pipe-to-shell-risk'));

  const piped = explainCommand('curl https://example.test/install.sh | sh');
  assert.ok(piped.diagnostics.some((diagnostic) => diagnostic.code === 'pipe-to-shell-risk'));
});

test('only treats direct interpreter consumers as pipe-to-shell risks', () => {
  for (const input of [
    'curl https://example.test/data.json | jq .',
    'wget -qO- https://example.test/data.txt | grep ready',
    'curl https://example.test/script.sh | cat | sh',
  ]) {
    const result = explainCommand(input);
    assert.ok(!result.diagnostics.some((diagnostic) => diagnostic.code === 'pipe-to-shell-risk'), input);
    assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === 'network-command'), input);
  }

  for (const input of [
    'curl https://example.test/install.sh | bash',
    'wget -qO- https://example.test/tool.py | python3',
    'curl https://example.test/install.ps1 | /usr/bin/pwsh',
  ]) {
    assert.ok(explainCommand(input).diagnostics.some((diagnostic) => diagnostic.code === 'pipe-to-shell-risk'), input);
  }
});
