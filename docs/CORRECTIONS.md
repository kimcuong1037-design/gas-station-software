# 修正记录 (Corrections Log)

本文件记录用户对 AI 输出的修正经验，按主题归纳为可复用模式。遵循 CONSTITUTION.md 原则六。
完整历史归档见 [`CORRECTIONS-ARCHIVE.md`](CORRECTIONS-ARCHIVE.md)。

---

## §1 模式速查表 (Pattern Index)

### P1 路由/导航/命名一致性
> 来源：02-15 路由路径×2, 02-15 导航菜单 404, 02-25 命名不一致

1. 路由路径在 `router.tsx` 一处定义为常量，组件中引用常量，禁止硬编码
2. 新增模块必须同步更新**所有入口点**：router.tsx、AppLayout.tsx（菜单 key）、面包屑、i18n
3. 动态路由 `:id` 前的静态路由（`new`/`create`）必须放在前面
4. UI Schema 的交互行为必须引用页面清单中的完整路由路径，禁止自行发明
5. 文档间同一页面必须使用同一名称；区分业务术语（充装记录）和 UI 命名（订单列表），UI 可见名称统一

### P2 模块交付检查清单（最后一公里）
> 来源：02-18 RequirementTag×2, 02-25 RequirementTag, 02-25 scroll.x, 02-18 architecture 跳步, 02-25 侧栏对齐

每个新模块完成时逐项核验：
1. ✅ **路由注册** — router.tsx 添加所有页面路由
2. ✅ **导航菜单** — AppLayout.tsx 菜单 key/层级正确，遵循 3 层模式（Domain → Sub-group → Leaf）
3. ✅ **面包屑** — 中间层使用子菜单分组名称，所有层级可点击
4. ✅ **i18n** — zh-CN + en-US 翻译键完整
5. ✅ **RequirementTag 四步**：① 创建 userStoryMapping.ts ② 在 RequirementTag.tsx 注册 ③ 每个页面传入 `componentIds={[...]}` + `module` + `showDetail` ④ **浏览器验证标签可见**（仅传 `module` 不传 `componentIds` 会导致 return null 不渲染）
6. ✅ **Table scroll.x** — 每个带 explicit column width 的 `<Table>` 必须有 `scroll={{ x: sum }}`
7. ✅ **architecture.md 存在** — 不可跳过，它是 types.ts 和 mock 数据的唯一真相来源
8. ✅ **跨域视觉一致性** — 与已有模块做侧栏截图对比
9. ✅ **构建通过** — `npm run build` 无报错

### P3 流程遵从 & AGENT-PLAN 步骤
> 来源：02-18 跳步, 02-16 走查缺失, 02-16 端到端验证

1. 严格遵循步骤顺序：requirements → user-stories → **architecture** → ux-design → ui-schema → 前端实现
2. architecture 阶段完整定义每个核心实体：携带数据、父子关系、创建时副作用
3. UX 设计阶段执行端到端用户旅程走查，验证每一步前置条件可达
4. 修正经验必须传导到方法论层面——检查产生问题的 Skill 定义是否有缺陷
5. 重大修正后执行全量影响扫描：Skills → 需求 → 架构 → UX → UI Schema → 前端 → i18n

### P4 交互完整性（外观承诺 = 行为实现）
> 来源：02-15 面包屑, 02-18 卡片联动, 02-27 主列表排除

1. `hoverable` / `cursor:pointer` 的组件**必须**有对应 `onClick`，否则是 UI 欺骗
2. 面包屑必须可点击并有悬停视觉反馈
3. 统计卡片与列表筛选应双向联动、共享状态变量
4. 主列表包含全量数据，专用视图是筛选子集而非互斥分区；ui-schema 为某状态定义了操作按钮 → 该状态数据必须出现在数据源中

### P5 数据模型 & Mock 完整性
> 来源：02-19 巡检任务定义, 02-15 外部系统对接

