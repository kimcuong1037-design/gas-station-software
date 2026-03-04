# 新成员引导手册 (Team Onboarding Guide)

**版本：** 1.0
**创建日期：** 2026-03-04

> 本手册帮助你从零开始，在 2 天内具备独立推进一个模块的能力。
> 按 Day 0 → Day 1 → Day 2 的节奏走，不要跳步。

---

## §1 欢迎 & 项目概览

### 我们在做什么

**加气站运营管理系统**（Gas Station Operations Management System）— 一个面向中国加气站行业的运营管理 SPA，当前处于**交互式 UI 原型阶段**（mock 数据驱动，无后端）。

技术栈：React 18 + TypeScript (strict) + Ant Design + ECharts + i18next + React Router v6 + Vite

### 当前进度

| 阶段 | 状态 | 包含模块 |
|------|------|---------|
| Phase 1 基础运营 | ✅ 完成 | 站点管理、交接班、设备设施、巡检安检（4 模块） |
| Phase 2 能源交易 | ✅ 完成 | 价格管理、订单交易、库存管理（3 模块） |
| Phase 3 数据分析 | ☐ 待启动 | 数据分析、报表中心、数据大屏（3 模块） |
| Phase 4-7 | ☐ 待启动 | 会员、营销、财税、系统管理等（16 模块） |

总进度：**7/26 模块（27%）**。详见 `docs/ROADMAP.md`。

### 团队模式

本项目采用**人类开发者 + Claude Code AI 协同**的模式：
- 你是模块的**负责人**，端到端负责一个模块的文档→设计→编码→评审
- Claude Code（AI Agent）是你的**高效助手**，帮你起草文档、生成代码、执行评审
- 所有 AI 产出必须经你审查确认——AI 不替代你的判断

---

## §2 环境搭建 (Day 0，约 30 分钟)

### 前置条件

| 工具 | 最低版本 | 检查命令 |
|------|---------|---------|
| Node.js | >= 18 | `node -v` |
| npm | >= 9 | `npm -v` |
| Git | >= 2.30 | `git --version` |
| VS Code | 最新稳定版 | 推荐，非必须 |

### 步骤

```bash
# 1. 克隆仓库
git clone <仓库地址>
cd gas-station-software

# 2. 安装依赖
cd frontend
npm install

# 3. 启动开发服务器
npm run dev
# → 浏览器打开 http://localhost:5173

# 4. 验证
# - 应能看到左侧导航栏和已有模块页面
# - 点击"基础运营 → 站点管理 → 站点列表"确认数据正常渲染

# 5. 构建验证
npm run build
# → 必须零错误通过
```

### Claude Code 安装（可选但推荐）

如果你计划使用 AI 辅助开发：

1. 安装 Claude Code CLI 或 VS Code 扩展
2. 在项目根目录启动 Claude Code — 它会自动加载 `CLAUDE.md`
3. 第一次启动后，告诉 AI："请执行 SESSION-PROTOCOL 启动检查"

---

## §3 必读文档路径 (Day 0-1，约 2 小时)

按以下顺序阅读。面向人类优化的阅读路径（与 AI 的加载顺序不同）：

| 顺序 | 优先级 | 文档 | 阅读目标 | 预计时间 |
|------|--------|------|---------|---------|
| 1 | ★★★ | `docs/TEAM-RULES.md` | 三级行为准则：什么该做、不该做、禁止做 | 10 min |
| 2 | ★★★ | `docs/PROGRESS.md` 顶部 | 项目当前在哪、谁在做什么、有什么阻塞 | 5 min |
| 3 | ★★★ | `docs/MODULE-ASSIGNMENTS.md` | 哪些模块已完成、哪些待认领 | 5 min |
| 4 | ★★★ | `docs/CONSTITUTION.md` | 8 条最高准则，内化为本能 | 15 min |
| 5 | ★★☆ | `docs/CORRECTIONS.md` §1 | 10 大纠偏模式（P1~P10），前人踩过的坑 | 20 min |
| 6 | ★★☆ | `docs/STANDARDS.md` §1 | 术语表——项目的"统一语言"，26 个核心术语 | 15 min |
| 7 | ★★☆ | `docs/AGENT-PLAN.md` §0-§7 | 14 步开发流程是怎么走的 | 30 min |
| 8 | ★☆☆ | `docs/SESSION-PROTOCOL.md` | Claude Code 使用者必读：session 启动/结束协议 | 10 min |
| 9 | ★☆☆ | `docs/ROADMAP.md` | 全景图：7 个阶段 26 个模块的总规划 | 10 min |

