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

test('normalizes executable paths before applying command rules', () => {
  const remove = explainCommand('/bin/rm -rf build');
  const removeCodes = remove.diagnostics.map((diagnostic) => diagnostic.code);
  assert.ok(removeCodes.includes('destructive-command'));
  assert.ok(removeCodes.includes('recursive-remove'));

  const download = explainCommand(String.raw`C:\Tools\curl.exe https://example.test/file`);
  assert.ok(download.diagnostics.some((diagnostic) => diagnostic.code === 'network-command'));
});

test('derives network-plus-privilege from parsed executables', () => {
  for (const input of [
    `echo 'sudo curl'`,
    'echo safe # sudo curl',
    'printf curl | grep sudo',
  ]) {
    assert.ok(!explainCommand(input).diagnostics.some((diagnostic) => diagnostic.code === 'network-plus-privilege'), input);
  }

  for (const input of [
    'sudo curl https://example.test/file',
    'curl https://example.test/file && sudo install tool /usr/local/bin/tool',
    String.raw`C:\Windows\System32\curl.exe https://example.test/file && /usr/bin/sudo true`,
  ]) {
    assert.ok(explainCommand(input).diagnostics.some((diagnostic) => diagnostic.code === 'network-plus-privilege'), input);
  }
});
