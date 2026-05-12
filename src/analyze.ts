import { shellLinesFromMarkdown } from './markdown.js';
import { parseCommand } from './parser.js';
import { rewriteCommand } from './rewrite.js';
import { lintParsed } from './rules.js';
import { countFindings } from './severity.js';
import type { ExplainResult } from './types.js';

export function explainCommand(input: string, options: { includeRewrite?: boolean } = {}): ExplainResult {
  const parsed = parseCommand(input);
  const diagnostics = lintParsed(parsed);
  const counts = countFindings(diagnostics);
  const summary = summarize(input, diagnostics.length, parsed.segments.length);
  return { input, summary: `${summary} (${counts.error} error, ${counts.warning} warning, ${counts.info} info)`, parsed, diagnostics, rewrite: options.includeRewrite ? rewriteCommand(input) : undefined };
}

export function lintCommand(input: string): ExplainResult {
  return explainCommand(input, { includeRewrite: false });
}

export function analyzeMarkdown(markdown: string): ExplainResult[] {
  return shellLinesFromMarkdown(markdown).map((line) => explainCommand(line, { includeRewrite: true }));
}

function summarize(input: string, diagnosticCount: number, segmentCount: number): string {
  if (input.trim() === '') return 'Empty command.';
  const noun = segmentCount === 1 ? 'segment' : 'segments';
  if (diagnosticCount === 0) return `Looks straightforward: ${segmentCount} ${noun}, no findings.`;
  return `Found ${diagnosticCount} finding${diagnosticCount === 1 ? '' : 's'} across ${segmentCount} ${noun}.`;
}