1. 核心实体在 architecture 阶段完整定义，不依赖"隐式约定"
2. Mock 数据必须覆盖完整生命周期（创建→执行中→已完成），已完成记录必须有支撑数据
3. 状态 ↔ 详情交叉验证：checkedItems/totalItems 与实际 logs 数量一致
4. 外部系统对接实体预留 `custom_fields` JSONB + `source_doc` JSONB + `tags` VARCHAR[]
5. 需求中的"生成"一词需追问：生成什么？包含哪些数据？谁触发？可否手动调整？

### P6 Skill 定义质量
> 来源：02-07 颗粒度, 02-07 知识库, 02-15 UX Skill, 02-15 路由约束

1. "拆解"类 Skill 必须定义输出颗粒度标准和层级结构
2. 明确约束 Agent 行为边界——"只能做什么"和"不能做什么"
3. Skill 间上下游依赖关系显式定义（UX → UI Schema → 前端实现）
4. 评估 Skill 要给出可执行的验证步骤（如 grep 命令），不能只说"检查 XX"
5. 所有 Skill 考虑是否需要 knowledge-base 行业知识作为输入

### P7 跨阶段/跨模块依赖管理
> 来源：02-24 RBAC/审批流, 02-16 业务流程完整链路, 02-28 订单→库存/交接班数据流

1. architecture.md 完成后执行"跨阶段依赖审查"：RBAC? 审批引擎? 其他 Phase 模块?
2. 依赖标记贯穿四层：requirements → user-stories → architecture → ux-design，使用 `⚠️ Phase N 依赖` 格式
3. 已确认文档修改采用"最小侵入性"策略（blockquote 标记 + 指向 DEFERRED-FIXES.md 链接）
4. 跨模块依赖功能不能简单标注"属于其他模块"——本模块必须提供 UI 入口
5. **上游模块 architecture.md 必须列出所有下游消费者**：当模块 A 的数据被模块 B 消费时，A 的 architecture.md §跨模块依赖 需显式列出 B 及其消费方式
6. **跨模块数据流必须定义触发机制**：事件驱动/轮询/同步调用？触发条件是什么？数据契约（字段列表）是什么？
7. **反向影响审查**：新模块的 requirements.md 编写完成后，回溯检查上游模块的 architecture.md 是否需要补充下游消费者声明

### P8 修复优先级 & 决策框架
> 来源：02-18 P1 分类, 02-25 页面合并决策

1. P1 修复前做二次分类：影响业务逻辑/用户旅程 vs 样式优化/一致性，后者降级 P2
2. 评估修改代价（低成本 vs 高成本），高成本修复单独讨论
3. 分类评估完成后**必须获得用户确认**再执行
4. 页面合并判断：列重合 > 60% + 操作重合 > 50% → 合并；否则独立。额外考量权限和"任务队列"属性

### P9 i18n 翻译键命名规范
> 来源：02-28 嵌套命名空间键名冲突, 03-02 全局缺失键扫描

1. **禁止将嵌套对象键名用作叶子翻译键**：若 `inventory.action` 是 `{ save, cancel, edit }` 对象，则 `t('inventory.action')` 返回对象而非字符串，导致 UI 渲染错误
2. **Table 列标题等纯文本场景应使用 `common.*` 通用键**（如 `common.actions`），不要在模块命名空间内重新定义已有的通用词汇
3. **i18n 键设计原则**：叶子节点必须是字符串；如果某个键已用作对象容器（如 `inventory.action.save`），则该键本身不能同时作为翻译字符串使用
4. **自测方法**：新增 i18n 键后，在浏览器中检查是否有 "returned an object instead of string" 警告
5. **全局完整性验证**：每个模块交付前，必须扫描该模块所有 `.tsx` 文件中的 `t('...')` 调用，逐一比对 zh-CN 和 en-US 的 locale 文件确认键存在。**仅检查肉眼可见页面不够**——筛选器 placeholder、统计卡片 title、分页文本等非主体区域极易遗漏
6. **禁止仅依赖 inline fallback**：`t('key', '默认值')` 的 fallback 不能替代正式注册到 locale 文件；含 fallback 的键仍必须在 zh-CN 和 en-US 中注册

