# Agent 结构计划 (Agent Architecture Plan)

**项目：** 加气站运营管理系统
**版本：** 1.8
**更新日期：** 2026-02-28

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
  - `data-model-design` — 综合架构设计（含数据模型、API 设计、聚合接口分析、权限矩阵、数据完整性约束、MySQL 8.0 Schema 草案、跨模块 ERD 更新）
  - `workflow-design` — 业务流程设计（复杂流程模块按需启用）
- **输入：** User Story、业务规则、`cross-module-erd.md`（已有跨模块实体关系）
- **输出：** architecture.md（数据模型 + API 端点 + 权限矩阵 + 数据完整性约束 + MySQL 8.0 Schema 草案）、更新后的 `cross-module-erd.md`
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
  - `react-component-development` — React 组件开发（✅ 含 Import 12 层规范、状态管理模式、Ant Design 组件模式、交互完整性规则、18 项检查清单）
  - `mock-data-creation` — 模拟数据创建（✅ 含生命周期全覆盖、数据质量 8 项验证、常见错误防范）
  - `i18n-integration` — 国际化集成（✅ 含键命名规范、状态标签处理、完整性验证）
  - `chart-visualization` — 图表可视化实现（✅ 已创建）
- **输入：** UI Schema、数据模型（architecture.md）、API 定义、术语规范（STANDARDS.md §1）
- **输出：** React 组件代码、i18n 翻译文件、模拟数据文件
- **执行顺序：** `react-component-development`（步骤 1-3: types.ts → constants.ts → 目录结构）→ `mock-data-creation` → `react-component-development`（步骤 4-6: 页面组件 → userStoryMapping → 路由注册）→ `i18n-integration` → `react-component-development`（步骤 7: 编译验证）

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
  - `api-implementation` — API 实现（Flask Blueprint + flask-smorest）
  - `database-migration` — 数据库迁移（Flask-Migrate / Alembic）
  - `business-logic` — 业务逻辑实现（Service 层）
- **输入：** `architecture.md`（API 端点 + DB Schema 草案）、`cross-module-erd.md`、`STANDARDS.md §8-10`
- **输出：** SQLAlchemy Models、Marshmallow Schemas、Flask Blueprints、Service 层、pytest 测试、迁移文件
- **启用时机：** B0 基础设施完成后，按模块逐步实现（B1 → B2 → B3+，见 ROADMAP §7）

##### BE Step 1：API 契约验证

```
→ 读取 architecture.md §API 端点
→ 核验每个端点的 method / path / request / response 是否完整
→ 确认路径前缀统一为 /api/v1/（纠正不一致的历史模块，见 STANDARDS §6.1）
→ 对缺少请求体/响应体示例的写操作端点补充说明（CORRECTIONS P10）
→ 输出：API 契约验证清单（哪些端点可直接实现，哪些需补充设计）
```

##### BE Step 2：SQLAlchemy Models

```
→ 以 architecture.md §MySQL 8.0 Schema 为唯一真相来源创建 Models
→ 遵循 STANDARDS §8.3 Model 规范（审计字段、软删除、关系显式声明）
→ 执行 flask db migrate -m "<描述>" 生成迁移文件
→ 执行 flask db upgrade 验证迁移无误
→ 输出：backend/app/models/{module}.py + migrations/versions/{ts}_{desc}.py
```

##### BE Step 3：Marshmallow Schemas

```
→ 为每个 Model 创建对应 Schema（序列化输出 + 输入验证）
→ 列出所有必填字段、枚举值约束、业务校验规则（对应 architecture.md §业务规则）
→ 输出：backend/app/schemas/{module}.py
```

##### BE Step 4：Service 层业务逻辑

```
→ 将 architecture.md §业务规则 翻译为 Python Service 方法
→ Service 方法不依赖 Flask request/response（纯业务逻辑，便于单元测试）
→ 为每个 Service 方法编写单元测试（pytest，目标 >= 80% 覆盖率）
→ 输出：backend/app/services/{module}_service.py + tests/unit/test_{module}_service.py
```

##### BE Step 5：Flask Blueprint（路由层）

```
→ 对照 architecture.md §API 端点逐一实现
→ 遵循 STANDARDS §8.4 Blueprint 规范（flask-smorest 装饰器）
→ 在 app/api/__init__.py 注册新 Blueprint
→ 编写 API 集成测试（pytest-flask，测试每个端点的正常/异常场景）
→ 输出：backend/app/api/{module}s.py + tests/test_{module}s.py
```

