import type { Token } from './types.js';

const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;
const WRAPPER_OPTIONS_WITH_VALUES: Record<string, Set<string>> = {
  env: new Set(['-u', '--unset', '-C', '--chdir', '-S', '--split-string']),
  sudo: new Set(['-C', '--close-from', '-D', '--chdir', '-g', '--group', '-h', '--host', '-p', '--prompt', '-R', '--chroot', '-T', '--command-timeout', '-u', '--user']),
};

export interface ResolvedExecutable {
  name: string;
  value: string;
  tokenIndex: number;
  wrappers: string[];
}

export function resolveExecutable(tokens: Token[]): ResolvedExecutable | undefined {
  const wrappers: string[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token || (token.kind !== 'word' && token.kind !== 'string')) continue;
    if (token.kind === 'word' && ASSIGNMENT.test(token.value)) continue;
    const name = commandBasename(token.value);
    const optionsWithValues = WRAPPER_OPTIONS_WITH_VALUES[name];
    if (!optionsWithValues) return { name, value: token.value, tokenIndex: index, wrappers };
    wrappers.push(name);
    for (index += 1; index < tokens.length; index += 1) {
      const argument = tokens[index];
      if (!argument || (argument.kind !== 'word' && argument.kind !== 'string')) continue;
      if (argument.kind === 'word' && ASSIGNMENT.test(argument.value)) continue;
      if (argument.value === '--') break;
      if (argument.kind === 'word' && optionsWithValues.has(argument.value)) {
        index += 1;
        continue;
      }
      if (argument.kind === 'word' && argument.value.startsWith('-')) continue;
      index -= 1;
      break;
    }
  }
  return undefined;
}

function commandBasename(command: string): string {
  return command.replace(/\\/g, '/').split('/').pop()?.toLowerCase().replace(/\.exe$/, '') ?? '';
}
