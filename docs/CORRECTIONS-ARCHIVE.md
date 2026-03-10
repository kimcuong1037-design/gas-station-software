# 修正记录完整归档 (Corrections Archive)

> 本文件保存所有修正记录的**原始完整内容**，包括详细的修正文件清单和逐条分析。
> 日常引用请使用精简版 [`CORRECTIONS.md`](CORRECTIONS.md)。

---

## 2026-02-07 PLAN.md 需要拆分为多个独立文件

- **修正内容：** 用户指出 PLAN.md 不应作为单一文件，需要拆分为至少三个独立部分：规范文件、项目计划文件、Agent 使用计划文件
- **原因分析：** 原始 PLAN.md 将规范、计划、实施方法混在一起，不利于独立维护和引用。不同关注点的内容应该分离，便于不同角色和阶段使用
- **经验总结：** 项目文档应遵循关注点分离原则。规范类文档（不常变）、计划类文档（随进度更新）、工具/流程类文档（按需调整）应各自独立管理

## 2026-02-07 需求拆解 Skill 缺少颗粒度定义

- **修正内容：** 用户指出 requirement-decomposition.md 缺少对拆解颗粒度的明确定义。增加了四级层级结构（L1 子系统 → L2 功能模块 → L3 功能 → L4 功能点/原子功能），并强调了拆解原则：忠实拆分、不发挥、不添加不存在的信息、适度颗粒度、每个功能点可用一个测试用例验收
- **原因分析：** 原始 Skill 文件中直接使用"功能点"一词但未定义其颗粒度标准，导致拆解结果可能过粗或过细。缺少层级定义也使得需求文档的结构（子系统→模块→功能→功能点）与拆解产出之间的映射关系不清晰。更重要的是，缺少"忠实拆分"的约束，Agent 可能会自行发挥添加需求文档中不存在的功能
- **经验总结：**
  1. Skill 定义中涉及"拆解"类操作时，必须明确定义输出的颗粒度标准和层级结构
  2. 必须明确约束 Agent 的行为边界——特别是"只能做什么"和"不能做什么"
  3. 拆解产出与下游 Skill（如 user-story-writing）的衔接关系需要在定义中显式说明

## 2026-02-07 引入 knowledge-base 行业知识库，所有 Skill 需引用

- **修正内容：** 用户创建了 `knowledge-base/` 目录用于存放行业基础知识和背景信息，并指出：(1) 所有 Skill 都应将 knowledge-base 中的文件作为输入引用；(2) `requirements/加气站软件市场调研.html` 应迁移到 knowledge-base 目录下。据此迁移了文件，并更新了 3 个 P0 Skill 文件和所有引用该文件路径的文档
- **原因分析：** 原始设计中将市场调研放在 requirements 目录，但市场调研属于行业背景知识而非直接需求。更重要的是，Skill 定义中缺少对行业知识的引用，Agent 在执行需求分析等任务时缺乏行业上下文，可能导致分析结果脱离行业实际
- **经验总结：**
  1. 行业知识/背景资料与需求文档应分开管理——requirements 存放直接需求，knowledge-base 存放行业背景
  2. 所有 Skill 都应考虑是否需要行业知识作为上下文输入，特别是分析类和设计类 Skill
  3. 项目目录结构的调整应同步更新所有引用路径，避免断链

## 2026-02-15 新增 UX Design Skill，区分用户体验设计与 UI 规格设计

- **修正内容：** 用户指出原有的 `ui-schema-design` Skill 偏向"UI 规格说明"（组件、字段、数据结构），缺少从用户视角出发的体验设计。据此创建了独立的 `ux-design` Skill，包含：用户角色分析、任务流程优化、操作效率审计（高频操作 ≤3 次点击）、导航与信息架构设计、引导与帮助设计、错误预防与恢复方案、反馈机制设计。同时更新了 `ui-schema-design` 将 UX 设计文档作为输入依赖，并更新了 AGENT-PLAN.md 的工作流程（步骤6-9）和 Skills 目录
- **原因分析：** 原有流程直接从 User Story 跳转到 UI Schema 设计，跳过了"设计决策依据"的环节。UI Schema 回答的是"是什么"和"在哪里"，但没有回答"为什么这样设计对用户更好"。用户体验设计应该在 UI 规格之前，为后续设计提供指导原则
- **经验总结：**
  1. 设计类 Skill 应区分"决策层"（UX——为什么这样设计）和"规格层"（UI Schema——具体如何实现）
  2. 用户视角的设计思考应形成独立的产出物，而非隐含在其他文档中
  3. Skill 之间的上下游依赖关系应明确定义（UX → UI Schema → 前端实现）
  4. 行业特殊场景（如加气员现场操作需要大按钮、设备监控需要醒目异常提示）应在 UX 设计中体现

## 2026-02-15 外部系统对接需预留扩展字段和原始数据存储

- **修正内容：** 用户指出架构设计中涉及外部异构系统对接的实体（如枪、充电桩等设备）需要增加扩展性设计。据此为 Nozzle 和 ChargingPile 实体增加了三个字段：(1) `custom_fields` JSONB 用于存储外部系统的未知/自定义字段；(2) `source_doc` JSONB 用于保留外部系统的原始报文数据以便排查问题；(3) `tags` VARCHAR[] 用于分类分组分析。同时在架构文档中新增"设计原则"章节（§0）明确此模式，并更新相关 API 接口支持这些字段
- **原因分析：** 与加注机、充电桩等外部系统对接时，不同厂商返回的数据结构差异大，在初期设计时难以预见所有字段。如果没有扩展机制，后续对接新设备时需要频繁修改数据模型。另外，当出现数据解析错误时，如果没有保留原始报文，问题排查非常困难
- **经验总结：**
  1. 涉及外部系统/设备对接的实体设计时，应预留 `custom_fields`（扩展字段）和 `source_doc`（原始数据）字段
  2. 为支持后续多维分析，设备类实体应考虑增加 `tags` 标签数组字段
  3. 这类扩展字段使用 JSONB 类型，并为 tags 建立 GIN 索引以支持高效查询
  4. 此设计模式应作为"外部系统对接实体"的标准范式，在后续类似场景中复用

