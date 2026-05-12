import type { Severity } from './types.js';

export interface ShellquoteConfig {
  severity: Partial<Record<string, Severity>>;
  allowedNetworkHosts: string[];
}

export const defaultConfig: ShellquoteConfig = {
  severity: {},
  allowedNetworkHosts: [],
};

export function mergeConfig(config: Partial<ShellquoteConfig> = {}): ShellquoteConfig {
  return {
    severity: { ...defaultConfig.severity, ...(config.severity ?? {}) },
    allowedNetworkHosts: [...(config.allowedNetworkHosts ?? defaultConfig.allowedNetworkHosts)],
  };
}