##### BE Step 6：API 集成验证

```
→ 启动 Flask dev server（flask run）
→ 在 Swagger UI (/api/docs/) 验证所有端点文档正确
→ 用 curl 或 Swagger UI 验证关键端点返回符合 STANDARDS §6.4 响应结构
→ 确认 JWT 认证保护端点（403/401 场景测试）
→ 输出：后端模块交付 Checklist（见 Step 12i）
```

##### 特别注意事项

1. **API 合同优先**：后端开发第一步是验证 architecture.md 的 API 设计是否完整，而非直接写代码
2. **device-ledger 类型核验**：该模块 architecture.md 为事后补创，实现时必须对比前端 types.ts 逐字段核验一致性
3. **时序数据策略**：`EquipmentMonitoringLog` 是时序数据，需在后端初始化时确定存储策略（MySQL 分区表 / 分区归档）
4. **交接班模块 API 前缀**：该模块 architecture.md 历史上使用 `/api/` 前缀，后端实现时统一改为 `/api/v1/`

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
步骤 3.5: 反向影响审查（Orchestrator 执行）
          → 检查本模块的 requirements.md 中所有跨模块依赖（§跨模块依赖）
          → 对每个上游模块，检查其 architecture.md 是否已声明本模块为下游消费者
          → 如未声明 → 记录待补充项，在本模块 architecture.md 编写时一并处理
          → 输出: 上游模块待补充清单（哪些 architecture.md 需要回溯更新）
         ↓
步骤 4: 架构设计 Agent
         → 执行"实体三问"分析（每个核心实体）
         → 设计数据模型（Station, Nozzle, Employee 等）
         → 设计 API 接口（含聚合接口前置分析）
         → 定义数据完整性约束
         → 绘制业务流程
         → 生成 MySQL 8.0 Schema 草案（ENUM 类型 + CREATE TABLE + 索引 + 约束）
         → 更新 docs/cross-module-erd.md（新增实体、跨模块 FK、迁移层级）
         → 跨模块数据流定义（CORRECTIONS P7 规则 5-6）：
           - 列出所有下游消费者（谁消费本模块的数据、消费方式）
           - 定义跨模块触发机制（事件/轮询/同步调用）、触发条件、数据契约
           - 如步骤 3.5 识别出上游待补充项 → 在本模块 architecture.md
             的"跨模块依赖"章节中补充完整数据流定义
         → 输出: docs/features/operations/station/architecture.md
         ↓
步骤 5: [用户确认架构设计]
         ⛔ 阻断性验证：architecture.md 必须存在且包含
            全部必要章节（实体三问、API 端点、权限矩阵、
            数据完整性约束、MySQL 8.0 Schema 草案），否则禁止进入步骤 6
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
步骤 9.5: 术语一致性扫描（文档阶段出口检查）
          → 执行 `glossary-management` Skill（docs/skills/analysis/glossary-management.md）
          → 以 STANDARDS.md §1 为基准，扫描 5 份文档的术语一致性
          → 检查：页面名称、组件名、路由、菜单文案在文档间是否统一
          → 检查：新增术语是否已注册到 STANDARDS.md §1
          → 如有不一致 → 修正文档后继续
          → 如有新增术语 → 更新 STANDARDS.md 后继续
          ↓
