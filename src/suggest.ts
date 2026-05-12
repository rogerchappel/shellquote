import type { Diagnostic } from './types.js';

const ACTIONS: Record<string, string> = {
  'unquoted-variable': 'Quote variable expansions, for example "$NAME".',
  'unquoted-glob': 'Quote literal globs or narrow the path before running.',
  'destructive-command': 'Require human review and avoid chaining with downloads.',
  'recursive-remove': 'Preview targets and prefer a narrower directory.',
  'pipe-to-shell-risk': 'Download, inspect, then execute explicitly.',
  'network-plus-privilege': 'Separate network, verification, and privileged steps.',
};

export function suggestedAction(diagnostic: Diagnostic): string {
  return diagnostic.hint ?? ACTIONS[diagnostic.code] ?? 'Review this command before copying it.';
}
