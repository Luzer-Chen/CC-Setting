<p align="center">
  <img src="public/app-icon.png" alt="CC-Setting" width="120" />
</p>

<h1 align="center">CC-Setting</h1>

<p align="center">
  <strong>可视化管理 Claude Code 配置</strong>
</p>

<p align="center">
  <a href="https://github.com/Luzer-Chen/CC-Setting/releases/latest">下载</a> ·
  <a href="./README.md">中文</a> |
  <a href="./readmeEN.md">English</a>
</p>

---

## 简介

CC-Setting 是一个本地桌面工具，用于可视化生成和管理 Claude Code 的 `settings.json`。支持权限配置、沙箱策略、网络控制、安全评分、一键导出。

## 功能

- **Permissions**：allow / ask / deny 三级权限，覆盖 Bash、Read、Edit、Write、WebFetch、WebSearch 等工具
- **Sandbox**：启用/禁用沙箱、文件系统白名单、网络白名单
- **WebFetch**：禁用 / 开发文档白名单 / 全部开放 / 自定义域名
- **Agent Team**：实验性多会话 Agent 协调功能
- **Profile 预设**：safe、dev-net、strict、custom 四种模式
- **JSON 预览**：CodeMirror 编辑器，实时同步，支持跳转
- **安全评分**：实时计算配置安全分数，标注风险项
- **备份恢复**：写入前自动备份，一键恢复
- **i18n**：中文 / English 双语支持

## 下载

前往 [Releases](https://github.com/Luzer-Chen/CC-Setting/releases/latest) 下载：

| 平台 | 文件 |
|------|------|
| macOS | `cc-setting.app.zip` |
| Windows | `cc-setting_1.0.0_aarch64.exe` |

## 开发

```bash
npm install
npm run tauri dev
```

### 构建

```bash
npm run tauri build
```

产物路径：
- macOS：`src-tauri/target/release/bundle/macos/cc-setting.app`
- Windows：`src-tauri/target/release/bundle/nsis/`

## 技术栈

前端 React 19 + TypeScript + Vite 6 + Tailwind CSS · 后端 Rust (Tauri 2) · 编辑器 CodeMirror 6

## 安全建议

- 不建议使用 `bypassPermissions` 模式，仅适合 Docker / VM 等隔离环境
- 推荐使用项目本地 `settings.local.json`，避免污染全局配置
- 建议开启 sandbox 以获得文件系统隔离保护
- 建议 deny 保护 `.env`、`~/.ssh`、`~/.aws` 等敏感目录

## License

[MIT](LICENSE)
