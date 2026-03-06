# Gas Station Operations Management System

加气站运营管理系统 — React + TypeScript + Ant Design 前端原型，当前处于 UI 原型阶段（mock 数据驱动）。

## 文档分层加载策略

> **Context 优化原则：** 不要一次性加载全部文档。按需分层加载，节省 context 窗口。

### Layer 0: 自动加载（本文件 + memory）

- `CLAUDE.md`（本文件）— 关键约定、禁止事项、Checklist 已内联
- `memory/MEMORY.md` — 跨 session 经验积累

### Layer 1: Session 启动必读（~20KB）

每次新 session 启动时加载：
1. **`docs/PROGRESS.md`** — 顶部 "Current Module Status" + 高层进度 + 最近 session + 下次起点
2. **`docs/CORRECTIONS.md` §1** — 模式速查表（P1~P10），仅读前 100 行即可

### Layer 2: 进入模块开发时加载

当确定要开发某个模块后，按需加载：
- **`docs/features/{domain}/{module}/`** — 该模块的文档套件（requirements, user-stories, architecture, ux-design, ui-schema）
- **`docs/AGENT-PLAN.md`** — 完整 14 步流程（仅在需要查步骤细节时）
- **`docs/STANDARDS.md`** — 术语查询（仅在 Step 9.5 术语扫描或 Step 10 编码时）

### Layer 3: 特定场景按需加载

- **`docs/ROADMAP.md`** — 查看全局模块列表和阶段规划时
- **`docs/cross-module-erd.md`** — Step 4 架构设计时（跨模块实体关系）
- **`docs/MODULE-ASSIGNMENTS.md`** — 认领模块或查看共享文件协议时
- **`docs/CONSTITUTION.md`** — 需要确认最高准则时
- **`docs/TEAM-RULES.md`** — 需要确认行为边界时
- **`docs/SESSION-PROTOCOL.md`** — 需要查看 session 结束更新流程时
- **`docs/PROGRESS-ARCHIVE.md`** — 需要查看历史 session 详细日志时

> **首次加入项目？** 请先通读 `docs/TEAM-ONBOARDING.md`（新成员引导手册）。

## 模块开发流程（AGENT-PLAN 14 步摘要）

```
Step 0:  文档完整性预检
Step 1:  确定目标模块
Step 2:  需求分析 Agent → requirements.md + user-stories.md
Step 3:  [用户确认 User Story]
Step 3.5: 反向影响审查（上游模块依赖检查）
Step 4:  架构设计 Agent → architecture.md（⛔ 阻断性门禁）
Step 5:  [用户确认架构]
Step 6:  UI 设计 Agent → ux-design.md
Step 7:  [用户确认 UX]
Step 8:  UI Schema Agent → ui-schema.md
Step 9:  [用户确认 UI Schema]
Step 9.5: 术语一致性扫描（glossary-management Skill）
Step 10: 前端工程 Agent → React 组件 + i18n + mock data
Step 11: UI 评审 Agent → ui-eval-report.md
Step 12: P1/P2 修复迭代循环
Step 12i: 模块交付 Checklist（9 项验证）
Step 13: 质量保障 Agent
Step 14: 文档更新
```

**严禁跳步。** architecture.md 不存在时禁止进入前端实现。

## 模块交付 Checklist（Step 12i，每个模块必检）

1. 路由注册 — `router.tsx`
2. 导航菜单 — `AppLayout.tsx`，3 层模式（Domain → Sub-group → Leaf）
3. 面包屑 — 中间层用子菜单分组名
4. i18n — zh-CN + en-US 翻译键完整
5. RequirementTag 三步 — ① `userStoryMapping.ts` ② 注册到 `RequirementTag.tsx` ③ 每个页面使用
6. Table scroll.x — 有 column width 的 `<Table>` 必须有 `scroll={{ x: sum }}`
7. architecture.md 存在
8. 跨模块视觉一致性 — 与已有模块对比侧栏/Header/表格
9. `npm run build` 无报错

