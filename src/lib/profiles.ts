import { AppState } from './types';
import { defaultAllowRules, defaultDenyRules, defaultSandbox, defaultFilesystem, defaultNetwork } from './defaults';

export type ProfileId = 'safe' | 'dev-net' | 'strict' | 'custom';

interface ProfileDef {
  id: ProfileId;
  name: string;
  description: string;
  apply?: (state: AppState) => AppState;
}

export const profiles: ProfileDef[] = [
  {
    id: 'safe',
    name: 'Safe Offline Mode',
    description: 'Sandbox enabled, network disabled, only project read/write allowed',
    apply: (state) => ({
      ...state,
      defaultMode: 'acceptEdits',
      sandbox: { ...defaultSandbox, enabled: true },
      filesystem: { ...defaultFilesystem },
      network: { allowedDomains: [], deniedDomains: ['*'], allowLocalBinding: true, allowAllUnixSockets: false },
      networkMode: 'disabled',
      webfetchMode: 'disabled',
      webfetchCustomDomains: [],
      websearchMode: 'deny',
      askEnabled: true,
      agentTeamsEnabled: true,
      permissions: {
        allow: ['Read(./**)', 'Edit(./**)', 'Write(./**)', 'Bash(pwd)', 'Bash(ls *)', 'Bash(find . *)', 'Bash(grep *)', 'Bash(echo *)', 'Bash(git status)', 'Bash(git diff *)', 'Bash(git log *)', 'Glob', 'Grep'],
        ask: ['Bash', 'Task', 'Monitor'],
        deny: [...defaultDenyRules, 'WebFetch', 'WebSearch', 'PowerShell', 'mcp__server__tool'],
      },
      activeProfile: 'safe',
    }),
  },
  {
    id: 'dev-net',
    name: 'Open Network Dev Mode',
    description: 'Sandbox enabled, network open, allow common dev commands',
    apply: (state) => ({
      ...state,
      defaultMode: 'acceptEdits',
      sandbox: { ...defaultSandbox, enabled: true },
      filesystem: { ...defaultFilesystem },
      network: { ...defaultNetwork, allowedDomains: ['*'] },
      networkMode: 'open',
      webfetchMode: 'dev-docs',
      webfetchCustomDomains: [],
      websearchMode: 'ask',
      askEnabled: true,
      agentTeamsEnabled: true,
      permissions: {
        allow: [...defaultAllowRules, 'Glob', 'Grep', 'Monitor', 'Task', 'WebFetch(domain:github.com)', 'WebFetch(domain:docs.github.com)', 'WebFetch(domain:tauri.app)', 'WebFetch(domain:react.dev)', 'WebFetch(domain:vite.dev)', 'WebFetch(domain:typescriptlang.org)', 'WebFetch(domain:npmjs.com)', 'WebFetch(domain:docs.npmjs.com)', 'WebFetch(domain:nodejs.org)'],
        ask: ['PowerShell', 'mcp__server__tool'],
        deny: [...defaultDenyRules],
      },
      activeProfile: 'dev-net',
    }),
  },
  {
    id: 'strict',
    name: 'Strict Review Mode',
    description: 'Read-only, no dependency install, no network access',
    apply: (state) => ({
      ...state,
      defaultMode: 'acceptEdits',
      sandbox: { ...defaultSandbox, enabled: true },
      filesystem: { ...defaultFilesystem },
      network: { allowedDomains: [], deniedDomains: ['*'], allowLocalBinding: true, allowAllUnixSockets: false },
      networkMode: 'disabled',
      webfetchMode: 'disabled',
      webfetchCustomDomains: [],
      websearchMode: 'deny',
      askEnabled: false,
      agentTeamsEnabled: false,
      permissions: {
        allow: ['Read(./**)', 'Bash(pwd)', 'Bash(ls *)', 'Bash(find . *)', 'Bash(grep *)', 'Bash(git status)', 'Bash(git diff *)', 'Bash(git log *)', 'Glob', 'Grep'],
        ask: [],
        deny: [...defaultDenyRules, 'Bash(npm install)', 'Bash(pnpm install)', 'Bash(yarn install)', 'Bash(cargo build *)', 'Edit', 'Write', 'WebFetch', 'WebSearch', 'Task', 'PowerShell', 'mcp__server__tool', 'Monitor'],
      },
      activeProfile: 'strict',
    }),
  },
  {
    id: 'custom',
    name: 'Custom Mode',
    description: 'Freely combine permissions, sandbox, network, WebFetch, AAD rules',
  },
];

export function applyProfile(state: AppState, profileId: ProfileId): AppState {
  const profile = profiles.find((p) => p.id === profileId);
  if (!profile || !profile.apply) return { ...state, activeProfile: profileId };
  return profile.apply(state);
}
