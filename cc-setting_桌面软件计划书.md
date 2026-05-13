# cc-setting 桌面软件计划书

## 1. 项目定位

项目名称固定为：

```text
cc-setting
```

项目类型固定为：

```text
本地桌面软件，不是网页项目
```

`cc-setting` 是一个用于管理 Claude Code `settings.json` 的本地 GUI 软件。它通过图形界面勾选 `permissions`、`sandbox`、`network`、`WebFetch` 等配置，然后一键生成、备份、替换 Claude Code 的配置文件。

核心目标：

```text
不是做一个浏览器网页。
不是只生成 Vite 前端。
必须生成可以在 macOS / Windows 上运行的桌面应用。
```

---

## 2. 技术路线

推荐技术栈：

```text
桌面框架：Tauri 2
前端界面：React + TypeScript
构建工具：Vite
样式：Tailwind CSS
本地文件操作：Tauri Rust Commands
JSON 预览：CodeMirror
配置校验：zod
桌面打包：Tauri build
```

重要说明：

```text
Tauri 的界面本质上会用 WebView 渲染 React 页面，
但最终交付物必须是桌面软件，不是网页。
开发阶段可以有 localhost / Vite dev server，
但最终验收必须是 Tauri 桌面窗口和安装包。
```

---

## 3. 严格禁止项

开发 agent 必须遵守：

```text
1. 禁止只创建 Vite React 网页。
2. 禁止只输出 npm run dev 网页预览。
3. 禁止把项目做成普通网站。
4. 禁止要求用户部署到浏览器或服务器。
5. 禁止删除 Tauri 目录 src-tauri。
6. 禁止省略 Rust 后端文件写入逻辑。
7. 禁止默认写入全局 ~/.claude/settings.json。
8. 禁止默认生成 Bash(*)、Read(*)、Edit(*)、Write(*)。
9. 禁止默认启用 bypassPermissions。
10. 禁止不备份就替换 settings.json。
```

---

## 4. 最终交付物

第一版必须交付：

```text
1. 一个可运行的桌面应用 cc-setting
2. macOS 下可以通过 npm run tauri dev 打开桌面窗口
3. 可以通过 npm run tauri build 打包
4. 具备 src-tauri/ Rust 后端目录
5. 具备 React GUI 界面
6. 可以生成 Claude Code settings.json
7. 可以一键复制 JSON
8. 可以一键导出 JSON 文件
9. 可以一键备份并替换 .claude/settings.local.json
10. 可以恢复上一次备份
```

验收时不能只看到网页，必须看到：

```text
Tauri 桌面窗口
```

---

## 5. 核心功能

### 5.1 目标位置选择

GUI 中提供四个目标位置：

```text
○ 全局配置：~/.claude/settings.json
○ 项目共享配置：当前项目/.claude/settings.json
● 项目本地配置：当前项目/.claude/settings.local.json
○ 占位符模板：当前项目/.claude/settings.template.json
```

默认选择：

```text
当前项目/.claude/settings.local.json
```

原因：

```text
1. 只影响当前项目
2. 不污染全局 Claude Code 配置
3. 适合 vibe coding
4. 出错可直接删除项目配置恢复
```

---

### 5.2 permissions 配置

支持：

```text
defaultMode
allow
ask
deny
```

#### defaultMode

GUI 选项：

```text
○ default
● acceptEdits
○ plan
○ auto
○ dontAsk
○ bypassPermissions
```

默认：

```text
acceptEdits
```

选择 `bypassPermissions` 时必须显示红色警告：

```text
该模式会绕过权限检查，只建议 Docker / VM / 一次性 sandbox 使用。
```

#### allow 默认项

```text
Read(./**)
Edit(./**)
Write(./**)

Bash(pwd)
Bash(ls *)
Bash(find . *)
Bash(grep *)
Bash(which *)
Bash(echo *)

Bash(git status)
Bash(git diff *)
Bash(git log *)

Bash(npm install)
Bash(npm run *)
Bash(npm test *)

Bash(pnpm install)
Bash(pnpm run *)

Bash(yarn install)
Bash(yarn run *)

Bash(cargo check *)
Bash(cargo build *)
Bash(cargo test *)
```

