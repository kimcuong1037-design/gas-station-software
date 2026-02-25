# 跨模块实体关系图 (Cross-Module Entity Relationship Diagram)

**项目：** 加气站运营管理系统
**覆盖范围：** Phase 1 基础运营（1.1~1.4）+ Phase 2.1 价格管理（已确认）+ Phase 2.2~2.3（预览）
**创建日期：** 2026-02-24
**版本：** 1.3（2026-02-24 §8 扩展 Phase 1 四模块依赖详情）

---

## 1. 全局实体总览

### 1.1 站点管理 (Station Management)

| 实体 | 说明 | 被引用次数 |
|------|------|-----------|
| **Station** | 站点（系统核心实体） | **高频** — 几乎所有模块引用 |
| StationGroup | 站点分组 | 仅 Station 引用 |
| Region | 区域层级 | 仅 Station 引用 |
| **FuelType** | 燃料类型 | Phase 2 高频引用 |
| **Nozzle** | 加注枪 | Phase 2 高频引用 |
| NozzlePriceLog | 枪单价变更日志 | Phase 2 引用 |
| **Shift** | 班次定义 | 1.2 交接班引用 |
| **Schedule** | 排班计划 | 1.2 交接班引用 |
| **StationEmployee** | 站点员工关联 | 全模块引用 |
| StationImage | 站点照片 | 仅站点内部 |
| ChargingPile | 充电桩（预留） | — |
| StationResponsibility | 责任站点关联 | — |

### 1.2 交接班管理 (Shift Handover)

| 实体 | 说明 | 被引用次数 |
|------|------|-----------|
| **ShiftHandover** | 交接班记录 | Phase 2 订单汇总引用 |
| ShiftSummary | 班次经营汇总 | 财务模块引用 |
| CashSettlement | 现金解缴 | 财务模块引用 |
| SettlementDocument | 解缴凭证 | 仅内部 |
| HandoverIssue | 交接班异常 | 仅内部 |
| HandoverPrecheck | 预检结果 | 仅内部 |

### 1.3 设备设施管理 (Device Ledger)

| 实体 | 说明 | 被引用次数 |
|------|------|-----------|
| **Equipment** | 设备台账 | 1.4 巡检引用，Phase 2 库存引用 |
| EquipmentPhoto | 设备照片 | 仅内部 |
| EquipmentMonitoring | 设备实时监控 | Phase 2 库存引用 |
| EquipmentMonitoringLog | 监控历史日志 | 数据分析引用 |
| MaintenanceOrder | 维保工单 | 1.4 巡检可触发 |
| OrderRecord | 工单处理记录 | 仅内部 |
| OrderAttachment | 工单附件 | 仅内部 |
| MaintenancePlan | 保养计划 [MVP+] | 仅内部 |
| AlarmRule | 告警规则 [MVP+] | 仅内部 |
| AlarmRecord | 告警记录 [MVP+] | 仅内部 |

### 1.4 巡检安检管理 (Inspection)

| 实体 | 说明 | 被引用次数 |
|------|------|-----------|
| InspectionPlan | 安检计划 | 仅内部 |
| InspectionTask | 安检任务 | 仅内部 |
| CheckItem | 检查项目 | 仅内部 |
| CheckItemTemplate | 检查项模板 [MVP+] | 仅内部 |
| InspectionTag | 巡检标签 | 仅内部 |
| InspectionLog | 巡检日志 | 仅内部 |
| InspectionPhoto | 巡检照片 | 仅内部 |
| IssueRecord | 问题记录 | 风控模块引用 |

### 2.1 价格管理 (Price Management) ✅ 已确认

| 实体 | 说明 | 被引用次数 |
|------|------|-----------|
| **FuelTypePrice** | 燃料类型基准价（每站每类型唯一 active） | 2.2 订单引用 |
| **PriceAdjustment** | 调价记录（全留痕，不可篡改） | 仅内部 |
| **NozzlePriceOverride** | 枪独立定价（覆盖基准价） | 2.2 订单引用 |
| PriceDefenseConfig | 调价防御配置 | 仅内部 |
| MemberPriceRule | 会员专享价规则 [⚠️ Phase 4 依赖] | 2.2 订单引用 |
| PriceAgreement | 大客户价格协议 [⚠️ Phase 4 依赖] | 2.2 订单引用 |

