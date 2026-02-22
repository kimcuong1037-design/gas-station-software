# Skill: 数据模型与架构设计

**Skill ID:** `architecture/data-model-design`
**所属 Agent:** Architecture Agent
**版本：** 1.1（2026-02-22 增加实体三问 + 聚合接口分析）
**依赖：** `analysis/user-story-writing.md` 已完成，`user-stories.md` 已存在

---

## 一、输入 / 输出

| 项目 | 说明 |
|------|------|
| **输入** | `user-stories.md`（必须已存在且完整） |
| **输出** | `architecture.md`（数据模型 + API 设计 + 权限矩阵） |
| **阻断条件** | `user-stories.md` 不存在时，**停止执行**，要求先完成 User Story 编写 |

---

## 二、执行流程

### Step 1：核心实体识别

从 `user-stories.md` 的所有 Acceptance Criteria 中，提取名词短语，识别候选实体。

对每个候选实体执行**实体三问检查**（强制步骤，不可跳过）：

#### 实体三问 Checklist

```
对每个核心实体 [EntityName]，逐一回答：

❓ 问题 1 — 自带数据
   这个实体自身携带哪些字段？哪些字段是从父实体继承的？
   → 防止字段遗漏（如 InspectionTask 的 checkItemIds 被错误地认为由 Plan 携带）

❓ 问题 2 — 创建触发方式
   这个实体是如何被创建的？
   选项: [ ] 手动创建（用户操作）  [ ] 自动生成（系统触发）  [ ] 两者兼有
   → "生成"/"下发"等词汇出现时，必须明确是系统自动还是用户触发

❓ 问题 3 — 副作用与生命周期约束
   创建/更新/删除时，会自动触发什么操作？
   完成某个状态时，必须存在哪些关联数据？
   → 防止 mock 数据中"已完成"状态但 logs 为空的问题
```

**示例（巡检任务）：**
```
实体：InspectionTask
问题1：自带字段包含 checkItemIds（不从 Plan 继承，每次下发独立配置）
问题2：由排班系统自动生成（不是手动创建），触发条件：Plan 生效 + 排班匹配
问题3：
  - 创建时：自动关联 Plan 中的 checkItems，生成初始 status='pending'
  - 完成时：必须有 ≥1 条 InspectionLog；completedAt 字段必须非空
  - 删除限制：status='in_progress' 时不允许删除
```

---

### Step 2：数据完整性约束设计

在确定实体字段后，为每个实体添加**数据完整性约束**章节：

```markdown
### 数据完整性约束：[EntityName]

| 约束类型 | 规则描述 |
|---------|---------|
| 状态约束 | status='completed' 时，必须存在 completedAt 和 completedBy |
| 关联约束 | 删除 Station 时，必须先处理/转移所有关联 Nozzle |
| 生命周期约束 | [completed 状态的实体] 必须有对应 [关联数据] |
| 唯一性约束 | nozzleNo 在同一 stationId 下唯一 |
```

**Mock 数据黄金规则**（派生自约束，必须在 mock 数据中遵守）：
- 每条 mock 记录的状态必须有对应的详情数据支撑
- `completed/done/closed` 状态的实体必须有 logs、records 或 completedAt

---

### Step 3：API 端点设计

#### 3.1 路径规范（强制）

所有端点必须遵循 STANDARDS.md 第 6 节：
- 前缀：`/api/v1/`
- 资源名：复数
- 嵌套：`/parent/:parentId/children`

#### 3.2 聚合接口前置分析（新增步骤）

**在设计 CRUD 接口之前，先执行聚合接口分析：**

```
对每个 UX 设计中的"详情页"或"看板页"，列出它需要的数据：

页面：[PageName]
需要的数据：
  - [数据1] → 来自 [Entity/API]
  - [数据2] → 来自 [Entity/API]
  - [数据3] → 来自 [Entity/API]

判断：
  [ ] 数据都来自单一实体 → 标准 CRUD 接口足够
  [x] 数据来自多个实体 → 需要聚合接口

如果需要聚合接口：
  端点：GET /api/v1/[resource]/:id/[aggregation-name]
  响应包含：[列出所有聚合字段]
```

**示例（站点概况页）：**
```
页面：ShiftSummary（站点概况）
需要的数据：
  - 当前班次信息 → Shift（当前活跃班次）
  - 下一排班 → ShiftSchedule（下一条排班记录）
  - 当前班次销售数据 → Order 聚合
  - 站点基本信息 → Station

判断：[x] 数据来自多个实体 → 需要聚合接口
聚合接口：GET /api/v1/stations/:id/overview
```

#### 3.3 标准 CRUD 端点模板

每个主要实体至少包含以下端点（按需增减）：

```
GET    /api/v1/{resources}              列表（支持分页、筛选）
POST   /api/v1/{resources}              创建
GET    /api/v1/{resources}/:id          详情
PUT    /api/v1/{resources}/:id          全量更新
PATCH  /api/v1/{resources}/:id          局部更新（状态变更）
DELETE /api/v1/{resources}/:id          删除（软删除）
```

---

### Step 4：权限矩阵设计

| 角色 | 操作 | 端点范围 |
|------|------|---------|
| 超级管理员 | CRUD | 所有端点 |
| 站长 | R + 部分 W | 本站点范围内的所有资源 |
| 收银员 | R | 只读；交接班创建权限 |
| 巡检员 | R + W | 巡检相关资源 |

---

### Step 5：输出 architecture.md

必须包含以下章节（缺少任意一个视为不完整，不允许进入前端实现）：

```markdown
# [模块名] 架构设计

## 1. 核心实体与数据模型
   - 1.1 实体关系图（ER 图，文字描述）
   - 1.2 实体三问分析（每个核心实体）
   - 1.3 数据完整性约束

## 2. API 端点设计
   - 2.1 聚合接口分析
   - 2.2 端点清单（含路径、方法、请求/响应字段）
   - 2.3 权限矩阵

## 3. 业务规则与状态机
   - 3.1 核心业务规则
   - 3.2 状态流转图

## 4. 跨模块依赖
   - 4.1 依赖其他模块的接口
   - 4.2 被其他模块依赖的接口
```

---

## 三、阻断性验证 Checklist

在 `architecture.md` 输出前，逐项确认：

- [ ] 所有核心实体都完成了"实体三问"
- [ ] 所有看板页/详情页都分析了是否需要聚合接口
- [ ] 所有 API 路径使用 `/api/v1/` 前缀
- [ ] 数据完整性约束已为每个有状态字段的实体定义
- [ ] 权限矩阵覆盖所有角色
- [ ] `architecture.md` 包含全部 5 个必要章节

**⛔ 如果以上任意一项未完成，禁止前端 Agent 开始实现工作。**

---

## 四、历史经验与反思

> 以下内容来自 Phase 1 复盘（reflections.md）：

1. **device-ledger 事故**：architecture.md 在前端实现完成后才补创，导致 types.ts 与架构设计不一致。解决方案：architecture.md 是进入实现阶段的门禁。

2. **InspectionTask 概念模糊**：因未做"实体三问"，导致 `checkItemIds` 字段被遗漏，4 个维度（需求/架构/UX/数据）同时出错。解决方案：本文档 Step 1 的实体三问强制流程。

3. **ShiftSummary 聚合接口缺失**：站点概况页的聚合接口在 UX 完成后才被发现遗漏，事后补设计。解决方案：本文档 Step 3.2 的聚合接口前置分析。

---

*创建日期：2026-02-22*
*版本：1.1*
*触发条件：每个新模块开始架构设计前*
