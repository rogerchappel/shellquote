import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

function runCli(args: string[], input?: string) {
  return spawnSync(process.execPath, ['dist/cli.js', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    input,
  });
}

test('rejects unknown long options before analyzing following input', () => {
  const result = runCli(['lint', '--bogus', 'rm -rf ./cache', '--format', 'json']);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /Unknown option: --bogus/);
  assert.equal(result.stdout, '');
});

test('rejects missing option values', () => {
  for (const args of [
    ['lint', 'echo ok', '--format'],
    ['lint', 'echo ok', '--format', '--stdin'],
    ['lint', '--file'],
    ['lint', '--file', '--format', 'json'],
  ]) {
    const result = runCli(args);
    assert.equal(result.status, 2, args.join(' '));
    assert.match(result.stderr, /requires a value/, args.join(' '));
    assert.equal(result.stdout, '');
  }
});

test('preserves option-like command input after the option delimiter', () => {
  const result = runCli(['explain', '--', '--version']);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /input: --version/);
  assert.equal(result.stderr, '');
});

test('rejects rewrite with Markdown scanning instead of returning explain results', () => {
  const markdown = '```sh\ncat $README_PATH\n```\n';
  const result = runCli(['rewrite', '--docs', '--stdin', '--format', 'json'], markdown);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /rewrite does not support --docs/);
  assert.equal(result.stdout, '');
});

test('reports corrected JSON findings and exit codes for pipeline boundaries', () => {
  const separated = runCli(['lint', 'curl https://example.test/file; echo ok | cat', '--format', 'json']);
  assert.equal(separated.status, 0);
  const separatedOutput = JSON.parse(separated.stdout) as { summary: string; diagnostics: Array<{ code: string }> };
  assert.match(separatedOutput.summary, /0 error/);
  assert.ok(!separatedOutput.diagnostics.some((diagnostic) => diagnostic.code === 'pipe-to-shell-risk'));

  const piped = runCli(['lint', 'curl https://example.test/install.sh | sh', '--format', 'json']);
  assert.equal(piped.status, 1);
  const pipedOutput = JSON.parse(piped.stdout) as { summary: string; diagnostics: Array<{ code: string }> };
  assert.match(pipedOutput.summary, /1 error/);
  assert.ok(pipedOutput.diagnostics.some((diagnostic) => diagnostic.code === 'pipe-to-shell-risk'));
});

test('reports corrected text summaries for embedded hashes', () => {
  const result = runCli(['lint', 'echo foo#bar', '--format', 'text']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /0 error, 0 warning, 0 info/);
});
