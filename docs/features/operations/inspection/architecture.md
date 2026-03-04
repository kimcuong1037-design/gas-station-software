# 巡检/安检管理 — 架构设计

**模块：** 基础运营 > 巡检/安检管理 (1.4)
**基于：** requirements.md v1.0 + user-stories.md v1.0
**设计日期：** 2026-02-19
**状态：** 待评审

---

## 0. 设计原则

### 0.1 软删除策略

所有业务实体采用 `status` 字段进行软删除：
- 安检计划：`cancelled`（已取消）表示软删除
- 检查项目：`inactive`（已停用）表示软删除
- 标签：物理删除（仅允许删除未被引用的标签）

### 0.2 三态检查结果

检查结果采用三态设计：
- `pending` — 待检查（初始状态，任务下发后所有检查项的默认状态）
- `normal` — 正常
- `abnormal` — 异常

### 0.3 计划-任务-日志三层模型

巡检业务采用三层结构，职责分明：
- **InspectionPlan**（安检计划）— 计划层：定义巡检周期、时间范围和包含的检查任务模式
- **InspectionTask**（安检任务）— 执行层：从计划生成的具体执行单元，分配执行人，跟踪状态
- **InspectionLog**（巡检日志）— 记录层：每个检查项的执行结果明细，形成完整审计轨迹

### 0.4 问题闭环流程

> ⚠️ **Phase 7 依赖（9.5 审批流程引擎）：** 问题闭环确认（pending_review → closed）涉及审批人角色，Phase 7 上线后纳入统一审批引擎。详见 [DEFERRED-FIXES.md — DF-001](../../DEFERRED-FIXES.md)。

> ⚠️ **Phase 7 依赖（9.1 角色权限管理）：** 本模块定义了 50+ 权限代码（散见于各 API 接口），但**缺少角色→权限映射矩阵**（P0 待补，已记录于 DEFERRED-FIXES.md DF-001）。MVP 阶段前端硬编码角色判断。

问题记录独立于巡检执行，支持独立生命周期管理：
- 问题可从巡检任务执行中自动关联，也可独立创建
- 问题状态流转：待处理 → 处理中 → 待验收 → 已闭环
- 支持驳回（退回处理中）

---

## 1. 数据模型

### 1.1 InspectionPlan（安检计划）

安检计划是巡检管理的顶层实体，定义巡检的周期安排。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `plan_no` | `VARCHAR(32)` | UNIQUE, NOT NULL | 计划编号（格式：IP-站点缩写-年月-序号） |
| `name` | `VARCHAR(200)` | NOT NULL | 计划名称 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 关联站点 |
| `cycle_type` | `VARCHAR(20)` | NOT NULL | 周期类型：`daily`/`weekly`/`monthly` |
| `start_date` | `DATE` | NOT NULL | 计划开始日期 |
| `end_date` | `DATE` | NOT NULL | 计划结束日期 |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending' | 计划状态：`pending`/`in_progress`/`completed`/`cancelled` |
| `description` | `TEXT` | | 计划描述/备注 |
| `check_item_ids` | `JSON` | | 关联的检查项目 ID 列表 |
| `created_by` | `UUID` | FK → User, NOT NULL | 创建人 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_plan_no` ON `plan_no` — 编号唯一查询
- `idx_plan_station` ON `station_id` — 站点筛选
- `idx_plan_status` ON `status` — 状态筛选
- `idx_plan_cycle` ON `cycle_type` — 周期类型筛选
- `idx_plan_start_date` ON `start_date` — 时间排序
- `idx_plan_created` ON `created_at` — 创建时间排序

---

### 1.2 InspectionTask（安检任务）

从安检计划中新增的具体执行任务，每个任务携带自己的检查项目列表（创建时从计划继承，可按需调整），并分配给一个执行人。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `task_no` | `VARCHAR(32)` | UNIQUE, NOT NULL | 任务编号（格式：IT-站点缩写-年月日-序号） |
| `plan_id` | `UUID` | FK → InspectionPlan, NOT NULL | 关联安检计划 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `assignee_id` | `UUID` | FK → Employee | 执行人（可后续分配） |
| `check_item_ids` | `JSON` | NOT NULL | 该任务关联的检查项目 ID 列表（创建时从计划继承，支持子集选择） |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending' | 任务状态：`pending`/`in_progress`/`completed` |
| `due_date` | `DATE` | NOT NULL | 截止日期 |
| `started_at` | `TIMESTAMP` | | 开始执行时间 |
| `completed_at` | `TIMESTAMP` | | 完成时间 |
| `total_items` | `INTEGER` | NOT NULL, DEFAULT 0 | 总检查项数量（= check_item_ids 间接长度） |
| `checked_items` | `INTEGER` | NOT NULL, DEFAULT 0 | 已检查项数量 |
| `normal_items` | `INTEGER` | NOT NULL, DEFAULT 0 | 正常项数量 |
| `abnormal_items` | `INTEGER` | NOT NULL, DEFAULT 0 | 异常项数量 |
| `remark` | `TEXT` | | 备注 |
| `created_by` | `UUID` | FK → User, NOT NULL | 创建人 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_task_no` ON `task_no` — 编号查询
- `idx_task_plan` ON `plan_id` — 计划关联查询
- `idx_task_station` ON `station_id` — 站点筛选
- `idx_task_assignee` ON `assignee_id` — 执行人筛选
- `idx_task_status` ON `status` — 状态筛选
- `idx_task_due_date` ON `due_date` — 截止日期排序
- `idx_task_created` ON `created_at` — 创建时间排序

**任务创建规则：**

创建安检任务时，需同时执行以下操作：
1. 任务的 `check_item_ids` 从关联计划继承（可选择子集），`total_items` = `check_item_ids` 数量，`checked_items` = 0
2. 为每个 `check_item_id` 自动创建一条 InspectionLog 记录，初始 `result = 'pending'`、`executed_at = NULL`
3. 任务初始状态为 `pending`

**数据一致性约束：**

| 规则 | 说明 |
|------|------|
| `checked_items = normal_items + abnormal_items` | 已检查数等于正常+异常数之和 |
| `total_items = len(check_item_ids) = count(InspectionLog WHERE task_id)` | 总数与检查项列表及日志数一致 |
| `status = 'completed' ⇒ checked_items = total_items > 0` | 已完成状态要求所有检查项均已完成 |
| `status = 'completed' ⇒ 所有 InspectionLog.result ≠ 'pending'` | 已完成状态下无待检查日志 |
| `status = 'in_progress' ⇒ checked_items > 0` | 执行中状态至少有一项已检查 |
| `status = 'pending' ⇒ checked_items = 0` | 待执行状态无已检查项 |

