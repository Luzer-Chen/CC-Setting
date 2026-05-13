<p>
  <img src="public/app-icon.png" width="140" align="left" style="margin-right: 24px; margin-bottom: 8px;" />
</p>

# cc-setting

一个用于可视化管理 Claude Code 配置的桌面工具。

<br clear="all"/>

---

[中文](./README.md) | [English](./readmeEN.md)

## 功能

- **Permissions**：Bash、Read、Edit、Write、WebFetch、WebSearch 等工具的 allow / ask / deny 三级权限
- **Sandbox**：文件系统白名单、网络白名单
- **WebFetch**：禁用 / 开发文档白名单 / 全部开放 / 自定义域名
- **Agent Team**：实验性多会话 Agent 协调功能
- **Profile 预设**：safe、dev-net、strict、custom 一键切换
- **JSON 预览**：CodeMirror 编辑器，实时同步
- **安全评分**：实时计算配置安全分数，标注风险项
- **备份恢复**：写入前自动备份，一键恢复

## 技术栈

React 19 + TypeScript + Vite 6 + Tailwind CSS + Rust (Tauri 2)

## 下载

[Releases](https://github.com/Luzer-Chen/CC-Setting/releases/latest) — macOS `.app` / Windows `.exe`

## 开发

```bash
npm install
npm run tauri dev
```

## 构建

```bash
npm run tauri build
```

## License

[MIT](LICENSE)
