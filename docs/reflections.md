# Phase 1 反思与流程优化 (Phase 1 Reflections)

**项目：** 加气站运营管理系统
**触发时机：** Phase 1（基础运营 4 个模块）全部完成后
**日期：** 2026-02-22
**版本：** 1.0

> 本文档每个 Phase 结束后写一次，不是常规文档。目的是从更高层次提炼出跨模块的系统性经验，
> 补充到 CORRECTIONS.md 之上——CORRECTIONS.md 记录"发现了什么具体问题"，
> 本文件回答"整个阶段的流程哪里值得改进"。

---

## 一、做得好的地方

### 1. 文档驱动开发产生了真实价值

四个模块都严格遵循了 `requirements → user-stories → architecture → ux-design → ui-schema → 前端实现` 的流程（device-ledger 的 architecture.md 例外，见下文）。这一流程确保了：
- 前端 mock 数据结构与真实数据模型高度一致
- TypeScript types 与 API 合同天然对齐
- 后续接入真实后端时的摩擦力很低

**结论**：不要因为"目前只做前端"而跳过文档阶段，文档是后端开发的"先行投资"。

### 2. User Story 追踪映射（userStoryMapping.ts）效果良好

每个模块都有独立的 `userStoryMapping.ts`，将 UI 组件 ID 与 User Story 编号对应。这使得：
- UI 评估时可以直接定位覆盖缺口
- 复盘时可以精确计算 MVP 覆盖率
- 后续开发优先级排序有数据支撑

**建议**：在 Phase 2 中将此机制自动化——在 CI 或本地构建时输出覆盖率报告，而非人工计算。

### 3. P1 问题二次分类机制显著提升了修复效率

引入"业务影响 vs. 体验影响"以及"修复代价评估"后，UI 评估修复循环从"无差别修复所有 P1"变成了"精准修复真正阻塞业务的问题"。每轮修复消耗的 token 和时间明显减少，同时修复质量更高。

### 4. CORRECTIONS.md 的习惯养成效果良好

Phase 1 共记录 15 条错误，其中有 7 条在后续模块开发中被验证确实有效阻止了同类问题重现（如"模块集成 checklist"阻止了 RequirementTag 遗漏，"architecture.md 必经步骤"阻止了跳步）。

### 5. 架构文档的 API 设计质量高

四个模块的 architecture.md 都包含了完整的 REST API 定义，覆盖：路径参数、查询参数、请求体、响应字段、权限矩阵。这为本次 API Doc 页面的创建提供了直接素材，无需重新梳理。

---

## 二、需要改进的地方

### 1. 【流程顺序风险】device-ledger 跳过 architecture 阶段

这是 Phase 1 中最严重的流程偏差。device-ledger 模块在完成 user-stories.md 后直接跳到 ux-design.md，导致：
- 前端 types.ts 在没有 architecture 约束下"自由发挥"
- architecture.md 事后补创（2026-02-18），存在前端与架构不一致的风险
- InspectionTask.checkItemIds 字段遗漏（巡检模块同样的根源）

**改进措施**：
1. 每个模块启动时输出"文档完整性 checklist"（对照 station 模块的 5 个文档是否都存在）
2. 在 architecture.md 创建之前，前端 Agent 拒绝开始实现工作
3. AGENT-PLAN.md 步骤 4（架构设计）需增加"阻断性验证"：如果 architecture.md 不存在，流程停止

### 2. 【数据一致性】Mock 数据的生命周期规则未被文档化

多次出现 mock 数据中状态与详情数据不一致的问题（最典型：已完成任务的 `logs` 为空数组）。根因是：**实体的生命周期副作用规则（如"任务完成时必须有对应的 logs"）从未被写入任何文档**。

**改进措施**：
1. 在 architecture.md 中为每个实体增加"数据完整性约束"章节
2. 定义"Mock 数据黄金规则"：每条 mock 记录的状态必须有对应的详情数据支撑
3. 创建 `validateMockData()` 工具函数，在模块实现完成后自动执行状态-详情交叉验证

### 3. 【需求模糊化】核心概念定义不充分导致连锁错误

巡检模块的"任务"（InspectionTask）概念在需求阶段定义模糊，导致 4 个维度同时出错（需求、架构、UX、数据）。

**改进措施**：
1. 在 user-story-writing.md Skill 中增加"核心实体三问"：
   - 这个实体自身携带哪些数据？（vs. 依赖父实体）
   - 这个实体的创建有哪些触发方式？（自动生成 vs. 手动创建）
   - 这个实体有哪些副作用？（创建时自动关联什么？删除时需要什么确认？）
2. "生成"/"下发"类需求词汇必须触发追问

### 4. 【跨模块一致性】新 User Story 未同步更新 userStoryMapping.ts

交接班模块在 2026-02-16 补充了 US-020~023（用户身份、站点选择、排班管理、站点概况），前端已实现但 `userStoryMapping.ts` 未更新。这是一个典型的"数据已准备 ≠ 集成已完成"问题。

**改进措施**：
1. 补充 `userStoryMapping.ts` 的更新到"模块交付 checklist"
2. 任何 user-stories.md 的变更，必须同步触发 userStoryMapping.ts 的更新
3. 规则：新增/修改 User Story 时，Agent 必须检查对应的 mapping 是否需要更新

### 5. 【API 版本规范】交接班模块 API 路径前缀不一致