---

### 1.3 CheckItem（检查项目）

检查项目是巡检的基础配置数据，定义需要检查的具体内容。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `name` | `VARCHAR(200)` | NOT NULL | 检查项目名称 |
| `category` | `VARCHAR(30)` | NOT NULL | 分类：`tank_area`/`dispenser`/`power_room`/`fueling_area`/`non_fuel`/`equipment` |
| `description` | `TEXT` | | 检查标准描述 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `equipment_id` | `UUID` | FK → Equipment | 关联设备（可选，如"x# 加气机"） |
| `tag_ids` | `JSON` | | 关联标签 ID 列表 |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | 排序序号 |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'active' | 状态：`active`/`inactive` |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |
| `created_by` | `UUID` | FK → User | 创建人 |

**索引：**
- `idx_check_item_station` ON `station_id` — 站点筛选
- `idx_check_item_category` ON `category` — 分类筛选
- `idx_check_item_status` ON `status` — 状态筛选
- `idx_check_item_equipment` ON `equipment_id` — 设备关联查询
- `idx_check_item_sort` ON `(station_id, sort_order)` — 站点内排序

---

### 1.4 CheckItemTemplate（检查项模板）[MVP+]

将多个检查项目组合为模板，方便批量添加。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `name` | `VARCHAR(200)` | NOT NULL | 模板名称 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `check_item_ids` | `JSON` | NOT NULL | 包含的检查项目 ID 列表 |
| `description` | `TEXT` | | 模板描述 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |
| `created_by` | `UUID` | FK → User | 创建人 |

**索引：**
- `idx_template_station` ON `station_id`

---

### 1.5 InspectionTag（巡检标签）

检查项目的标签体系，支持一级标签分类。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `name` | `VARCHAR(50)` | NOT NULL | 标签名称 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | 排序序号 |
| `usage_count` | `INTEGER` | NOT NULL, DEFAULT 0 | 使用次数（被多少检查项目引用） |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_tag_station` ON `station_id`
- `idx_tag_sort` ON `(station_id, sort_order)` — 站点内排序

**约束：**
- 同一站点内标签名称唯一（`UNIQUE(station_id, name)`）

---

### 1.6 InspectionLog（巡检日志/执行记录）

记录每个检查项的执行结果明细。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `task_id` | `UUID` | FK → InspectionTask, NOT NULL | 关联安检任务 |
| `check_item_id` | `UUID` | FK → CheckItem, NOT NULL | 关联检查项目 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `executor_id` | `UUID` | FK → Employee, NOT NULL | 执行人 |
| `result` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending' | 检查结果：`pending`/`normal`/`abnormal` |
| `remark` | `TEXT` | | 异常备注说明 |
| `executed_at` | `TIMESTAMP` | | 执行时间（结果录入时间） |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_log_task` ON `task_id` — 任务关联查询
- `idx_log_check_item` ON `check_item_id` — 检查项关联
- `idx_log_station` ON `station_id` — 站点筛选
- `idx_log_executor` ON `executor_id` — 执行人筛选
- `idx_log_result` ON `result` — 结果筛选
- `idx_log_executed` ON `executed_at` — 时间排序
- `idx_log_task_item` ON `(task_id, check_item_id)` UNIQUE — 同一任务同一检查项唯一

---

### 1.7 InspectionPhoto（巡检照片）

巡检执行和问题整改的照片附件。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `ref_type` | `VARCHAR(20)` | NOT NULL | 关联类型：`inspection_log`/`issue_record` |
| `ref_id` | `UUID` | NOT NULL | 关联 ID（InspectionLog.id 或 IssueRecord.id） |
| `file_url` | `VARCHAR(500)` | NOT NULL | 文件URL |
| `file_name` | `VARCHAR(255)` | NOT NULL | 原始文件名 |
| `file_size` | `INTEGER` | | 文件大小（字节） |
| `mime_type` | `VARCHAR(50)` | | MIME 类型（image/jpeg, image/png） |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | 排序序号 |
| `uploaded_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 上传时间 |
| `uploaded_by` | `UUID` | FK → User | 上传人 |

**索引：**
- `idx_photo_ref` ON `(ref_type, ref_id)` — 关联查询

**约束：**
- 每个关联对象最多 10 张照片
- 格式限制：JPG/PNG，单张不超过 5MB

---

### 1.8 IssueRecord（问题记录）

巡检中发现的问题，独立生命周期管理，支持全流程闭环。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `issue_no` | `VARCHAR(32)` | UNIQUE, NOT NULL | 问题编号（格式：IS-站点缩写-年月日-序号） |
| `station_id` | `UUID` | FK → Station, NOT NULL | 所属站点 |
| `task_id` | `UUID` | FK → InspectionTask | 关联安检任务（可选，支持独立创建） |
| `log_id` | `UUID` | FK → InspectionLog | 关联巡检日志（可选） |
| `check_item_id` | `UUID` | FK → CheckItem | 关联检查项目（可选） |
| `equipment_id` | `UUID` | FK → Equipment | 关联设备（可选，来源于设备设施管理 1.3） |
| `description` | `TEXT` | NOT NULL | 问题描述 |
| `severity` | `VARCHAR(20)` | NOT NULL, DEFAULT 'medium' | 问题等级：`low`/`medium`/`high`/`urgent` |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending' | 状态：`pending`/`processing`/`pending_review`/`closed` |
| `reporter_id` | `UUID` | FK → Employee, NOT NULL | 登记人 |
| `assignee_id` | `UUID` | FK → Employee | 处理人 |
| `assigned_at` | `TIMESTAMP` | | 分配时间 |
| `assigned_by` | `UUID` | FK → User | 分配人 |
| `rectification` | `TEXT` | | 整改措施 |
| `rectification_result` | `TEXT` | | 整改结果 |
| `rectified_at` | `TIMESTAMP` | | 整改完成时间 |
| `reviewer_id` | `UUID` | FK → User | 闭环审核人 |
| `reviewed_at` | `TIMESTAMP` | | 闭环审核时间 |
| `review_comment` | `TEXT` | | 审核意见 |
| `due_date` | `DATE` | | 处理期限 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_issue_no` ON `issue_no` — 编号查询
- `idx_issue_station` ON `station_id` — 站点筛选
- `idx_issue_task` ON `task_id` — 任务关联查询
- `idx_issue_status` ON `status` — 状态筛选
- `idx_issue_severity` ON `severity` — 等级筛选
- `idx_issue_assignee` ON `assignee_id` — 处理人筛选
- `idx_issue_reporter` ON `reporter_id` — 登记人筛选
- `idx_issue_due_date` ON `due_date` — 到期查询
- `idx_issue_created` ON `created_at` — 创建时间排序

