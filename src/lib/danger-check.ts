import { AppState, DangerItem } from './types';

export function calcScore(state: AppState, dangers: DangerItem[]): number {
  let score = 100;

  // High risk: -18 each
  const reds = dangers.filter((d) => d.level === 'red').length;
  score -= reds * 18;

  // Medium risk: -8 each
  const yellows = dangers.filter((d) => d.level === 'yellow').length;
  score -= yellows * 8;

  // Low risk: -3 each
  const blues = dangers.filter((d) => d.level === 'blue').length;
  score -= blues * 3;

  // Safety bonuses: +2 each, max +10
  const greens = dangers.filter((d) => d.level === 'green').length;
  score += Math.min(greens * 2, 10);

  return Math.max(0, Math.min(100, score));
}

export function scanDangerousConfig(state: AppState, t?: (key: string) => string): DangerItem[] {
  const items: DangerItem[] = [];

  const tr = (key: string, fallback: string) => t ? t(key) : fallback;

  // ===== HIGH RISK (-18 each) =====

  // defaultMode = bypassPermissions
  if (state.defaultMode === 'bypassPermissions') {
    items.push({
      level: 'red',
      message: tr('risk.msg.bypassPermissions', 'defaultMode is bypassPermissions — all permission checks are bypassed'),
      source: 'defaultMode',
      impact: tr('risk.impact.bypassAll', 'All tool calls execute without permission checks'),
      suggestion: tr('risk.sugg.bypassPermissions', 'Use acceptEdits or auto mode instead'),
    });
  }

  // sandbox disabled
  if (!state.sandbox.enabled) {
    items.push({
      level: 'red',
      message: tr('risk.msg.sandboxDisabled', 'Sandbox is disabled — no filesystem isolation'),
      source: 'sandbox.enabled',
      impact: tr('risk.impact.noIsolation', 'Tools can read/write outside project directory'),
      suggestion: tr('risk.sugg.enableSandbox', 'Enable sandbox for filesystem isolation'),
    });
  }

  // allowUnsandboxedCommands
  if (state.sandbox.allowUnsandboxedCommands) {
    items.push({
      level: 'red',
      message: tr('risk.msg.allowUnsandboxed', 'allowUnsandboxedCommands is enabled'),
      source: 'sandbox.allowUnsandboxedCommands',
      impact: tr('risk.impact.unsandboxed', 'Commands can bypass sandbox restrictions'),
      suggestion: tr('risk.sugg.disableUnsandboxed', 'Disable allowUnsandboxedCommands'),
    });
  }

  for (const rule of state.permissions.allow) {
    // Agent in allow
    if (rule === 'Agent') {
      items.push({
        level: 'red',
        message: tr('risk.msg.agentAllowed', 'Agent is allowed — can launch autonomous sub-agents'),
        source: 'permissions.allow',
        impact: tr('risk.impact.agentAuto', 'Agent can execute arbitrary tool chains autonomously'),
        suggestion: tr('risk.sugg.moveAgentToAsk', 'Move Agent to Ask for review before execution'),
      });
    }

    // Bash(*) — arbitrary bash
    if (rule === 'Bash' || rule === 'Bash(*)') {
      items.push({
        level: 'red',
        message: tr('risk.msg.bashAll', `High risk: ${rule} — allows executing any Bash command`).replace('{rule}', rule),
        source: 'permissions.allow',
        impact: tr('risk.impact.arbitraryBash', 'Can run any shell command including rm, sudo, curl'),
        suggestion: tr('risk.sugg.restrictBash', 'Use specific Bash rules like Bash(git *) instead'),
      });
    }

    // Bash(rm -rf *)
    if (rule.includes('rm -rf')) {
      items.push({
        level: 'red',
        message: tr('risk.msg.bashRmRf', `Dangerous: ${rule} — allows recursive deletion`).replace('{rule}', rule),
        source: 'permissions.allow',
        impact: tr('risk.impact.dataLoss', 'Can permanently delete files and directories'),
        suggestion: tr('risk.sugg.removeRmRf', 'Remove this rule or move to deny'),
      });
    }

    // Bash(sudo *)
    if (rule.includes('sudo')) {
      items.push({
        level: 'red',
        message: tr('risk.msg.bashSudo', `Dangerous: ${rule} — allows root-level commands`).replace('{rule}', rule),
        source: 'permissions.allow',
        impact: tr('risk.impact.rootAccess', 'Can execute commands with root privileges'),
        suggestion: tr('risk.sugg.removeSudo', 'Remove sudo from allow rules'),
      });
    }

    // Read(~/.ssh/**)
    if (rule.includes('~/.ssh')) {
      items.push({
        level: 'red',
        message: tr('risk.msg.readSsh', `Sensitive: ${rule} — can read SSH keys`).replace('{rule}', rule),
        source: 'permissions.allow',
        impact: tr('risk.impact.sshExposure', 'SSH private keys could be exposed'),
        suggestion: tr('risk.sugg.denySsh', 'Move to deny or remove from allow'),
      });
    }

    // Read(~/.aws/**)
    if (rule.includes('~/.aws')) {
      items.push({
        level: 'red',
        message: tr('risk.msg.readAws', `Sensitive: ${rule} — can read AWS credentials`).replace('{rule}', rule),
        source: 'permissions.allow',
        impact: tr('risk.impact.awsExposure', 'AWS credentials could be exposed'),
        suggestion: tr('risk.sugg.denyAws', 'Move to deny or remove from allow'),
      });
    }

    // Write(~/.ssh/**)
    if (rule.startsWith('Write(') && rule.includes('~/.ssh')) {
      items.push({
        level: 'red',
        message: tr('risk.msg.writeSsh', `Critical: ${rule} — can modify SSH keys`).replace('{rule}', rule),
        source: 'permissions.allow',
        impact: tr('risk.impact.sshModification', 'SSH keys could be modified or replaced'),
        suggestion: tr('risk.sugg.denyWriteSsh', 'Remove immediately — never allow write to SSH'),
      });
    }

    // Write(~/.aws/**)
    if (rule.startsWith('Write(') && rule.includes('~/.aws')) {
      items.push({
        level: 'red',
        message: tr('risk.msg.writeAws', `Critical: ${rule} — can modify AWS credentials`).replace('{rule}', rule),
        source: 'permissions.allow',
        impact: tr('risk.impact.awsModification', 'AWS credentials could be modified or replaced'),
        suggestion: tr('risk.sugg.denyWriteAws', 'Remove immediately — never allow write to AWS'),
      });
    }
  }

  // ===== MEDIUM RISK (-8 each) =====

  // Agent Teams experimental env
  if (state.agentTeamsEnabled) {
    items.push({
      level: 'yellow',
      message: tr('risk.msg.agentTeamsEnabled', 'Agent Teams enabled — experimental multi-session agent coordination'),
      source: 'env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS',
      impact: tr('risk.impact.agentTeams', 'Experimental feature with broader coordination and permission surface'),
      suggestion: tr('risk.sugg.disableAgentTeams', 'Disable unless specifically needed for team workflows'),
    });
  }

  // WebFetch allow-all
  if (state.webfetchMode === 'all') {
    items.push({
      level: 'yellow',
      message: tr('risk.msg.webfetchOpen', 'WebFetch fully open — can read any webpage'),
      source: 'webfetchMode',
      impact: tr('risk.impact.anyWebpage', 'Can fetch and read content from any URL'),
      suggestion: tr('risk.sugg.useDevDocs', 'Use dev-docs mode for common development sites'),
    });
  }

  // WebSearch allowed
  if (state.websearchMode === 'allow') {
    items.push({
      level: 'yellow',
      message: tr('risk.msg.websearchAllowed', 'WebSearch is allowed — can search any content'),
      source: 'websearchMode',
      impact: tr('risk.impact.anySearch', 'Can perform unrestricted web searches'),
      suggestion: tr('risk.sugg.useAskSearch', 'Use Ask mode to review before searching'),
    });
  }

  // Network fully open
  if (state.networkMode === 'open') {
    items.push({
      level: 'yellow',
      message: tr('risk.msg.netOpen', 'Network fully open — all domains accessible'),
      source: 'networkMode',
      impact: tr('risk.impact.anyNetwork', 'Can connect to any external service'),
      suggestion: tr('risk.sugg.useDevDomains', 'Use dev-domains mode to restrict network access'),
    });
  }

  // allowAllUnixSockets
  if (state.network.allowAllUnixSockets) {
    items.push({
      level: 'yellow',
      message: tr('risk.msg.unixSockets', 'All Unix sockets allowed'),
      source: 'network.allowAllUnixSockets',
      impact: tr('risk.impact.unixSocketAccess', 'Can communicate with local services via Unix sockets'),
      suggestion: tr('risk.sugg.disableUnixSockets', 'Disable unless specifically needed'),
    });
  }

  // filesystem.allowWrite includes ~ or /Users
  if (state.filesystem.allowWrite.some((p) => p === '~' || p === '/Users' || p === '/')) {
    items.push({
      level: 'yellow',
      message: tr('risk.msg.writeHomeDir', 'Filesystem write includes home or root directory'),
      source: 'filesystem.allowWrite',
      impact: tr('risk.impact.writeAnywhere', 'Can write files anywhere in home directory'),
      suggestion: tr('risk.sugg.restrictWrite', 'Limit write access to project directory only'),
    });
  }

  for (const rule of state.permissions.allow) {
    // Write(./**) — write all project files
    if (rule === 'Write(./**)' || rule === 'Write(*)') {
      items.push({
        level: 'yellow',
        message: tr('risk.msg.writeAll', `${rule} — can write any project file`).replace('{rule}', rule),
        source: 'permissions.allow',
        impact: tr('risk.impact.writeProject', 'Can create or overwrite any file in project'),
        suggestion: tr('risk.sugg.specificWrite', 'Use more specific write patterns'),
      });
    }

    // Edit(./**) — edit all project files
    if (rule === 'Edit(./**)' || rule === 'Edit(*)') {
      items.push({
        level: 'yellow',
        message: tr('risk.msg.editAll', `${rule} — can edit any project file`).replace('{rule}', rule),
        source: 'permissions.allow',
        impact: tr('risk.impact.editProject', 'Can modify any existing file in project'),
        suggestion: tr('risk.sugg.specificEdit', 'Use more specific edit patterns'),
      });
    }

    // MCP filesystem tools
    if (rule.startsWith('mcp__filesystem__') || rule.startsWith('mcp__*')) {
      items.push({
        level: 'yellow',
        message: tr('risk.msg.mcpFs', `${rule} — MCP filesystem tool`).replace('{rule}', rule),
        source: 'permissions.allow',
        impact: tr('risk.impact.mcpFsAccess', 'MCP server can access filesystem'),
        suggestion: tr('risk.sugg.specificMcp', 'Use specific MCP tool rules'),
      });
    }
  }

  // ===== LOW RISK (-3 each) =====

  // Too many allow rules
  if (state.permissions.allow.length > 30) {
    items.push({
      level: 'blue',
      message: tr('risk.msg.tooManyAllow', `Allow rules exceed 30 (${state.permissions.allow.length})`).replace('{count}', String(state.permissions.allow.length)),
      source: 'permissions.allow',
      impact: tr('risk.impact.overPermissive', 'Configuration is overly permissive'),
      suggestion: tr('risk.sugg.reviewAllow', 'Review and consolidate allow rules'),
    });
  }

  // Too few deny rules
  if (state.permissions.deny.length < 5) {
    items.push({
      level: 'blue',
      message: tr('risk.msg.tooFewDeny', `Deny rules below 5 (${state.permissions.deny.length})`).replace('{count}', String(state.permissions.deny.length)),
      source: 'permissions.deny',
      impact: tr('risk.impact.weakDeny', 'Few deny rules may miss sensitive paths'),
      suggestion: tr('risk.sugg.addDenyRules', 'Add deny rules for .env, .ssh, .aws etc.'),
    });
  }

  // Too many custom domains
  if (state.webfetchCustomDomains.length > 15) {
    items.push({
      level: 'blue',
      message: tr('risk.msg.tooManyDomains', `Custom domains exceed 15 (${state.webfetchCustomDomains.length})`).replace('{count}', String(state.webfetchCustomDomains.length)),
      source: 'webfetchCustomDomains',
      impact: tr('risk.impact.wideAccess', 'Large domain list broadens attack surface'),
      suggestion: tr('risk.sugg.reviewDomains', 'Review and reduce custom domain list'),
    });
  }

  // ===== SAFETY BONUSES (+2 each, max +10) =====

  if (state.sandbox.enabled) {
    items.push({
      level: 'green',
      message: tr('risk.msg.sandboxEnabled', 'Sandbox is enabled'),
      source: 'sandbox.enabled',
      impact: '',
      suggestion: '',
    });
  }

  if (state.sandbox.failIfUnavailable) {
    items.push({
      level: 'green',
      message: tr('risk.msg.failIfUnavailable', 'failIfUnavailable is enabled'),
      source: 'sandbox.failIfUnavailable',
      impact: '',
      suggestion: '',
    });
  }

  const hasSshDeny = state.permissions.deny.some((r) => r.includes('.ssh'));
  if (hasSshDeny) {
    items.push({
      level: 'green',
      message: tr('risk.msg.sshProtected', '~/.ssh is protected by deny'),
      source: 'permissions.deny',
      impact: '',
      suggestion: '',
    });
  }

  const hasAwsDeny = state.permissions.deny.some((r) => r.includes('.aws'));
  if (hasAwsDeny) {
    items.push({
      level: 'green',
      message: tr('risk.msg.awsProtected', '~/.aws is protected by deny'),
      source: 'permissions.deny',
      impact: '',
      suggestion: '',
    });
  }

  const hasEnvDeny = state.permissions.deny.some((r) => r.includes('.env'));
  if (hasEnvDeny) {
    items.push({
      level: 'green',
      message: tr('risk.msg.envProtected', '.env files are protected by deny'),
      source: 'permissions.deny',
      impact: '',
      suggestion: '',
    });
  }

  const hasNetDeny = state.network.deniedDomains.includes('*');
  if (hasNetDeny) {
    items.push({
      level: 'green',
      message: tr('risk.msg.netBlocked', 'Network is blocked by deniedDomains: ["*"]'),
      source: 'network.deniedDomains',
      impact: '',
      suggestion: '',
    });
  }

  if (state.webfetchMode === 'deny-all' || state.webfetchMode === 'disabled') {
    items.push({
      level: 'green',
      message: tr('risk.msg.webfetchBlocked', 'WebFetch is blocked or disabled'),
      source: 'webfetchMode',
      impact: '',
      suggestion: '',
    });
  }

  if (state.websearchMode === 'deny' || state.websearchMode === 'disabled') {
    items.push({
      level: 'green',
      message: tr('risk.msg.websearchBlocked', 'WebSearch is blocked or disabled'),
      source: 'websearchMode',
      impact: '',
      suggestion: '',
    });
  }

  const hasPushDeny = state.permissions.deny.some((r) => r.includes('git push'));
  if (hasPushDeny) {
    items.push({
      level: 'green',
      message: tr('risk.msg.pushBlocked', 'git push is blocked by deny'),
      source: 'permissions.deny',
      impact: '',
      suggestion: '',
    });
  }

  const hasSudoDeny = state.permissions.deny.some((r) => r.includes('sudo'));
  if (hasSudoDeny) {
    items.push({
      level: 'green',
      message: tr('risk.msg.sudoBlocked', 'sudo is blocked by deny'),
      source: 'permissions.deny',
      impact: '',
      suggestion: '',
    });
  }

  return items;
}
