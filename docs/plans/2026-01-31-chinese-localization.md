# OpenClaw 中文本地化 (Chinese Localization) 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 OpenClaw 项目添加完整的中文（简体）本地化支持，使中文用户能够使用母语界面操作所有平台（CLI、Web UI、iOS、macOS、Android）。

**Architecture:** 采用分层国际化架构：

1. TypeScript 层（CLI + Web UI）：使用 i18next 框架，JSON 翻译文件
2. Swift 层（iOS + macOS）：使用原生 Localizable.strings
3. Kotlin 层（Android）：使用原生 strings.xml 资源

**Tech Stack:** i18next (TypeScript), NSLocalizedString (Swift), Android Resources (Kotlin)

---

## 概述

### 字符串分布统计

| 平台          | 预估字符串数 | 文件类型         | 优先级    |
| ------------- | ------------ | ---------------- | --------- |
| CLI 命令/帮助 | ~80          | TypeScript       | P0        |
| CLI 错误消息  | ~100         | TypeScript       | P0        |
| CLI 交互提示  | ~50          | TypeScript       | P0        |
| Web UI 组件   | ~60          | TypeScript (Lit) | P1        |
| macOS 应用    | ~150         | Swift            | P2        |
| iOS 应用      | ~80          | Swift            | P2        |
| Android 应用  | ~50          | Kotlin           | P2        |
| 文档          | ~296 文件    | Markdown         | P3 (可选) |

### 阶段划分

- **Phase 1**: 基础设施搭建 (i18n 框架 + 工具链)
- **Phase 2**: CLI 核心汉化 (命令描述 + 帮助 + 错误)
- **Phase 3**: Web UI 汉化
- **Phase 4**: 移动端汉化 (iOS/macOS/Android)
- **Phase 5**: 文档汉化 (可选)

---

## Phase 1: 基础设施搭建

### Task 1.1: 安装 i18next 依赖

**Files:**

- Modify: `package.json`

**Step 1: 添加 i18next 依赖**

```bash
pnpm add i18next
```

**Step 2: 验证安装**

Run: `pnpm list i18next`
Expected: 显示已安装的 i18next 版本

**Step 3: Commit**

```bash
scripts/committer "chore: add i18next for localization support" package.json pnpm-lock.yaml
```

---

### Task 1.2: 创建翻译基础设施

**Files:**

- Create: `src/i18n/index.ts`
- Create: `src/i18n/locales/en.json`
- Create: `src/i18n/locales/zh-CN.json`

**Step 1: 创建 i18n 初始化模块**

```typescript
// src/i18n/index.ts
import i18next from "i18next";
import en from "./locales/en.json" with { type: "json" };
import zhCN from "./locales/zh-CN.json" with { type: "json" };

export const i18n = i18next.createInstance();

export async function initI18n(lng?: string) {
  const detectedLang = lng ?? detectLanguage();

  await i18n.init({
    lng: detectedLang,
    fallbackLng: "en",
    debug: false,
    resources: {
      en: { translation: en },
      "zh-CN": { translation: zhCN },
    },
    interpolation: {
      escapeValue: false,
    },
  });

  return i18n;
}

function detectLanguage(): string {
  // 优先使用环境变量
  const envLang = process.env.OPENCLAW_LANG || process.env.LANG || "";
  if (envLang.startsWith("zh")) return "zh-CN";
  return "en";
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}

export function setLanguage(lng: string) {
  return i18n.changeLanguage(lng);
}
```

**Step 2: 创建英文翻译文件（初始骨架）**

```json
// src/i18n/locales/en.json
{
  "cli": {
    "channels": {
      "description": "Manage chat channel accounts",
      "list": {
        "description": "List configured channels + auth profiles"
      },
      "status": {
        "description": "Show gateway channel status (use status --deep for local)"
      },
      "add": {
        "description": "Add a channel account"
      },
      "remove": {
        "description": "Remove a channel account"
      }
    },
    "gateway": {
      "description": "Manage the OpenClaw gateway",
      "run": {
        "description": "Start the gateway server"
      },
      "status": {
        "description": "Show gateway status"
      }
    },
    "message": {
      "description": "Send and manage messages",
      "send": {
        "description": "Send a message"
      }
    },
    "agent": {
      "description": "Run the AI agent"
    },
    "config": {
      "description": "Manage configuration"
    }
  },
  "errors": {
    "messageRequired": "Message (--message) is required",
    "channelRequired": "Channel (--channel) is required",
    "accountRequired": "Account (--account) is required",
    "invalidChannel": "Invalid channel: {{channel}}",
    "connectionFailed": "Connection failed: {{reason}}"
  },
  "wizard": {
    "intro": "OpenClaw onboarding",
    "securityWarning": "Security warning — please read.",
    "riskAccept": "I understand this is powerful and inherently risky. Continue?",
    "cancelled": "Setup cancelled"
  },
  "common": {
    "yes": "Yes",
    "no": "No",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  }
}
```

