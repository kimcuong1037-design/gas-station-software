# Agent 结构计划 (Agent Architecture Plan)

**项目：** 加气站运营管理系统
**版本：** 1.6
**更新日期：** 2026-02-25

---

## 1. 设计理念

### 1.1 核心原则

- **先内置，后迁移**：当前基于 Claude Code 内置的 Task 工具调度 SubAgent，后续可迁移至 Claude Agent SDK
- **Skill 驱动**：每个 Agent 的能力由 Skill 文件定义（Prompt 模板 + 流程定义）
- **关注点分离**：不同阶段的工作由不同专业 Agent 负责
- **人在回路**：关键决策点需要用户确认，遵循 CONSTITUTION.md 原则
- **分批执行**：涉及超过 5 个文件的修改任务应拆分为多个子任务，每批完成后执行 `npm run build` 验证，确保质量后再进行下一批

### 1.2 工作阶段模型

项目工作按以下阶段流转，每个阶段有对应的 Agent 负责：

```
需求分析 → 架构设计 → UI 设计 → 前端实现 → UI 评审 → 后端实现 → 测试验证
   ↑                                                              |
   └─────────────────── 评审反馈循环 ──────────────────────────────┘
```

---

## 2. Agent 层级结构

### 2.1 总览

```
┌───────────────────────────────────────────────────────────┐
│                  Orchestrator (主 Agent)                    │
│           用户交互、任务分配、进度管理、决策协调             │
├───────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 需求分析  │ │ 架构设计  │ │ UI 设计   │ │ 前端工程  │      │
│  │ Agent    │ │ Agent    │ │ Agent    │ │ Agent    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ UI 评审   │ │ 后端工程  │ │ 质量保障  │ │ 文档管理  │      │
│  │ Agent    │ │ Agent    │ │ Agent    │ │ Agent    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
└───────────────────────────────────────────────────────────┘
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
  - `data-model-design` — 综合架构设计（含数据模型、API 设计、聚合接口分析、权限矩阵、数据完整性约束、PostgreSQL Schema 草案、跨模块 ERD 更新）
  - `workflow-design` — 业务流程设计（复杂流程模块按需启用）
- **输入：** User Story、业务规则、`cross-module-erd.md`（已有跨模块实体关系）
- **输出：** architecture.md（数据模型 + API 端点 + 权限矩阵 + 数据完整性约束 + PostgreSQL Schema 草案）、更新后的 `cross-module-erd.md`
- **阻断性规则：** architecture.md 是进入前端实现的硬门禁，文件不存在时流程停止

#### Agent 3：UI 设计 Agent (UI Designer)

- **SubAgent 类型：** `general-purpose`
- **负责 Skills：**
  - `ux-design` — 用户体验设计（用户视角的流程优化、交互效率、导航清晰度）
  - `ui-schema-design` — UI Schema 编写（页面结构与交互定义）
  - `page-layout-design` — 页面布局设计
  - `component-specification` — 组件规格定义
- **输入：** User Story、行业知识库、UI/UX 规范（STANDARDS.md §4）
- **输出：** UX 设计文档、UI Schema 文件、页面结构定义、组件使用说明
- **执行顺序：** `ux-design` → `ui-schema-design` → `page-layout-design`

#### Agent 4：前端工程 Agent (Frontend Engineer)

- **SubAgent 类型：** `general-purpose`（编码任务可用 `Bash` 类型辅助）
- **负责 Skills：**
  - `react-component-development` — React 组件开发
  - `i18n-integration` — 国际化集成
  - `mock-data-creation` — 模拟数据创建
  - `chart-visualization` — 图表可视化实现
- **输入：** UI Schema、数据模型、API 定义、模拟数据规范
- **输出：** React 组件代码、i18n 翻译文件、模拟数据文件

#### Agent 5：UI 评审 Agent (UI Evaluator)

- **SubAgent 类型：** `general-purpose`
- **负责 Skills：**
  - `ui-eval` — UI 评估（视觉保真度、功能正确性、无障碍性、代码质量、性能、用户体验）
- **输入：** 已实现的 React 组件、UI Schema、设计规范（STANDARDS.md §4）
- **输出：** UI 评估报告（评分、发现、改进建议）
- **触发时机：** 前端工程 Agent 完成组件开发后
- **工作模式：**
  - 按六大维度评估：视觉保真度(20%)、功能正确性(25%)、无障碍性(20%)、代码质量(15%)、性能(10%)、用户体验(10%)
  - 输出可操作的改进建议
  - 评分低于阈值时触发修复迭代
- **迭代修复规则：**
  - 评估后进入修复阶段，**但修复前必须先完成 P1 优先级二次分类**：
    1. 对所有 P1 问题分类为“业务影响”（路由断裂、功能缺失）vs“体验影响”（样式、i18n、无障碍）
    2. 评估每个问题的修复代价（低/中/高）
    3. 向用户展示分类结果并等待确认
    4. 用户确认后再执行具体修复
  - P1 问题全部修复后，继续修复 P2（可选改进）问题
  - 修复完成后重新评估，循环直到所有 P1 问题解决且 P2 问题基本解决
  - 如遇到不易修复的问题（如需要重大架构调整、外部依赖等），主动询问用户是否：
    1. 暂停修复，继续后续流程
    2. 记录为技术债务，后续迭代处理
    3. 提供更多上下文以尝试其他方案

#### Agent 6：后端工程 Agent (Backend Engineer)

- **SubAgent 类型：** `general-purpose`
- **负责 Skills：**
  - `api-implementation` — API 实现
  - `database-migration` — 数据库迁移
  - `business-logic` — 业务逻辑实现
- **输入：** API 设计文档、数据模型、PostgreSQL Schema 草案（architecture.md §DB Schema）、`cross-module-erd.md`
- **输出：** API 代码、数据库迁移脚本、业务逻辑代码
- **启用时机：** Phase 2 开始启用（Phase 1 模块 API 实现）
- **Phase 2 特别注意事项：**
  1. **API 合同优先**：后端开发第一步是验证 architecture.md 的 API 设计是否完整，而非直接写代码
  2. **前后端类型共享**：考虑建立 `shared/types/` 目录存放公共类型定义，前后端共享引用
  3. **device-ledger 类型核验**：该模块 architecture.md 为事后补创，后端实现时必须对比前端 types.ts 逐字段核验一致性
  4. **时序数据策略**：`EquipmentMonitoringLog` 是时序数据，需在后端初始化时确定存储策略（TimescaleDB / 分区归档 / 独立时序库）

#### Agent 7：质量保障 Agent (QA Engineer)

- **SubAgent 类型：** `general-purpose`
- **负责 Skills：**
  - `code-review` — 代码审查
  - `test-writing` — 测试编写
  - `accessibility-check` — 可访问性检查
- **输入：** 已实现的代码、UI Schema、验收标准
- **输出：** 审查意见、测试代码、问题报告

#### Agent 8：文档管理 Agent (Documentation Manager)

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
步骤 0: Orchestrator 文档完整性预检
         → 检查目标模块文档目录是否存在
         → 输出"文档完整性 checklist"：
           ☐ requirements（需求来源已确认）
           ☐ user-stories.md
           ☐ architecture.md
           ☐ ux-design.md
           ☐ ui-schema.md
         → 标记当前阶段（哪些已存在、从哪一步开始）
         ↓
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
         → 执行"实体三问"分析（每个核心实体）
         → 设计数据模型（Station, Nozzle, Employee 等）
         → 设计 API 接口（含聚合接口前置分析）
         → 定义数据完整性约束
         → 绘制业务流程
         → 生成 PostgreSQL Schema 草案（ENUM 类型 + CREATE TABLE + 索引 + 约束）
         → 更新 docs/cross-module-erd.md（新增实体、跨模块 FK、迁移层级）
         → 输出: docs/features/operations/station/architecture.md
         ↓
步骤 5: [用户确认架构设计]
         ⛔ 阻断性验证：architecture.md 必须存在且包含
            全部必要章节（实体三问、API 端点、权限矩阵、
            数据完整性约束、PostgreSQL Schema 草案），否则禁止进入步骤 6
         ⛔ cross-module-erd.md 必须已更新（新模块实体已纳入）
         ↓
步骤 6: UI 设计 Agent (UX 设计)
         → 分析用户角色和核心任务流程
         → 优化操作效率（高频操作 ≤3 次点击）
         → 设计导航层级和信息架构
         → 设计引导、帮助、错误预防机制
         → 输出: docs/features/operations/station/ux-design.md
         ↓
步骤 7: [用户确认 UX 设计]
         ↓
步骤 8: UI 设计 Agent (UI Schema)
         → 编写 UI Schema（列表页、详情页、表单页）
         → 定义交互行为
         → 输出: docs/features/operations/station/ui-schema.md
         ↓
步骤 9: [用户确认 UI Schema]
         ↓
步骤 10: 前端工程 Agent
          → 创建模拟数据
          → 实现 React 组件
          → 集成 i18n
          → 输出: src/features/operations/station/ 下的代码文件
          ↓
步骤 11: UI 评审 Agent
          → 按六大维度评估 UI 质量
          → 输出: docs/features/operations/station/ui-eval-report.md
          ↓
步骤 12: UI 评审修复迭代循环
          ┌─────────────────────────────────────────────────────┐
          │  12a: 检查评估报告中的 P1（重要）和 P2（改进）问题     │
          │       ↓                                              │
          │  12b: 如有 P1/P2 问题 → 前端工程 Agent 自动修复       │
          │       - 优先修复 P1 问题                             │
          │       - P1 完成后修复 P2 问题                        │
          │       ↓                                              │
          │  12c: 修复完成 → 重新编译验证                        │
          │       ↓                                              │
          │  12d: UI 评审 Agent 重新评估                         │
          │       ↓                                              │
          │  12e: 检查是否仍有未解决的 P1/P2 问题                 │
          │       ↓                                              │
          │  12f: 如有 → 返回 12b 继续修复                       │
          │  12g: 如遇到不易修复的问题 → 询问用户                 │
          │       - 选项 1: 暂停修复，继续后续流程               │
          │       - 选项 2: 记录为技术债务，后续处理             │
          │       - 选项 3: 提供更多上下文尝试其他方案           │
          │       ↓                                              │
          │  12h: 所有 P1 问题已解决且 P2 基本解决 → 退出循环    │
          └─────────────────────────────────────────────────────┘
          ↓ (评估通过)
步骤 12i: 模块交付 Checklist（Orchestrator 执行）
          → 逐项验证模块集成完整性：
            ☐ 路由注册（router.tsx 中已添加模块路由）
            ☐ 导航菜单（AppLayout 侧边栏已添加入口）
            ☐ i18n 翻译完整（中英文 key 无遗漏）
            ☐ 需求追踪集成（RequirementTag Protocol，详见 §7）：
              ☐ a. userStoryMapping.ts 已创建且覆盖所有 User Story
              ☐ b. RequirementTag.tsx 已 import 新模块的 mapping 并注册到 moduleStories
              ☐ c. 每个页面组件的标题区域已添加 <RequirementTag> 并关联正确的 componentIds
            ☐ PostgreSQL Schema 草案已包含在 architecture.md 中
            ☐ cross-module-erd.md 已更新（新模块实体 + 跨模块 FK）
            ☐ API Docs 页面数据同步更新（apiData.ts）
            ☐ npm run build 编译通过
          → 有遗漏项则修复后重新验证
          ↓ (交付验证通过)
步骤 13: 质量保障 Agent
          → 代码审查
          → 编写测试
          → 输出: 审查意见、测试文件
          ↓
步骤 14: 文档管理 Agent
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
│   ├── requirement-decomposition.md   # ✅ 需求拆解
│   ├── user-story-writing.md          # ✅ User Story 编写
│   └── glossary-management.md         # ☐ 术语表维护
│
├── architecture/                      # 架构设计类 Skills
│   ├── data-model-design.md           # ✅ 综合架构设计（数据模型 + API + 权限 + 约束）
│   └── workflow-design.md             # ☐ 业务流程设计（复杂流程模块按需）
│
├── ui/                                # UI 设计类 Skills
│   ├── ux-design.md                   # ✅ 用户体验设计（流程优化、交互效率）
│   ├── ui-schema-design.md            # ✅ UI Schema 编写
│   ├── ui-eval.md                     # ✅ UI 评估（六大维度质量评审）
│   ├── page-layout-design.md          # ☐ 页面布局设计
│   └── component-specification.md     # ☐ 组件规格定义
│
├── frontend/                          # 前端工程类 Skills
│   ├── react-component-development.md # ☐ React 组件开发
│   ├── i18n-integration.md            # ☐ 国际化集成
│   ├── mock-data-creation.md          # ☐ 模拟数据创建
│   └── chart-visualization.md         # ☐ 图表可视化实现
│
├── backend/                           # 后端工程类 Skills
│   ├── api-implementation.md          # ☐ API 实现
│   ├── database-migration.md          # ☐ 数据库迁移
│   └── business-logic.md              # ☐ 业务逻辑实现
│
└── quality/                           # 质量保障类 Skills
    ├── code-review.md                 # ☐ 代码审查
    ├── test-writing.md                # ☐ 测试编写
    └── accessibility-check.md         # ☐ 可访问性检查
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

| 优先级 | Skill | 原因 | 状态 |
|--------|-------|------|------|
| P0 | `requirement-decomposition` | 所有模块开发的起点 | ✅ 已创建 |
| P0 | `user-story-writing` | 需求确认的载体 | ✅ 已创建 |
| P0 | `data-model-design` | 架构门禁：前端实现的前置条件（含实体三问 + 聚合接口分析 + PostgreSQL Schema + 跨模块 ERD） | ✅ 已创建 v1.2 |
| P0 | `ux-design` | 用户体验设计，ui-schema-design 的前置输入 | ✅ 已创建 |
| P0 | `ui-schema-design` | 前端开发的直接输入 | ✅ 已创建 |
| P0 | `ui-eval` | 前端实现后的质量门禁（Phase 1 验证为关键环节） | ✅ 已创建 |
| P1 | `mock-data-creation` | MVP 阶段的数据来源 | ☐ 待创建 |
| P1 | `react-component-development` | 核心编码 Skill | ☐ 待创建 |
| P1 | `i18n-integration` | 贯穿所有页面 | ☐ 待创建 |
| P2 | `workflow-design` | 复杂业务流程需要 | ☐ 待创建 |
| P2 | `chart-visualization` | 数据分析模块需要 | ☐ 待创建 |
| P3 | 其余 Skills | 按需创建 | ☐ |

### 6.2 后续演进

- 当 Skill 文件积累到一定程度，评估是否迁移至 Claude Agent SDK
- 根据实际使用效果迭代 Skill 定义
- 考虑引入 MCP Server 扩展 Agent 能力（如设计工具集成）

---

## 7. RequirementTag 需求追踪协议

### 7.1 目的

确保每个前端页面组件都可追溯到其对应的 User Story，提供从需求 → 用户故事 → UI 组件的完整链路。此机制仅在开发模式下可见（`devOnly=true`），不影响生产构建。

### 7.2 集成三步法（每个新模块必须执行）

#### Step 1: 创建 userStoryMapping.ts

在模块目录下创建映射文件，覆盖该模块所有 User Story：

```
frontend/src/features/{domain}/{module}/userStoryMapping.ts
```

每个条目包含：
- `us`: User Story ID 数组（如 `['US-001']`）
- `desc`: 功能描述
- `priority`: `'MVP' | 'MVP+' | 'PROD' | 'FUTURE'`
- `status`: `'implemented' | 'partial' | 'planned' | 'not-planned'`

#### Step 2: 注册到 RequirementTag.tsx

在 `frontend/src/components/RequirementTag.tsx` 中：
1. **Import** 新模块的映射：`import { xxxUserStories } from '../features/{domain}/{module}/userStoryMapping';`
2. **Spread** 到 `allUserStories` 对象
3. **注册** 到 `moduleStories` 对象，key 为模块短名（如 `'price-management'`）

#### Step 3: 在页面组件中添加标记

每个页面组件的标题区域添加 `<RequirementTag>`：

```tsx
import { RequirementTag } from '../../../../components/RequirementTag';