---

## 2. 跨模块外键关系图

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        MODULE 1.1: 站点管理 (核心基础)                       ║
║                                                                              ║
║  ┌──────────┐   ┌─────────────┐   ┌──────────┐   ┌──────────────┐          ║
║  │ Station  │←──│StationGroup │   │  Region  │   │StationImage  │          ║
║  │──────────│   └─────────────┘   └──────────┘   └──────────────┘          ║
║  │ id (PK)  │                                                                ║
║  │ code     │   ┌──────────┐   ┌──────────┐   ┌────────────────┐           ║
║  │ name     │   │ FuelType │   │  Nozzle  │──→│NozzlePriceLog  │           ║
║  │ status   │   │──────────│   │──────────│   └────────────────┘           ║
║  └────┬─────┘   │ id (PK)  │   │ id (PK)  │                                ║
║       │         │ code     │   │station_id│──→ Station                      ║
║       │         │ name     │   │fuel_type │──→ FuelType                     ║
║       │         └──────────┘   └──────────┘                                 ║
║       │                                                                      ║
║       │         ┌──────────┐   ┌──────────┐   ┌────────────────┐           ║
║       ├────────→│  Shift   │   │ Schedule │──→│StationEmployee │           ║
║       │         │──────────│   │──────────│   │────────────────│           ║
║       │         │station_id│   │station_id│   │ station_id     │           ║
║       │         │ name     │   │ shift_id │   │ employee_id    │           ║
║       │         └──────────┘   └──────────┘   └────────────────┘           ║
╚══════╤═══════════════════════════╤══════════════════════════════════════════╝
       │                           │
       │  ┌────────────────────────┘
       │  │
       ▼  ▼
╔══════════════════════════════════════════════╗
║       MODULE 1.2: 交接班管理                  ║
║                                               ║
║  ┌─────────────────┐   ┌──────────────┐      ║
║  │ ShiftHandover   │──→│ ShiftSummary │      ║
║  │─────────────────│   └──────────────┘      ║
║  │ station_id ──→ Station                    ║
║  │ shift_id   ──→ Shift                      ║
║  │ handover_by──→ Employee                   ║
║  │ received_by──→ Employee                   ║
║  └───┬────┬────┘                              ║
║      │    │                                   ║
║      │    └──→ ┌────────────────┐             ║
║      │         │ CashSettlement │             ║
║      │         │────────────────│             ║
║      │         │ station_id ──→ Station       ║
║      │         │ settled_by ──→ Employee      ║
║      │         └───────┬───────┘              ║
║      │                 ▼                      ║
║      │         ┌───────────────────┐          ║
║      │         │SettlementDocument │          ║
║      │         └───────────────────┘          ║
║      ▼                                        ║
║  ┌───────────────┐  ┌─────────────────┐      ║
║  │HandoverIssue  │  │HandoverPrecheck │      ║
║  └───────────────┘  └─────────────────┘      ║
╚══════════════════════════════════════════════╝

       │ (Station)
       ▼
╔══════════════════════════════════════════════╗
║       MODULE 1.3: 设备设施管理                ║
║                                               ║
║  ┌──────────────┐   ┌──────────────────┐     ║
║  │  Equipment   │──→│EquipmentMonitoring│     ║
║  │──────────────│   └──────────────────┘     ║
║  │ station_id ──→ Station                    ║
║  │ device_type  │   ┌──────────────────────┐ ║
║  │ status       │──→│EquipmentMonitoringLog│ ║
║  └───┬──────────┘   └──────────────────────┘ ║
║      │                                        ║
║      ├──→ ┌──────────────────┐                ║
║      │    │MaintenanceOrder  │                ║
║      │    │──────────────────│                ║
║      │    │ station_id ──→ Station            ║
║      │    │ equipment_id──→ Equipment         ║
║      │    │ reported_by ──→ Employee          ║
║      │    │ assigned_to ──→ Employee          ║
║      │    └──┬───────────┘                    ║
║      │       ├──→ OrderRecord                 ║
║      │       └──→ OrderAttachment             ║
║      │                                        ║
║      └──→ EquipmentPhoto                      ║
╚═══════════════════╤══════════════════════════╝
                    │ (Equipment)
                    ▼