**为什么这个顺序？**
- 先读 TEAM-RULES（知道边界）→ 再读 PROGRESS（知道现状）→ 再读 CONSTITUTION（知道原则）
- CORRECTIONS 是最有价值的"经验包"——30 条历史教训比任何规范都直观
- AGENT-PLAN 较长但很重要，理解 14 步流程是独立工作的前提

---

## §4 理解 AI-Agent 开发模式

### AGENT-PLAN 中的 "Agent" 是什么？

AGENT-PLAN.md 描述了 6 个 "Agent"（需求分析、用户故事、架构设计、UI 设计、前端工程、UI 评审）。这些**不是自动运行的机器人**，而是一种**工作模式**的描述：

| Agent | 做什么 | 你的角色 |
|-------|--------|---------|
| Agent 1 需求分析 | 拆解功能点、识别边界 | 你引导 Claude Code 做分析，你审查产出 |
| Agent 2 架构设计 | 定义实体、API、状态机 | 你审查每个实体定义、每个 API 端点 |
| Agent 3 UI 设计 | 设计用户流程、画线框图 | 你判断是否符合业务逻辑 |
| Agent 4 前端工程 | 生成 React 组件代码 | 你审查代码质量、运行 build 验证 |
| Agent 5 UI 评审 | 6 维度质量评审 | 你决定哪些 P1/P2 要修、哪些延后 |

### 关键理解

**AI 是你的工具，不是你的替代品。** 你负责：
- 审查 AI 的每一份文档产出（不是 AI 写了就对了）
- 确认 architecture.md 的实体和 API 设计正确
- 验证前端代码的业务逻辑合理
- 执行 `npm run build` 确认无错误
- 对最终交付质量负责

### 高效使用 Claude Code 的技巧

| 场景 | 低效做法 ❌ | 高效做法 ✅ |
|------|-----------|-----------|
| 开始新模块 | "帮我做库存管理模块" | "请执行 SESSION-PROTOCOL 启动检查，然后执行 AGENT-PLAN Step 0" |
| 写代码 | "写一个库存管理页面" | "按照 ui-schema.md 的 P01 规格实现 InventoryOverview 页面" |
| 修复问题 | "修一下这个 bug" | "P01 页面的 Table 缺少 scroll.x，请按照 CORRECTIONS P2 的规范修复" |
| 结束 session | 直接关闭窗口 | "请执行 SESSION-PROTOCOL 结束流程，更新 PROGRESS.md" |

### 不使用 Claude Code 也完全可以

14 步流程对人类开发者同样适用。如果你选择不用 AI：
- 自己按步骤编写文档和代码
- 自己执行 session 结束时的 PROGRESS 更新
- 自己逐项核对交付 Checklist

---

## §5 端到端走读：以价格管理为范例 (Day 1，约 1.5 小时)

**目标：** 理解一个完整模块从文档到代码的全貌。

以 Module 2.1 价格管理为范例（项目中文档最完整的模块），按以下顺序打开并浏览每个文件：

### 第一步：文档套件（5 个文件）

| 步骤 | 文件 | 观察重点 |
|------|------|---------|
| 需求 | `docs/features/energy-trade/price-management/requirements.md` | 功能点如何分类？每个功能点的粒度是什么？ |
| 用户故事 | `docs/features/energy-trade/price-management/user-stories.md` | Epic→Story 层级结构、验收标准（AC）的写法 |
| 架构 | `docs/features/energy-trade/price-management/architecture.md` | 实体定义→API 端点→状态机→业务规则→PostgreSQL Schema 的完整链路 |
| UX 设计 | `docs/features/energy-trade/price-management/ux-design.md` | 角色画像→核心任务流→线框图描述 |
| UI Schema | `docs/features/energy-trade/price-management/ui-schema.md` | 页面→组件→字段→交互→Mock 接口的映射关系 |

### 第二步：前端代码

