# 团队行为准则 (Team Rules)

**版本：** 1.0
**创建日期：** 2026-03-04
**适用范围：** 所有参与项目开发的团队成员（含使用 AI Agent 辅助开发的场景）

> 本文档将分散在 CONSTITUTION、CORRECTIONS、AGENT-PLAN 等文档中的行为规范整合为三级准则，
> 便于团队成员快速了解"什么该做、什么不该做、什么绝对不能做"。

---

## §1 推荐做法 (MUST DO)

### 1.1 流程纪律

- **严格遵循 AGENT-PLAN 14 步流程，不跳步** — 需求→用户故事→架构→UX→UI Schema→前端→评审，每一步都有阻断性门禁（来源：CORRECTIONS P3）
- **每个模块开发前重读 CORRECTIONS.md §1 模式速查表** — 10 大纠偏模式（P1~P10）浓缩了 30 条历史教训，5 分钟阅读可避免重复犯错
- **每次 session 结束更新 PROGRESS.md** — 含作者标注 `[姓名]`，确保团队知道谁做了什么（来源：SESSION-PROTOCOL §2）
- **模块交付前逐项核对 9 项 Checklist** — 路由/导航/面包屑/i18n/RequirementTag/scroll.x/architecture.md/跨模块一致性/build（来源：AGENT-PLAN Step 12i）

### 1.2 代码规范

- **architecture.md 是 types.ts 和 mock 数据的唯一真相来源** — 先有架构文档，再写类型定义和数据（来源：CORRECTIONS P3, P5）
- **路由路径用 router.tsx 常量，组件引用常量** — 禁止在组件中硬编码路由字符串（来源：CORRECTIONS P1）
- **每个 Table 有 column width 就必须有 `scroll={{ x: sum }}`** — 否则右侧列会被裁切（来源：CORRECTIONS P2）
- **`npm run build` 通过后才能声明模块完成** — TypeScript 编译零错误是交付底线

### 1.3 协作纪律

- **开始模块前在 MODULE-ASSIGNMENTS.md 认领** — 登记后状态设为"已认领"，确保模块互斥（详见 `MODULE-ASSIGNMENTS.md §1`）
- **修改共享文件前 `git pull` + 确认无冲突** — 共享文件清单及协议见 `MODULE-ASSIGNMENTS.md §3`
- **新增术语先注册 STANDARDS.md §1，再通过团队约定的沟通渠道通知** — 避免两人同时定义相似但不同的术语（来源：CORRECTIONS P1-5）
- **使用 feature branch 开发，通过 PR 合入 main** — 分支策略和分层审批流程见 `MODULE-ASSIGNMENTS.md §4`

### 1.4 AI/Agent 使用

- **启动 Claude Code 后执行 SESSION-PROTOCOL 启动检查** — 5 步必检流程确保 AI 加载了正确上下文
- **让 AI 先读文档再动手** — 不要直接说"写一个页面"，而是"按照 ui-schema.md 的 P01 规格实现 InventoryOverview"
- **AI 产出必须对照 architecture.md 交叉验证** — 类型定义、字段名称、API 端点都要核对
- **session 结束时让 AI 执行结束协议更新 PROGRESS** — 确保进度记录不会遗漏

---

## §2 不建议做法 (DON'T)

以下行为不会立即导致问题，但会增加团队协作风险或降低交付质量：

| # | 不建议做法 | 风险说明 |
|---|-----------|---------|
| D1 | 同时修改多个模块 | 模块互斥原则——同一人同时处理两个模块会导致上下文切换过频、共享文件冲突增多 |
| D2 | 跳过 UI 评审轮次 | 即使自信代码无误，评审能发现集成问题（i18n 缺失、scroll.x 遗漏等） |
| D3 | 积攒多个 session 再批量更新 PROGRESS | 信息滞后会导致团队成员基于过时状态做决策 |
| D4 | 自行发明术语 | 必须先查 STANDARDS.md §1，没有的术语需先注册再使用 |
| D5 | 完全依赖 AI 输出不做人工审查 | AI 会产生与 architecture.md 不一致的类型、遗漏 i18n key、发明不存在的路由 |
| D6 | 跳过入职引导直接开始编码 | TEAM-ONBOARDING.md 的走读流程（§5）是理解项目模式的最快路径 |
| D7 | 在 main 分支直接开发 | 所有开发工作应在 feature branch 进行，通过 PR 合入 |
| D8 | 未经沟通修改他人正在开发的模块文件 | 先通过团队约定的沟通渠道确认，避免互相覆盖 |

---

## §3 禁止事项 (PROHIBITED)

