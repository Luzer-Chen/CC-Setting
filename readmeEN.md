<p align="center">
  <img src="public/app-icon.png" alt="CC-Setting" width="120" />
</p>

<h1 align="center">CC-Setting</h1>

<p align="center">
  <strong>Visual Claude Code Configuration Manager</strong>
</p>

<p align="center">
  <a href="https://github.com/Luzer-Chen/CC-Setting/releases/latest">Download</a> ·
  <a href="./README.md">中文</a> |
  <a href="./readmeEN.md">English</a>
</p>

---

## About

CC-Setting is a local desktop tool for visually generating and managing Claude Code's `settings.json`. It supports permission configuration, sandbox policies, network control, security scoring, and one-click export.

## Features

- **Permissions**: Three-level allow / ask / deny for Bash, Read, Edit, Write, WebFetch, WebSearch and more
- **Sandbox**: Enable/disable sandbox, filesystem allowlist, network allowlist
- **WebFetch**: Disabled / dev docs whitelist / fully open / custom domains
- **Agent Team**: Experimental multi-session agent coordination
- **Profiles**: safe, dev-net, strict, custom — switch with one click
- **JSON Preview**: CodeMirror editor with real-time sync and section navigation
- **Security Scoring**: Real-time safety score with risk item highlighting
- **Backup & Restore**: Auto-backup before write, one-click restore
- **i18n**: Chinese / English bilingual support

## Download

Go to [Releases](https://github.com/Luzer-Chen/CC-Setting/releases/latest):

| Platform | File |
|----------|------|
| macOS | `cc-setting.app.zip` |
| Windows | `cc-setting_1.0.0_aarch64.exe` |

## Development

```bash
npm install
npm run tauri dev
```

### Build

```bash
npm run tauri build
```

Output paths:
- macOS: `src-tauri/target/release/bundle/macos/cc-setting.app`
- Windows: `src-tauri/target/release/bundle/nsis/`

## Tech Stack

Frontend: React 19 + TypeScript + Vite 6 + Tailwind CSS · Backend: Rust (Tauri 2) · Editor: CodeMirror 6

## Security Tips

- Avoid `bypassPermissions` mode — only suitable for Docker / VM isolation
- Use project-local `settings.local.json` to avoid polluting global config
- Enable sandbox for filesystem isolation
- Deny access to `.env`, `~/.ssh`, `~/.aws` and other sensitive directories

## License

[MIT](LICENSE)