### P11 后端纠偏模式（占位，B0 启动后逐步积累）
> 来源：后端开发启动后填充

*此章节预留。后端开发正式开始后，将记录 SQLAlchemy Model / Flask Blueprint / 数据库迁移 / pytest 测试等方向的高频纠偏经验。*

---

### P10 API 文档写操作端点必须有 JSON 示例
> 来源：03-01 architecture.md POST/PUT/PATCH 缺少请求体和响应体示例

1. **所有写操作端点（POST/PUT/PATCH/DELETE with body）必须包含请求 Body JSON 示例**：仅在表格"请求/响应要点"列列字段名不够，必须附带完整 JSON code block，参照 Module 1.3 设备设施格式
2. **所有写操作端点必须包含响应示例**：至少包含 HTTP 状态码（201/200）和关键响应字段（id、生成的单号、状态变更后的字段）
3. **无 Body 的状态变更端点也需说明**：如审核通过（approve）等无 Body 端点，需显式注明"无请求 Body"及响应格式
4. **字段约束必须在示例附近文档化**：必填/条件必填、枚举值范围、业务校验规则（如 BR-11 损耗量上限），不能只靠实体定义隐式传递
5. **架构设计 Skill 交付物检查**：data-model-design Skill 输出的 architecture.md，在 API 端点设计章节必须对 GET/POST/PUT/PATCH/DELETE 一视同仁提供示例，不得只为 GET 响应提供 TypeScript 类型而跳过写操作

---

## §2 修正记录摘要

> 每条仅保留标题、一句话根因和关键规则编号。完整上下文见 [CORRECTIONS-ARCHIVE.md](CORRECTIONS-ARCHIVE.md)。