## 2026-02-15 禁止未经确认删除文件，新增双重确认机制

- **修正内容：** 在初始化前端项目时，执行 `npx create-vite` 并在交互提示中选择了 "Remove existing files and continue"，导致项目中所有已有文件（包括 docs、requirements、knowledge-base 等）被删除。用户要求建立文件删除的双重确认机制。据此从 git 恢复了文件，并在 CONSTITUTION.md 中新增"原则七：文件删除必须双重确认"
- **原因分析：** 使用外部工具初始化项目时，未充分考虑其对现有文件的影响，且在交互提示中选择了破坏性选项。缺少"删除前确认"的工作流程保护
- **经验总结：**
  1. 任何文件/文件夹删除操作必须进行至少两次独立的用户确认，并明确提示"不可撤销"
  2. 优先采用非破坏性方案：新建目录而非覆盖、移动而非删除
  3. 使用外部工具时，必须事先了解其行为，并在交互提示中选择保留现有文件的选项
  4. 建议前端项目初始化时使用单独子目录（如 `app/` 或 `frontend/`），而非在项目根目录执行

## 2026-02-15 Vite 默认模板 CSS 与 Ant Design 布局冲突

- **修正内容：** 用户发现前端页面布局完全错乱——面包屑、标题、内容全部变成竖排显示。经排查发现是 Vite 默认模板的 CSS 样式与 Ant Design Layout 组件冲突。具体问题：`index.css` 中 `body { display: flex; place-items: center; }` 导致弹性布局错乱；`App.css` 中 `#root { max-width: 1280px; text-align: center; }` 限制宽度并居中。据此移除了这些默认样式，替换为适配 Ant Design 的基础样式
- **原因分析：** 使用 `create-vite` 初始化项目后，未清理脚手架自带的 CSS 样式。这些样式针对 Vite 的默认演示页面设计，与企业级 UI 框架（Ant Design）的布局假设不兼容
- **经验总结：**
  1. 使用脚手架初始化项目后，必须检查并清理默认模板的 CSS 文件（`index.css`、`App.css`）
  2. 集成 UI 框架（如 Ant Design、Material UI）时，应确保全局样式不冲突
  3. 推荐做法：初始化后立即将 `index.css` 和 `App.css` 重置为最小化的基础样式
  4. 遇到布局异常时，优先检查全局 CSS 样式（特别是 `body`、`#root` 的 display、flex、text-align 属性）

## 2026-02-15 路由路径与导航路径不一致导致页面错误

- **修正内容：** 用户点击"新增站点"按钮后，页面显示"站点不存在"而非新增表单。经排查发现路由定义为 `/operations/station/new`，但按钮跳转路径为 `/operations/station/create`，导致 `create` 被 `:id` 路由匹配，进入详情页并显示站点不存在。据此将跳转路径修正为 `/operations/station/new`
- **原因分析：** 路由定义和实际使用的路径不一致。当使用动态路由参数（如 `:id`）时，任何未匹配的路径都会被当作 id 处理，导致意外行为
- **经验总结：**
  1. 路由路径应在一处集中定义为常量，组件中引用常量而非硬编码字符串
  2. 动态路由（`:id`）前的静态路由（如 `new`、`create`）必须放在前面，以获得正确的匹配优先级
  3. 新增导航链接后应立即测试完整流程，确保跳转目标正确
  4. 推荐做法：创建 `routes.ts` 统一管理所有路由路径，避免多处硬编码导致不一致

## 2026-02-15 Skill 文件缺少路由一致性约束，导致实现与设计脱节

- **修正内容：** 基于路由路径不一致 bug 的反思，更新了两个 Skill 文件：(1) `ui-schema-design.md` 步骤 4 增加"路由路径一致性"约束，要求交互行为必须使用页面清单中定义的完整路由路径，禁止自行发明路径；检查清单增加两项路由相关检查。(2) `ui-eval.md` 功能正确性维度增加"路由专项检查"子项，包含 5 个具体检查点和命令行检查方法
- **原因分析：** 原有 `ui-schema-design` Skill 虽然要求"所有页面都有明确的路由定义"，但未约束"交互行为中的跳转必须引用已定义路由"。交互行为表格只写"跳转 P03"而非完整路径，给前端实现留下了自行发明路径的空间。`ui-eval` Skill 中"导航和路由正确"检查项过于笼统，缺少具体的路由一致性验证步骤
- **经验总结：**
  1. 设计规范必须闭环：当定义了"路由"字段，就必须同时约束所有引用该字段的地方使用一致的值
  2. Skill 之间的数据传递要显式：UI Schema 的路由定义是前端实现的输入，Skill 文件应明确这种依赖关系
  3. 评估 Skill 要有具体检查方法：不能只说"检查 XX"，要给出可执行的验证步骤（如 grep 命令）
  4. 静态检查优于运行时发现：路由一致性可以在代码审查阶段发现，不必等到用户点击才暴露

## 2026-02-15 Vite 动态导入模块失败 (Failed to fetch dynamically imported module)