---

## 2. 实体关系

### 2.1 ER 图描述

```
┌──────────────────────────────────────────────────────┐
│                Station (站点) [外部]                   │
└──┬───────┬──────────┬────────────┬───────────────────┘
   │       │          │            │
   │ 1     │ 1        │ 1          │ 1
   ▼ n     ▼ n        ▼ n          ▼ n
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│Inspection  │ │ CheckItem  │ │Inspection  │ │IssueRecord │
│Plan        │ │            │ │Tag         │ │            │
│────────────│ │────────────│ │────────────│ │────────────│
│ id (PK)    │ │ id (PK)    │ │ id (PK)    │ │ id (PK)    │
│ plan_no    │ │ name       │ │ name       │ │ issue_no   │
│ station_id │ │ category   │ │ station_id │ │ station_id │
│ cycle_type │ │ station_id │ │ sort_order │ │ task_id(FK)│
│ status     │ │ equipment_ │ │ usage_count│ │ severity   │
│ ...        │ │ id (FK)    │ └────────────┘ │ status     │
└──────┬─────┘ │ tag_ids    │                │ assignee_id│
       │       │ status     │                │ ...        │
       │ 1     └──────┬─────┘                └──────┬─────┘
       ▼ n            │                             │
┌────────────┐        │ 1                           │ 1
│Inspection  │        ▼ n                           ▼ n
│Task        │  ┌────────────┐               ┌────────────┐
│────────────│  │Inspection  │               │Inspection  │
│ id (PK)    │  │Log         │               │Photo       │
│ task_no    │  │────────────│               │────────────│
│ plan_id(FK)│  │ id (PK)    │               │ id (PK)    │
│ station_id │  │ task_id(FK)│               │ ref_type   │
│ assignee_id│  │ check_item │               │ ref_id     │
│ status     │  │  _id (FK)  │               │ file_url   │
│ due_date   │  │ result     │               │ ...        │
│ ...        │  │ executed_at│               └────────────┘
└──────┬─────┘  └────────────┘
       │ 1
       ▼ n
  InspectionLog
  (via task_id)

  Equipment (设备) [外部模块 1.3]
    ← CheckItem.equipment_id
    ← IssueRecord.equipment_id
```

### 2.2 关系说明

| 关系 | 类型 | 说明 |
|------|------|------|
| Station → InspectionPlan | 1:N | 一个站点有多个安检计划 |
| Station → CheckItem | 1:N | 一个站点有多个检查项目 |
| Station → InspectionTag | 1:N | 一个站点有多个标签 |
| Station → IssueRecord | 1:N | 一个站点有多个问题记录 |
| InspectionPlan → InspectionTask | 1:N | 一个计划下发多个任务 |
| InspectionTask → InspectionLog | 1:N | 一个任务包含多条日志（每个检查项一条） |
| CheckItem → InspectionLog | 1:N | 一个检查项可在多个任务中被检查 |
| InspectionTask → IssueRecord | 1:N | 一个任务可产生多条问题记录 |
| InspectionLog → InspectionPhoto | 1:N | 一条日志可附带多张照片（通过 ref_type 多态关联） |
| IssueRecord → InspectionPhoto | 1:N | 一条问题记录可附带多张照片（通过 ref_type 多态关联） |
| Equipment → CheckItem | 1:N | 一台设备可关联多个检查项目（跨模块） |
| Equipment → IssueRecord | 1:N | 一台设备可有多条相关问题记录（跨模块） |

---

## 3. 枚举定义

### 3.1 计划状态 (PlanStatus)

| 值 | 说明 |
|----|------|
| `pending` | 待执行 |
| `in_progress` | 执行中 |
| `completed` | 已完成 |
| `cancelled` | 已取消（软删除） |

### 3.2 周期类型 (CycleType)

| 值 | 说明 | 间隔 |
|----|------|------|
| `daily` | 日巡检 | 每天 |
| `weekly` | 周巡检 | 每周 |
| `monthly` | 月巡检 | 每月 |

### 3.3 任务状态 (TaskStatus)

| 值 | 说明 |
|----|------|
| `pending` | 待执行 |
| `in_progress` | 执行中 |
| `completed` | 已完成 |

**状态流转：**
```
pending → in_progress → completed
```

### 3.4 检查结果 (CheckResult)

| 值 | 说明 | 图标 |
|----|------|------|
| `pending` | 待检查 | ○ 灰色 |
| `normal` | 正常 | ● 绿色 |
| `abnormal` | 异常 | ● 红色 |

### 3.5 检查项分类 (CheckItemCategory)

| 值 | 中文名 | 说明 |
|----|--------|------|
| `tank_area` | 罐区环保 | 储罐区域的安全和环保检查 |
| `dispenser` | 加注机 | 加注设备的运行状态检查 |
| `power_room` | 配电室 | 配电设施的安全检查 |
| `fueling_area` | 加油区域 | 加注作业区域的安全检查 |
| `non_fuel` | 非油管理 | 便利店等非油业务区域检查 |
| `equipment` | 设备管理 | 其他设备的综合检查 |

### 3.6 问题等级 (IssueSeverity)

| 值 | 说明 | 响应要求 |
|----|------|---------|
| `low` | 低 | 不影响运营，可计划处理 |
| `medium` | 中 | 影响部分功能，需较快处理 |
| `high` | 高 | 影响安全运行，需当日处理 |
| `urgent` | 紧急 | 严重安全隐患，需立即处理 |

### 3.7 问题状态 (IssueStatus)

| 值 | 说明 |
|----|------|
| `pending` | 待处理 |
| `processing` | 处理中 |
| `pending_review` | 待验收 |
| `closed` | 已闭环 |

**状态流转：**
```
pending → processing → pending_review → closed
                ↑                      │
                └── (驳回退回) ─────────┘
```

### 3.8 照片关联类型 (PhotoRefType)

