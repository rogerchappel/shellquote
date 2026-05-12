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
  let current: { language: string; startLine: number; lines: string[] } | undefined;

  lines.forEach((line, index) => {
    const fence = line.match(/^```\s*([A-Za-z0-9_-]*)/);
    if (fence) {
      if (current) {
        if (isShellLanguage(current.language)) blocks.push({ language: current.language, code: current.lines.join('\n'), startLine: current.startLine, endLine: index + 1 });
        current = undefined;
      } else {
        current = { language: fence[1] ?? '', startLine: index + 1, lines: [] };
      }
      return;
    }
    current?.lines.push(line);
  });
  return blocks;
}

export function shellLinesFromMarkdown(markdown: string): string[] {
  return extractShellBlocks(markdown).flatMap((block) => block.code.split(/\r?\n/)).map((line) => line.replace(/^\$\s*/, '').trim()).filter(Boolean).filter((line) => !line.startsWith('#'));
}

function isShellLanguage(language: string): boolean {
  return language === '' || SHELL_LANGS.has(language.toLowerCase());
}
