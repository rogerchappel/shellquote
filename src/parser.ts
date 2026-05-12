import { tokenize } from './tokenizer.js';
import type { CommandSegment, ParsedCommand, Token } from './types.js';

const CHAIN_OPERATORS = new Set(['&&', '||', ';', '|']);

export function parseCommand(source: string): ParsedCommand {
  const { tokens, errors } = tokenize(source);
  const segments: CommandSegment[] = [];
  let current: Token[] = [];
  let segmentStart = 0;
  let operatorBefore: string | undefined;

  const flush = (end: number) => {
    const meaningful = current.filter((token) => token.kind !== 'comment');
    if (meaningful.length === 0) {
      current = [];
      return;
    }
    const start = meaningful[0]?.start ?? segmentStart;
    segments.push({
      text: source.slice(start, end).trim(),
      tokens: [...meaningful],
      operatorBefore,
      start,
      end,
    });
    current = [];
    operatorBefore = undefined;
  };

  for (const token of tokens) {
    if (token.kind === 'operator' && CHAIN_OPERATORS.has(token.value)) {
      flush(token.start);
      operatorBefore = token.value;
      segmentStart = token.end;
      continue;
    }
    if (token.kind !== 'comment') current.push(token);
  }
  flush(source.length);

  return { source, tokens, segments, errors };
}

export function commandName(segment: CommandSegment): string | undefined {
  return segment.tokens.find((token) => token.kind === 'word' || token.kind === 'string')?.value;
}

export function tokenText(token: Token): string {
  if (token.kind === 'string') {
    const quote = token.quote === 'single' ? "'" : '"';
    return `${quote}${token.value}${quote}`;
  }
  return token.value;
}