#### deny 默认项

```text
Read(./.env)
Read(./.env.*)
Read(./**/.env)
Read(./**/.env.*)

Read(~/.ssh/**)
Read(~/.aws/**)
Read(~/.docker/**)
Read(~/.config/gh/**)
Read(~/.kube/**)

Edit(./.env)
Edit(./.env.*)
Write(./.env)
Write(./.env.*)

Bash(sudo *)
Bash(su *)
Bash(rm -rf /)
Bash(rm -rf ~)
Bash(rm -rf ./*)

Bash(git push *)
Bash(git push --force*)
Bash(git reset --hard *)
Bash(git clean -fd *)

Bash(ssh *)
Bash(scp *)
Bash(rsync *)

Bash(docker run --privileged *)
Bash(docker system prune *)
Bash(docker volume rm *)
Bash(docker compose down -v *)
```

---

### 5.3 sandbox 配置

必须支持 GUI 勾选。

#### sandbox 总开关

```text
☑ 启用 sandbox
☑ sandbox 不可用时直接失败
☑ sandbox 内 Bash 自动允许
☑ 禁止非 sandbox 命令运行
```

对应字段：

```json
{
  "sandbox": {
    "enabled": true,
    "failIfUnavailable": true,
    "autoAllowBashIfSandboxed": true,
    "allowUnsandboxedCommands": false
  }
}
```

#### filesystem 配置

默认推荐：

```json
{
  "filesystem": {
    "allowRead": [
      "."
    ],
    "allowWrite": [
      ".",
      "/tmp/claude-501",
      "/private/tmp/claude-501"
    ],
    "denyRead": [
      "~/.ssh",
      "~/.aws",
      "~/.docker",
      "~/.config/gh",
      "~/.kube"
    ],
    "denyWrite": [
      "~/.ssh",
      "~/.aws",
      "~/.docker",
      "~/.config/gh",
      "~/.kube"
    ]
  }
}
```

说明：

```text
allowWrite ["."]
= 允许写当前项目

/tmp/claude-501
= 允许 Claude Code 写自己的临时状态文件

denyWrite
= 第二层保障，只禁止敏感目录，不要禁止整个 /Users 或 ~/
```

禁止默认写：

```json
{
  "denyWrite": [
    "~/",
    "/Users/",
    "/tmp/",
    "/private/"
  ]
}
```

原因：

```text
这些会误伤项目目录或 Claude Code 自身临时目录。
```

---

### 5.4 network 配置

提供三种模式：

```text
○ 禁用网络
● 开放网络
○ 仅允许开发常用域名
```

#### 禁用网络

```json
{
  "network": {
    "allowedDomains": [],
    "deniedDomains": [
      "*"
    ],
    "allowLocalBinding": true,
    "allowAllUnixSockets": false
  }
}
```

#### 开放网络

```json
{
  "network": {
    "allowedDomains": [
      "*"
    ],
    "deniedDomains": [],
    "allowLocalBinding": true,
    "allowAllUnixSockets": false
  }
}
```

#### 仅允许开发常用域名

```json
{
  "network": {
    "allowedDomains": [
      "registry.npmjs.org",
      "*.npmjs.org",
      "registry.yarnpkg.com",
      "github.com",
      "*.github.com",
      "objects.githubusercontent.com",
      "pypi.org",
      "files.pythonhosted.org",
      "crates.io",
      "index.crates.io",
      "static.crates.io"
    ],
    "deniedDomains": [],
    "allowLocalBinding": true,
    "allowAllUnixSockets": false
  }
}
```

---

### 5.5 WebFetch 配置

单独做成一个区域：

```text
WebFetch 网页读取权限

○ 禁用 WebFetch
● 允许常用开发文档
○ 允许全部 WebFetch
○ 自定义域名
```

常用开发文档预设：

```text
github.com
docs.github.com
tauri.app
react.dev
vite.dev
typescriptlang.org
npmjs.com
docs.npmjs.com
nodejs.org
```

对应示例：