╔══════════════════════════════════════════════╗
║       MODULE 1.4: 巡检安检管理                ║
║                                               ║
║  ┌────────────────┐                           ║
║  │InspectionPlan  │                           ║
║  │────────────────│                           ║
║  │ station_id ──→ Station                    ║
║  └──────┬─────────┘                           ║
║         │ 1:N                                 ║
║         ▼                                     ║
║  ┌────────────────┐   ┌──────────────┐       ║
║  │InspectionTask  │   │  CheckItem   │       ║
║  │────────────────│   │──────────────│       ║
║  │ station_id ──→ Station            │       ║
║  │ assignee_id──→ Employee           │       ║
║  │ plan_id    ──→ InspectionPlan     │       ║
║  └──────┬─────────┘   │ station_id ──→ Station║
║         │ 1:N         │ equipment_id──→ Equipment (1.3)
║         ▼             └──────┬───────┘       ║
║  ┌────────────────┐         │ 1:N            ║
║  │ InspectionLog  │←────────┘                ║
║  │────────────────│                           ║
║  │ task_id     ──→ InspectionTask            ║
║  │ check_item_id→ CheckItem                  ║
║  │ executor_id ──→ Employee                  ║
║  └────────────────┘                           ║
║                                               ║
║  ┌────────────────┐   ┌────────────────┐     ║
║  │  IssueRecord   │   │InspectionPhoto │     ║
║  │────────────────│   │ (多态关联)      │     ║
║  │ station_id ──→ Station                    ║
║  │ task_id    ──→ InspectionTask             ║
║  │ equipment_id→ Equipment (1.3)             ║
║  │ assignee_id──→ Employee                   ║
║  └────────────────┘                           ║
╚══════════════════════════════════════════════╝
```

---

## 3. 跨模块外键关系表

### 3.1 模块 1.2 → 1.1（交接班 → 站点管理）

| 源实体 | 源字段 | 目标实体 | 目标字段 | 关系 | 说明 |
|--------|--------|---------|---------|------|------|
| ShiftHandover | station_id | Station | id | N:1 | 交接班所属站点 |
| ShiftHandover | shift_id | Shift | id | N:1 | 关联班次定义 |
| ShiftHandover | handover_by | StationEmployee | employee_id | N:1 | 交班人 |
| ShiftHandover | received_by | StationEmployee | employee_id | N:1 | 接班人 |
| CashSettlement | station_id | Station | id | N:1 | 解缴所属站点 |
| CashSettlement | settled_by | StationEmployee | employee_id | N:1 | 解缴人 |

### 3.2 模块 1.3 → 1.1（设备设施 → 站点管理）

| 源实体 | 源字段 | 目标实体 | 目标字段 | 关系 | 说明 |
|--------|--------|---------|---------|------|------|
| Equipment | station_id | Station | id | N:1 | 设备所属站点 |
| MaintenanceOrder | station_id | Station | id | N:1 | 工单所属站点 |
| MaintenanceOrder | reported_by | StationEmployee | employee_id | N:1 | 报修人 |
| MaintenanceOrder | assigned_to | StationEmployee | employee_id | N:1 | 维修人 |

### 3.3 模块 1.4 → 1.1（巡检安检 → 站点管理）

| 源实体 | 源字段 | 目标实体 | 目标字段 | 关系 | 说明 |
|--------|--------|---------|---------|------|------|
| InspectionPlan | station_id | Station | id | N:1 | 计划所属站点 |
| InspectionTask | station_id | Station | id | N:1 | 任务所属站点 |
| InspectionTask | assignee_id | StationEmployee | employee_id | N:1 | 执行人 |
| CheckItem | station_id | Station | id | N:1 | 检查项所属站点 |
| InspectionTag | station_id | Station | id | N:1 | 标签所属站点 |
| InspectionLog | station_id | Station | id | N:1 | 日志所属站点 |
| InspectionLog | executor_id | StationEmployee | employee_id | N:1 | 执行人 |
| IssueRecord | station_id | Station | id | N:1 | 问题所属站点 |
| IssueRecord | reporter_id | StationEmployee | employee_id | N:1 | 登记人 |
| IssueRecord | assignee_id | StationEmployee | employee_id | N:1 | 处理人 |

### 3.4 模块 1.4 → 1.3（巡检安检 → 设备设施）

| 源实体 | 源字段 | 目标实体 | 目标字段 | 关系 | 说明 |
|--------|--------|---------|---------|------|------|
| CheckItem | equipment_id | Equipment | id | N:1 | 检查项关联设备 |
| IssueRecord | equipment_id | Equipment | id | N:1 | 问题关联设备 |

---

### 3.5 模块 2.1 → 1.1（价格管理 → 站点管理）✅ 已确认

| 源实体 | 源字段 | 目标实体 | 目标字段 | 关系 | 说明 |
|--------|--------|---------|---------|------|------|
| FuelTypePrice | station_id | Station | id | N:1 | 基准价所属站点 |
| FuelTypePrice | fuel_type_id | FuelType | id | N:1 | 基准价燃料类型 |
| FuelTypePrice | updated_by | StationEmployee | employee_id | N:1 | 最后更新人 |
| PriceAdjustment | station_id | Station | id | N:1 | 调价所属站点 |
| PriceAdjustment | fuel_type_id | FuelType | id | N:1 | 调价燃料类型 |
| PriceAdjustment | nozzle_id | Nozzle | id | N:1 | 枪级调价目标（可空） |
| PriceAdjustment | adjusted_by | StationEmployee | employee_id | N:1 | 调价提交人 |
| PriceAdjustment | approved_by | StationEmployee | employee_id | N:1 | 审批人（可空） |
| NozzlePriceOverride | nozzle_id | Nozzle | id | 1:1 | 枪覆盖价 |
| NozzlePriceOverride | station_id | Station | id | N:1 | 所属站点 |
| NozzlePriceOverride | fuel_type_id | FuelType | id | N:1 | 燃料类型 |
| PriceDefenseConfig | station_id | Station | id | N:1 | 站点级配置（可空） |
| PriceDefenseConfig | fuel_type_id | FuelType | id | N:1 | 燃料类型级配置（可空） |
| MemberPriceRule | station_id | Station | id | N:1 | 适用站点 |
| MemberPriceRule | fuel_type_id | FuelType | id | N:1 | 适用燃料类型 |
| PriceAgreement | station_id | Station | id | N:1 | 适用站点 |
| PriceAgreement | fuel_type_id | FuelType | id | N:1 | 适用燃料类型 |
| PriceAgreement | created_by | StationEmployee | employee_id | N:1 | 创建人 |

---

## 4. Phase 2 能源交易 — 预期跨模块引用

> 模块 2.1 价格管理已确认，见 §3.5。以下为 2.2/2.3 的预判，具体外键关系将在各模块 architecture.md 中正式定义。

### 4.2 模块 2.2 订单与交易 → Phase 1

| 预期实体 | 预期字段 | 目标实体 | 目标模块 | 说明 |
|---------|---------|---------|---------|------|
| FuelingOrder | station_id | Station | 1.1 | 订单所属站点 |
| FuelingOrder | nozzle_id | Nozzle | 1.1 | 加注枪 |
| FuelingOrder | fuel_type_id | FuelType | 1.1 | 燃料类型 |
| FuelingOrder | shift_id | Shift | 1.1 | 所属班次 |
| FuelingOrder | operator_id | StationEmployee | 1.1 | 操作员 |
| FuelingOrder | handover_id | ShiftHandover | 1.2 | 关联交接班（用于班次汇总） |
| PaymentRecord | order_id | FuelingOrder | 2.2 | 支付记录关联订单 |

### 4.3 模块 2.3 库存管理 → Phase 1

| 预期实体 | 预期字段 | 目标实体 | 目标模块 | 说明 |
|---------|---------|---------|---------|------|
| InventoryRecord | station_id | Station | 1.1 | 库存所属站点 |
| InventoryRecord | fuel_type_id | FuelType | 1.1 | 燃料类型 |
| InventoryRecord | tank_equipment_id | Equipment | 1.3 | 关联储罐设备 |
| TankComparison | equipment_id | Equipment | 1.3 | 罐存比对关联储罐 |
| TankComparison | monitoring_id | EquipmentMonitoring | 1.3 | 引用实测液位数据 |

---

## 5. 核心共享实体（后端 Shared Types 候选）

以下实体在 3 个以上模块中被引用，后端启动时应优先考虑作为 `shared/types/` 公共定义：

| 实体 | 引用模块数 | 说明 |
|------|-----------|------|
| **Station** | 6+ | 系统核心实体，所有模块引用 |
| **StationEmployee** (Employee) | 5+ | 所有需要人员关联的模块 |
| **FuelType** | 3+ (1.1, 2.1, 2.2, 2.3) | 价格/订单/库存均引用 |
| **Nozzle** | 3+ (1.1, 2.1, 2.2) | 价格/订单引用 |
| **Shift** | 2+ (1.1, 1.2, 2.2) | 交接班/订单引用 |
| **Equipment** | 2+ (1.3, 1.4, 2.3) | 巡检/库存引用 |

### 5.1 建议的 Shared Types 目录结构

```
shared/
├── types/
│   ├── station.ts        # Station, StationGroup, Region
│   ├── employee.ts       # StationEmployee, User, Role
│   ├── fuel.ts           # FuelType, Nozzle
│   ├── shift.ts          # Shift, Schedule
│   ├── equipment.ts      # Equipment (设备基础信息)
│   └── common.ts         # 通用类型 (Pagination, ApiResponse, etc.)
└── enums/
    ├── status.ts         # 全局状态枚举
    └── payment.ts        # 支付方式枚举