| 值 | 说明 |
|----|------|
| `inspection_log` | 巡检日志照片 |
| `issue_record` | 问题记录/整改照片 |

---

## 4. API 接口设计

### 4.1 通用约定

遵循项目 API 通用约定：

**基础路径：** `/api/v1`

**通用响应格式：**
```jsonc
{
  "code": 0,           // 0=成功，非0=错误
  "message": "success",
  "data": { ... },
  "timestamp": "2026-02-19T10:30:00.000Z"
}
```

---

### 4.2 安检计划 API

#### GET /api/v1/stations/:stationId/inspection-plans

获取安检计划列表。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页数量，默认 20，最大 100 |
| `keyword` | string | 否 | 搜索关键词（匹配计划编号、名称） |
| `status` | string | 否 | 状态筛选：`pending`/`in_progress`/`completed`/`cancelled`/`all` |
| `cycleType` | string | 否 | 周期类型：`daily`/`weekly`/`monthly` |
| `startDateFrom` | string | 否 | 开始日期起始（YYYY-MM-DD） |
| `startDateTo` | string | 否 | 开始日期截止（YYYY-MM-DD） |
| `sortBy` | string | 否 | 排序字段：`createdAt`/`startDate`/`planNo`，默认 `createdAt` |
| `sortOrder` | string | 否 | 排序方向：`asc`/`desc`，默认 `desc` |

