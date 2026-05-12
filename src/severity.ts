import type { Diagnostic, FindingCounts, Severity } from './types.js';

const RANK: Record<Severity, number> = { info: 0, warning: 1, error: 2 };

export function compareSeverity(left: Severity, right: Severity): number {
  return RANK[left] - RANK[right];
}

export function countFindings(diagnostics: Diagnostic[]): FindingCounts {
  return diagnostics.reduce<FindingCounts>((counts, diagnostic) => {
    counts[diagnostic.severity] += 1;
    return counts;
  }, { info: 0, warning: 0, error: 0 });
}

export function hasError(diagnostics: Diagnostic[]): boolean {
  return diagnostics.some((diagnostic) => diagnostic.severity === 'error');
}