步骤 10: 前端工程 Agent（按 3 个 Skill 分步执行）
          → 10a: `react-component-development` 步骤 1-3
            → 搭建模块目录结构
            → 编写 types.ts（以 architecture.md 为唯一真相来源）
            → 编写 constants.ts（状态配置 + getLabel）
          → 10b: `mock-data-creation`
            → 创建 mock 数据（生命周期全覆盖、数据质量验证）
          → 10c: `react-component-development` 步骤 4-6
            → 实现页面组件（Import 12 层顺序、交互完整性规则）
            → 编写 userStoryMapping.ts + 注册到 RequirementTag.tsx
            → 路由注册 + 侧边栏菜单（3 层模式）
          → 10d: `i18n-integration`
            → 提取翻译键、编写 zh-CN/en-US、组件 t() 集成
          → 10e: `react-component-development` 步骤 7
            → npm run build 编译验证
          → 输出: frontend/src/features/{domain}/{module}/ 下的代码文件
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
            ☐ MySQL 8.0 Schema 草案已包含在 architecture.md 中
            ☐ cross-module-erd.md 已更新（新模块实体 + 跨模块 FK）
            ☐ API Docs 页面数据同步更新（apiData.ts）
            ☐ 跨模块数据流完整性（CORRECTIONS P7 规则 5-7）：
              ☐ a. architecture.md 已列出所有下游消费者（不仅"我依赖谁"，还有"谁依赖我"）
              ☐ b. 每条跨模块数据流已定义触发机制（事件/轮询/同步）和数据契约（字段列表）
              ☐ c. 上游模块 architecture.md 已回溯补充本模块为消费者（步骤 3.5 识别项已处理）
            ☐ 术语合规（Terminology Compliance，详见 `docs/skills/analysis/glossary-management.md`）：
              ☐ a. 所有新增术语已录入 STANDARDS.md §1（含中英文 + 代码命名）
              ☐ b. 文档间术语命名一致（页面名称、组件名、路由、菜单、面包屑在 5 份文档中统一）
              ☐ c. i18n key 与 STANDARDS.md 术语对齐
            ☐ npm run build 编译通过
          → 有遗漏项则修复后重新验证
          ↓ (前端交付验证通过)

步骤 12i-BE：后端模块交付 Checklist（后端完成该模块 BE Step 1~6 后执行）
          → 逐项验证后端模块集成完整性：
            ☐ SQLAlchemy Model 字段与 architecture.md §DB Schema 一一对应（含审计字段、软删除）
            ☐ Flask-Migrate 迁移文件已创建且 `flask db upgrade` 可成功执行
            ☐ Marshmallow Schema 覆盖所有 Model 字段（含输入验证规则）
            ☐ 所有 API 端点已按 architecture.md §API 端点实现（方法、路径、状态码）
            ☐ API 响应结构符合 STANDARDS.md §6.4 规范（data / pagination / error）
            ☐ pytest 测试套件全部通过（Service 单元测试 >= 80% 覆盖 + API 集成测试）
            ☐ Swagger UI 文档完整（/api/docs/ 所有端点可见、schema 正确）
            ☐ JWT 认证保护已验证（401/403 场景测试通过）
            ☐ 迁移文件已 commit（与代码变更在同一 PR）
          → 有遗漏项则修复后重新验证
          ↓ (后端交付验证通过)
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
│   └── glossary-management.md         # ✅ 术语表维护
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
│   ├── react-component-development.md # ✅ React 组件开发（Import 规范 + 状态管理 + 交互规则）
│   ├── mock-data-creation.md          # ✅ 模拟数据创建（生命周期覆盖 + 质量验证）
│   ├── i18n-integration.md            # ✅ 国际化集成（键命名 + 状态标签处理）
│   └── chart-visualization.md         # ✅ 图表可视化实现
│
├── backend/                           # 后端工程类 Skills
│   ├── api-implementation.md          # 🔜 API 实现（Flask Blueprint + flask-smorest，B0 完成后优先创建）
│   ├── database-migration.md          # 🔜 数据库迁移（Flask-Migrate / Alembic，B0 完成后优先创建）
│   └── business-logic.md              # 🔜 业务逻辑实现（Service 层 + pytest，B0 完成后优先创建）
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
| P0 | `data-model-design` | 架构门禁：前端实现的前置条件（含实体三问 + 聚合接口分析 + MySQL 8.0 Schema + 跨模块 ERD） | ✅ 已创建 v1.2 |
| P0 | `ux-design` | 用户体验设计，ui-schema-design 的前置输入 | ✅ 已创建 |
| P0 | `ui-schema-design` | 前端开发的直接输入 | ✅ 已创建 |
| P0 | `ui-eval` | 前端实现后的质量门禁（Phase 1 验证为关键环节） | ✅ 已创建 |
| P1 | `react-component-development` | 核心编码 Skill（含 Import 规范、状态管理、Ant Design 模式、交互规则） | ✅ 已创建 |
| P1 | `mock-data-creation` | MVP 阶段的数据来源（含生命周期覆盖、数据质量验证） | ✅ 已创建 |
| P1 | `i18n-integration` | 贯穿所有页面（含键命名规范、状态标签处理） | ✅ 已创建 |
| P2 | `workflow-design` | 复杂业务流程需要 | ☐ 待创建 |
| P2 | `chart-visualization` | 数据分析模块需要（含 ECharts 共享组件层、主题集成、占位符替换流程） | ✅ 已创建 |
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