| 步骤 | 文件 | 观察重点 |
|------|------|---------|
| 类型定义 | `frontend/src/features/energy-trade/price-management/types.ts` | 与 architecture.md 实体定义的对应关系 |
| 常量 | `.../constants.ts` | 状态配置、颜色映射的组织方式 |
| User Story 映射 | `.../userStoryMapping.ts` | User Story ID → 组件 ID 的追溯关系 |
| 页面组件 | `.../pages/PriceOverview.tsx` 等 | 组件结构、useOutletContext 用法、i18n 使用 |

### 第三步：集成文件（4 个共享文件）

| 文件 | 观察重点 |
|------|---------|
| `frontend/src/router.tsx` | 价格管理的路由是如何注册的？lazy loading 怎么用？ |
| `frontend/src/components/AppLayout.tsx` | 侧边栏菜单的三级结构（Domain→Sub-group→Leaf） |
| `frontend/src/components/RequirementTag.tsx` | 价格管理模块的 userStoryMapping 是如何注册的？ |
| `frontend/src/locales/zh-CN/index.ts` | `price.*` 命名空间的翻译键组织方式 |

### 走读后自测

完成走读后，你应能回答以下问题：
1. 一个模块从需求到上线，要产出哪些文档和代码文件？
2. `architecture.md` 和 `types.ts` 是什么关系？谁是真相来源？
3. 新模块上线需要同步修改哪些共享文件？
4. RequirementTag 三步注册流程是什么？
5. 侧边栏为什么是三级结构而不是两级？

---

## §6 你的第一个任务 (Day 1-2)

### 认领模块

1. 查看 `docs/MODULE-ASSIGNMENTS.md §2` — 找到状态为"待认领"的模块
2. 与 Roger 沟通确认你要认领的模块
3. 在表中填入你的名字，状态改为 `🔒 已认领`

### 创建分支

```bash
# 从 main 创建你的 feature branch
git checkout main
git pull origin main
git checkout -b feature/<module-id>-<desc>
# 例如: feature/7.1-data-analytics
```

### 开始第一个步骤

1. **Step 0：文档完整性预检** — 确认目标模块的 `docs/features/{domain}/{module}/` 目录存在
2. **Step 2：需求分析** — 产出 `requirements.md`
   - 如果使用 Claude Code："请执行 AGENT-PLAN Step 2，目标模块是 XXX"
   - 如果手动编写：参考价格管理的 `requirements.md` 格式
3. **提交第一个 PR** — 只包含 `requirements.md`，请 Roger review

```bash
git add docs/features/<domain>/<module>/requirements.md
git commit -m "docs(<module>): 完成需求分析 requirements.md"
git push -u origin feature/<module-id>-<desc>
# 创建 PR → 标注"关键文档，需 Roger review"
```

4. Roger approve 后，继续 Step 3（用户故事）→ Step 4（架构设计）→ ...

### 节奏建议

| 步骤 | 预计耗时 | 产出 |
|------|---------|------|
| Step 0-2 需求分析 | 半天 | requirements.md |
| Step 3 用户故事 | 半天 | user-stories.md |
| Step 4 架构设计 | 1 天 | architecture.md（最关键的文档） |
| Step 6-9 UX + UI Schema | 1 天 | ux-design.md + ui-schema.md |
| Step 10 前端工程 | 1-2 天 | 页面组件 + mock 数据 + 集成 |
| Step 11-12 评审修复 | 半天 | UI eval report + P1/P2 修复 |

---

## §7 常见陷阱 Top 10

从 CORRECTIONS.md 30 条历史记录中提炼，按"新人最容易犯"排序：