```

---

## 6. 数据完整性约束（跨模块）

| 约束规则 | 说明 |
|---------|------|
| Station 软删除前检查 | 站点设为 inactive 前，必须检查是否有进行中的交接班、未完成的巡检任务、未关闭的问题记录 |
| Employee 离职前检查 | 员工标记离职前，必须检查是否有未完成的巡检任务分配、未完成的维保工单 |
| Equipment 停用前检查 | 设备停用前，必须检查是否有未完成的维保工单、关联的活跃巡检检查项 |
| Shift 删除前检查 | 班次删除前，必须检查是否有未完成的排班计划引用 |
| Nozzle 停用前检查 | 枪停用前，必须检查是否有进行中的订单（Phase 2）、**活跃的枪覆盖价（NozzlePriceOverride）** |
| FuelType 停用前检查 | 燃料类型停用前，必须检查是否有活跃的枪绑定、**有效的基准价（FuelTypePrice active）、活跃的价格协议** |
| FuelTypePrice 停用前检查 | 基准价停用前，必须检查是否有 pending_approval/approved 的调价记录 |
| PriceAgreement 到期检查 | 协议到期时（valid_to 到达），自动将 status 设为 expired |

---

## 7. 后端启动时的数据库迁移顺序

基于外键依赖关系，数据库表创建（migration）必须按以下顺序执行：

```
第 1 层（无外键依赖）：
  → StationGroup, Region, FuelType

