import { parseCommand, tokenText } from './parser.js';
import { resolveExecutable } from './executable.js';
import type { Rewrite, Token } from './types.js';

const SAFE_LITERAL = /^[A-Za-z0-9_@%+=:,./-]+$/;
const DANGEROUS_COMMANDS = new Set(['rm', 'dd', 'mkfs', 'sudo']);

export function rewriteCommand(source: string): Rewrite {
  const parsed = parseCommand(source);
  const notes: string[] = [];
  const skipped: string[] = [];
  const replacements = new Map<Token, string>();

  for (const segment of parsed.segments) {
    const command = resolveExecutable(segment.tokens)?.name;
    if (command && DANGEROUS_COMMANDS.has(command)) {
      skipped.push(`Skipped automatic rewrite for approval-sensitive command: ${command}`);
      continue;
    }
    let segmentChanged = false;
    for (const token of segment.tokens) {
      const rewritten = rewriteToken(token);
      if (rewritten !== source.slice(token.start, token.end)) {
        replacements.set(token, rewritten);
        segmentChanged = true;
      }
    }
    if (segmentChanged) {
      notes.push(`Quoted risky tokens in: ${segment.text}`);
    }
  }

  let cursor = 0;
  let output = '';
  for (const token of parsed.tokens) {
    const replacement = replacements.get(token);
    if (replacement === undefined) continue;
    output += source.slice(cursor, token.start);
    output += replacement;
    cursor = token.end;
  }
  output += source.slice(cursor);

  return { changed: output !== source, output, notes, skipped };
}

function rewriteToken(token: Token): string {
  if (token.kind === 'string') return tokenText(token);
  if (token.kind !== 'word') return token.value;
  if (SAFE_LITERAL.test(token.value) && !token.value.includes('*') && !token.value.includes('?')) return token.value;
  if (/^\$(?:[A-Za-z_][A-Za-z0-9_]*|\{[A-Za-z_][A-Za-z0-9_]*\}|[0-9@*#?$!\-])$/.test(token.value)) return `"${token.value}"`;
  if (/[*?[]/.test(token.value)) return singleQuote(token.value);
  if (/\s/.test(token.value)) return singleQuote(token.value);
  return token.value;
}

function singleQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}