```json
{
  "permissions": {
    "allow": [
      "WebFetch(domain:github.com)",
      "WebFetch(domain:docs.github.com)",
      "WebFetch(domain:tauri.app)",
      "WebFetch(domain:react.dev)"
    ]
  }
}
```

允许全部：

```json
{
  "permissions": {
    "allow": [
      "WebFetch"
    ]
  }
}
```

说明：

```text
WebFetch 管 Claude Code 自己读取网页。
sandbox.network 管 npm / pip / cargo / curl 等 Bash 子进程联网。
```

---

## 6. GUI 页面结构

桌面软件布局：

```text
┌──────────────────────────────────────────────────────────────┐
│ cc-setting                                                   │
├───────────────────────┬──────────────────────────────────────┤
│ 左侧配置面板            │ 右侧 JSON 实时预览                    │
│                       │                                      │
│ 1. 目标位置             │ {                                    │
│ 2. Profile 预设         │   "$schema": "...",                 │
│ 3. defaultMode         │   "permissions": {},                │
│ 4. permissions         │   "sandbox": {}                     │
│ 5. WebFetch            │ }                                    │
│ 6. sandbox             │                                      │
│ 7. network             │                                      │
├───────────────────────┴──────────────────────────────────────┤
│ 风险提示区                                                    │
├──────────────────────────────────────────────────────────────┤
│ [一键输出 JSON] [复制 JSON] [导出文件] [备份并替换] [恢复备份] │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. 内置 Profile

### 7.1 safe

```text
安全离线模式

特点：
1. sandbox 开启
2. 网络禁用
3. 只允许项目内读写
4. 禁止密钥目录
5. 禁止危险 Bash 命令
6. 不允许 WebFetch
```

### 7.2 dev-net

```text
开放网络开发模式

特点：
1. sandbox 开启
2. 网络开放
3. 允许 npm / pnpm / yarn / cargo 常用命令
4. 允许 WebFetch 常用开发文档
5. 禁止密钥目录
6. 禁止生产危险命令
```

### 7.3 strict

```text
严格审查模式

特点：
1. 以只读为主
2. 不允许安装依赖
3. 不开放网络
4. 不允许 WebFetch
5. 适合陌生项目
```

### 7.4 placeholder

```text
占位符模板

特点：
1. 生成 Bash()
2. 生成 Read()
3. 生成 Edit()
4. 生成 Write()
5. 生成 WebFetch()
6. 生成 sandbox 空字段
7. 只导出为 settings.template.json
8. 不允许写入 settings.local.json
```

---

## 8. 危险配置扫描

### 8.1 红色高危

检测到以下内容显示红色：

```text
Bash
Bash(*)
Read(*)
Edit(*)
Write(*)
defaultMode = bypassPermissions
sandbox.enabled = false
allowUnsandboxedCommands = true
```

### 8.2 黄色中危

检测到以下内容显示黄色：

```text
network.allowedDomains = ["*"]
WebFetch
npm install 被允许
pip install 被允许
cargo build 被允许
docker compose build 被允许
```

### 8.3 绿色安全项

检测到以下内容显示绿色：

```text
sandbox 已启用
failIfUnavailable 已启用
.env 已被 deny
~/.ssh 已被 deny
git push 已被 deny
sudo 已被 deny
生产目录已被 deny
```

---

## 9. 文件写入流程

点击：

```text
一键备份并替换
```

必须执行：

```text
1. 获取目标路径
2. 创建 .claude 目录
3. 检查目标文件是否存在
4. 如果存在，备份到 .claude/backups/
5. 生成最终 JSON
6. 校验 JSON 合法性
7. 扫描危险配置
8. 高危配置弹窗二次确认
9. 写入目标文件
10. 显示成功路径和备份路径
```

备份命名：

```text
settings.local.2026-05-10-153000.json
settings.2026-05-10-153000.json
```

---

## 10. 必须包含的桌面端文件结构

```text
cc-setting/
  package.json
  tsconfig.json
  vite.config.ts
  index.html
  README.md
  .gitignore

  src/
    main.tsx
    App.tsx

    components/
      TargetSelector.tsx
      ProfileSelector.tsx
      PermissionModePanel.tsx
      PermissionRulesPanel.tsx
      WebFetchPanel.tsx
      SandboxPanel.tsx
      FilesystemPanel.tsx
      NetworkPanel.tsx
      JsonPreview.tsx
      DangerReport.tsx
      ActionBar.tsx

    lib/
      types.ts
      defaults.ts
      profiles.ts
      generator.ts
      validator.ts
      danger-check.ts
      paths.ts
      format.ts

    styles/
      globals.css

  src-tauri/
    Cargo.toml
    tauri.conf.json
    build.rs

    src/
      main.rs
      commands.rs
      paths.rs
      backup.rs
      writer.rs

  examples/
    settings.safe.json
    settings.dev-net.json
    settings.strict.json
    settings.placeholder.json

  docs/
    product-plan.md
    ui-design.md
    safety-rules.md
    profile-design.md