- **修正内容：** 用户点击站点列表进入详情页时，浏览器报错 `TypeError: Failed to fetch dynamically imported module`。经排查发现是 Vite 开发服务器缓存陈旧导致动态模块无法正确解析。据此清除了 Vite 缓存目录 (`node_modules/.vite`) 并重启开发服务器，问题解决
- **原因分析：** Vite 通过 `node_modules/.vite` 缓存预编译的依赖和模块转换结果。当代码结构发生变化（如文件移动、依赖更新）后，旧缓存可能与新代码不匹配，导致动态 import 失败
- **经验总结：**
  1. 遇到 `Failed to fetch dynamically imported module` 错误时，首先检查开发服务器状态（是否运行、端口是否正确）
  2. 清除 Vite 缓存的标准操作：`rm -rf node_modules/.vite && npm run dev`
  3. 排查步骤优先级：检查服务器状态 → 清除缓存重启 → 检查路由配置 → 检查导出语法

## 2026-02-15 导航菜单路径与路由定义不一致导致 404

- **修正内容：** 用户点击左侧导航栏"交接班"菜单后显示 404 页面。经排查发现 `router.tsx` 定义的路径为 `/operations/shift-handover`，但 `AppLayout.tsx` 导航菜单的 key 配置为 `/operations/shift`。据此将导航菜单 key 修正为 `/operations/shift-handover`
- **原因分析：** 创建新模块（shift-handover）时，只更新了路由定义文件（router.tsx），但忘记同步更新导航菜单配置（AppLayout.tsx）。导航菜单的 key 沿用了占位符路径而非实际路由
- **经验总结：**
  1. 新增模块必须同步更新所有入口点：路由定义、导航菜单、面包屑配置等所有引用路径的地方必须同步修改
  2. 创建模块前应列出所有需要修改的文件清单：包括 router.tsx、AppLayout.tsx（导航菜单）、i18n 文件、mock 数据等
  3. 导航菜单的 key 应直接引用路由常量，而非硬编码字符串
  4. 命名一致性：模块名称应在所有位置保持一致（shift-handover），避免使用简称（shift）造成混淆

## 2026-02-15 面包屑导航不可点击

- **修正内容：** 用户发现顶部面包屑导航（首页图标、基础运营等）无法点击跳转。经排查发现 `getBreadcrumbItems()` 只返回了 `title` 属性，缺少 `onClick` 回调。据此为每个面包屑项添加 `onClick` 导航功能，并添加 CSS 悬停样式
- **原因分析：** 实现面包屑时只关注了"显示当前位置"的功能，忽略了面包屑的核心交互——点击跳转到上级页面
- **经验总结：**
  1. 面包屑必须可点击：面包屑的主要作用是导航，纯展示型面包屑违反用户预期
  2. UI 组件实现时要考虑交互完整性：不仅要实现视觉呈现，还要实现标准交互行为
  3. 添加悬停视觉反馈：cursor: pointer 和颜色变化让用户知道元素可点击

## 2026-02-16 交接班模块缺少页面层级逻辑、用户身份展示和排班管理

- **修正内容：** 用户在 review 交接班模块后提出四个关键问题：(1) 系统缺少用户登录身份显示；(2) 交接班应基于站点上下文，用户需先选择站点；(3) 排班管理应作为独立功能；(4) 交接班默认视图应为"站点概况"。据此新增 4 个 User Story（US-020~US-023）、更新 UI Schema、更新 AppLayout（用户头像/站点选择器/子菜单）、新增排班表页面、重构站点概况页
- **原因分析：** 原设计直接将"班次汇总"作为交接班入口页面，跳过了"从哪个站点出发"的上下文选择。排班本应是交接班的前置操作，但被标注为"属于站点管理模块"而遗漏。系统缺少全局用户身份识别
- **经验总结：**
  1. 功能模块设计必须考虑业务流程的完整链路：从"用户打开系统"到"完成目标操作"
  2. 跨模块依赖的功能不能简单标注"属于其他模块"：交接班模块必须有排班表的访问入口
  3. 用户身份展示是基本的系统需求，即使在 Demo 阶段也应展示
  4. 默认视图应是"概况"而非"操作入口"：用户先了解状态，再执行操作
  5. 导航菜单层级应反映业务逻辑层级

## 2026-02-16 Skill 文件和架构文档缺少端到端流程验证机制

- **修正内容：** 在完成前端实现的 review 后，进一步扫描所有 Skills 文件、架构文件、UX 设计文件和需求文件，发现 7 个系统性问题并全部修复：ux-design Skill 新增端到端走查步骤、ui-eval 增加流程完整性检查、user-story-writing 增加跨模块 UI 入口分析、多个架构文档新增 API 和依赖等
- **原因分析：** 上一轮修正只更新了直接相关文件，但没有回溯检查上游 Skill 定义和同层架构/UX 设计文档。陈旧信息如果不更新，同样问题会在新模块重现
- **经验总结：**
  1. 修正经验必须传导到方法论层面：发现问题后要检查产生问题的 Skill 定义是否有缺陷
  2. 每次重大修正后应执行全量影响扫描：Skills → 需求 → 架构 → UX → UI Schema → 前端 → i18n
  3. API 设计必须跟随 UI 变更同步更新
  4. Skill 的检查清单应包含"完整性"维度

## 2026-02-18 P1 修复前必须先做优先级分类和代价评估

- **修正内容：** 用户指出 UI 评估报告的 12 个 P1 问题不应直接修复，要先做分类评估（影响业务逻辑 vs 样式优化）和代价评估（低成本 vs 高成本改造），获得用户确认后再执行。据此更新了 ui-eval.md 和 AGENT-PLAN.md
- **原因分析：** 原有修复流程跳过了优先级分类和用户确认环节。12 个 P1 中只有 4 个真正影响用户旅程，其余可降级。无分类评估会浪费 token 在低优先级事项上
- **经验总结：**
  1. P1 问题修复前必须做二次分类：区分"影响业务逻辑/用户旅程" vs "样式优化/一致性"
  2. 评估修改代价是关键决策信息，高成本修复应单独讨论
  3. 用户确认是修复循环的必要环节
  4. "全修"不如"精修"：聚焦真正影响用户体验的问题