**响应示例：**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "plan-001",
        "planNo": "IP-BJCY-202602-001",
        "name": "2026年2月日常巡检计划",
        "stationId": "station-001",
        "cycleType": "daily",
        "startDate": "2026-02-01",
        "endDate": "2026-02-28",
        "status": "in_progress",
        "taskCount": 28,
        "completedTaskCount": 18,
        "createdAt": "2026-01-30T10:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "pageSize": 20, "total": 5, "totalPages": 1 }
  }
}
```

**权限：** `inspection_plan:list`

---

#### GET /api/v1/stations/:stationId/inspection-plans/:id

获取安检计划详情。

**权限：** `inspection_plan:read`

---

#### POST /api/v1/stations/:stationId/inspection-plans

创建安检计划。

**请求 Body：**
```json
{
  "name": "2026年3月日常巡检计划",
  "cycleType": "daily",
  "startDate": "2026-03-01",
  "endDate": "2026-03-31",
  "checkItemIds": ["ci-001", "ci-002", "ci-003"],
  "description": "每日常规安全巡检"
}
```

**权限：** `inspection_plan:create`

---

#### PUT /api/v1/stations/:stationId/inspection-plans/:id

编辑安检计划（仅 `pending` 状态可编辑）。

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 403001 | 计划已开始执行，不可编辑 |

**权限：** `inspection_plan:update`

---

#### DELETE /api/v1/stations/:stationId/inspection-plans/:id

取消安检计划（软删除，仅 `pending` 状态可取消）。

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 403002 | 计划已开始执行，不可取消 |

**权限：** `inspection_plan:delete`

---

#### POST /api/v1/stations/:stationId/inspection-plans/:id/dispatch

从计划下发安检任务。

**请求 Body：**
```json
{
  "assigneeId": "emp-001",
  "dueDate": "2026-02-19"
}
```

**权限：** `inspection_task:create`

---

### 4.3 安检任务 API

#### GET /api/v1/stations/:stationId/inspection-tasks

获取安检任务列表。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页数量，默认 20 |
| `keyword` | string | 否 | 搜索关键词（匹配任务编号） |
| `status` | string | 否 | 状态：`pending`/`in_progress`/`completed`/`all` |
| `assigneeId` | string | 否 | 执行人筛选 |
| `planId` | string | 否 | 关联计划筛选 |
| `dueDateFrom` | string | 否 | 截止日期起始 |
| `dueDateTo` | string | 否 | 截止日期截止 |
| `sortBy` | string | 否 | 排序字段：`createdAt`/`dueDate`/`taskNo` |
| `sortOrder` | string | 否 | 排序方向：`asc`/`desc` |

**权限：** `inspection_task:list`

---

#### GET /api/v1/stations/:stationId/inspection-tasks/:id

获取任务详情（含检查项列表及各项结果）。

**响应示例：**
```json
{
  "code": 0,
  "data": {
    "id": "task-001",
    "taskNo": "IT-BJCY-20260219-001",
    "planId": "plan-001",
    "planName": "2026年2月日常巡检计划",
    "stationId": "station-001",
    "assigneeId": "emp-001",
    "assigneeName": "张三",
    "status": "in_progress",
    "dueDate": "2026-02-19",
    "totalItems": 8,
    "checkedItems": 5,
    "normalItems": 4,
    "abnormalItems": 1,
    "checkResults": [
      {
        "logId": "log-001",
        "checkItemId": "ci-001",
        "checkItemName": "LNG储罐#1外观检查",
        "category": "tank_area",
        "result": "normal",
        "remark": null,
        "executedAt": "2026-02-19T08:30:00.000Z",
        "photos": []
      },
      {
        "logId": "log-002",
        "checkItemId": "ci-002",
        "checkItemName": "加气机#01运行检查",
        "category": "dispenser",
        "result": "abnormal",
        "remark": "加气枪#2有微量泄漏",
        "executedAt": "2026-02-19T08:45:00.000Z",
        "photos": [{ "id": "p-001", "fileUrl": "...", "fileName": "leak.jpg" }]
      },
      {
        "logId": "log-003",
        "checkItemId": "ci-003",
        "checkItemName": "配电室温度检查",
        "category": "power_room",
        "result": "pending",
        "remark": null,
        "executedAt": null,
        "photos": []
      }
    ]
  }
}
```

**权限：** `inspection_task:read`

---

#### PUT /api/v1/stations/:stationId/inspection-tasks/:id/assign

分配/变更执行人。

**请求 Body：**
```json
{
  "assigneeId": "emp-002"
}
```

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 403003 | 任务已完成，不可变更执行人 |

**权限：** `inspection_task:assign`

---

#### PUT /api/v1/stations/:stationId/inspection-tasks/:id/complete

提交任务完成。

**权限：** `inspection_task:update`

---

### 4.4 检查项目 API

#### GET /api/v1/stations/:stationId/check-items

获取检查项目列表。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `keyword` | string | 否 | 名称搜索 |
| `category` | string | 否 | 分类筛选 |
| `status` | string | 否 | 状态：`active`/`inactive`/`all` |

**权限：** `check_item:list`

---

#### POST /api/v1/stations/:stationId/check-items

新增检查项目。

**权限：** `check_item:create`

---

#### PUT /api/v1/stations/:stationId/check-items/:id

编辑检查项目。

**权限：** `check_item:update`

---

#### DELETE /api/v1/stations/:stationId/check-items/:id

停用检查项目（软删除）。

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 409003 | 检查项目正在被进行中的任务使用，无法停用 |

**权限：** `check_item:delete`

---

### 4.5 标签 API

#### GET /api/v1/stations/:stationId/inspection-tags

获取标签列表。

**权限：** `inspection_tag:list`

---

#### POST /api/v1/stations/:stationId/inspection-tags

新增标签。

**权限：** `inspection_tag:create`

---

#### PUT /api/v1/stations/:stationId/inspection-tags/:id

编辑标签。

**权限：** `inspection_tag:update`

---

#### DELETE /api/v1/stations/:stationId/inspection-tags/:id

删除标签。

**错误码：**

| 错误码 | 说明 |
|--------|------|
| 409004 | 标签正在被检查项目使用，需确认后删除 |

**权限：** `inspection_tag:delete`

---

#### PUT /api/v1/stations/:stationId/inspection-tags/sort

批量更新标签排序。

**请求 Body：**
```json
{
  "items": [
    { "id": "tag-001", "sortOrder": 1 },
    { "id": "tag-002", "sortOrder": 2 }
  ]
}
```

**权限：** `inspection_tag:update`

---

### 4.6 巡检日志 API

#### GET /api/v1/stations/:stationId/inspection-logs

获取巡检日志列表。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 页码 |
| `pageSize` | number | 否 | 每页数量 |
| `taskId` | string | 否 | 任务筛选 |
| `checkItemId` | string | 否 | 检查项目筛选 |
| `executorId` | string | 否 | 执行人筛选 |
| `result` | string | 否 | 结果：`normal`/`abnormal`/`pending` |
| `executedFrom` | string | 否 | 执行时间起始 |
| `executedTo` | string | 否 | 执行时间截止 |

**权限：** `inspection_log:list`

---

#### PUT /api/v1/stations/:stationId/inspection-logs/:id/result

记录检查结果。

**请求 Body：**
```json
{
  "result": "abnormal",
  "remark": "加气枪#2有微量泄漏"
}
```

**权限：** `inspection_log:update`

---

#### POST /api/v1/stations/:stationId/inspection-logs/:id/photos

上传巡检照片。

**请求：** `multipart/form-data`

**权限：** `inspection_log:update`

---

### 4.7 问题记录 API

#### GET /api/v1/stations/:stationId/issue-records

获取问题记录列表。

**请求参数（Query）：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | number | 否 | 页码 |
| `pageSize` | number | 否 | 每页数量 |
| `status` | string | 否 | 状态筛选 |
| `severity` | string | 否 | 等级筛选 |
| `assigneeId` | string | 否 | 处理人筛选 |
| `taskId` | string | 否 | 关联任务筛选 |
| `createdFrom` | string | 否 | 创建时间起始 |
| `createdTo` | string | 否 | 创建时间截止 |
| `sortBy` | string | 否 | 排序：`createdAt`/`severity`/`dueDate` |
| `sortOrder` | string | 否 | 排序方向 |

**权限：** `issue_record:list`

---

#### POST /api/v1/stations/:stationId/issue-records

登记问题。

**请求 Body：**
```json
{
  "taskId": "task-001",
  "logId": "log-002",
  "checkItemId": "ci-002",
  "equipmentId": "equip-004",
  "description": "加气枪#2有微量泄漏，需及时维修",
  "severity": "high",
  "dueDate": "2026-02-20"
}
```

**权限：** `issue_record:create`

---

#### GET /api/v1/stations/:stationId/issue-records/:id

获取问题详情。

**权限：** `issue_record:read`

---

#### PUT /api/v1/stations/:stationId/issue-records/:id/assign

分配处理人。

**请求 Body：**
```json
{
  "assigneeId": "emp-003"
}
```

**权限：** `issue_record:assign`

---

#### PUT /api/v1/stations/:stationId/issue-records/:id/rectify

提交整改结果。

**请求 Body：**
```json
{
  "rectification": "更换加气枪#2密封圈",
  "rectificationResult": "已更换密封圈，测试无泄漏"
}
```

**权限：** `issue_record:update`

---

#### PUT /api/v1/stations/:stationId/issue-records/:id/close

闭环确认。

**请求 Body：**
```json
{
  "approved": true,
  "reviewComment": "验收通过，问题已解决"
}
```

如果 `approved` 为 `false`，问题状态退回 `processing`。

**权限：** `issue_record:close`

---

#### POST /api/v1/stations/:stationId/issue-records/:id/photos

上传整改照片。

**权限：** `issue_record:update`

---

### 4.8 统计与报表 API

#### GET /api/v1/stations/:stationId/inspection-stats/daily-report

获取巡检日报。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `date` | string | 否 | 日期（YYYY-MM-DD），默认当天 |

**响应示例：**
```json
{
  "code": 0,
  "data": {
    "date": "2026-02-19",
    "totalTasks": 5,
    "completedTasks": 3,
    "completionRate": 60.0,
    "totalItems": 40,
    "checkedItems": 24,
    "normalItems": 22,
    "abnormalItems": 2,
    "newIssues": 2,
    "executorSummary": [
      { "executorId": "emp-001", "executorName": "张三", "completedTasks": 2, "abnormalItems": 1 },
      { "executorId": "emp-002", "executorName": "李四", "completedTasks": 1, "abnormalItems": 1 }
    ]
  }
}
```

**权限：** `inspection_stats:read`

---

#### GET /api/v1/inspection-stats/station-report

获取站点执行报表（跨站点，运营经理视角）。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `startDate` | string | 是 | 开始日期 |
| `endDate` | string | 是 | 结束日期 |
| `stationIds` | string | 否 | 站点 ID 列表（逗号分隔），默认全部 |

**响应示例：**
```json
{
  "code": 0,
  "data": {
    "startDate": "2026-02-01",
    "endDate": "2026-02-19",
    "stations": [
      {
        "stationId": "station-001",
        "stationName": "北京朝阳加气站",
        "totalTasks": 38,
        "completedTasks": 35,
        "completionRate": 92.1,
        "totalAbnormalItems": 8,
        "totalIssues": 6,
        "closedIssues": 4,
        "rectificationRate": 66.7
      }
    ]
  }
}
```

**权限：** `inspection_stats:read`

---

#### GET /api/v1/stations/:stationId/inspection-stats/overview

获取安检统计概览。

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `startDate` | string | 是 | 开始日期 |
| `endDate` | string | 是 | 结束日期 |
| `dimension` | string | 否 | 维度：`time`/`station`/`category`，默认 `time` |
| `granularity` | string | 否 | 时间粒度：`day`/`week`/`month`，默认 `day`（仅 dimension=time 时有效） |

**权限：** `inspection_stats:read`

---

#### GET /api/v1/stations/:stationId/inspection-reports

获取检查报表列表。

**权限：** `inspection_report:list`

---

#### POST /api/v1/stations/:stationId/inspection-reports/generate

生成检查报表。

**请求 Body：**
```json
{
  "reportType": "completion",
  "startDate": "2026-02-01",
  "endDate": "2026-02-19",
  "format": "excel"
}
```

| reportType | 说明 |
|------------|------|
| `completion` | 巡检完成报表 |
| `abnormal` | 异常统计报表 |
| `rectification` | 整改跟踪报表 |
| `compliance` | 合规报表 |

**权限：** `inspection_report:create`

---

## 5. 业务流程

### 5.1 巡检计划-任务-执行流程

```
安全主管创建安检计划
  → 选择周期类型、时间范围、检查项目
  → 保存计划（状态：pending）
       │
       ▼