以下为硬性红线，**违规必须立即 revert 并记录到 CORRECTIONS.md**。

| # | 禁止事项 | 来源 | 说明 |
|---|---------|------|------|
| X1 | 修改治理文档未经审批 | CONSTITUTION 原则八 | 治理文档包括：CONSTITUTION、AGENT-PLAN、CLAUDE.md、SESSION-PROTOCOL、STANDARDS、TEAM-RULES。修改必须通过 PR 并由 **Roger approve** |
| X2 | 跳过 architecture.md 直接编码 | CORRECTIONS P3 | architecture.md 是阻断性门禁——不存在时禁止进入前端实现 |
| X3 | 删除文件未经双重确认 | CONSTITUTION 原则七 | 任何文件/文件夹删除需两次独立确认；优先使用非破坏性替代方案 |
| X4 | 路由硬编码 | CORRECTIONS P1 | 所有路由路径必须引用 `router.tsx` 中定义的常量 |
| X5 | UI 视觉欺骗 | CORRECTIONS P4 | 有 `hoverable`/`cursor:pointer` 视觉暗示的元素必须有对应 `onClick` 行为 |
| X6 | 关键文档未审批就 commit | CONSTITUTION 原则八 | requirements / architecture / ux-design / ui-schema 等关键文档必须经 Roger 审批后才能合入 main |
| X7 | 直接 push 到 main 分支 | 团队新规则 | 所有变更必须通过 PR 合入，main 分支受保护 |
| X8 | 未认领就开始模块开发 | 团队新规则 | 必须先在 `MODULE-ASSIGNMENTS.md` 登记认领 |
| X9 | 擅自修改 CORRECTIONS.md 模式定义 | 团队新规则 | P1~P10 模式定义由 Roger 维护；可以新增纠偏记录到 §2 摘要表 |

---

## §4 分层审批规则

根据变更内容的风险等级，PR 审批分为两个层级：

### 关键文档 PR → Roger 审批

以下类型的变更必须由 **Roger** review 并 approve 后才能合入：

- 模块文档套件：`requirements.md`、`user-stories.md`、`architecture.md`、`ux-design.md`、`ui-schema.md`
- 治理文档：`CONSTITUTION.md`、`AGENT-PLAN.md`、`CLAUDE.md`、`SESSION-PROTOCOL.md`、`STANDARDS.md`、`TEAM-RULES.md`
- 跨模块文档：`cross-module-erd.md`、`ROADMAP.md`
- Skill 定义文件：`docs/skills/` 下所有文件

### 纯代码 PR → 团队互审

以下类型的变更由任意团队成员互审 approve 即可：

- 前端组件代码：`pages/`、`components/`、`types.ts`、`constants.ts`、`mockData.ts`
- 集成文件：`router.tsx`、`AppLayout.tsx`、`RequirementTag.tsx`
- 国际化：`zh-CN/`、`en-US/` 翻译文件
- 样式和配置文件

### 混合 PR

如果一个 PR 同时包含关键文档和代码变更，按**最高等级**处理——由 Roger 审批。

---

## §5 违规处理

1. **发现违规** → 立即 revert 相关变更到违规前状态
2. **记录原因** → 在 CORRECTIONS.md §2 摘要表新增一行，标注日期、标题、根因、关联模式
3. **流程改进** → 分析根因，如果是流程缺陷则更新相关文档（需走 PR 审批）
4. **无追责** → 重点是修复和预防，不是追究个人责任

---

## 附录：来源追溯表

| 本文档条目 | 来源文档 | 来源位置 |
|-----------|---------|---------|
| §1.1 流程纪律 | AGENT-PLAN.md | Steps 0-14 + Step 12i |
| §1.1 重读 CORRECTIONS | CORRECTIONS.md | §1 模式速查表 |
| §1.2 architecture 真相来源 | CORRECTIONS.md | P3, P5 |
| §1.2 路由常量 | CORRECTIONS.md | P1 |
| §1.2 scroll.x | CORRECTIONS.md | P2 |
| §1.3 模块认领 | MODULE-ASSIGNMENTS.md | §1 |
| §1.3 共享文件 | MODULE-ASSIGNMENTS.md | §3 |
| §1.4 session 协议 | SESSION-PROTOCOL.md | §1, §2 |
| §3 X1, X6 | CONSTITUTION.md | 原则八 |
| §3 X2 | CORRECTIONS.md | P3 |
| §3 X3 | CONSTITUTION.md | 原则七 |
| §3 X4 | CORRECTIONS.md | P1 |
| §3 X5 | CORRECTIONS.md | P4 |
| §3 X7, X8, X9 | 本文档 | 团队新规则 |
