# Gas Station Operations Management System

加气站运营管理系统 — React + TypeScript + Ant Design 前端原型，当前处于 UI 原型阶段（mock 数据驱动）。

## 必读文档（按优先级）

开始任何模块工作前，必须按顺序阅读：

1. **`docs/CONSTITUTION.md`** — 8 条最高准则（拆解优先、规范先行、不确定必确认、文件删除双重确认等）
2. **`docs/AGENT-PLAN.md`** — 模块开发 14 步流程 + Agent/Skill 体系 + RequirementTag 协议（§7）+ 团队协作（§8）
3. **`docs/CORRECTIONS.md`** — 8 大纠偏模式（P1~P8），27 条历史修正。**每次开发新模块前必须重读 §1 模式速查表**
4. **`docs/STANDARDS.md`** — 术语表（§1）+ 技术规范
5. **`docs/SESSION-PROTOCOL.md`** — Session 启动/结束标准流程
6. **`docs/ROADMAP.md`** — 7 个阶段 26 个模块的总路线图
7. **`docs/PROGRESS.md`** — 精细进度追踪，顶部有 "Current Module Status" 快速定位

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
