export type TargetType = 'global' | 'project' | 'local';

export type PermissionMode = 'default' | 'acceptEdits' | 'plan' | 'auto' | 'dontAsk' | 'bypassPermissions';

export type NetworkMode = 'disabled' | 'open' | 'dev-domains';

export type WebFetchMode = 'disabled' | 'dev-docs' | 'all' | 'deny-all' | 'custom';

export type WebSearchMode = 'disabled' | 'allow' | 'ask' | 'deny';

export type AADType = 'allow' | 'ask' | 'deny';

export type AppPage = 'main' | 'aada-allow' | 'aada-ask' | 'aada-deny' | 'sandbox';

export interface SandboxConfig {
  enabled: boolean;
  failIfUnavailable: boolean;
  autoAllowBashIfSandboxed: boolean;
  allowUnsandboxedCommands: boolean;
  excludedCommands: string[];
  enableWeakerNestedSandbox: boolean;
  enableWeakerNetworkIsolation: boolean;
}

export interface FilesystemConfig {
  allowRead: string[];
  allowWrite: string[];
  denyRead: string[];
  denyWrite: string[];
}

export interface NetworkConfig {
  allowedDomains: string[];
  deniedDomains: string[];
  allowLocalBinding: boolean;
  allowAllUnixSockets: boolean;
}

export interface PermissionRules {
  allow: string[];
  ask: string[];
  deny: string[];
}

export type ToolId =
  | 'Bash'
  | 'Read'
  | 'Write'
  | 'Edit'
  | 'WebFetch'
  | 'WebSearch'
  | 'Glob'
  | 'Grep'
  | 'Mcp'
  | 'Monitor'
  | 'Task'
  | 'PowerShell'
  | 'NotebookEdit'
  | 'TodoWrite';

export interface AppState {
  targetType: TargetType;
  projectDir: string | null;
  defaultMode: PermissionMode;
  permissions: PermissionRules;
  askEnabled: boolean;
  sandbox: SandboxConfig;
  filesystem: FilesystemConfig;
  network: NetworkConfig;
  networkMode: NetworkMode;
  webfetchMode: WebFetchMode;
  webfetchCustomDomains: string[];
  websearchMode: WebSearchMode;
  agentTeamsEnabled: boolean;
  activeProfile: string | null;
}

export interface DangerItem {
  level: 'red' | 'yellow' | 'blue' | 'green';
  message: string;
  source?: string;
  impact?: string;
  suggestion?: string;
}

export interface ToolCategory {
  id: ToolId | 'Custom';
  label: string;
  description: string;
  presetRules: { label: string; rule: string }[];
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'Bash', label: 'Bash', description: 'Execute Bash shell commands',
    presetRules: [
      { label: 'pwd', rule: 'Bash(pwd)' },
      { label: 'ls *', rule: 'Bash(ls *)' },
      { label: 'find . *', rule: 'Bash(find . *)' },
      { label: 'grep *', rule: 'Bash(grep *)' },
      { label: 'which *', rule: 'Bash(which *)' },
      { label: 'echo *', rule: 'Bash(echo *)' },
      { label: 'git status', rule: 'Bash(git status)' },
      { label: 'git diff *', rule: 'Bash(git diff *)' },
      { label: 'git log *', rule: 'Bash(git log *)' },
      { label: 'npm install', rule: 'Bash(npm install)' },
      { label: 'npm run *', rule: 'Bash(npm run *)' },
      { label: 'npm test *', rule: 'Bash(npm test *)' },
      { label: 'pnpm install', rule: 'Bash(pnpm install)' },
      { label: 'pnpm run *', rule: 'Bash(pnpm run *)' },
      { label: 'yarn install', rule: 'Bash(yarn install)' },
      { label: 'yarn run *', rule: 'Bash(yarn run *)' },
      { label: 'cargo check *', rule: 'Bash(cargo check *)' },
      { label: 'cargo build *', rule: 'Bash(cargo build *)' },
      { label: 'cargo test *', rule: 'Bash(cargo test *)' },
    ],
  },
  {
    id: 'Read', label: 'Read', description: 'Read file contents',
    presetRules: [
      { label: '当前项目全部', rule: 'Read(./**)' },
      { label: '.env (deny)', rule: 'Read(./.env)' },
      { label: '.env.* (deny)', rule: 'Read(./.env.*)' },
      { label: '~/.ssh (deny)', rule: 'Read(~/.ssh/**)' },
    ],
  },
  {
    id: 'Write', label: 'Write', description: 'Create or overwrite files',
    presetRules: [
      { label: '当前项目全部', rule: 'Write(./**)' },
      { label: '.env (deny)', rule: 'Write(./.env)' },
      { label: '.env.* (deny)', rule: 'Write(./.env.*)' },
    ],
  },
  {
    id: 'Edit', label: 'Edit', description: 'Edit existing files',
    presetRules: [
      { label: '当前项目全部', rule: 'Edit(./**)' },
      { label: '.env (deny)', rule: 'Edit(./.env)' },
      { label: '.env.* (deny)', rule: 'Edit(./.env.*)' },
    ],
  },
  {
    id: 'WebFetch', label: 'WebFetch', description: 'Read web page contents',
    presetRules: [
      { label: '全部开放', rule: 'WebFetch' },
      { label: 'github.com', rule: 'WebFetch(domain:github.com)' },
      { label: 'docs.github.com', rule: 'WebFetch(domain:docs.github.com)' },
      { label: 'react.dev', rule: 'WebFetch(domain:react.dev)' },
      { label: 'vite.dev', rule: 'WebFetch(domain:vite.dev)' },
      { label: 'npmjs.com', rule: 'WebFetch(domain:npmjs.com)' },
      { label: 'nodejs.org', rule: 'WebFetch(domain:nodejs.org)' },
    ],
  },
  {
    id: 'WebSearch', label: 'WebSearch', description: 'Search the web',
    presetRules: [
      { label: '允许搜索', rule: 'WebSearch' },
    ],
  },
  {
    id: 'Glob', label: 'Glob', description: 'Match files by pattern',
    presetRules: [
      { label: '允许 Glob', rule: 'Glob' },
    ],
  },
  {
    id: 'Grep', label: 'Grep', description: 'Search file contents',
    presetRules: [
      { label: '允许 Grep', rule: 'Grep' },
    ],
  },
  {
    id: 'Mcp', label: 'MCP tools', description: 'MCP server tool calls',
    presetRules: [
      { label: '通用 MCP', rule: 'mcp__server__tool' },
    ],
  },
  {
    id: 'Monitor', label: 'Monitor', description: 'Monitor file or process changes',
    presetRules: [
      { label: '允许 Monitor', rule: 'Monitor' },
    ],
  },
  {
    id: 'Task', label: 'Task / Agent', description: 'Launch subtasks or agents',
    presetRules: [
      { label: '允许 Task', rule: 'Task' },
    ],
  },
  {
    id: 'PowerShell', label: 'PowerShell', description: 'Execute PowerShell commands',
    presetRules: [
      { label: '允许 PowerShell', rule: 'PowerShell' },
    ],
  },
  {
    id: 'NotebookEdit', label: 'NotebookEdit', description: 'Edit Jupyter Notebook',
    presetRules: [
      { label: '允许 NotebookEdit', rule: 'NotebookEdit' },
    ],
  },
  {
    id: 'TodoWrite', label: 'TodoWrite', description: 'Write to todo list',
    presetRules: [
      { label: '允许 TodoWrite', rule: 'TodoWrite' },
    ],
  },
  {
    id: 'Custom', label: 'Custom Rules', description: 'Custom rules',
    presetRules: [],
  },
];