| # | 陷阱 | 来源 | 如何避免 |
|---|------|------|---------|
| 1 | 跳过 architecture.md 直接写代码 | P3 | architecture.md 是阻断性门禁，必须先写、先确认 |
| 2 | 路由硬编码 | P1 | 所有路由引用 `router.tsx` 常量，组件中不出现路由字符串 |
| 3 | 新模块忘记更新 AppLayout.tsx 菜单 | P2 | 交付 Checklist 第 2 项：导航菜单三级结构 |
| 4 | 忘记 RequirementTag 三步注册 | P2 | ① userStoryMapping.ts ② 注册到 RequirementTag.tsx ③ 页面使用 |
| 5 | Table 有 column width 但没 scroll.x | P2 | `scroll={{ x: sum_of_all_column_widths }}` |
| 6 | i18n key 同时当字符串和对象容器 | P9 | 如果 `a.b` 是对象，则 `t('a.b')` 返回对象不是字符串 |
| 7 | hover/cursor:pointer 但没 onClick | P4 | 有视觉交互暗示就必须有行为——否则是 UI 欺骗 |
| 8 | 统计卡片和列表筛选没有联动 | P4 | 点击统计卡片应切换列表的筛选状态 |
| 9 | 侧边栏没有遵循三级结构 | P1 | Domain → Sub-group → Leaf，保持所有模块一致 |
| 10 | Mock 数据缺少完整生命周期覆盖 | P5 | 必须包含"创建→进行中→已完成"各状态的数据 |

---

## §8 FAQ

**Q: 我可以不用 Claude Code 吗？**
A: 完全可以。14 步流程对人类开发者同样适用。只是 AI 能显著加速文档和代码的起草过程。

**Q: 我可以同时认领两个模块吗？**
A: 不建议。模块互斥原则确保你专注于一个模块的完整交付。完成一个再认领下一个。

**Q: 遇到不确定的术语怎么办？**
A: 先查 `STANDARDS.md §1` 术语表。如果没有，通过团队约定的沟通渠道询问 Roger，确认后注册到 STANDARDS.md。

**Q: PR 被要求修改怎么办？**
A: 正常流程。在你的 feature branch 上修改，commit + push，PR 会自动更新。

**Q: 我的 session 中途被打断怎么办？**
A: 如果用了 Claude Code，下次启动时执行 SESSION-PROTOCOL 启动检查，AI 会自动恢复上下文。如果没用 AI，阅读 PROGRESS.md 顶部的"当前状态"恢复上下文。

**Q: architecture.md 我看不太懂，怎么办？**
A: 这是最关键的文档。先走读价格管理的 architecture.md（§5 范例），理解"实体→API→状态机→DB Schema"的结构。如果仍有疑问，与 Roger 讨论。

**Q: 我发现了一个已有模块的 bug，应该怎么办？**
A: 记录到 CORRECTIONS.md §2 摘要表（如果是模式性问题），然后创建 `fix/` 分支修复，提 PR。不要在你的 feature 分支中修复其他模块的问题。

---

## 附录：项目目录结构速览

```
gas-station-software/
├── CLAUDE.md                    ← Claude Code 自动加载的入口
├── docs/
│   ├── CONSTITUTION.md          ← 8 条最高准则
│   ├── AGENT-PLAN.md            ← 14 步开发流程
│   ├── CORRECTIONS.md           ← 10 大纠偏模式 + 30 条历史教训
│   ├── STANDARDS.md             ← 术语表 + 技术规范
│   ├── SESSION-PROTOCOL.md      ← Session 交接协议
│   ├── ROADMAP.md               ← 总路线图
│   ├── PROGRESS.md              ← 精细进度追踪
│   ├── TEAM-RULES.md            ← 团队行为准则（本文引用）
│   ├── TEAM-ONBOARDING.md       ← 本文档
│   ├── MODULE-ASSIGNMENTS.md    ← 模块认领表
│   ├── cross-module-erd.md      ← 跨模块实体关系图
│   ├── skills/                  ← Skill 定义文件
│   └── features/                ← 每个模块的文档套件
│       └── {domain}/{module}/
│           ├── requirements.md
│           ├── user-stories.md
│           ├── architecture.md  ← ⛔ 阻断性门禁
│           ├── ux-design.md
│           └── ui-schema.md
└── frontend/
    └── src/
        ├── features/            ← 模块前端代码
        │   └── {domain}/{module}/
        │       ├── pages/
        │       ├── components/
        │       ├── types.ts
        │       ├── constants.ts
        │       ├── mockData.ts
        │       └── userStoryMapping.ts
        ├── components/
        │   ├── AppLayout.tsx    ← 侧边栏 + 面包屑
        │   ├── RequirementTag.tsx ← 需求追踪注册
        │   └── Charts/         ← ECharts 基础设施
        ├── locales/
        │   ├── zh-CN/index.ts
        │   └── en-US/index.ts
        ├── router.tsx           ← 路由定义（常量）
        └── mock/                ← Mock 数据
```