第 2 层（依赖第 1 层）：
  → Station (→ StationGroup, Region)
  → Shift (→ Station)
  → StationEmployee (→ Station)
  → StationImage (→ Station)

第 3 层（依赖第 2 层）：
  → Nozzle (→ Station, FuelType)
  → NozzlePriceLog (→ Nozzle)
  → Schedule (→ Station, Shift, StationEmployee)
  → Equipment (→ Station)

第 4 层（依赖第 3 层）：
  → ShiftHandover (→ Station, Shift, StationEmployee)
  → ShiftSummary (→ ShiftHandover)
  → CashSettlement (→ ShiftHandover, Station)
  → SettlementDocument (→ CashSettlement)
  → HandoverIssue (→ ShiftHandover)
  → HandoverPrecheck (→ ShiftHandover)

第 5 层（依赖第 3 层）：
  → EquipmentPhoto (→ Equipment)
  → EquipmentMonitoring (→ Equipment)
  → EquipmentMonitoringLog (→ Equipment)
  → MaintenanceOrder (→ Equipment, Station, StationEmployee)
  → OrderRecord (→ MaintenanceOrder)
  → OrderAttachment (→ MaintenanceOrder)

第 6 层（依赖第 3 层 + 跨模块）：
  → InspectionPlan (→ Station)
  → InspectionTag (→ Station)
  → CheckItem (→ Station, Equipment)
  → InspectionTask (→ InspectionPlan, Station, StationEmployee)
  → InspectionLog (→ InspectionTask, CheckItem, Station, StationEmployee)
  → IssueRecord (→ Station, InspectionTask, CheckItem, Equipment, StationEmployee)
  → InspectionPhoto (→ InspectionLog | IssueRecord)