| # | 日期 | 标题 | 根因（一句话） | 关联模式 |
|---|------|------|---------------|---------|
| 1 | 02-07 | PLAN.md 需拆分 | 规范/计划/流程混在一个文件，关注点未分离 | P6 |
| 2 | 02-07 | 需求拆解 Skill 缺颗粒度 | Skill 未定义输出层级标准，Agent 无法控制拆解粒度 | P6 |
| 3 | 02-07 | 引入 knowledge-base | Skill 缺少行业知识输入，分析脱离行业实际 | P6 |
| 4 | 02-15 | 新增 UX Design Skill | User Story 直接跳到 UI Schema，缺少"为什么这样设计"的决策层 | P6 |
| 5 | 02-15 | 外部系统扩展字段 | 外部设备数据结构多样，初期无法预见所有字段 | P5 |
| 6 | 02-15 | 禁止未确认删除文件 | create-vite 选择了"删除现有文件"选项 | — |
| 7 | 02-15 | Vite CSS 与 Ant Design 冲突 | 脚手架默认 CSS 未清理，与 Ant Design 布局冲突 | P2 |
| 8 | 02-15 | 路由路径不一致 | 按钮跳转路径硬编码与 router.tsx 定义不一致 | P1 |
| 9 | 02-15 | Skill 缺少路由约束 | ui-schema 交互表格写"跳转 P03"而非完整路径 | P1, P6 |
| 10 | 02-15 | Vite 动态导入失败 | 缓存陈旧，`rm -rf node_modules/.vite` 后恢复 | — |
| 11 | 02-15 | 导航菜单 key 不一致 | 菜单 key 沿用占位符路径而非实际路由 | P1 |
| 12 | 02-15 | 面包屑不可点击 | 只实现了展示，遗漏了 onClick 导航交互 | P4 |
| 13 | 02-16 | 交接班缺页面层级 | 跳过站点上下文选择和排班前置操作，业务链路不完整 | P3, P7 |
| 14 | 02-16 | Skill/架构缺端到端走查 | 修正只更新直接文件，未回溯 Skill 定义和同层文档 | P3, P6 |
| 15 | 02-18 | P1 修复须先分类 | 12 个 P1 中仅 4 个影响用户旅程，其余可降级 | P8 |
| 16 | 02-18 | RequirementTag 遗漏 (device-ledger) | 聚焦功能实现忽略非功能性集成，"最后一公里"跳过 | P2 |
| 17 | 02-18 | 卡片点击不联动 Tab | hoverable 外观暗示可交互但无 onClick 处理 | P4 |
| 18 | 02-18 | 跳过 architecture.md | 前端优先心态，将 architecture 视为"后端文档"而跳步 | P2, P3 |
| 19 | 02-19 | 巡检任务定义不充分 | "任务"核心概念在需求阶段模糊，逐层传递放大 | P3, P5 |
| 20 | 02-24 | 跨阶段依赖未标记 | Phase 1 设计时缺少对 Phase 7（RBAC/审批）的系统性识别 | P7 |
| 21 | 02-25 | 侧栏菜单层级不一致 | 新域直接平铺子页面为 2 级，未遵循已有 3 级模式 | P1, P2 |
| 22 | 02-25 | RequirementTag 遗漏 (price-management) | checklist 条目过于笼统，未细分 3 个子步骤 | P2 |
| 23 | 02-25 | Table scroll.x 缺失 | 定义了 column width 但未设 scroll.x，右侧列被裁切 | P2 |
| 24 | 02-25 | "充装记录"命名不一致 | 需求阶段沿用业务术语，未在 UI 层面统一为系统命名 | P1 |
| 25 | 02-25 | 异常订单页面合并决策 | 量化分析：列重合 27%、操作重合 14% → 保持独立 | P8 |
| 26 | 02-27 | 主列表排除异常订单 | 错误认为异常订单"专属于"P02，主列表做了排除过滤 | P4 |
| 27 | 02-28 | 跨模块数据流文档缺口 | 上游模块 architecture.md 未列出下游消费者，跨模块触发机制和数据契约未定义 | P7 |
| 28 | 02-28 | i18n 嵌套命名空间键名冲突 | `t('inventory.action')` 指向嵌套对象而非字符串，Table 列标题渲染为错误提示 | P9 |
| 29 | 03-01 | API 文档写操作端点缺少 JSON 示例 | architecture.md 只为 GET 响应提供 TypeScript 类型，POST/PUT/PATCH 仅在表格列字段名，缺少请求体和响应体 JSON 示例 | P10 |
| 30 | 03-02 | i18n 全局缺失键（交接历史等 17+ 处） | 前端代码使用的 `t()` 键未注册到 locale 文件，筛选器/统计卡片/分页等非主体区域漏检 | P9 |
| 31 | 03-10 | RequirementTag 仅传 module 未传 componentIds | 误以为 `module` 属性能显示全部 story，实际需 `componentIds` 才能渲染；Checklist 第 5 条未细化、缺运行时验证 | P2 |

---

## §3 新增记录模板

```
### YYYY-MM-DD 标题
- **根因：** 一句话
- **规则：** ① ... ② ... ③ ...
- **关联模式：** P?
```

如有需要，在 [CORRECTIONS-ARCHIVE.md](CORRECTIONS-ARCHIVE.md) 中补充完整上下文。

---

*创建时间：2026-02-07*
*最后更新：2026-03-10*
*压缩重构：2026-02-27（原 357 行 → 当前约 120 行，完整版归档至 CORRECTIONS-ARCHIVE.md）*
*P9 新增：2026-02-28（i18n 嵌套命名空间键名冲突）*
*P10 新增：2026-03-01（API 文档写操作端点缺少 JSON 示例）*
*P9 扩展：2026-03-02（新增规则 5/6：全局完整性验证 + 禁止仅依赖 inline fallback）*
