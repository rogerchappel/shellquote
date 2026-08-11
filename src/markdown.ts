export interface CodeBlock {
  language: string;
  code: string;
  startLine: number;
  endLine: number;
}

const SHELL_LANGS = new Set(['sh', 'bash', 'shell', 'zsh', 'console', 'terminal']);

export function extractShellBlocks(markdown: string): CodeBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: CodeBlock[] = [];
  let current: { language: string; startLine: number; marker: '`' | '~'; length: number; lines: string[] } | undefined;

  lines.forEach((line, index) => {
    if (current) {
      const closingFence = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
      if (closingFence && closingFence[1]?.[0] === current.marker && closingFence[1].length >= current.length) {
        if (isShellLanguage(current.language)) blocks.push({ language: current.language, code: current.lines.join('\n'), startLine: current.startLine, endLine: index + 1 });
        current = undefined;
        return;
      }
      current.lines.push(line);
      return;
    }

    const openingFence = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*([^ \t]*)/);
    if (!openingFence) return;
    const marker = openingFence[1]?.[0];
    const info = openingFence[2] ?? '';
    if ((marker !== '`' && marker !== '~') || (marker === '`' && info.includes('`'))) return;
    current = { language: info, startLine: index + 1, marker, length: openingFence[1].length, lines: [] };
  });
  return blocks;
}

export function shellLinesFromMarkdown(markdown: string): string[] {
  return extractShellBlocks(markdown).flatMap((block) => logicalShellLines(block.code));
}

function logicalShellLines(code: string): string[] {
  const commands: string[] = [];
  let continued = '';

  for (const physicalLine of code.split(/\r?\n/)) {
    const line = physicalLine.replace(/^\s*(?:\$|>)\s*/, '').trim();
    if (!continued && (!line || line.startsWith('#'))) continue;

    const trailingBackslashes = line.match(/\\+$/)?.[0].length ?? 0;
    const hasContinuation = trailingBackslashes % 2 === 1;
    const part = hasContinuation ? line.slice(0, -1).trimEnd() : line;
    continued = [continued, part].filter(Boolean).join(' ');

    if (!hasContinuation) {
      if (continued) commands.push(continued);
      continued = '';
    }
  }

  if (continued) commands.push(continued);
  return commands;
}

function isShellLanguage(language: string): boolean {
  return language === '' || SHELL_LANGS.has(language.toLowerCase());
}