安全主管下发任务
  → 从计划生成安检任务，分配执行人
  → 任务状态：pending，计划状态：in_progress
       │
       ▼
巡检员执行巡检
  → 进入任务详情，逐项记录检查结果
  → 首次操作时任务自动变为 in_progress
  → 结果为异常时填写备注（可上传照片）
  → 异常项可直接登记问题记录
       │
       ▼
巡检员提交任务
  → 所有检查项已填写结果
  → 任务状态：completed
  → 更新计划进度（所有任务完成时计划变为 completed）
       │
       ▼
系统聚合生成日报
  → 按日汇总完成率、异常项
  → 安全主管/站长查看日报
```

### 5.2 问题闭环流程

```
登记问题
  → 巡检执行中发现异常时登记（自动关联任务/检查项）
  → 或从问题列表独立创建
  → 状态：pending
       │
       ▼
分配处理人
  → 安全主管将问题分配给具体人员
  → 状态：processing
       │
       ▼
记录整改
  → 处理人填写整改措施、整改结果
  → 可上传整改照片
  → 状态：pending_review
       │
       ▼
闭环确认
  ├─ 验收通过 → 状态：closed（闭环完成）
  └─ 驳回 → 状态：processing（退回处理）
```

---

## 6. 与其他模块的集成点

| 集成点 | 方向 | 说明 | 实现阶段 |
|--------|------|------|---------|
| 站点管理 (1.1) → 本模块 | 读取 | 获取站点列表、员工列表用于计划关联和任务分配 | MVP |
| 本模块 → 设备设施管理 (1.3) | 读取 | 检查项目关联设备台账，问题记录引用设备编号 | MVP |
| 本模块 → 设备设施管理 (1.3) | 写入 | 巡检问题触发创建维保工单 | PROD |
| 本模块 → 风控中心 (5.4) | 写入 | 严重问题同步至风控 | PROD |
| 数据分析 (7.1) → 本模块 | 读取 | 巡检统计数据供经营看板引用 | FUTURE |

---

## 7. Database Schema (MySQL 8.0)

> 后端启动时可直接使用的数据库表定义草案。基于 Section 1 数据模型生成。
> 跨模块外键（Station, Employee/User, Equipment）使用 UUID 类型但不添加 FK 约束，由应用层保证一致性。

```sql
-- ============================================================
-- ENUM TYPES
-- ============================================================

-- ============================================================
-- 1. InspectionTag（巡检标签）
--    无内部 FK 依赖，最先创建
-- ============================================================