```

如果没有：

```text
src-tauri/
```

就说明它不是完整 Tauri 桌面软件。

---

## 11. Tauri 后端必须实现的命令

Rust commands 必须包括：

```text
resolve_target_path
read_settings_file
backup_settings_file
write_settings_file
restore_latest_backup
export_json_file
choose_project_directory
```

示例职责：

```text
resolve_target_path
根据 global / project / local / template 返回真实路径。

backup_settings_file
替换前备份旧文件。

write_settings_file
写入 settings.json / settings.local.json。

restore_latest_backup
恢复最近一次备份。

choose_project_directory
让用户选择目标项目目录。
```

---

## 12. 开发阶段

### 阶段 1：创建真正的 Tauri 桌面项目

目标：

```text
创建 Tauri 2 + React + TypeScript 项目
确保存在 src-tauri/
确保 npm run tauri dev 打开桌面窗口
```

验收：

```text
不是浏览器网页。
必须弹出桌面应用窗口。
```

### 阶段 2：完成静态 GUI

目标：

```text
完成左侧配置区
完成右侧 JSON 预览区
完成底部按钮区
```

验收：

```text
所有勾选框可以点击。
界面标题显示 cc-setting。
```

### 阶段 3：JSON 生成器

目标：

```text
根据 UI 状态生成 settings.json
```

验收：

```text
切换 defaultMode 后 JSON 变化。
切换 sandbox 后 JSON 变化。
切换 network 后 JSON 变化。
切换 WebFetch 后 JSON 变化。
```

### 阶段 4：Profile 预设

目标：

```text
实现 safe / dev-net / strict / placeholder
```

验收：

```text
选择 Profile 后，界面状态和 JSON 同步变化。
```

### 阶段 5：危险扫描

目标：

```text
检测高危、中危、安全项
```

验收：

```text
Bash(*) 红色警告。
bypassPermissions 红色警告。
网络开放黄色提示。
sandbox 启用绿色提示。
```

### 阶段 6：Tauri 文件写入

目标：

```text
实现一键导出
实现一键备份并替换
实现恢复上一次备份
```

验收：

```text
可以写入 .claude/settings.local.json。
替换前旧文件会备份。
可以恢复备份。
```

### 阶段 7：桌面打包

目标：

```text
生成 macOS / Windows 桌面软件包
```

验收：

```text
npm run tauri build 成功。
可以找到 .app / .dmg / .exe 或对应平台包。
```

---

## 13. MVP 验收标准

必须满足：

```text
1. 项目名称固定为 cc-setting
2. 项目是 Tauri 桌面软件，不是普通网页
3. 存在 src-tauri/ 目录
4. npm run tauri dev 打开桌面窗口
5. npm run tauri build 可以打包
6. 可以选择 safe / dev-net / strict / placeholder
7. 可以配置 permissions
8. 可以配置 sandbox
9. 可以配置 network
10. 可以配置 WebFetch
11. 可以生成完整 settings.json
12. 可以复制 JSON
13. 可以导出 JSON
14. 可以备份并替换 .claude/settings.local.json
15. 可以恢复备份
16. 可以扫描危险配置
17. 默认不写入 ~/.claude/settings.json
18. 默认不允许 Bash(*) / Read(*) / Edit(*) / Write(*)
19. 默认不启用 bypassPermissions
```

---

## 14. 给 agent 的重做提示词

```text
你要重新开发一个本地桌面软件，项目名称固定为 cc-setting。