**Step 3: 创建中文翻译文件**

```json
// src/i18n/locales/zh-CN.json
{
  "cli": {
    "channels": {
      "description": "管理聊天频道账户",
      "list": {
        "description": "列出已配置的频道和认证配置"
      },
      "status": {
        "description": "显示网关频道状态（本地使用 status --deep）"
      },
      "add": {
        "description": "添加频道账户"
      },
      "remove": {
        "description": "移除频道账户"
      }
    },
    "gateway": {
      "description": "管理 OpenClaw 网关",
      "run": {
        "description": "启动网关服务器"
      },
      "status": {
        "description": "显示网关状态"
      }
    },
    "message": {
      "description": "发送和管理消息",
      "send": {
        "description": "发送消息"
      }
    },
    "agent": {
      "description": "运行 AI 代理"
    },
    "config": {
      "description": "管理配置"
    }
  },
  "errors": {
    "messageRequired": "消息 (--message) 是必需的",
    "channelRequired": "频道 (--channel) 是必需的",
    "accountRequired": "账户 (--account) 是必需的",
    "invalidChannel": "无效的频道：{{channel}}",
    "connectionFailed": "连接失败：{{reason}}"
  },
  "wizard": {
    "intro": "OpenClaw 初始设置",
    "securityWarning": "安全警告 - 请仔细阅读。",
    "riskAccept": "我了解这是强大且有风险的工具。是否继续？",
    "cancelled": "设置已取消"
  },
  "common": {
    "yes": "是",
    "no": "否",
    "cancel": "取消",
    "confirm": "确认",
    "save": "保存",
    "delete": "删除",
    "edit": "编辑",
    "loading": "加载中...",
    "error": "错误",
    "success": "成功"
  }
}
```

**Step 4: 运行类型检查**

Run: `pnpm build`
Expected: 编译成功，无类型错误

**Step 5: Commit**

```bash
scripts/committer "feat(i18n): add i18n infrastructure with en/zh-CN support" src/i18n/
```

---

### Task 1.3: 添加语言配置选项

**Files:**

- Modify: `src/config/config.ts`
- Modify: `src/cli/config-cli.ts`

**Step 1: 在配置 schema 中添加 language 字段**

在 `OpenClawConfig` 类型中添加：

```typescript
language?: "en" | "zh-CN" | "auto";
```

**Step 2: 添加 CLI 命令设置语言**

```typescript
// openclaw config set language zh-CN
```

**Step 3: 运行测试**

Run: `pnpm test src/config/`
Expected: 所有测试通过

**Step 4: Commit**

```bash
scripts/committer "feat(config): add language setting for i18n" src/config/config.ts src/cli/config-cli.ts
```

---

### Task 1.4: 在 CLI 入口初始化 i18n

**Files:**

- Modify: `src/entry.ts`

**Step 1: 在 CLI 启动时初始化 i18n**

```typescript
import { initI18n } from "./i18n/index.js";

// 在 main 函数开始处
await initI18n();
```

**Step 2: 运行 CLI 验证**

Run: `OPENCLAW_LANG=zh-CN pnpm openclaw --help`
Expected: CLI 正常启动

**Step 3: Commit**

```bash
scripts/committer "feat(cli): initialize i18n on CLI startup" src/entry.ts
```

---

## Phase 2: CLI 核心汉化

### Task 2.1: 汉化 channels-cli.ts

**Files:**

- Modify: `src/cli/channels-cli.ts`
- Update: `src/i18n/locales/en.json`
- Update: `src/i18n/locales/zh-CN.json`

**Step 1: 导入 t 函数**

```typescript
import { t } from "../i18n/index.js";
```

**Step 2: 替换硬编码字符串**

```typescript
// Before:
.description("Manage chat channel accounts")

// After:
.description(t("cli.channels.description"))
```

**Step 3: 添加所有 channels 命令的翻译键**

更新 JSON 文件，为每个 `.description()` 调用添加对应的翻译键。

**Step 4: 运行测试**

Run: `pnpm test src/cli/`
Expected: 所有测试通过

**Step 5: Commit**

```bash
scripts/committer "feat(i18n): localize channels CLI commands" src/cli/channels-cli.ts src/i18n/locales/
```

---

### Task 2.2: 汉化 gateway-cli.ts

**Files:**