## 2026-02-18 新模块前端实现遗漏 RequirementTag 需求追踪关联

- **修正内容：** 用户发现设备设施管理（device-ledger）模块的 11 个前端页面全部缺少 `RequirementTag` 组件关联。`RequirementTag.tsx` 未导入模块 mapping，所有页面均未使用组件。据此修复了全部 11 个页面的关联
- **原因分析：** 聚焦功能完整性时忽略了"非功能性但对开发流程关键"的需求追踪。`userStoryMapping.ts` 已创建但最后一步——注册到 `RequirementTag.tsx` 并在页面中使用——被遗漏。典型的"最后一公里"问题
- **经验总结：**
  1. RequirementTag 关联是模块交付 checklist 的必选项
  2. "最后一公里"集成步骤最易遗漏：与全局基础设施的集成需逐一核验
  3. 模块交付 checklist：✅ 路由注册、✅ 导航菜单、✅ i18n、✅ RequirementTag（注册 + 逐页使用）、✅ 构建通过
  4. 数据准备 ≠ 集成完成：创建了 mapping 文件不意味着追踪已生效
  5. 参照已有模块做对照检查

## 2026-02-18 维保工单统计卡片点击不切换状态 Tab

- **修正内容：** "设备设施-维保工单"页面顶部统计卡片有 `hoverable` 悬停效果，但点击后不切换下方 Tab 页。据此为卡片添加 `onClick` → `setStatusTab()`，增加选中态边框高亮
- **原因分析：** 统计卡片和 Tab 作为独立视觉区块分别实现，"快捷筛选"交互被遗漏。`hoverable` 给用户传递了"可点击"暗示但无实际响应
- **经验总结：**
  1. 带有 `hoverable` 属性的组件必须有对应 `onClick`，否则是 UI 欺骗
  2. 统计卡片与列表筛选应双向联动、共享状态
  3. 交互组件实现应遵循"外观-行为一致性"原则
  4. UI 评审应包含"交互响应完整性"检查：所有带交互暗示的元素逐一验证点击响应

## 2026-02-18 设备设施管理模块跳过 architecture.md 编写步骤

- **修正内容：** `docs/features/operations/device-ledger/` 缺少 `architecture.md`。对比 station 和 shift-handover 都有完整 5 个文档，device-ledger 只有 4 个。据此补创了完整的架构文档
- **原因分析：** 当前阶段重心在前端，潜意识将 architecture 视为"后端才需要"的文档。没有严格按 AGENT-PLAN §3.1 步骤顺序执行，跳过了步骤 4（架构设计）
- **经验总结：**
  1. architecture.md 是必经步骤，不可跳过：它定义的数据模型和 API 是 types.ts、mock 数据的基础
  2. 严格遵循 AGENT-PLAN 步骤顺序，不得跳步
  3. 新模块开发前应做文档完整性对照检查
  4. architecture 是前后端的桥梁文档，是"唯一真相来源"

## 2026-02-19 巡检模块前端审查：4 项系统性问题

- **修正内容：** 用户审查巡检模块后提出 4 项问题：(1) 计划-任务关系不清晰，缺少 planNo 列，合并为双 Tab；(2) 不支持手动创建任务，新增 US-004-B；(3) InspectionTask 未定义 `checkItemIds` 字段；(4) 已完成任务的 logs 为空与 checkedItems 计数矛盾。涉及 user-stories、architecture、ux-design、ui-schema、types.ts、mock 数据、多个页面组件的修改
- **原因分析：** 共同根因是"任务"（Task）核心概念在需求阶段定义不充分，模糊定义在需求→故事→架构→设计→编码→Mock 链路中被逐层"放大"
- **经验总结：**
  1. 核心实体必须在 architecture 阶段完整定义：携带哪些数据、与父实体的关系、创建时的副作用
  2. "生命周期完整性"应作为验收标准：Mock 数据必须覆盖创建→执行中→已完成的完整状态
  3. 状态-详情交叉验证应作为 Mock 数据检查点
  4. 父子关系实体应优先在同一视图展示（Tab 合并），降低认知成本
  5. 需求中的"生成"一词需追问细节：生成什么？包含哪些数据？谁触发？可否手动调整？

## 2026-02-24 跨阶段依赖（RBAC/审批流）需全链路标记

- **修正内容：** 用户指出审批流程依赖统一审批模块（Phase 7 模块 9.5），RBAC 依赖 Phase 7 模块 9.1，应在需求、User Story、架构、UX 设计四层文档全部做显式标记。据此对 Phase 2.1 做全量标记、Phase 1 四模块做最小修复、创建 DEFERRED-FIXES.md 追踪文档
- **原因分析：** Phase 1 设计时对 Phase 7 系统模块依赖缺乏系统性识别。"跨阶段依赖标记"的规范格式在 Phase 2.1 才建立。已确认文档发现问题后缺少处理机制
- **经验总结：**
  1. 架构设计完成后必须执行"跨阶段依赖审查"：RBAC？审批引擎？其他 Phase 的模块？
  2. 跨阶段依赖标记应贯穿四层文档：requirements → user-stories → architecture → ux-design
  3. 已确认文档的修改采用"最小侵入性"策略
  4. 确认后发现的问题统一记录到 DEFERRED-FIXES.md
  5. "确认"不等于"完美"：通过延期修复机制跟踪，不阻塞当前进度

## 2026-02-25 左侧导航栏二级菜单对齐不一致