## 关键约定

### 路由与导航
- 路由路径在 `router.tsx` 定义为常量，组件引用常量，**禁止硬编码**
- 新模块同步更新：router.tsx、AppLayout.tsx（菜单 key）、面包屑、i18n
- 侧边栏统一 3 层：Domain → Sub-group → Leaf pages

### 术语
- 所有术语以 `docs/STANDARDS.md §1` 为唯一真相来源
- 文档间同一页面必须使用同一名称
- 新术语必须先注册到 STANDARDS.md 再使用

### 数据模型
- `architecture.md` 是 `types.ts` 和 mock 数据的唯一真相来源
- Mock 数据覆盖完整生命周期（创建→进行中→已完成）
- 跨模块实体关系记录在 `docs/cross-module-erd.md`

### 交互
- `hoverable` / `cursor:pointer` 必须有对应 `onClick`
- 统计卡片与列表筛选双向联动
- 主列表包含全量数据，专用视图是筛选子集而非互斥分区

### 团队协作
- **模块认领表**：`docs/MODULE-ASSIGNMENTS.md` — 开始模块前必须认领
- **行为准则**：`docs/TEAM-RULES.md` — 推荐/不建议/禁止三级分类
- **分支策略**：feature branch 开发，PR 合入 main，禁止直接 push main
- **分层审批**：关键文档 PR → Roger 审批；纯代码 PR → 团队互审
- **共享文件修改协议**：见 `MODULE-ASSIGNMENTS.md §3`

## 项目结构

```
docs/
├── CONSTITUTION.md          # 最高准则
├── AGENT-PLAN.md            # 编排蓝图 + Skill 体系
├── CORRECTIONS.md           # 纠偏模式速查
├── STANDARDS.md             # 术语表 + 技术规范
├── SESSION-PROTOCOL.md      # Session 交接协议
├── ROADMAP.md               # 总路线图
├── PROGRESS.md              # 精细进度
├── TEAM-RULES.md            # 团队行为准则（推荐/不建议/禁止）
├── TEAM-ONBOARDING.md       # 新成员引导手册
├── MODULE-ASSIGNMENTS.md    # 模块认领表 + 共享文件协议 + PR 流程
├── cross-module-erd.md      # 跨模块实体关系图
├── skills/                  # Skill 定义（8 个已创建）
│   ├── analysis/            # requirement-decomposition, user-story-writing, glossary-management
│   ├── architecture/        # data-model-design
│   └── ui/                  # ux-design, ui-schema-design, ui-eval
└── features/{domain}/{module}/  # 每个模块的文档套件
    ├── requirements.md
    ├── user-stories.md
    ├── architecture.md      # ⛔ 阻断性门禁
    ├── ux-design.md
    └── ui-schema.md

frontend/src/
├── features/{domain}/{module}/  # 模块前端代码
│   ├── pages/
│   ├── components/
│   ├── types.ts
│   ├── constants.ts
│   ├── mockData.ts
│   └── userStoryMapping.ts
├── components/RequirementTag.tsx  # 需求追踪中央注册
└── locales/{zh-CN,en-US}/        # i18n 翻译文件
```

## 禁止事项

- **禁止跳过 architecture.md** 直接编码（CORRECTIONS P3）
- **禁止文件删除** 未经双重确认（CONSTITUTION 原则七）
- **禁止路由硬编码**（CORRECTIONS P1）
- **禁止术语自行发明**，必须查 STANDARDS.md（CORRECTIONS P1-5）
- **禁止 UI 外观欺骗**：有视觉交互暗示必须有对应行为（CORRECTIONS P4）
- **禁止关键文档未经用户审批就 commit**（CONSTITUTION 原则八）
- **禁止直接 push 到 main 分支**，必须通过 PR 合入（TEAM-RULES X7）
- **禁止未认领就开始模块开发**（TEAM-RULES X8）

> 完整禁止事项清单（9 条）见 `docs/TEAM-RULES.md §3`