注意：这不是网页项目，不是普通 Vite React 网站。必须使用 Tauri 2 生成真正的桌面应用。项目中必须存在 src-tauri/ 目录，最终必须能通过 npm run tauri dev 打开桌面窗口，通过 npm run tauri build 打包桌面软件。

技术栈：
- Tauri 2
- React
- TypeScript
- Vite
- Tailwind CSS
- zod
- CodeMirror

核心功能：
1. 可视化生成 Claude Code settings.json。
2. 支持 permissions：
   - defaultMode
   - allow
   - ask
   - deny
3. 支持工具权限：
   - Bash
   - Read
   - Edit
   - Write
   - WebFetch
   - WebSearch
   - Task
   - MCP tools
4. 支持 sandbox：
   - enabled
   - failIfUnavailable
   - autoAllowBashIfSandboxed
   - allowUnsandboxedCommands
   - excludedCommands
   - filesystem.allowRead
   - filesystem.allowWrite
   - filesystem.denyRead
   - filesystem.denyWrite
   - network.allowedDomains
   - network.deniedDomains
   - network.allowLocalBinding
   - network.allowAllUnixSockets
   - enableWeakerNestedSandbox
   - enableWeakerNetworkIsolation
5. sandbox 必须可以通过复选框启用或关闭。
6. network 支持三种模式：
   - 禁用网络
   - 开放网络
   - 仅允许开发常用域名
7. WebFetch 支持：
   - 禁用 WebFetch
   - 允许常用开发文档
   - 允许全部 WebFetch
   - 自定义域名
8. 右侧实时 JSON 预览。
9. 底部按钮：
   - 一键输出 JSON
   - 一键复制 JSON
   - 一键导出文件
   - 一键备份并替换
   - 恢复上一次备份
10. 默认目标文件是当前项目 .claude/settings.local.json。
11. 替换前必须自动备份旧文件到 .claude/backups/。
12. 必须实现危险规则扫描：
    - Bash
    - Bash(*)
    - Read(*)
    - Edit(*)
    - Write(*)
    - defaultMode = bypassPermissions
    - sandbox 未启用
    - 网络开放
    - WebFetch 全开放
13. 不允许默认写入全局 ~/.claude/settings.json，除非用户主动选择。
14. placeholder 模板只能导出为 settings.template.json，不要写入 settings.local.json。
15. UI 使用中文。
16. 组件拆分：
    - TargetSelector
    - ProfileSelector
    - PermissionModePanel
    - PermissionRulesPanel
    - WebFetchPanel
    - SandboxPanel
    - FilesystemPanel
    - NetworkPanel
    - JsonPreview
    - DangerReport
    - ActionBar
17. Tauri Rust 后端必须实现：
    - 选择项目目录
    - 解析目标路径
    - 读取已有 settings
    - 备份旧 settings
    - 写入新 settings
    - 恢复上一次备份
    - 导出 JSON 文件

严格禁止：
- 禁止只做 Vite 网页
- 禁止只交付浏览器页面
- 禁止省略 src-tauri
- 禁止省略 Rust 文件写入逻辑
- 禁止默认生成 Bash(*)、Read(*)、Edit(*)、Write(*)
- 禁止默认使用 bypassPermissions
- 禁止不备份就替换 settings.json

最终输出：
1. 完整文件结构
2. 启动命令
3. 构建命令
4. 测试方法
5. 已完成清单
6. 未完成清单
7. 如何确认它是桌面软件而不是网页
```

---

## 15. 最重要的修正

之前的问题是：

```text
计划里虽然写了 Tauri，
但没有把“必须交付桌面软件”作为硬性验收。
导致 agent 可能只生成 React/Vite 网页。
```

这次必须把验收标准改为：

```text
必须有 src-tauri/
必须能 npm run tauri dev 打开桌面窗口
必须能 npm run tauri build 生成桌面安装包
否则不算完成
```
