import { AppState } from './types';
import { devWebFetchDomains, devDomains } from './defaults';

function removeRules(list: string[], predicate: (r: string) => boolean): string[] {
  return list.filter((r) => !predicate(r));
}

export function generateSettingsJson(state: AppState): Record<string, unknown> {
  const result: Record<string, unknown> = {
    $schema: 'https://json.schemastore.org/claude-code-settings.json',
  };

  let filteredAllow = [...state.permissions.allow];
  let filteredAsk = [...state.permissions.ask];
  let filteredDeny = [...state.permissions.deny];

  // --- WebFetch: clean all WebFetch rules first, then apply current mode ---
  const isWebFetchRule = (r: string) => r === 'WebFetch' || r.startsWith('WebFetch(domain:');
  filteredAllow = removeRules(filteredAllow, isWebFetchRule);
  filteredAsk = removeRules(filteredAsk, isWebFetchRule);
  filteredDeny = removeRules(filteredDeny, isWebFetchRule);

  if (state.webfetchMode === 'all') {
    filteredAllow.push('WebFetch');
  } else if (state.webfetchMode === 'dev-docs') {
    for (const domain of devWebFetchDomains) {
      const rule = `WebFetch(domain:${domain})`;
      if (!filteredAllow.includes(rule)) {
        filteredAllow.push(rule);
      }
    }
  } else if (state.webfetchMode === 'deny-all') {
    filteredDeny.push('WebFetch');
  } else if (state.webfetchMode === 'custom') {
    for (const domain of state.webfetchCustomDomains) {
      const rule = `WebFetch(domain:${domain})`;
      if (!filteredAllow.includes(rule)) {
        filteredAllow.push(rule);
      }
    }
  }
  // disabled: do nothing (rules already removed)

  // --- WebSearch: clean all WebSearch rules first, then apply current mode ---
  const isWebSearchRule = (r: string) => r === 'WebSearch';
  filteredAllow = removeRules(filteredAllow, isWebSearchRule);
  filteredAsk = removeRules(filteredAsk, isWebSearchRule);
  filteredDeny = removeRules(filteredDeny, isWebSearchRule);

  if (state.websearchMode === 'allow') {
    filteredAllow.push('WebSearch');
  } else if (state.websearchMode === 'ask') {
    filteredAsk.push('WebSearch');
  } else if (state.websearchMode === 'deny') {
    filteredDeny.push('WebSearch');
  }
  // disabled: do nothing (rules already removed)

  // --- Dedup: ensure no rule appears in multiple lists ---
  const allowSet = new Set(filteredAllow);
  const askSet = new Set(filteredAsk);
  const denySet = new Set(filteredDeny);

  // Remove from allow if in deny
  for (const r of denySet) {
    allowSet.delete(r);
    askSet.delete(r);
  }
  // Remove from ask if in allow
  for (const r of allowSet) {
    askSet.delete(r);
  }

  // --- Build permissions ---
  result.permissions = {
    defaultMode: state.defaultMode,
    allow: [...allowSet],
  };

  if (state.askEnabled && askSet.size > 0) {
    (result.permissions as Record<string, unknown>).ask = [...askSet];
  }
  if (denySet.size > 0) {
    (result.permissions as Record<string, unknown>).deny = [...denySet];
  }

  // sandbox
  const sandboxObj: Record<string, unknown> = {
    enabled: state.sandbox.enabled,
    failIfUnavailable: state.sandbox.failIfUnavailable,
    autoAllowBashIfSandboxed: state.sandbox.autoAllowBashIfSandboxed,
    allowUnsandboxedCommands: state.sandbox.allowUnsandboxedCommands,
  };

  if (state.sandbox.excludedCommands.length > 0) {
    sandboxObj.excludedCommands = state.sandbox.excludedCommands;
  }

  if (state.sandbox.enableWeakerNestedSandbox) {
    sandboxObj.enableWeakerNestedSandbox = true;
  }
  if (state.sandbox.enableWeakerNetworkIsolation) {
    sandboxObj.enableWeakerNetworkIsolation = true;
  }

  // filesystem
  sandboxObj.filesystem = {
    allowRead: state.filesystem.allowRead,
    allowWrite: state.filesystem.allowWrite,
    denyRead: state.filesystem.denyRead,
    denyWrite: state.filesystem.denyWrite,
  };

  // network
  let networkConfig: Record<string, unknown>;
  if (state.networkMode === 'disabled') {
    networkConfig = {
      allowedDomains: [],
      deniedDomains: ['*'],
      allowLocalBinding: state.network.allowLocalBinding,
      allowAllUnixSockets: state.network.allowAllUnixSockets,
    };
  } else if (state.networkMode === 'dev-domains') {
    networkConfig = {
      allowedDomains: devDomains,
      deniedDomains: [],
      allowLocalBinding: state.network.allowLocalBinding,
      allowAllUnixSockets: state.network.allowAllUnixSockets,
    };
  } else {
    networkConfig = {
      allowedDomains: ['*'],
      deniedDomains: [],
      allowLocalBinding: state.network.allowLocalBinding,
      allowAllUnixSockets: state.network.allowAllUnixSockets,
    };
  }
  sandboxObj.network = networkConfig;

  result.sandbox = sandboxObj;

  // --- Agent Teams env ---
  if (state.agentTeamsEnabled) {
    result.env = {
      CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: '1',
    };
  }

  return result;
}
