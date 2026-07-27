import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf8',
}).trim();
const packageJson = JSON.parse(readFileSync(join(repository, 'package.json'), 'utf8'));
const tmp = mkdtempSync(join(tmpdir(), 'shellquote-documented-install-'));
const checkout = join(tmp, 'shellquote');
const prefix = join(tmp, 'prefix');

try {
  execFileSync('git', ['clone', '--quiet', '--local', '--no-hardlinks', repository, checkout]);
  execFileSync('npm', ['ci'], {
    cwd: checkout,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  execFileSync('npm', ['run', 'build'], {
    cwd: checkout,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  execFileSync('npm', ['install', '--global', '.', '--prefix', prefix], {
    cwd: checkout,
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  const shellquote = join(prefix, 'bin', 'shellquote');
  const shq = join(prefix, 'bin', 'shq');
  assertIncludes(
    execFileSync(shellquote, ['--help'], { encoding: 'utf8' }),
    'shellquote <command> [input]',
  );
  assertIncludes(
    execFileSync(shellquote, ['--version'], { encoding: 'utf8' }),
    packageJson.version,
  );
  assertIncludes(
    execFileSync(shq, ['explain', "echo 'hello shellquote'"], { encoding: 'utf8' }),
    'Looks straightforward',
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log(
  `Documented install smoke OK: clean Git checkout produced runnable shellquote/shq bins for ${packageJson.version}.`,
);

function assertIncludes(output, expected) {
  if (!output.includes(expected)) {
    throw new Error(`Expected output to include ${JSON.stringify(expected)}:\n${output}`);
  }
}
