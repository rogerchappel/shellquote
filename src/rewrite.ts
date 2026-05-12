import { parseCommand, tokenText } from './parser.js';
import type { Rewrite, Token } from './types.js';

const SAFE_LITERAL = /^[A-Za-z0-9_@%+=:,./-]+$/;
const DANGEROUS_COMMANDS = new Set(['rm', 'dd', 'mkfs', 'sudo']);

export function rewriteCommand(source: string): Rewrite {
  const parsed = parseCommand(source);
  const notes: string[] = [];
  const skipped: string[] = [];
  const pieces: string[] = [];
  let changed = false;

  for (const [index, segment] of parsed.segments.entries()) {
    if (index > 0 && segment.operatorBefore) pieces.push(segment.operatorBefore);
    const command = segment.tokens[0]?.value;
    if (command && DANGEROUS_COMMANDS.has(command)) {
      skipped.push(`Skipped automatic rewrite for approval-sensitive command: ${command}`);
      pieces.push(segment.text);
      continue;
    }
    const rewritten = segment.tokens.map((token) => rewriteToken(token));
    if (rewritten.some((part, tokenIndex) => part !== tokenText(segment.tokens[tokenIndex]!))) {
      changed = true;
      notes.push(`Quoted risky tokens in: ${segment.text}`);
    }
    pieces.push(rewritten.join(' '));
  }

  const output = pieces.join(' ');
  return { changed: changed && output !== source, output: output || source, notes, skipped };
}

function rewriteToken(token: Token): string {
  if (token.kind === 'string') return tokenText(token);
  if (token.kind !== 'word') return token.value;
  if (SAFE_LITERAL.test(token.value) && !token.value.includes('*') && !token.value.includes('?')) return token.value;
  if (/^\$[A-Za-z_][A-Za-z0-9_]*$/.test(token.value)) return `"${token.value}"`;
  if (/[*?[]/.test(token.value)) return singleQuote(token.value);
  if (/\s/.test(token.value)) return singleQuote(token.value);
  return token.value;
}

function singleQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}