- **修正内容：** "基础运营"使用 3 层结构（Domain → Sub-group → Leaf），"能源交易"使用 2 层结构（Domain → Leaf），导致叶子页面缩进不一致。据此在"能源交易"下新增"价格管理"中间子菜单层，修正面包屑和 i18n
- **原因分析：** 能源交易是第一个非 operations 域的模块，开发时直接平铺子页面为 2 级，没有注意 operations 域的 3 级模式。缺少跨域导航一致性规范
- **经验总结：**
  1. 侧边栏统一 3 层模式：Domain → Sub-group → Leaf pages
  2. 跨域视觉一致性检查应加入模块交付 checklist
  3. 面包屑中间层应使用子菜单分组名称

## 2026-02-25 价格管理模块遗漏 RequirementTag 关联

- **修正内容：** Phase 2 price-management 模块 7 个页面全部缺少 RequirementTag。RequirementTag.tsx 未导入模块 mapping，所有页面未使用组件。据此修复全部 7 页
- **原因分析：** AGENT-PLAN.md checklist 条目过于笼统，未细分 3 个子步骤（创建 mapping → 注册到 RequirementTag.tsx → 逐页使用）。这是第一个 Phase 2 模块，Phase 1 的正确模式未被固化为硬性检查清单
- **经验总结：** RequirementTag 集成需要 3 步：① 创建 userStoryMapping.ts ② 在 RequirementTag.tsx 注册 ③ 每个页面组件使用。任何一步缺失都等于未完成

## 2026-02-25 Ant Design Table overflow — action 列被裁切

- **修正内容：** ApprovalList 页面操作按钮被推出可见区域外。所有 6 个 price-management 表格存在相同隐患。据此为全部 6 个表格添加 `scroll={{ x: sumOfColumnWidths }}`
- **原因分析：** Table 定义了 column width 但未设置 `scroll.x`，当列宽总和超出容器宽度时无横向滚动条，右侧列被裁切。开发时在宽屏测试未发现
- **经验总结：** 每个带 explicit column width 的 `<Table>` 必须有 `scroll={{ x: sumOfColumnWidths }}`

## 2026-02-25 "充装记录"与"订单列表"命名不一致

- **修正内容：** P01 页面在不同文档中交替使用"充装记录"和"订单"，与所在菜单层级（订单管理 → ?）不匹配。据此全文档统一：页面名→订单列表页，组件名→OrderList，路由→/list，侧边栏→订单列表。保留 3 处合理的业务概念引用
- **原因分析：** "充装记录"源自加气站业务术语，"订单"是管理系统通用术语，二者指向同一实体。需求拆解阶段沿用了原始文档叫法，未在 UI 层面统一
- **经验总结：**
  1. 侧边栏命名逻辑：子菜单名称必须与父菜单形成语义层级
  2. 组件名 = 页面名：React 组件名与页面中文名直接对应
  3. 文档间命名一致：同一页面在所有文档使用同一名称
  4. 区分业务概念 vs UI 命名：UI 可见名称必须统一，业务概念描述可保留

## 2026-02-25 异常订单页面是否应与订单列表合并

- **决策内容：** 进行量化重合度分析后决定保持独立页面：列重合度 27%（3/11），操作重合度 14%（1/7），权限模型不同，P02 是任务处理队列而 P01 是数据查看页面
- **经验总结：** 页面合并 vs 独立的决策框架：列重合 > 60% + 操作重合 > 50% → 合并；列重合 < 40% 或操作重合 < 30% → 独立。额外考量权限和"任务队列"属性

## 2026-02-27 订单列表错误排除异常订单 + 缺少异常类型标记

- **修正内容：** OrderList 页面 `!o.exceptionType` 过滤将异常订单完全排除，且缺少异常类型视觉标记。据此移除过滤条件、增加行级异常类型 Tag、添加"处理"按钮跳转 P02
- **原因分析：** 错误地认为异常订单"专属于"P02，不应出现在 P01。实际上 F001 要求"展示全部订单记录"，ui-schema 操作列也定义了 exception 状态的按钮
- **经验总结：**
  1. 主列表必须包含全量数据：专用视图是主列表的筛选子集，不是互斥分区
  2. 专用视图的存在不意味着主列表排除
  3. 实现前对照 ui-schema 操作列设计：如果为某状态定义了按钮，该状态数据必须出现在数据源中
  4. 跨页面标记一致性：某属性在专用页面有展示，在主列表也应有视觉标记

## 2026-02-28 跨模块数据流文档缺口：订单→库存扣减、订单→交接班 KPI

- **修正内容：** 用户在 review Module 2.3 库存管理 requirements.md 时提出两个跨模块设计问题：(1) Module 2.2 订单完成后应触发 Module 2.3 库存自动扣减；(2) Module 2.2 订单数据应影响 Phase 1 交接班模块的站点经营 KPI（销售金额、订单数等）。经全面跨模块分析发现：
  - **链路 1 (2.2→2.3)**：Module 2.3 requirements.md F22 和 Section 3.2 正确定义了"订单完成时自动生成出库记录"和"退款时生成冲红入库记录"，但 Module 2.2 的 architecture.md 未将 Module 2.3 列为下游消费者，也未定义事件触发机制（同步/异步/事件总线）和数据契约
  - **链路 2 (2.2→1.2)**：cross-module-erd.md 有 FuelingOrder→ShiftHandover 引用，shift-handover/architecture.md 的 ShiftSummary 包含 totalSales/orderCount 字段，但缺少聚合计算算法（按哪些字段聚合、时间窗口如何确定）和 API 契约

  据此确定处理方案：在 Module 2.3 architecture.md 中补充完整的 2.2→2.3 数据流定义（触发机制、数据契约、冲红流程），同时记录 2.2→1.2 链路留作 Phase 1 增强阶段实现。更新 CORRECTIONS.md P7 模式新增 3 条规则（规则 5-7）

