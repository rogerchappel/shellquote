export type Severity = 'info' | 'warning' | 'error';

export type TokenKind = 'word' | 'string' | 'operator' | 'comment';

export interface Token {
  kind: TokenKind;
  value: string;
  quote?: 'single' | 'double';
  start: number;
  end: number;
}

export interface CommandSegment {
  text: string;
  tokens: Token[];
  operatorBefore?: string;
  start: number;
  end: number;
}

export interface ParsedCommand {
  source: string;
  segments: CommandSegment[];
  tokens: Token[];
  errors: Diagnostic[];
}

export interface Diagnostic {
  code: string;
  severity: Severity;
  message: string;
  hint?: string;
  start?: number;
  end?: number;
  segment?: string;
}

export interface Rewrite {
  changed: boolean;
  output: string;
  notes: string[];
  skipped: string[];
}

export interface ExplainResult {
  input: string;
  summary: string;
  parsed: ParsedCommand;
  diagnostics: Diagnostic[];
  rewrite?: Rewrite;
}

export interface CliOptions {
  format: 'text' | 'json' | 'markdown';
  docs: boolean;
  fix: boolean;
  stdin: boolean;
  file?: string;
}