第 7 层（Phase 2.1 价格管理 ✅ — 依赖 Phase 1 实体）：
  → FuelTypePrice (→ Station, FuelType, StationEmployee)
  → PriceDefenseConfig (→ Station?, FuelType?)
  → NozzlePriceOverride (→ Nozzle, Station, FuelType, StationEmployee)
  → PriceAdjustment (→ Station, FuelType, Nozzle?, StationEmployee)
  → MemberPriceRule (→ Station, FuelType) [⚠️ Phase 4 member_tier 依赖]
  → PriceAgreement (→ Station, FuelType, StationEmployee) [⚠️ Phase 4 enterprise_id 依赖]

第 8 层（Phase 2.2~2.3 预期 — 依赖 Phase 1 + 2.1 实体）：
  → FuelingOrder (→ Station, Nozzle, FuelType, Shift, StationEmployee, FuelTypePrice?)
  → PaymentRecord (→ FuelingOrder)
  → InventoryRecord (→ Station, FuelType, Equipment)
  → TankComparison (→ Equipment, EquipmentMonitoring)
```

---

## 8. Phase 7 系统模块依赖预览

> 以下为各已实现/设计中模块对 Phase 7 系统模块的依赖汇总，便于 Phase 7 启动时回补。

### 8.1 角色权限管理 (9.1) 依赖清单

| 依赖模块 | 权限代码数量 | 依赖内容 | 当前处理 | Phase 7 回补 |
|---------|------------|---------|---------|-------------|
| 1.1 站点管理 | 44 个 | §5 权限列表，5 角色分配（station_master/ops_manager/finance 等） | 前端硬编码角色 | 对接 RBAC API，动态渲染菜单和按钮 |
| 1.2 交接班 | 8 个 | §6.1 权限矩阵（4 角色 × 8 权限） | 前端硬编码 | 同上 |
| 1.3 设备台账 | 18 个 | §7.1 权限列表 + §6.1 系统权限依赖声明 | 前端硬编码 | 同上 |
| 1.4 巡检管理 | 50+ 个 | 各 API 接口内联权限声明，**缺少角色→权限映射矩阵**（P0，见 DF-001） | 前端硬编码 | 补充权限矩阵 + 导入 RBAC |
| **2.1 价格管理** | 12 个 | §2.3 权限矩阵（4 角色 × 12 权限） | architecture.md 权限矩阵约定，前端硬编码 | 权限矩阵导入 RBAC 系统，前端改用动态权限指令 |
| 所有模块 | — | StationEmployee → User 关联 | StationEmployee 作为用户代理 | 建立 User ↔ StationEmployee 正式关联 |

### 8.2 审批流程引擎 (9.5) 依赖清单

| 依赖模块 | 审批场景 | 当前处理 | Phase 7 回补 |
|---------|---------|---------|-------------|
| 1.2 交接班 | CashSettlement 现金解缴审批（pending/approved/rejected）、ShiftHandover 强制交接审批（forced_by） | 简单状态字段 + 角色判断 | 对接审批引擎：审批节点、审批通知 |
| 1.3 设备台账 | 维保工单审批（§0.4 已声明对接统一审批模块） | 未实现 | 纳入审批引擎 |
| 1.4 巡检管理 | 问题闭环确认（pending_review → closed，reviewer_id）、巡检计划审批（需求中提及但未定义流程） | 简单 reviewer_id 字段 | 纳入审批引擎 |
| **2.1 价格管理** | 调价审批（PriceAdjustment: pending_approval → approved/rejected） | PriceDefenseConfig 阈值触发 + 单级硬编码审批（ops_manager/admin） | 对接审批引擎：可配置审批节点、多级审批链、审批通知 |

---

*创建时间：2026-02-24*
*版本：1.3*
*最后更新：2026-02-24（§8 扩展 Phase 1 四模块依赖详情）*