- **原因分析：** 模块开发按"自内向外"视角设计——每个模块的 architecture.md 只关注"我依赖谁"（上游），不关注"谁依赖我"（下游）。当下游模块尚未启动设计时，上游模块没有动力去声明"我的数据会被谁消费"。这导致跨模块数据流的触发机制和数据契约缺失，只有到下游模块设计时才暴露缺口。另外 cross-module-erd.md 只定义了实体间的静态关系（FK 引用），未定义动态行为（事件触发、数据聚合算法）

- **经验总结：**
  1. **上游必须声明下游**：模块 architecture.md 不仅要列"我依赖谁"，还必须列"谁消费我的数据"。当新模块 B 消费模块 A 的数据时，A 的 architecture.md 需回溯补充
  2. **数据流 ≠ 实体关系**：cross-module-erd.md 定义实体间的静态 FK 引用，但跨模块数据流需要额外定义：触发条件（订单状态变为 paid）、触发机制（事件/轮询/同步调用）、数据契约（传递哪些字段）、失败处理（重试/补偿）
  3. **反向影响审查**是必要步骤：每个新模块的 requirements.md 完成后，应回溯检查上游模块的 architecture.md 是否需要补充。这一步应加入 AGENT-PLAN 的文档套件流程
  4. **聚合计算必须文档化**：当模块 B 需要聚合模块 A 的数据生成统计（如 ShiftSummary.totalSales = Σ FuelingOrder.totalAmount），聚合算法（字段、时间窗口、过滤条件）必须在 architecture.md 中显式定义，不能依赖"隐式约定"
  5. **跨模块文档缺口的发现时机**：理想是上游模块设计时就预留；实际往往是下游模块需求分析时暴露。应将"反向影响审查"制度化，而非依赖偶然发现

- **修正文件清单：**
  - `docs/CORRECTIONS.md` — P7 新增规则 5-7，摘要表新增 #27
  - `docs/CORRECTIONS-ARCHIVE.md` — 新增本条完整记录
  - `docs/features/energy-trade/inventory-management/requirements.md` — F22/Section 3.2 已正确覆盖（无需修改）
  - `docs/features/energy-trade/inventory-management/architecture.md` — 待创建时补充完整跨模块数据流定义
  - `docs/features/energy-trade/order-transaction/architecture.md` — 待补充 Module 2.3 为下游消费者

---

## 2026-02-28 i18n 嵌套命名空间键名冲突

- **修正内容：** 预警管理页面（AlertManagement.tsx）Table 的"操作"列标题使用了 `t('inventory.action', '操作')`，但 `inventory.action` 在 zh-CN/index.ts 中定义为嵌套对象 `{ save: '保存', cancel: '取消', edit: '编辑' }`，i18next 返回整个对象而非字符串，页面上显示 "key 'inventory.action(zh-CN)' returned an object instead of string." 错误提示。

- **原因分析：**
  1. **命名空间层级冲突**：`inventory.action` 同时用作"操作"列标题的翻译键和嵌套子键的容器（`inventory.action.save`、`inventory.action.cancel`）。i18next 的规则是：如果某个键是对象，`t()` 返回该对象而非字符串
  2. **未复用通用键**：Table 的"操作"列标题是跨模块通用词汇，已有 `common.actions` 键可用，不需要在模块内重新定义
  3. **缺少 i18n 运行时校验**：zh-CN 翻译文件的 TypeScript 类型检查只能发现 JS 语法错误（如重复属性名），无法检测 i18next 运行时的"对象当字符串用"问题

- **经验总结：**
  1. i18n 键设计必须遵循"叶子节点纯字符串"原则——如果 `a.b` 已是对象容器（有 `a.b.c` 子键），则 `t('a.b')` 不可用于文本渲染
  2. 通用 UI 词汇（操作、状态、类型等 Table 列标题）应统一使用 `common.*` 命名空间，避免各模块重复定义导致命名冲突
  3. 新模块的 i18n 键设计应画出层级树，确认每个被 `t()` 调用的键都指向字符串叶子节点
  4. 建立新的检查习惯：开发完成后在浏览器中快速过一遍所有页面，检查控制台有无 i18next 警告

- **修正文件清单：**
  - `frontend/src/features/energy-trade/inventory-management/pages/AlertManagement.tsx` — 两处 `t('inventory.action')` → `t('common.actions')`
  - `docs/CORRECTIONS.md` — 新增 P9 模式 + 摘要表 #28
  - `docs/CORRECTIONS-ARCHIVE.md` — 新增本条完整记录

---

## 2026-03-01 API 文档写操作端点缺少 JSON 请求体和响应体示例

- **修正内容：** 用户在 review API 文档（截图为"创建损耗出库"POST 端点）时发现，architecture.md 中的 POST/PUT/PATCH 端点只在表格的"请求/响应要点"列用简短文字列出字段名，没有 JSON code block 示例。对比分析发现这是跨模块的系统性缺失：
  - Module 1.3（设备设施）：POST/PATCH **有** JSON 请求体示例（最佳实践）
  - Module 2.1（价格管理）：POST/PUT/PATCH 仅表格字段名，**无** JSON 示例
  - Module 2.2（订单交易）：POST/PATCH 仅表格字段名，**无** JSON 示例
  - Module 2.3（库存管理）：POST/PUT/PATCH 仅表格字段名，**无** JSON 示例
  - **所有模块**均缺少 POST/PATCH 的响应体示例（包括 HTTP 状态码和返回字段）

  据此为 Module 2.3 库存管理的 13 个写操作端点全部补齐了：
  1. **请求 Body JSON 示例**（含贴近真实的示例值）
  2. **字段描述表格**（类型、必填、说明、枚举值范围）
  3. **响应示例**（HTTP 状态码 + 关键字段）
  4. **无 Body 端点的显式说明**（如 approve 类端点注明"无请求 Body"）

  补齐的 13 个端点：
  - 入库管理：POST /inbound-records, PATCH .../approve, PATCH .../reject
  - 出库管理：POST /outbound-records, PATCH .../approve, PATCH .../reject
  - 进销存流水：POST /transactions/export
  - 盘点调整：POST /stock-adjustments, PATCH .../approve, PATCH .../reject
  - 预警管理：PATCH /alerts/:id/acknowledge, PATCH /alerts/:id/dismiss, PUT /alert-config/:fuelTypeId

