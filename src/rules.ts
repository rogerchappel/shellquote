import { commandName } from './parser.js';
import type { Diagnostic, ParsedCommand, Token } from './types.js';

const DESTRUCTIVE = new Set(['rm', 'rmdir', 'mv', 'dd', 'mkfs', 'chmod', 'chown', 'sudo']);
const NETWORK = new Set(['curl', 'wget', 'ssh', 'scp', 'rsync']);
const PACKAGE_INSTALLERS = new Set(['npm', 'pnpm', 'yarn', 'pip', 'brew', 'apt', 'apt-get']);

export function lintParsed(parsed: ParsedCommand): Diagnostic[] {
  const diagnostics: Diagnostic[] = [...parsed.errors];
  for (const segment of parsed.segments) {
    const name = commandName(segment);
    if (!name) continue;
    const args = segment.tokens.slice(1);
    if (DESTRUCTIVE.has(name)) diagnostics.push(destructiveDiagnostic(name, segment.text, segment.start, segment.end));
    if (name === 'rm') diagnostics.push(...lintRm(args));
    if (name === 'curl' || name === 'wget') diagnostics.push(...lintNetworkPipe(parsed, name));
    if (NETWORK.has(name)) diagnostics.push({ code: 'network-command', severity: 'info', message: `${name} reaches outside this machine.`, hint: 'Keep tokens and URLs out of copied examples unless intentional.', segment: segment.text, start: segment.start, end: segment.end });
    if (PACKAGE_INSTALLERS.has(name)) diagnostics.push({ code: 'environment-mutating', severity: 'warning', message: `${name} can change the local environment.`, hint: 'Pin versions and separate install steps from execution steps.', segment: segment.text, start: segment.start, end: segment.end });
    diagnostics.push(...lintTokens(segment.tokens));
  }
  diagnostics.push(...lintChains(parsed));
  return dedupe(diagnostics);
}

function destructiveDiagnostic(name: string, segment: string, start: number, end: number): Diagnostic {
  return { code: 'destructive-command', severity: name === 'sudo' ? 'warning' : 'error', message: `${name} can modify or remove local state.`, hint: 'Require explicit review; avoid combining with downloads or broad globs.', segment, start, end };
}

function lintRm(args: Token[]): Diagnostic[] {
  const joined = args.map((arg) => arg.value).join(' ');
  const diagnostics: Diagnostic[] = [];
  if (/(-rf|-fr|--recursive)/.test(joined)) diagnostics.push({ code: 'recursive-remove', severity: 'error', message: 'Recursive removal is approval-sensitive.', hint: 'Prefer a narrower path and show it before removing.' });
  if (args.some((arg) => arg.value === '/' || arg.value === '$HOME' || arg.value === '~')) diagnostics.push({ code: 'broad-remove-target', severity: 'error', message: 'Removal target is dangerously broad.', hint: 'Refuse this in docs unless it is clearly sandboxed.' });
  return diagnostics;
}

function lintNetworkPipe(parsed: ParsedCommand, name: string): Diagnostic[] {
  const pipeIndex = parsed.tokens.findIndex((token) => token.kind === 'operator' && token.value === '|');
  if (pipeIndex === -1) return [];
  const networkIndex = parsed.tokens.findIndex((token) => token.value === name);
  if (networkIndex !== -1 && networkIndex < pipeIndex) return [{ code: 'pipe-to-shell-risk', severity: 'error', message: `${name} output is piped into another command.`, hint: 'Download to a file, inspect it, then run explicitly.' }];
  return [];
}

function lintTokens(tokens: Token[]): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const token of tokens) {
    if (token.kind !== 'word' && token.kind !== 'string') continue;
    if (token.kind === 'word' && /[*?[]/.test(token.value)) diagnostics.push({ code: 'unquoted-glob', severity: 'warning', message: `Unquoted glob-like token: ${token.value}`, hint: 'Quote literal globs or narrow the path.', start: token.start, end: token.end });
    if (token.kind !== 'string' && /\$[A-Za-z_][A-Za-z0-9_]*/.test(token.value)) diagnostics.push({ code: 'unquoted-variable', severity: 'warning', message: `Variable interpolation is unquoted: ${token.value}`, hint: 'Use double quotes around variable expansions.', start: token.start, end: token.end });
    if (/`|\$\(/.test(token.value)) diagnostics.push({ code: 'command-substitution', severity: 'warning', message: 'Command substitution hides extra execution.', hint: 'Split into a named variable or explain the substitution.' });
  }
  return diagnostics;
}

function lintChains(parsed: ParsedCommand): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const operators = parsed.tokens.filter((token) => token.kind === 'operator' && ['&&', '||', ';'].includes(token.value));
  if (operators.length >= 2) diagnostics.push({ code: 'complex-chain', severity: 'warning', message: 'Command chain has multiple control operators.', hint: 'Break long chains into separate documented steps.' });
  if (parsed.source.includes('sudo') && (parsed.source.includes('curl') || parsed.source.includes('wget'))) diagnostics.push({ code: 'network-plus-privilege', severity: 'error', message: 'Network download and privileged execution appear together.', hint: 'Separate download, verification, and privileged action.' });
  return diagnostics;
}

function dedupe(diagnostics: Diagnostic[]): Diagnostic[] {
  const seen = new Set<string>();
  return diagnostics.filter((diagnostic) => {
    const key = `${diagnostic.code}:${diagnostic.message}:${diagnostic.start ?? ''}:${diagnostic.end ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
