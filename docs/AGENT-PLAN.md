# Agent 结构计划 (Agent Architecture Plan)

**项目：** 加气站运营管理系统
**版本：** 1.0
**更新日期：** 2026-02-07

---

## 1. 设计理念

### 1.1 核心原则

- **先内置，后迁移**：当前基于 Claude Code 内置的 Task 工具调度 SubAgent，后续可迁移至 Claude Agent SDK
- **Skill 驱动**：每个 Agent 的能力由 Skill 文件定义（Prompt 模板 + 流程定义）
- **关注点分离**：不同阶段的工作由不同专业 Agent 负责
- **人在回路**：关键决策点需要用户确认，遵循 CONSTITUTION.md 原则

### 1.2 工作阶段模型

项目工作按以下阶段流转，每个阶段有对应的 Agent 负责：

```
需求分析 → 架构设计 → UI 设计 → 前端实现 → 后端实现 → 测试验证
   ↑                                                        |
   └────────────── 评审反馈循环 ──────────────────────────────┘
```

---

## 2. Agent 层级结构

### 2.1 总览

```
┌─────────────────────────────────────────────────┐
│              Orchestrator (主 Agent)              │
│         用户交互、任务分配、进度管理、决策协调         │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ 需求分析  │ │ 架构设计  │ │ UI 设计   │         │
│  │ Agent    │ │ Agent    │ │ Agent    │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ 前端工程  │ │ 后端工程  │ │ 质量保障  │         │
│  │ Agent    │ │ Agent    │ │ Agent    │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│                                                   │
│  ┌──────────┐                                    │
│  │ 文档管理  │                                    │
│  │ Agent    │                                    │
│  └──────────┘                                    │
└─────────────────────────────────────────────────┘
```

### 2.2 各 Agent 职责定义

#### Orchestrator（主 Agent / 编排者）

- **角色：** 项目总协调，即当前与用户直接交互的 Claude Code 主会话
- **职责：**
  - 接收用户指令，理解意图
  - 将任务分解并分配给对应 SubAgent
  - 管理项目进度（更新 ROADMAP.md）
  - 协调 Agent 间的依赖关系
  - 关键决策点请求用户确认
- **调度方式：** 直接通过 Task 工具调用 SubAgent

#### Agent 1：需求分析 Agent (Requirement Analyst)

- **SubAgent 类型：** `general-purpose`
- **负责 Skills：**
  - `requirement-decomposition` — 需求拆解
  - `user-story-writing` — User Story 编写
  - `glossary-management` — 术语表维护
- **输入：** 需求文档、用户反馈
- **输出：** 拆解后的 User Story、验收标准、术语更新

#### Agent 2：架构设计 Agent (Architect)

- **SubAgent 类型：** `general-purpose`
- **负责 Skills：**
  - `data-model-design` — 数据模型设计
  - `api-design` — API 接口设计
  - `workflow-design` — 业务流程设计
- **输入：** User Story、业务规则
- **输出：** 数据模型定义、API 接口文档、流程图描述

#### Agent 3：UI 设计 Agent (UI Designer)

- **SubAgent 类型：** `general-purpose`
- **负责 Skills：**
  - `ui-schema-design` — UI Schema 编写（页面结构与交互定义）
  - `page-layout-design` — 页面布局设计
  - `component-specification` — 组件规格定义
- **输入：** User Story、UI 规范（STANDARDS.md §4）
- **输出：** UI Schema 文件、页面结构定义、组件使用说明

#### Agent 4：前端工程 Agent (Frontend Engineer)

- **SubAgent 类型：** `general-purpose`（编码任务可用 `Bash` 类型辅助）
- **负责 Skills：**
  - `react-component-development` — React 组件开发
  - `i18n-integration` — 国际化集成
  - `mock-data-creation` — 模拟数据创建
  - `chart-visualization` — 图表可视化实现
- **输入：** UI Schema、数据模型、API 定义、模拟数据规范
- **输出：** React 组件代码、i18n 翻译文件、模拟数据文件

#### Agent 5：后端工程 Agent (Backend Engineer)

- **SubAgent 类型：** `general-purpose`
- **负责 Skills：**
  - `api-implementation` — API 实现
  - `database-migration` — 数据库迁移
  - `business-logic` — 业务逻辑实现
- **输入：** API 设计文档、数据模型
- **输出：** API 代码、数据库迁移脚本、业务逻辑代码
- **备注：** MVP 阶段暂不启用，待后端开发阶段激活

#### Agent 6：质量保障 Agent (QA Engineer)

- **SubAgent 类型：** `general-purpose`
- **负责 Skills：**
  - `code-review` — 代码审查
  - `test-writing` — 测试编写
  - `accessibility-check` — 可访问性检查
- **输入：** 已实现的代码、UI Schema、验收标准
- **输出：** 审查意见、测试代码、问题报告

#### Agent 7：文档管理 Agent (Documentation Manager)

- **SubAgent 类型：** `general-purpose`
- **负责 Skills：**
  - `doc-generation` — 文档生成与更新
  - `changelog-management` — 变更日志管理
- **输入：** 各阶段产出物
- **输出：** 更新后的项目文档、变更记录

---

## 3. 工作流程

### 3.1 单个模块的完整开发流程

以"站点管理"模块为例：