- **原因分析：**
  1. **格式不对称**：architecture.md 为 GET 响应提供了完整的 TypeScript 接口定义（如 InventoryCard、TankComparisonCard），但写操作端点只在表格的一个 cell 里用逗号分隔列出字段名，没有展开为 JSON code block
  2. **Module 1.3 是标杆但未被复制**：Module 1.3 的 architecture.md 在 POST/PATCH 端点都有完整的 JSON 请求体示例，但后续模块（2.1、2.2、2.3）没有沿用这个格式标准
  3. **data-model-design Skill 未约束写操作示例**：当前 Skill 定义可能未将"写操作端点 JSON 示例"作为必选输出项，导致 Agent 在生成 architecture.md 时只关注了 GET 响应类型
  4. **"表格够用"的错觉**：字段名在表格中列出后，容易误认为已足够，但缺少具体示例值（尤其是枚举值、关联 ID 格式、可选字段处理）会给后端实现者带来歧义

- **经验总结：**
  1. architecture.md 的 API 端点设计章节必须对 GET 和 POST/PUT/PATCH/DELETE 一视同仁：GET 有响应类型定义 → 写操作也必须有请求体 + 响应体示例
  2. JSON 示例的价值不在于"完整"，而在于"消歧义"：枚举字段填什么值？可选字段传 null 还是不传？条件必填的触发条件是什么？这些只有示例能直观表达
  3. 无 Body 端点（如审核通过）也需要显式文档化，否则实现者不确定是否需要传参
  4. 每个写操作的响应应至少包含：HTTP 状态码、生成的 ID/单号、状态变更后的字段值——便于前端对接时知道要读取哪些响应字段
  5. Module 1.3 的 API 文档格式应作为所有模块的标准参照，后续模块 architecture.md 生成时应引用

- **修正文件清单：**
  - `docs/features/energy-trade/inventory-management/architecture.md` — 13 个写操作端点补齐 JSON 示例
  - `docs/CORRECTIONS.md` — 新增 P10 模式 + 摘要表 #29
  - `docs/CORRECTIONS-ARCHIVE.md` — 新增本条完整记录

- **待办（其他模块）：**
  - Module 2.1 price-management/architecture.md — 12 个 POST/PUT/PATCH 待补齐
  - Module 2.2 order-transaction/architecture.md — 10 个 POST/PATCH 待补齐

---

## 2026-03-02 i18n 全局缺失键（交接历史等 17+ 处）

- **修正内容：** 用户在 review "交接班 → 交接历史"页面时发现多处 UI 显示原始 i18n 键名（如 `shiftHandover.totalRecords`、`shiftHandover.issues`、`shiftHandover.selectHandoverBy`）而非中文翻译。经全局扫描后发现共 114 个缺失键，分布在 6 个模块：

  **HIGH 优先级（无 fallback，直接显示英文键名，已修复 17 个）：**
  | 缺失键 | 模块 | zh-CN 修复值 |
  |--------|------|-------------|
  | `shiftHandover.selectShift` | 交接历史筛选器 | 请选择班次 |
  | `shiftHandover.selectHandoverBy` | 交接历史筛选器 | 请选择交班人 |
  | `shiftHandover.totalRecords` | 交接历史统计卡片 | 交接总数 |
  | `shiftHandover.totalAmountSum` | 交接历史统计卡片 | 销售额合计 |
  | `shiftHandover.issues` | 交接历史表格列 | 异常 |
  | `shiftHandover.issuesCount` | 交接历史 tooltip | 条异常 |
  | `common.totalItems` | 交接历史分页 | 共 {{total}} 条 |
  | `station.region` | 站点表单 | → 改用已有 `station.regionLabel` |
  | `station.region.title` | 站点列表/详情 | → 改用已有 `station.regionLabel`（避免 P9 冲突） |
  | `station.group` | 站点表单 | → 改用已有 `station.groupLabel` |
  | `station.group.title` | 站点列表/详情 | → 改用已有 `station.groupLabel`（避免 P9 冲突） |

  **MEDIUM 优先级（有 inline fallback，UI 正常但不规范，已修复 5 个）：**
  | 缺失键 | zh-CN 修复值 |
  |--------|-------------|
  | `shiftHandover.autoRefresh` | 自动刷新 |
  | `shiftHandover.minutes` | 分钟 |
  | `common.close` | 关闭 |
  | `common.create` | 创建 |
  | `deviceLedger.monitoring.tankTitle` / `dispenserTitle` | 储罐监控 / 加气机状态 |

  **LOW 优先级（全部有 inline fallback，约 97 个，未修复）：**
  - Module 2.2 订单交易的 `order.*`（46 个）、`payment.*`（10 个）、`receipt.*`（14 个）、`refund.*`（18 个）、`supplement.*`（9 个）命名空间整体缺失——代码中使用 `t('key', '默认值')` 形式，UI 正常但未注册到 locale 文件

  **station 模块 P9 冲突修复：**
  - `t('station.region.title')` 与 `t('station.region')` 同时存在，会导致 `station.region` 既是对象（有 `.title`）又是字符串的冲突
  - 修复方案：全部改用已有的 `station.regionLabel` / `station.groupLabel`，避免新增冲突键