站点、设备、巡检模块使用 `/api/v1/...`，交接班模块使用 `/api/...`（缺少 v1）。这是在 architecture.md 各自独立设计时未统一规范造成的。

**改进措施**：
1. 在 STANDARDS.md 中增加"API 路径规范"章节，明确所有模块统一使用 `/api/v1/...`
2. architecture.md Skill 模板增加路径前缀校验
3. 后端项目初始化时统一为 `/api/v1`

### 6. 【UI 评估盲区】缺少"交互响应完整性"自动检查

多次出现"组件有 hoverable 外观但无 onClick 响应"的问题（维保工单统计卡片）。UI 评估 Skill 对此类问题没有系统性检查机制。

**改进措施**：
1. ui-eval.md 增加"外观-行为一致性"检查清单：
   - 所有 `hoverable` 卡片必须有 `onClick`
   - 所有带 `cursor: pointer` 的元素必须有点击响应
   - 所有带 `disabled` 属性的元素必须在正确条件下禁用
2. 将此检查自动化：通过 AST 分析或 grep 扫描 `hoverable` 关键词

### 7. 【架构聚合接口】聚合 API 设计滞后于 UI 设计

站点概况页（ShiftSummary）需要聚合"当前班次 + 下一排班 + 经营数据"，但 architecture.md 最初没有设计 `GET /stations/{id}/overview` 这类聚合接口。它是在 CORRECTIONS.md 2026-02-16 批评之后补充的。

**改进措施**：
1. 在 ux-design.md Skill 中增加"接口映射分析"步骤：对于每个页面，列出它需要的数据，分析是否需要新的聚合接口
2. UX 设计完成后，架构设计 Agent 需要回头检查是否有新增接口需求

### 8. 【Token 消耗】大型修复任务未分批执行

部分 P1 修复会话（如 inspection 模块的系统性问题修复）在单次对话中修改超过 10 个文件，导致上下文窗口压力大、输出质量在后期下降。

**改进措施**：
1. 超过 5 个文件的修复任务应拆分为 2 个或更多的子任务
2. 每次修复后执行 `npm run build` 验证，确保修复有效后再进行下一批

---

## 三、Phase 2 流程建议

### 3.1 必须保留的机制

| 机制 | 理由 |
|------|------|
| 文档驱动（5步文档完整性 checklist） | 防止 device-ledger 式的跳步事故 |
| User Story 追踪映射 | 覆盖率数据对优先级决策有价值 |
| P1 问题二次分类 + 用户确认 | 显著提升修复效率 |
| 模块交付 checklist（路由/导航/i18n/RequirementTag/userStoryMapping） | 防止"最后一公里"遗漏 |
| 状态-详情交叉验证 mock 数据 | 防止已完成状态但数据为空 |

### 3.2 Phase 2 新增的机制

| 新机制 | 解决的问题 |
|--------|-----------|
| **实体三问检查**（核心概念定义） | 防止"任务"式的模糊概念连锁错误 |
| **聚合接口前置分析**（UX 阶段） | 避免 overview API 事后补设计 |
| **API 路径前缀规范**（STANDARDS.md） | 解决跨模块路径不一致问题 |
| **Mock 数据生命周期约束文档** | 防止状态-详情不一致问题 |
| **大任务分批执行规则**（>5 文件分批） | 保证长会话修复质量 |

### 3.3 后端开发阶段的特殊注意事项

Phase 2 将同时推进前端（能源交易模块）和后端（Phase 1 模块 API 实现），以下是特别提醒：

1. **前后端 TypeScript 类型共享**：考虑建立 `shared/types/` 目录存放公共类型定义，前后端都从此引用，避免各自维护造成分叉
2. **API 合同优先**：后端开发的第一步是验证 architecture.md 的 API 设计是否完整，而非直接写代码
3. **device-ledger 类型核验**：由于 architecture.md 是事后补创，后端实现 device-ledger API 时必须对比前端 types.ts 逐字段核验
4. **时序数据特殊处理**：`EquipmentMonitoringLog` 是时序数据，需在后端初始化时就确定存储策略（TimescaleDB / 分区归档 / 独立时序库）

---

## 四、遗留 Action Items（后续需处理）

| # | 优先级 | 类型 | 描述 |
|---|--------|------|------|
| 1 | **P1** | 前端修复 | 补全 `shiftHandoverUserStoryMapping.ts` 中 US-020~023 的 mapping 记录 |
| 2 | **P1** | 前端修复 | 实现交接班向导中的接班人选择组件（US-007） |
| 3 | **P1** | 文档 | STANDARDS.md 增加 API 路径规范（统一 `/api/v1/`） |
| 4 | **P2** | 文档 | 更新 architecture.md Skill 模板，增加"实体三问"和"聚合接口分析" |
| 5 | **P2** | 工具 | 实现 `validateMockData()` 工具函数，自动检查状态-详情一致性 |
| 6 | **P2** | 前端补全 | 站点管理枪配置 CRUD 补全（US-011~013） |
| 7 | **P3** | 工程优化 | Phase 2 前端实现时集成 ECharts 图表库（巡检统计 US-021-A 等） |

---

*创建日期：2026-02-22*
*适用范围：Phase 1 基础运营（4 个模块）复盘*
*下次更新：Phase 2 能源交易模块完成后*
