import { AppState, PermissionRules, SandboxConfig, FilesystemConfig, NetworkConfig, WebSearchMode } from './types';

export const defaultAllowRules: string[] = [
  'Read(./**)',
  'Edit(./**)',
  'Write(./**)',
  'Bash(pwd)',
  'Bash(ls *)',
  'Bash(find . *)',
  'Bash(grep *)',
  'Bash(which *)',
  'Bash(echo *)',
  'Bash(git status)',
  'Bash(git diff *)',
  'Bash(git log *)',
  'Bash(npm install)',
  'Bash(npm run *)',
  'Bash(npm test *)',
  'Bash(pnpm install)',
  'Bash(pnpm run *)',
  'Bash(yarn install)',
  'Bash(yarn run *)',
  'Bash(cargo check *)',
  'Bash(cargo build *)',
  'Bash(cargo test *)',
];

export const defaultAskRules: string[] = [];

export const defaultDenyRules: string[] = [
  'Read(./.env)',
  'Read(./.env.*)',
  'Read(./**/.env)',
  'Read(./**/.env.*)',
  'Read(~/.ssh/**)',
  'Read(~/.aws/**)',
  'Read(~/.docker/**)',
  'Read(~/.config/gh/**)',
  'Read(~/.kube/**)',
  'Edit(./.env)',
  'Edit(./.env.*)',
  'Write(./.env)',
  'Write(./.env.*)',
  'Bash(sudo *)',
  'Bash(su *)',
  'Bash(rm -rf /)',
  'Bash(rm -rf ~)',
  'Bash(rm -rf ./*)',
  'Bash(git push *)',
  'Bash(git push --force*)',
  'Bash(git reset --hard *)',
  'Bash(git clean -fd *)',
  'Bash(ssh *)',
  'Bash(scp *)',
  'Bash(rsync *)',
  'Bash(docker run --privileged *)',
  'Bash(docker system prune *)',
  'Bash(docker volume rm *)',
  'Bash(docker compose down -v *)',
];

export const defaultSandbox: SandboxConfig = {
  enabled: true,
  failIfUnavailable: true,
  autoAllowBashIfSandboxed: true,
  allowUnsandboxedCommands: false,
  excludedCommands: [],
  enableWeakerNestedSandbox: false,
  enableWeakerNetworkIsolation: false,
};

export const defaultFilesystem: FilesystemConfig = {
  allowRead: ['.'],
  allowWrite: ['.', '/tmp/claude-501', '/private/tmp/claude-501'],
  denyRead: ['~/.ssh', '~/.aws', '~/.docker', '~/.config/gh', '~/.kube'],
  denyWrite: ['~/.ssh', '~/.aws', '~/.docker', '~/.config/gh', '~/.kube'],
};

export const defaultNetwork: NetworkConfig = {
  allowedDomains: ['*'],
  deniedDomains: [],
  allowLocalBinding: true,
  allowAllUnixSockets: false,
};

export const devDomains: string[] = [
  'registry.npmjs.org',
  '*.npmjs.org',
  'registry.yarnpkg.com',
  'github.com',
  '*.github.com',
  'objects.githubusercontent.com',
  'pypi.org',
  'files.pythonhosted.org',
  'crates.io',
  'index.crates.io',
  'static.crates.io',
];

export const devWebFetchDomains: string[] = [
  'github.com',
  'docs.github.com',
  'tauri.app',
  'react.dev',
  'vite.dev',
  'typescriptlang.org',
  'npmjs.com',
  'docs.npmjs.com',
  'nodejs.org',
];

export function createDefaultState(): AppState {
  return {
    targetType: 'local',
    projectDir: null,
    defaultMode: 'acceptEdits',
    permissions: {
      allow: [...defaultAllowRules],
      ask: [...defaultAskRules],
      deny: [...defaultDenyRules],
    },
    askEnabled: true,
    agentTeamsEnabled: false,
    sandbox: {
      enabled: true,
      failIfUnavailable: true,
      autoAllowBashIfSandboxed: true,
      allowUnsandboxedCommands: false,
      excludedCommands: [],
      enableWeakerNestedSandbox: false,
      enableWeakerNetworkIsolation: false,
    },
    filesystem: {
      allowRead: [...defaultFilesystem.allowRead],
      allowWrite: [...defaultFilesystem.allowWrite],
      denyRead: [...defaultFilesystem.denyRead],
      denyWrite: [...defaultFilesystem.denyWrite],
    },
    network: { ...defaultNetwork },
    networkMode: 'open',
    webfetchMode: 'dev-docs',
    webfetchCustomDomains: [],
    websearchMode: 'disabled',
    activeProfile: null,
  };
}
