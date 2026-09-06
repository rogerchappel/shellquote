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

test('keeps benign network consumers informational', () => {
  const result = runCli(['lint', 'curl https://example.test/data.json | jq .', '--format', 'json']);

  assert.equal(result.status, 0);
  const output = JSON.parse(result.stdout) as { summary: string; diagnostics: Array<{ code: string; severity: string }> };
  assert.match(output.summary, /0 error/);
  assert.ok(output.diagnostics.some((diagnostic) => diagnostic.code === 'network-command' && diagnostic.severity === 'info'));
  assert.ok(!output.diagnostics.some((diagnostic) => diagnostic.code === 'pipe-to-shell-risk'));
});

test('reports corrected text summaries for embedded hashes', () => {
  const result = runCli(['lint', 'echo foo#bar', '--format', 'text']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /0 error, 0 warning, 0 info/);
});

test('reports and rewrites supported parameter expansion forms through the CLI', () => {
  const lint = runCli(['lint', 'printf %s ${VALUE} $1 $@', '--format', 'json']);
  const output = JSON.parse(lint.stdout) as { diagnostics: Array<{ code: string }> };
  assert.equal(output.diagnostics.filter((diagnostic) => diagnostic.code === 'unquoted-variable').length, 3);

  const rewrite = runCli(['rewrite', 'printf %s ${VALUE} $1 $@']);
  assert.equal(rewrite.status, 0);
  assert.equal(rewrite.stdout, 'printf %s "${VALUE}" "$1" "$@"\n');
});

test('renders command substitution as valid Markdown code spans', () => {
  const result = runCli(['explain', 'echo `date`', '--format', 'markdown']);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /- \*\*Input:\*\* ``echo `date```/);
  assert.match(result.stdout, /\*\*Rewrite:\*\* ``echo `date```/);
  assert.equal(result.stderr, '');
});

test('rewrite preserves comments and multiline command structure', () => {
  const source = 'echo ready && # retain context\ncat $README_PATH';
  const result = runCli(['rewrite', '--stdin'], source);

  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'echo ready && # retain context\ncat "$README_PATH"\n');
  assert.equal(result.stderr, '');
});

test('rewrite exits one without changing a wrapped destructive command', () => {
  const input = 'sudo env CI=true /usr/bin/rm -rf $BUILD_DIR/*';
  const result = runCli(['rewrite', '--', input]);

  assert.equal(result.status, 1);
  assert.equal(result.stdout, `${input}\n# Skipped automatic rewrite for approval-sensitive command: rm\n`);
  assert.equal(result.stderr, '');
});