## 8. 团队协作协议

> **详细文档：** 团队协作的完整规范分布在三个专项文档中，本节提供摘要和引用。
> - `docs/TEAM-RULES.md` — 三级行为准则（推荐/不建议/禁止）
> - `docs/TEAM-ONBOARDING.md` — 新成员引导手册（Day 0→Day 1→Day 2）
> - `docs/MODULE-ASSIGNMENTS.md` — 模块认领表 + 共享文件协议 + Git 分支与 PR 流程

### 8.1 新成员启动

新成员加入项目时，按 `docs/TEAM-ONBOARDING.md` 引导手册执行：

1. **Day 0：环境搭建** — clone 仓库 → `npm install` → `npm run dev` → `npm run build` 验证
2. **Day 0-1：必读文档** — 按 TEAM-ONBOARDING §3 的人类优化阅读路径（约 2 小时）
3. **Day 1：范例走读** — 以价格管理模块为范例，端到端走读完整文档套件和代码（TEAM-ONBOARDING §5）
4. **Day 1-2：认领第一个模块** — 在 `MODULE-ASSIGNMENTS.md` 认领 → 创建 feature branch → 执行 AGENT-PLAN Step 0

### 8.2 行为准则

所有团队成员必须遵守 `docs/TEAM-RULES.md` 定义的三级行为准则：

| 级别 | 说明 | 条目数 |
|------|------|--------|
| §1 推荐做法 (MUST DO) | 流程纪律、代码规范、协作纪律、AI 使用 | 16 条 |
| §2 不建议做法 (DON'T) | 不会立即出问题但增加风险的行为 | 8 条 |
| §3 禁止事项 (PROHIBITED) | 硬性红线，违规必须 revert | 9 条 |

### 8.3 多人并行开发

| 规则 | 说明 | 详见 |
|------|------|------|
| 模块互斥 | 同一时间只有一人开发同一模块 | `MODULE-ASSIGNMENTS.md §1` |
| 模块认领 | 开始前必须在认领表登记 | `MODULE-ASSIGNMENTS.md §2` |
| 共享文件协议 | 修改共享文件前 `git pull`，只改自己模块区块 | `MODULE-ASSIGNMENTS.md §3` |
| 分支策略 | feature branch 开发，PR 合入 main，禁止直接 push | `MODULE-ASSIGNMENTS.md §4` |
| 分层审批 | 关键文档→Roger 审批；纯代码→团队互审 | `TEAM-RULES.md §4` |
| 进度标注 | `PROGRESS.md` 每条记录标注作者 `[姓名]` | `SESSION-PROTOCOL.md §4` |
| 术语新增 | 新增术语先注册 STANDARDS.md，再通知团队 | `TEAM-RULES.md §1.3` |

### 8.4 知识传递路径

**AI Agent 阅读顺序**（Claude Code 自动加载 CLAUDE.md 后按以下顺序）：

```
CLAUDE.md（入口指令，自动加载）
  → TEAM-RULES.md（行为边界）
  → CONSTITUTION.md（最高准则）
  → AGENT-PLAN.md（本文档，编排蓝图）
  → CORRECTIONS.md（纠偏模式，防止重复犯错）
  → STANDARDS.md（术语 + 技术规范）
  → SESSION-PROTOCOL.md（会话协议）
  → MODULE-ASSIGNMENTS.md（认领状态 + 共享文件协议）
  → Skills 文件（按需阅读当前阶段涉及的 Skill）
  → 目标模块的 features/{domain}/{module}/ 文档套件
```

**人类团队成员阅读顺序**：见 `docs/TEAM-ONBOARDING.md §3`（按时间效益优化，与 AI 顺序不同）。

### 8.5 模块认领与交接

- **认领**：在 `docs/MODULE-ASSIGNMENTS.md §2` 登记，认领后 3 个工作日内提交首个 PR
- **交接**：参考 `docs/SESSION-PROTOCOL.md §3` 的交接清单模板，在 `PROGRESS.md` 中记录交接信息
- **释放**：如因故无法继续，及时在认领表中释放模块并通知团队

---

*创建时间：2026-02-07*
*最后更新：2026-03-04*
*版本：1.9*