CREATE TABLE inspection_tag (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name            VARCHAR(50) NOT NULL,
    station_id      CHAR(36)        NOT NULL,   -- FK → Station（跨模块，应用层保证）
    sort_order      INTEGER     NOT NULL DEFAULT 0,
    usage_count     INTEGER     NOT NULL DEFAULT 0,
    created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_tag_station_name UNIQUE (station_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT = '巡检标签 — 检查项目的一级标签分类体系';
-- Column comments for inspection_tag:
-- ALTER TABLE inspection_tag MODIFY COLUMN station_id ... COMMENT '所属站点（跨模块 FK → Station，应用层保证一致性）';

CREATE INDEX idx_tag_station ON inspection_tag (station_id);
CREATE INDEX idx_tag_sort    ON inspection_tag (station_id, sort_order);

-- ============================================================
-- 2. CheckItem（检查项目）
--    依赖：无内部 FK（equipment_id 为跨模块引用）
-- ============================================================

CREATE TABLE check_item (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name            VARCHAR(200)        NOT NULL,
    category        ENUM('tank_area', 'dispenser', 'power_room', 'fueling_area', 'non_fuel', 'equipment') NOT NULL,
    description     TEXT,
    station_id      CHAR(36)                NOT NULL,   -- FK → Station（跨模块，应用层保证）
    equipment_id    CHAR(36),                           -- FK → Equipment（跨模块 1.3，应用层保证）
    tag_ids         JSON,
    sort_order      INTEGER             NOT NULL DEFAULT 0,
    status          VARCHAR(20)         NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      CHAR(36),                           -- FK → User（跨模块，应用层保证）

    CONSTRAINT chk_check_item_status CHECK (status IN ('active', 'inactive'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT = '检查项目 — 巡检的基础配置数据，定义需要检查的具体内容';
-- Column comments for check_item:
-- ALTER TABLE check_item MODIFY COLUMN station_id ... COMMENT '所属站点（跨模块 FK → Station，应用层保证一致性）';
-- ALTER TABLE check_item MODIFY COLUMN equipment_id ... COMMENT '关联设备（跨模块 FK → Equipment 1.3，应用层保证一致性）';
-- ALTER TABLE check_item MODIFY COLUMN created_by ... COMMENT '创建人（跨模块 FK → User，应用层保证一致性）';

CREATE INDEX idx_check_item_station   ON check_item (station_id);
CREATE INDEX idx_check_item_category  ON check_item (category);
CREATE INDEX idx_check_item_status    ON check_item (status);
CREATE INDEX idx_check_item_equipment ON check_item (equipment_id);
CREATE INDEX idx_check_item_sort      ON check_item (station_id, sort_order);

-- ============================================================
-- 3. CheckItemTemplate（检查项模板）[MVP+]
--    依赖：无内部 FK
-- ============================================================

CREATE TABLE check_item_template (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name            VARCHAR(200)    NOT NULL,
    station_id      CHAR(36)            NOT NULL,   -- FK → Station（跨模块，应用层保证）
    check_item_ids  JSON           NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by      CHAR(36)                        -- FK → User（跨模块，应用层保证）
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT = '检查项模板 [MVP+] — 将多个检查项目组合为模板，方便批量添加';
-- Column comments for check_item_template:
-- ALTER TABLE check_item_template MODIFY COLUMN station_id ... COMMENT '所属站点（跨模块 FK → Station，应用层保证一致性）';
-- ALTER TABLE check_item_template MODIFY COLUMN created_by ... COMMENT '创建人（跨模块 FK → User，应用层保证一致性）';

CREATE INDEX idx_template_station ON check_item_template (station_id);

-- ============================================================
-- 4. InspectionPlan（安检计划）
--    依赖：无内部 FK
-- ============================================================

CREATE TABLE inspection_plan (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    plan_no         VARCHAR(32)     NOT NULL,
    name            VARCHAR(200)    NOT NULL,
    station_id      CHAR(36)            NOT NULL,   -- FK → Station（跨模块，应用层保证）
    cycle_type      VARCHAR(20)     NOT NULL,
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    status          ENUM('pending', 'in_progress', 'completed', 'cancelled')     NOT NULL DEFAULT 'pending',
    description     TEXT,
    check_item_ids  JSON,
    created_by      CHAR(36)            NOT NULL,   -- FK → User（跨模块，应用层保证）
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_plan_no      UNIQUE (plan_no),
    CONSTRAINT chk_plan_cycle  CHECK (cycle_type IN ('daily', 'weekly', 'monthly')),
    CONSTRAINT chk_plan_dates  CHECK (end_date >= start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT = '安检计划 — 巡检管理的顶层实体，定义巡检周期安排';
-- Column comments for inspection_plan:
-- ALTER TABLE inspection_plan MODIFY COLUMN station_id ... COMMENT '关联站点（跨模块 FK → Station，应用层保证一致性）';
-- ALTER TABLE inspection_plan MODIFY COLUMN created_by ... COMMENT '创建人（跨模块 FK → User，应用层保证一致性）';

CREATE INDEX idx_plan_no         ON inspection_plan (plan_no);
CREATE INDEX idx_plan_station    ON inspection_plan (station_id);
CREATE INDEX idx_plan_status     ON inspection_plan (status);
CREATE INDEX idx_plan_cycle      ON inspection_plan (cycle_type);
CREATE INDEX idx_plan_start_date ON inspection_plan (start_date);
CREATE INDEX idx_plan_created    ON inspection_plan (created_at);

-- ============================================================
-- 5. InspectionTask（安检任务）
--    依赖：inspection_plan (plan_id)
-- ============================================================

CREATE TABLE inspection_task (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    task_no         VARCHAR(32)         NOT NULL,
    plan_id         CHAR(36)                NOT NULL REFERENCES inspection_plan (id) ON DELETE RESTRICT,
    station_id      CHAR(36)                NOT NULL,   -- FK → Station（跨模块，应用层保证）
    assignee_id     CHAR(36),                           -- FK → Employee（跨模块，应用层保证）
    check_item_ids  JSON               NOT NULL,
    status          ENUM('pending', 'in_progress', 'completed')    NOT NULL DEFAULT 'pending',
    due_date        DATE                NOT NULL,
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    total_items     INTEGER             NOT NULL DEFAULT 0,
    checked_items   INTEGER             NOT NULL DEFAULT 0,
    normal_items    INTEGER             NOT NULL DEFAULT 0,
    abnormal_items  INTEGER             NOT NULL DEFAULT 0,
    remark          TEXT,
    created_by      CHAR(36)                NOT NULL,   -- FK → User（跨模块，应用层保证）
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_task_no UNIQUE (task_no),
    CONSTRAINT chk_task_checked_sum CHECK (checked_items = normal_items + abnormal_items),
    CONSTRAINT chk_task_checked_le_total CHECK (checked_items <= total_items),
    CONSTRAINT chk_task_total_nonneg CHECK (total_items >= 0),
    CONSTRAINT chk_task_items_nonneg CHECK (checked_items >= 0 AND normal_items >= 0 AND abnormal_items >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT = '安检任务 — 从安检计划下发的具体执行单元';
-- Column comments for inspection_task:
-- ALTER TABLE inspection_task MODIFY COLUMN station_id ... COMMENT '所属站点（跨模块 FK → Station，应用层保证一致性）';
-- ALTER TABLE inspection_task MODIFY COLUMN assignee_id ... COMMENT '执行人（跨模块 FK → Employee，应用层保证一致性）';
-- ALTER TABLE inspection_task MODIFY COLUMN created_by ... COMMENT '创建人（跨模块 FK → User，应用层保证一致性）';

CREATE INDEX idx_task_no       ON inspection_task (task_no);
CREATE INDEX idx_task_plan     ON inspection_task (plan_id);
CREATE INDEX idx_task_station  ON inspection_task (station_id);
CREATE INDEX idx_task_assignee ON inspection_task (assignee_id);
CREATE INDEX idx_task_status   ON inspection_task (status);
CREATE INDEX idx_task_due_date ON inspection_task (due_date);
CREATE INDEX idx_task_created  ON inspection_task (created_at);

-- ============================================================
-- 6. InspectionLog（巡检日志/执行记录）
--    依赖：inspection_task (task_id), check_item (check_item_id)
-- ============================================================

CREATE TABLE inspection_log (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    task_id         CHAR(36)            NOT NULL REFERENCES inspection_task (id) ON DELETE CASCADE,
    check_item_id   CHAR(36)            NOT NULL REFERENCES check_item (id) ON DELETE RESTRICT,
    station_id      CHAR(36)            NOT NULL,   -- FK → Station（跨模块，应用层保证）
    executor_id     CHAR(36)            NOT NULL,   -- FK → Employee（跨模块，应用层保证）
    result          ENUM('pending', 'normal', 'abnormal')    NOT NULL DEFAULT 'pending',
    remark          TEXT,
    executed_at     TIMESTAMP,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_log_task_item UNIQUE (task_id, check_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT = '巡检日志 — 记录每个检查项的执行结果明细';
-- Column comments for inspection_log:
-- ALTER TABLE inspection_log MODIFY COLUMN station_id ... COMMENT '所属站点（跨模块 FK → Station，应用层保证一致性）';
-- ALTER TABLE inspection_log MODIFY COLUMN executor_id ... COMMENT '执行人（跨模块 FK → Employee，应用层保证一致性）';

CREATE INDEX idx_log_task       ON inspection_log (task_id);
CREATE INDEX idx_log_check_item ON inspection_log (check_item_id);
CREATE INDEX idx_log_station    ON inspection_log (station_id);
CREATE INDEX idx_log_executor   ON inspection_log (executor_id);
CREATE INDEX idx_log_result     ON inspection_log (result);
CREATE INDEX idx_log_executed   ON inspection_log (executed_at);
-- idx_log_task_item 已通过 UNIQUE 约束 uq_log_task_item 自动创建

-- ============================================================
-- 7. IssueRecord（问题记录）
--    依赖：inspection_task (task_id), inspection_log (log_id),
--          check_item (check_item_id)
-- ============================================================

CREATE TABLE issue_record (
    id                      CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    issue_no                VARCHAR(32)         NOT NULL,
    station_id              CHAR(36)                NOT NULL,   -- FK → Station（跨模块，应用层保证）
    task_id                 CHAR(36)                REFERENCES inspection_task (id) ON DELETE SET NULL,
    log_id                  CHAR(36)                REFERENCES inspection_log (id) ON DELETE SET NULL,
    check_item_id           CHAR(36)                REFERENCES check_item (id) ON DELETE SET NULL,
    equipment_id            CHAR(36),                           -- FK → Equipment（跨模块 1.3，应用层保证）
    description             TEXT                NOT NULL,
    severity                ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    status                  ENUM('pending', 'processing', 'pending_review', 'closed')        NOT NULL DEFAULT 'pending',
    reporter_id             CHAR(36)                NOT NULL,   -- FK → Employee（跨模块，应用层保证）
    assignee_id             CHAR(36),                           -- FK → Employee（跨模块，应用层保证）
    assigned_at             TIMESTAMP,
    assigned_by             CHAR(36),                           -- FK → User（跨模块，应用层保证）
    rectification           TEXT,
    rectification_result    TEXT,
    rectified_at            TIMESTAMP,
    reviewer_id             CHAR(36),                           -- FK → User（跨模块，应用层保证）
    reviewed_at             TIMESTAMP,
    review_comment          TEXT,
    due_date                DATE,
    created_at              TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_issue_no UNIQUE (issue_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT = '问题记录 — 巡检中发现的问题，独立生命周期管理，支持全流程闭环';
-- Column comments for issue_record:
-- ALTER TABLE issue_record MODIFY COLUMN station_id ... COMMENT '所属站点（跨模块 FK → Station，应用层保证一致性）';
-- ALTER TABLE issue_record MODIFY COLUMN equipment_id ... COMMENT '关联设备（跨模块 FK → Equipment 1.3，应用层保证一致性）';
-- ALTER TABLE issue_record MODIFY COLUMN reporter_id ... COMMENT '登记人（跨模块 FK → Employee，应用层保证一致性）';
-- ALTER TABLE issue_record MODIFY COLUMN assignee_id ... COMMENT '处理人（跨模块 FK → Employee，应用层保证一致性）';
-- ALTER TABLE issue_record MODIFY COLUMN assigned_by ... COMMENT '分配人（跨模块 FK → User，应用层保证一致性）';
-- ALTER TABLE issue_record MODIFY COLUMN reviewer_id ... COMMENT '闭环审核人（跨模块 FK → User，应用层保证一致性）';

CREATE INDEX idx_issue_no       ON issue_record (issue_no);
CREATE INDEX idx_issue_station  ON issue_record (station_id);
CREATE INDEX idx_issue_task     ON issue_record (task_id);
CREATE INDEX idx_issue_status   ON issue_record (status);
CREATE INDEX idx_issue_severity ON issue_record (severity);
CREATE INDEX idx_issue_assignee ON issue_record (assignee_id);
CREATE INDEX idx_issue_reporter ON issue_record (reporter_id);
CREATE INDEX idx_issue_due_date ON issue_record (due_date);
CREATE INDEX idx_issue_created  ON issue_record (created_at);

-- ============================================================
-- 8. InspectionPhoto（巡检照片）
--    依赖：通过 (ref_type, ref_id) 多态关联 inspection_log / issue_record
--    不使用 FK，由应用层保证引用完整性
-- ============================================================

CREATE TABLE inspection_photo (
    id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ref_type        ENUM('inspection_log', 'issue_record')  NOT NULL,
    ref_id          CHAR(36)            NOT NULL,
    file_url        VARCHAR(500)    NOT NULL,
    file_name       VARCHAR(255)    NOT NULL,
    file_size       INTEGER,
    mime_type       VARCHAR(50),
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    uploaded_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by     CHAR(36),                           -- FK → User（跨模块，应用层保证）

    CONSTRAINT chk_photo_mime   CHECK (mime_type IN ('image/jpeg', 'image/png')),
    CONSTRAINT chk_photo_size   CHECK (file_size IS NULL OR (file_size > 0 AND file_size <= 5242880))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT = '巡检照片 — 巡检执行和问题整改的照片附件（多态关联）';
-- Column comments for inspection_photo:
-- ALTER TABLE inspection_photo MODIFY COLUMN ref_type ... COMMENT '关联类型：inspection_log 或 issue_record';
-- ALTER TABLE inspection_photo MODIFY COLUMN ref_id ... COMMENT '关联 ID（InspectionLog.id 或 IssueRecord.id，应用层保证引用完整性）';
-- ALTER TABLE inspection_photo MODIFY COLUMN uploaded_by ... COMMENT '上传人（跨模块 FK → User，应用层保证一致性）';

CREATE INDEX idx_photo_ref ON inspection_photo (ref_type, ref_id);
```

---

*文档生成时间：2026-02-19*
*最后更新：2026-02-24*
*生成依据：AGENT-PLAN Step 4（架构设计）*