- **原因分析：**
  1. **非主体 UI 区域漏检**：前端实现后的 i18n 检查只关注了页面主体内容（表格列、表单标签），遗漏了筛选器 placeholder、统计卡片 title、分页文本等辅助区域
  2. **缺少自动化验证**：目前无工具自动比对代码中 `t()` 调用与 locale 文件的键集合差异，完全依赖人工目测
  3. **Module 2.2 的 inline fallback 掩盖了问题**：`t('key', '默认值')` 使 UI 正常运行，但键未注册到 locale 文件，导致英文版翻译缺失且不可维护
  4. **P9 修复范围不足**：02-28 修复 P9 时只处理了"嵌套命名空间冲突"这一种 i18n 问题，未趁机做全量扫描

- **经验总结：**
  1. P9 扩展规则 5：每个模块交付前必须**全量扫描** `.tsx` 中的 `t()` 调用 vs locale 文件，不能只靠肉眼检查可见页面
  2. P9 扩展规则 6：`t('key', '默认值')` 的 inline fallback 不能替代正式注册到 locale 文件
  3. station 模块案例再次验证了 P9 规则 3：定义 `station.region.title` 会使 `station.region` 变为对象容器，与 `t('station.region')` 作为叶子字符串冲突

- **修正文件清单：**
  - `frontend/src/locales/zh-CN/index.ts` — 新增 11 个翻译键
  - `frontend/src/locales/en-US/index.ts` — 新增 11 个翻译键
  - `frontend/src/features/operations/station/pages/StationForm.tsx` — `t('station.region')` → `t('station.regionLabel')`，`t('station.group')` → `t('station.groupLabel')`
  - `frontend/src/features/operations/station/pages/StationList.tsx` — `t('station.region.title')` → `t('station.regionLabel')`，`t('station.group.title')` → `t('station.groupLabel')`
  - `frontend/src/features/operations/station/pages/StationDetail.tsx` — 同上
  - `docs/CORRECTIONS.md` — P9 新增规则 5/6 + 摘要表 #30

- **待办：**
  - Module 2.2 订单交易约 97 个 inline fallback 键待注册到 locale 文件（下次迭代时统一补齐）

---

## 2026-03-10 RequirementTag 仅传 module 未传 componentIds，导致标签不渲染

- **修正内容：** 7.2 报表中心和 7.1 数据分析共 6 个页面的 `<RequirementTag>` 仅传了 `module="report-center"` / `module="data-analytics"`，未传 `componentIds`，导致组件内部 `ids` 为空数组 → `mappings` 为空 → return null，页面上完全不显示 User Story 关联标签。同时缺少 `showDetail` 属性，即使传了 componentId 也只会显示压缩格式而非完整 US 编号列表。
- **原因分析：**
  1. **API 理解不完整：** 开发者误以为 `module` 属性能让 RequirementTag 显示该模块的所有 story，实际上 `module` 只是指定"去哪个映射表查找"，真正决定渲染内容的是 `componentId` / `componentIds`
  2. **Checklist 条目粒度不够：** P2 Checklist 第 5 条"RequirementTag 三步"只检查了"① 创建 userStoryMapping ② 注册到 RequirementTag.tsx ③ 每个页面使用"，但第 ③ 步的"使用"未定义**正确的使用方式**（需传 componentIds + showDetail），仅检查了"有引用"而非"引用正确"
  3. **缺少运行时验证：** 交付前仅检查 `npm run build` 通过和代码中有 import/引用，但从未在浏览器中确认 RequirementTag 是否真正渲染出可见标签
  4. **跨模块传染：** 7.1 data-analytics 首次犯此错误后，7.2 report-center 复制了同样的错误用法模式
- **影响范围：** 6 个页面（7.1 × 3 + 7.2 × 3），所有页面 Header 区域的 RequirementTag 不可见
- **修复文件清单：**
  - `frontend/src/features/analytics/data-analytics/pages/BusinessDashboard.tsx` — 添加 componentIds (6 stories) + showDetail
  - `frontend/src/features/analytics/data-analytics/pages/SalesAnalysis.tsx` — 添加 componentIds (5 stories) + showDetail
  - `frontend/src/features/analytics/data-analytics/pages/CustomerAnalysis.tsx` — 添加 componentIds (5 stories) + showDetail
  - `frontend/src/features/analytics/report-center/pages/ReportOverview.tsx` — 添加 componentIds (3 stories) + showDetail
  - `frontend/src/features/analytics/report-center/pages/StandardReport.tsx` — 添加 componentIds (7 stories) + showDetail
  - `frontend/src/features/analytics/report-center/pages/CustomReport.tsx` — 添加 componentIds (4 stories) + showDetail
- **经验总结：**
  1. **RequirementTag 正确用法模板：** `<RequirementTag componentIds={['story-key-1', 'story-key-2']} module="module-name" showDetail />`，三个属性缺一不可
  2. **Checklist 第 5 条应细化为 4 个子步骤：** ① 创建 userStoryMapping.ts ② 注册到 RequirementTag.tsx ③ 每个页面传入 `componentIds` + `showDetail` ④ **浏览器验证标签可见**
  3. **运行时验证不可替代：** build 通过 ≠ 功能正确。组件 return null 不报错但功能丧失，必须在浏览器中肉眼确认
  4. **复制代码前验证原型正确性：** 从已有模块复制用法模式前，先确认源模块的用法本身是正确的

---

*创建时间：2026-02-27*
*最后更新：2026-03-10*
*内容来源：docs/CORRECTIONS.md 原始内容 (2026-02-07 ~ 2026-02-25) + auto-memory corrections (2026-02-25 ~ 2026-03-02)*