- Modify: `src/cli/gateway-cli.ts`
- Update: `src/i18n/locales/en.json`
- Update: `src/i18n/locales/zh-CN.json`

**Step 1-5:** 同 Task 2.1 模式

---

### Task 2.3: 汉化 wizard/onboarding.ts

**Files:**

- Modify: `src/wizard/onboarding.ts`
- Modify: `src/wizard/prompts.ts`
- Update: `src/i18n/locales/en.json`
- Update: `src/i18n/locales/zh-CN.json`

**Step 1: 替换安全警告文本**

```typescript
// Before:
"Security warning — please read.";

// After:
t("wizard.securityWarning");
```

**Step 2: 替换所有用户提示**

确保所有 `prompter.note()`, `prompter.confirm()` 等调用使用 `t()` 函数。

**Step 3: 运行完整测试**

Run: `pnpm test`
Expected: 所有测试通过

**Step 4: Commit**

```bash
scripts/committer "feat(i18n): localize onboarding wizard" src/wizard/
```

---

### Task 2.4: 汉化错误消息 (src/commands/)

**Files:**

- Modify: `src/commands/*.ts` (所有命令文件)
- Update: `src/i18n/locales/*.json`

**目标文件:**

- `src/commands/agent.ts`
- `src/commands/channels.ts`
- `src/commands/config.ts`
- `src/commands/message.ts`
- 等

**Step 1: 识别所有 throw new Error(...) 调用**

使用 grep 查找所有硬编码错误消息。

**Step 2: 为每个错误添加翻译键**

**Step 3: 替换为 t() 调用**

**Step 4: Commit**

```bash
scripts/committer "feat(i18n): localize error messages in commands" src/commands/
```

---

### Task 2.5: 汉化帮助文本和示例

**Files:**

- Modify: `src/cli/program/help.ts`
- Modify: `src/cli/browser-cli-examples.ts`
- Update: `src/i18n/locales/*.json`

**Step 1: 替换帮助文本**

**Step 2: 替换示例文本**

**Step 3: Commit**

```bash
scripts/committer "feat(i18n): localize help text and examples" src/cli/program/ src/cli/browser-cli-examples.ts
```

---

## Phase 3: Web UI 汉化

### Task 3.1: 创建 Web UI i18n 模块

**Files:**

- Create: `ui/src/i18n/index.ts`
- Create: `ui/src/i18n/locales/en.json`
- Create: `ui/src/i18n/locales/zh-CN.json`

**Step 1: 为 Lit 组件创建轻量级 i18n**

```typescript
// ui/src/i18n/index.ts
import en from "./locales/en.json" with { type: "json" };
import zhCN from "./locales/zh-CN.json" with { type: "json" };

type Translations = typeof en;
const translations: Record<string, Translations> = {
  en,
  "zh-CN": zhCN,
};

let currentLang = "en";

export function setLang(lang: string) {
  currentLang = lang in translations ? lang : "en";
}

export function t(key: string): string {
  const keys = key.split(".");
  let value: unknown = translations[currentLang];
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
  }
  return (value as string) ?? key;
}

export function detectBrowserLang(): string {
  const lang = navigator.language;
  if (lang.startsWith("zh")) return "zh-CN";
  return "en";
}
```

**Step 2: Commit**

```bash
scripts/committer "feat(ui/i18n): add web UI localization infrastructure" ui/src/i18n/
```

---

### Task 3.2: 汉化主要 UI 组件

**Files:**

- Modify: `ui/src/ui/app-render.ts`
- Modify: `ui/src/ui/views/*.ts`
- Update: `ui/src/i18n/locales/*.json`

**目标组件:**

- Navigation tabs (Chat, Channels, Settings, etc.)
- Settings labels
- Button text
- Status messages

**Step 1: 替换静态文本**

```typescript
// Before:
html`<span>Settings</span>`;

// After:
html`<span>${t("nav.settings")}</span>`;
```

**Step 2: 运行 UI 测试**

Run: `pnpm test:ui`
Expected: 所有测试通过

**Step 3: Commit**

```bash
scripts/committer "feat(ui/i18n): localize web UI components" ui/src/ui/
```

---

## Phase 4: 移动端汉化

### Task 4.1: iOS/macOS 本地化设置

**Files:**

- Create: `apps/ios/Sources/zh-Hans.lproj/Localizable.strings`
- Create: `apps/macos/Sources/OpenClaw/Resources/zh-Hans.lproj/Localizable.strings`
- Modify: `apps/ios/project.yml` (xcodegen)

**Step 1: 创建 Localizable.strings 文件**

