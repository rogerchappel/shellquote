#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { stdin as input, stdout, stderr, exit } from 'node:process';
import { analyzeMarkdown, explainCommand } from './analyze.js';
import { formatMany, formatResult } from './format.js';
import { rewriteCommand } from './rewrite.js';
import type { CliOptions } from './types.js';

const USAGE = `shellquote <command> [input]

Commands:
  explain   Explain command segments and findings
  lint      Report findings; exits 1 on error findings
  rewrite   Print a deterministic safer rewrite when possible

Options:
  --format text|json|markdown
  --docs             Treat input/file as Markdown and scan shell fences
  --file <path>      Read input from a file
  --stdin            Read input from stdin
  --fix              With lint, include rewrite suggestions
  --                 Treat all following arguments as command input
  -h, --help         Show help
  -v, --version      Show version

Note: rewrite does not support --docs.
`;

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  if (!command || command === '--help' || command === '-h') {
    stdout.write(USAGE);
    return 0;
  }
  if (command === '--version' || command === '-v') {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
    stdout.write(`${pkg.version}\n`);
    return 0;
  }
  if (!['explain', 'lint', 'rewrite'].includes(command)) {
    stderr.write(`Unknown command: ${command}\n\n${USAGE}`);
    return 2;
  }
  const { options, args } = parseOptions(rest);
  if (command === 'rewrite' && options.docs) {
    throw new Error('rewrite does not support --docs; rewrite one command at a time without --docs.');
  }
  const source = await readInput(args, options);
  if (options.docs) {
    const results = analyzeMarkdown(source);
    stdout.write(`${formatMany(results, options.format)}\n`);
    return hasErrors(results) && command === 'lint' ? 1 : 0;
  }
  if (command === 'rewrite') {
    const rewrite = rewriteCommand(source.trim());
    if (options.format === 'json') stdout.write(`${JSON.stringify(rewrite, null, 2)}\n`);
    else stdout.write(`${rewrite.output}\n${rewrite.skipped.map((skip) => `# ${skip}`).join('\n')}${rewrite.skipped.length ? '\n' : ''}`);
    return rewrite.skipped.length > 0 ? 1 : 0;
  }
  const result = explainCommand(source.trim(), { includeRewrite: command === 'explain' || options.fix });
  stdout.write(`${formatResult(result, options.format)}\n`);
  return command === 'lint' && result.diagnostics.some((diagnostic) => diagnostic.severity === 'error') ? 1 : 0;
}

function parseOptions(argv: string[]): { options: CliOptions; args: string[] } {
  const options: CliOptions = { format: 'text', docs: false, fix: false, stdin: false };
  const args: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg === '--') {
      args.push(...argv.slice(i + 1));
      break;
    }
    if (arg === '--format') options.format = parseFormat(optionValue(argv, i, '--format'));
    else if (arg === '--docs') options.docs = true;
    else if (arg === '--fix') options.fix = true;
    else if (arg === '--stdin') options.stdin = true;
    else if (arg === '--file') options.file = optionValue(argv, i, '--file');
    else if (arg.startsWith('--')) throw new Error(`Unknown option: ${arg}`);
    else args.push(arg);
    if (arg === '--format' || arg === '--file') i += 1;
  }
  return { options, args };
}

function optionValue(argv: string[], index: number, option: string): string {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

function parseFormat(value: string | undefined): CliOptions['format'] {
  if (value === 'json' || value === 'markdown' || value === 'text') return value;
  throw new Error(`Unsupported format: ${value ?? '<missing>'}`);
}

async function readInput(args: string[], options: CliOptions): Promise<string> {
  if (options.file) return readFileSync(options.file, 'utf8');
  if (options.stdin) return readStdin();
  if (args.length > 0) return args.join(' ');
  if (!input.isTTY) return readStdin();
  throw new Error('No input provided. Pass a command, --file, or --stdin.');
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of input) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString('utf8');
}

function hasErrors(results: Array<{ diagnostics: Array<{ severity: string }> }>): boolean {
  return results.some((result) => result.diagnostics.some((diagnostic) => diagnostic.severity === 'error'));
}

main(process.argv.slice(2)).then((code) => exit(code)).catch((error: unknown) => {
  stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  exit(2);
});