// 在页面标题旁
<Space align="center">
  <Title level={4} style={{ margin: 0 }}>页面标题</Title>
  <RequirementTag
    componentIds={['component-id-1', 'component-id-2']}
    module="module-short-name"
    showDetail
  />
</Space>
```

**componentIds 选择原则：** 包含该页面实现或承载的所有 userStoryMapping 条目 ID。

### 7.3 验证方法

交付时用以下命令快速验证：

```bash
# 检查模块页面文件是否都包含 RequirementTag
grep -rL "RequirementTag" frontend/src/features/{domain}/{module}/pages/*.tsx

# 检查 RequirementTag.tsx 是否已注册新模块
grep "{module}UserStories" frontend/src/components/RequirementTag.tsx
```

如有文件缺失则交付不通过。

### 7.4 已注册模块清单

| 模块 | moduleStories Key | 映射文件路径 | 页面数 |
|------|-------------------|-------------|--------|
| 站点管理 | `station` | `features/operations/station/userStoryMapping.ts` | - |
| 交接班 | `shift-handover` | `features/operations/shift-handover/userStoryMapping.ts` | - |
| 设备台账 | `device-ledger` | `features/operations/device-ledger/userStoryMapping.ts` | - |
| 巡检安检 | `inspection` | `features/operations/inspection/userStoryMapping.ts` | 17 |
| 价格管理 | `price-management` | `features/energy-trade/price-management/userStoryMapping.ts` | 7 |

> **新模块上线时务必更新此清单。**

---

*创建时间：2026-02-07*
*最后更新：2026-02-25*
*版本：1.6*