```strings
/* Common */
"common.yes" = "是";
"common.no" = "否";
"common.cancel" = "取消";
"common.settings" = "设置";
"common.chat" = "聊天";
"common.voice" = "语音";

/* Settings */
"settings.title" = "设置";
"settings.gateway" = "网关";
"settings.connection" = "连接";

/* Chat */
"chat.placeholder" = "输入消息...";
"chat.send" = "发送";
```

**Step 2: 在 SwiftUI 中使用 LocalizedStringKey**

```swift
// Before:
Text("Settings")

// After:
Text("settings.title")
```

**Step 3: Commit**

```bash
scripts/committer "feat(ios/i18n): add Chinese localization for iOS/macOS" apps/ios/ apps/macos/
```

---

### Task 4.2: Android 本地化设置

**Files:**

- Create: `apps/android/app/src/main/res/values-zh-rCN/strings.xml`
- Modify: `apps/android/app/src/main/res/values/strings.xml`

**Step 1: 更新英文 strings.xml**

```xml
<resources>
    <string name="app_name">OpenClaw Node</string>
    <string name="common_yes">Yes</string>
    <string name="common_no">No</string>
    <string name="common_cancel">Cancel</string>
    <string name="settings_title">Settings</string>
    <string name="chat_placeholder">Type a message...</string>
    <string name="chat_send">Send</string>
</resources>
```

**Step 2: 创建中文 strings.xml**

```xml
<!-- apps/android/app/src/main/res/values-zh-rCN/strings.xml -->
<resources>
    <string name="app_name">OpenClaw 节点</string>
    <string name="common_yes">是</string>
    <string name="common_no">否</string>
    <string name="common_cancel">取消</string>
    <string name="settings_title">设置</string>
    <string name="chat_placeholder">输入消息...</string>
    <string name="chat_send">发送</string>
</resources>
```

**Step 3: 在 Kotlin 中使用字符串资源**

```kotlin
// Before:
Text("Settings")

// After:
Text(stringResource(R.string.settings_title))
```

**Step 4: 运行 Android 测试**

Run: `pnpm android:test`
Expected: 所有测试通过

**Step 5: Commit**

```bash
scripts/committer "feat(android/i18n): add Chinese localization for Android" apps/android/
```

---

## Phase 5: 文档汉化 (可选)

### Task 5.1: 创建中文文档目录结构

**Files:**

- Create: `docs/zh-CN/` 目录结构

**决策点:** 文档汉化可采用以下方案之一：

1. **镜像结构**: `docs/zh-CN/` 完整镜像英文文档
2. **按需翻译**: 只翻译核心文档（快速入门、配置、CLI 参考）
3. **社区驱动**: 建立贡献指南，由社区逐步翻译

**建议:** 先完成核心文档（~20个文件），其余按需翻译。

---

## 测试验证清单

### CLI 验证

```bash
# 测试中文环境
OPENCLAW_LANG=zh-CN pnpm openclaw --help
OPENCLAW_LANG=zh-CN pnpm openclaw channels --help
OPENCLAW_LANG=zh-CN pnpm openclaw gateway --help

# 测试英文环境（回退）
OPENCLAW_LANG=en pnpm openclaw --help

# 测试自动检测
LANG=zh_CN.UTF-8 pnpm openclaw --help
```

### Web UI 验证

1. 打开 Web UI
2. 切换浏览器语言为中文
3. 刷新页面
4. 验证所有界面文本显示中文

### 移动端验证

1. 将设备/模拟器系统语言切换为简体中文
2. 重新安装应用
3. 验证所有界面文本显示中文

---

## 维护指南

### 添加新翻译键

1. 在 `src/i18n/locales/en.json` 添加英文键值
2. 在 `src/i18n/locales/zh-CN.json` 添加中文翻译
3. 在代码中使用 `t("path.to.key")`

### 翻译文件命名规范

```
en.json      - English (default)
zh-CN.json   - Simplified Chinese (简体中文)
zh-TW.json   - Traditional Chinese (繁体中文) [可选]
```

### CI 检查建议

添加 CI 步骤检查翻译完整性：

```bash
# 检查所有键在各语言文件中存在
node scripts/check-i18n-keys.ts
```

---

## 时间线估算

| Phase   | 预估工作量 | 依赖    |
| ------- | ---------- | ------- |
| Phase 1 | 2-4 小时   | 无      |
| Phase 2 | 4-8 小时   | Phase 1 |
| Phase 3 | 2-4 小时   | Phase 1 |
| Phase 4 | 4-6 小时   | Phase 1 |
| Phase 5 | 按需       | 无      |

**建议顺序:** Phase 1 → Phase 2 → Phase 3 → Phase 4

---

Plan complete and saved to `docs/plans/2026-01-31-chinese-localization.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
