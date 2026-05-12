import { suggestedAction } from './suggest.js';
import type { Diagnostic, ExplainResult } from './types.js';

export function formatResult(result: ExplainResult, format: 'text' | 'json' | 'markdown'): string {
  if (format === 'json') return JSON.stringify(result, null, 2);
  if (format === 'markdown') return formatMarkdown(result);
  return formatText(result);
}

export function formatMany(results: ExplainResult[], format: 'text' | 'json' | 'markdown'): string {
  if (format === 'json') return JSON.stringify(results, null, 2);
  return results.map((result) => formatResult(result, format)).join(format === 'markdown' ? '\n\n' : '\n---\n');
}

function formatText(result: ExplainResult): string {
  const lines = [`shellquote: ${result.summary}`, `input: ${result.input}`];
  for (const [index, segment] of result.parsed.segments.entries()) lines.push(`segment ${index + 1}: ${segment.text}`);
  if (result.diagnostics.length === 0) lines.push('findings: none');
  for (const diagnostic of result.diagnostics) lines.push(renderDiagnostic(diagnostic));
  if (result.rewrite) {
    lines.push(`rewrite: ${result.rewrite.changed ? result.rewrite.output : 'no safe rewrite needed'}`);
    result.rewrite.notes.forEach((note) => lines.push(`note: ${note}`));
    result.rewrite.skipped.forEach((skip) => lines.push(`skip: ${skip}`));
  }
  return lines.join('\n');
}

function formatMarkdown(result: ExplainResult): string {
  const lines = [`### shellquote`, '', `- **Input:** \`${escapePipes(result.input)}\``, `- **Summary:** ${result.summary}`];
  if (result.diagnostics.length > 0) {
    lines.push('', '| Severity | Code | Message | Hint |', '| --- | --- | --- | --- |');
    for (const diagnostic of result.diagnostics) lines.push(`| ${diagnostic.severity} | \`${diagnostic.code}\` | ${escapePipes(diagnostic.message)} | ${escapePipes(diagnostic.hint ?? '')} |`);
  }
  if (result.rewrite) lines.push('', `**Rewrite:** \`${escapePipes(result.rewrite.output)}\``);
  return lines.join('\n');
}

function renderDiagnostic(diagnostic: Diagnostic): string {
  return `${diagnostic.severity.toUpperCase()} ${diagnostic.code}: ${diagnostic.message} (${suggestedAction(diagnostic)})`;
}

function escapePipes(value: string): string {
  return value.replaceAll('|', '\\|');
}
