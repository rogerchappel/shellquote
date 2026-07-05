import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

const packOutput = execFileSync('npm', ['pack', '--json'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
});
const [pack] = JSON.parse(packOutput);
const files = new Set(pack.files.map((file) => file.path));
const requiredFiles = [
  'dist/cli.js',
  'dist/analyze.js',
  'dist/format.js',
  'dist/rewrite.js',
  'fixtures/readme-snippets.md',
  'examples/commands.txt',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
];

const missing = requiredFiles.filter((file) => !files.has(file));
if (missing.length > 0) {
  console.error('Package smoke failed; missing expected packed file(s):');
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), 'shellquote-package-smoke-'));
try {
  execFileSync('npm', ['init', '-y'], { cwd: tmp, stdio: 'ignore' });
  execFileSync('npm', ['install', join(process.cwd(), pack.filename)], {
    cwd: tmp,
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  const bin = join(tmp, 'node_modules', '.bin', 'shellquote');
  const alias = join(tmp, 'node_modules', '.bin', 'shq');
  assertIncludes(execFileSync(bin, ['--help'], { encoding: 'utf8' }), 'shellquote <command> [input]');
  assertIncludes(execFileSync(bin, ['--version'], { encoding: 'utf8' }), packageJson.version);
  assertIncludes(execFileSync(alias, ['explain', "echo 'hello shellquote'"], { encoding: 'utf8' }), 'Looks straightforward');
} finally {
  rmSync(tmp, { recursive: true, force: true });
  rmSync(pack.filename, { force: true });
}

console.log(`Package smoke OK: ${pack.name}@${pack.version} includes ${pack.files.length} files and runnable shellquote/shq bins.`);

function assertIncludes(output, expected) {
  if (!output.includes(expected)) {
    console.error(`Package smoke failed; expected output to include: ${expected}`);
    console.error(output);
    process.exit(1);
  }
}