```
步骤 1: Orchestrator 确定目标模块
         ↓
步骤 2: 需求分析 Agent
         → 读取需求文档中"站点管理"相关内容
         → 拆解为 User Story
         → 定义验收标准
         → 输出: docs/features/operations/station/user-stories.md
         ↓
步骤 3: [用户确认 User Story]
         ↓
步骤 4: 架构设计 Agent
         → 设计数据模型（Station, Nozzle, Employee 等）
         → 设计 API 接口
         → 绘制业务流程
         → 输出: docs/features/operations/station/architecture.md
         ↓
步骤 5: [用户确认架构设计]
         ↓
步骤 6: UI 设计 Agent
         → 编写 UI Schema（列表页、详情页、表单页）
         → 定义交互行为
         → 输出: docs/features/operations/station/ui-schema.md
         ↓
步骤 7: [用户确认 UI 设计]
         ↓
步骤 8: 前端工程 Agent
         → 创建模拟数据
         → 实现 React 组件
         → 集成 i18n
         → 输出: src/features/operations/station/ 下的代码文件
         ↓
步骤 9: 质量保障 Agent
         → 代码审查
         → 编写测试
         → 输出: 审查意见、测试文件
         ↓
步骤 10: 文档管理 Agent
          → 更新 ROADMAP.md 进度
          → 更新 CHANGELOG
```

### 3.2 Agent 调度示例（Claude Code Task 工具）

```
# Orchestrator 调度需求分析 Agent 的示例
Task(
  subagent_type="general-purpose",
  description="需求拆解-站点管理",
  prompt="""
  你是需求分析 Agent。请按照以下 Skill 定义执行任务：
  [读取 docs/skills/requirement-decomposition.md 中的流程定义]

  目标模块：基础运营 > 站点管理
  需求来源：requirements/加气站运营管理系统-功能清单-参考.md
  术语规范：docs/STANDARDS.md §1

  请输出：
  1. 拆解后的 User Story 列表
  2. 每个 Story 的验收标准
  3. 需要确认的疑问点
  """
)
```

---

## 4. Skills 目录结构

```
docs/skills/
├── README.md                          # Skills 总览与使用说明
│
├── analysis/                          # 需求分析类 Skills
│   ├── requirement-decomposition.md   # 需求拆解
│   ├── user-story-writing.md          # User Story 编写
│   └── glossary-management.md         # 术语表维护
│
├── architecture/                      # 架构设计类 Skills
│   ├── data-model-design.md           # 数据模型设计
│   ├── api-design.md                  # API 接口设计
│   └── workflow-design.md             # 业务流程设计
│
├── ui/                                # UI 设计类 Skills
│   ├── ui-schema-design.md            # UI Schema 编写
│   ├── page-layout-design.md          # 页面布局设计
│   └── component-specification.md     # 组件规格定义
│
├── frontend/                          # 前端工程类 Skills
│   ├── react-component-development.md # React 组件开发
│   ├── i18n-integration.md            # 国际化集成
│   ├── mock-data-creation.md          # 模拟数据创建
│   └── chart-visualization.md         # 图表可视化实现
│
├── backend/                           # 后端工程类 Skills
│   ├── api-implementation.md          # API 实现
│   ├── database-migration.md          # 数据库迁移
│   └── business-logic.md              # 业务逻辑实现
│
└── quality/                           # 质量保障类 Skills
    ├── code-review.md                 # 代码审查
    ├── test-writing.md                # 测试编写
    └── accessibility-check.md         # 可访问性检查
```

---

## 5. Skill 文件格式规范

每个 Skill 文件遵循统一格式：

```markdown
# Skill: [Skill 名称]

## 元信息
- **Skill ID:** [唯一标识]
- **所属 Agent:** [对应的 Agent 名称]
- **输入:** [需要什么输入]
- **输出:** [产出什么结果]
- **依赖:** [依赖哪些其他 Skill 的产出]

## 流程定义

### 步骤 1: [步骤名称]
[具体操作说明]

### 步骤 2: [步骤名称]
[具体操作说明]

...

## Prompt 模板

[Agent 执行此 Skill 时使用的 Prompt 模板，包含变量占位符]

## 输出格式

[输出文件的格式规范和示例]

## 检查清单

- [ ] 检查项 1
- [ ] 检查项 2
...
```

---

## 6. 实施计划

### 6.1 当前阶段（MVP 前准备）

需要优先创建的 Skills（按开发流程顺序）：

| 优先级 | Skill | 原因 |
|--------|-------|------|
| P0 | `requirement-decomposition` | 所有模块开发的起点 |
| P0 | `user-story-writing` | 需求确认的载体 |
| P0 | `ui-schema-design` | 前端开发的直接输入 |
| P1 | `data-model-design` | 模拟数据和组件的基础 |
| P1 | `mock-data-creation` | MVP 阶段的数据来源 |
| P1 | `react-component-development` | 核心编码 Skill |
| P1 | `i18n-integration` | 贯穿所有页面 |
| P2 | `workflow-design` | 复杂业务流程需要 |
| P2 | `api-design` | 后端阶段需要 |
| P2 | `chart-visualization` | 数据分析模块需要 |
| P3 | 其余 Skills | 按需创建 |

### 6.2 后续演进

- 当 Skill 文件积累到一定程度，评估是否迁移至 Claude Agent SDK
- 根据实际使用效果迭代 Skill 定义
- 考虑引入 MCP Server 扩展 Agent 能力（如设计工具集成）

---

*创建时间：2026-02-07*
*版本：1.0*
