import type { Diagnostic, Token } from './types.js';

const OPERATORS = ['&&', '||', '>>', '<<', '|', ';', '>', '<'];

export interface TokenizeResult {
  tokens: Token[];
  errors: Diagnostic[];
}

export function tokenize(source: string): TokenizeResult {
  const tokens: Token[] = [];
  const errors: Diagnostic[] = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === '#') {
      tokens.push({ kind: 'comment', value: source.slice(i), start: i, end: source.length });
      break;
    }
    const op = OPERATORS.find((candidate) => source.startsWith(candidate, i));
    if (op) {
      tokens.push({ kind: 'operator', value: op, start: i, end: i + op.length });
      i += op.length;
      continue;
    }
    if (ch === '\'' || ch === '"') {
      const quote = ch;
      const start = i;
      i += 1;
      let value = '';
      let closed = false;
      while (i < source.length) {
        const current = source[i];
        if (current === '\\' && quote === '"' && i + 1 < source.length) {
          value += source.slice(i, i + 2);
          i += 2;
          continue;
        }
        if (current === quote) {
          closed = true;
          i += 1;
          break;
        }
        value += current;
        i += 1;
      }
      tokens.push({ kind: 'string', value, quote: quote === '\'' ? 'single' : 'double', start, end: i });
      if (!closed) {
        errors.push({ code: 'unterminated-quote', severity: 'error', message: `Unterminated ${quote === '\'' ? 'single' : 'double'} quote.`, start, end: i });
      }
      continue;
    }
    const start = i;
    let value = '';
    while (i < source.length) {
      const current = source[i];
      if (/\s/.test(current) || current === '#' || OPERATORS.some((candidate) => source.startsWith(candidate, i))) break;
      if (current === '\\' && i + 1 < source.length) {
        value += source.slice(i, i + 2);
        i += 2;
        continue;
      }
      value += current;
      i += 1;
    }
    tokens.push({ kind: 'word', value, start, end: i });
  }
  return { tokens, errors };
}
