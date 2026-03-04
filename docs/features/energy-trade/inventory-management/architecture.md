# 库存管理 — 架构设计

**模块：** 能源交易 > 库存管理 (2.3)
**基于：** user-stories.md v1.0 + ui-schema.md v1.0 + requirements.md v1.0
**设计日期：** 2026-02-28
**状态：** 待确认

---

## 0. 设计原则

- **数量精度**：库存量使用 `NUMERIC(10,3)`，最小单位 0.001 kg/m³
- **金额精度**：所有金额字段使用 `NUMERIC(12,2)`，最小单位 0.01 元
- **审计不可变**：进出库记录一旦创建不可修改（只追加），盘点调整需审批留痕
- **理论库存可算**：理论库存 = 期初 + Σ入库 - Σ销售出库 - Σ损耗出库 ± Σ盘点调整，由系统自动维护
- **实际罐存外取**：实际罐存来自 Module 1.3 设备监控（EquipmentMonitoring），不在本模块维护
- **预警实时**：预警触发由系统根据配置规则自动判定，支持自动恢复

---

## 1. 核心实体与数据模型

### 1.1 实体关系图

```
                    ┌────────────────┐
                    │    Station     │ (1.1)
                    │    FuelType    │ (1.1)
                    │ StationEmployee│ (1.1)
                    └───────┬────────┘
                            │
                    ┌───────┴────────┐
                    │  Equipment     │ (1.3, type=tank)
                    │  EquipmentMonitoring │ (1.3)
                    └───────┬────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
    ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │ InboundRecord   │  │  OutboundRecord  │  │ StockAdjustment  │
    │─────────────────│  │──────────────────│  │──────────────────│
    │ id              │  │ id               │  │ id               │
    │ inbound_no      │  │ outbound_no      │  │ adjustment_no    │
    │ station_id (FK) │  │ station_id (FK)  │  │ station_id (FK)  │
    │ tank_id (FK)    │  │ fuel_type_id(FK) │  │ tank_id (FK)     │
    │ fuel_type_id(FK)│  │ outbound_type    │  │ fuel_type_id(FK) │
    │ supplier_name   │  │ quantity         │  │ before_stock     │
    │ planned_qty     │  │ amount           │  │ after_stock      │
    │ actual_qty      │  │ order_id (FK?)   │  │ adjustment_qty   │
    │ audit_status    │  │ loss_reason      │  │ reason           │
    │ audited_by (FK?)│  │ source           │  │ audit_status     │
    │ created_at      │  │ approval_status  │  │ audited_by (FK?) │
    └────────┬────────┘  │ created_at       │  │ created_at       │
             │           └──────────────────┘  └──────────────────┘
             │
    ┌────────┴────────────────────┐
    │                             │
    ▼                             ▼
  ┌──────────────────┐  ┌─────────────────────┐
  │ InventoryLedger  │  │  TankComparisonLog  │
  │──────────────────│  │─────────────────────│
  │ id               │  │ id                  │
  │ station_id (FK)  │  │ station_id (FK)     │
  │ fuel_type_id(FK) │  │ tank_id (FK)        │
  │ transaction_type │  │ fuel_type_id (FK)   │
  │ quantity         │  │ snapshot_date       │
  │ amount           │  │ actual_level        │
  │ stock_balance    │  │ theoretical_stock   │
  │ related_no       │  │ deviation           │
  │ created_at       │  │ deviation_rate      │
  └──────────────────┘  │ created_at          │
                        └─────────────────────┘

  ┌──────────────────┐  ┌─────────────────────┐
  │ InventoryAlert   │  │  AlertConfig        │
  │──────────────────│  │─────────────────────│
  │ id               │  │ id                  │
  │ station_id (FK)  │  │ station_id (FK)     │
  │ fuel_type_id(FK) │  │ fuel_type_id (FK)   │
  │ tank_id (FK?)    │  │ safe_threshold      │
  │ alert_level      │  │ warning_threshold   │
  │ alert_type       │  │ critical_threshold  │
  │ current_value    │  │ loss_deviation_thr  │
  │ threshold_value  │  │ threshold_type      │
  │ handle_status    │  │ updated_at          │
  │ triggered_at     │  └─────────────────────┘
  │ resolved_at      │
  │ handled_by (FK?) │
  └──────────────────┘
```

### 1.2 实体三问分析

#### InboundRecord（入库记录）

```
❓ 问题 1 — 自带数据
   - id: UUID 主键
   - inbound_no: 唯一入库单号（格式: IB-站点编码-日期-序号，如 IB-ST001-20260228-0001）
   - station_id: 所属站点（跨模块 FK → Station）
   - tank_id: 目标储罐（跨模块 FK → Equipment，type=tank）
   - fuel_type_id: 燃料类型（跨模块 FK → FuelType，由储罐自动带出）
   - supplier_name: 供应商名称（VARCHAR(100)）
   - delivery_no: 送货单号（VARCHAR(50)，可选）
   - planned_quantity: 计划量（NUMERIC(10,3)，kg）
   - actual_quantity: 实收量（NUMERIC(10,3)，kg）
   - variance: 入库偏差 = actual_quantity - planned_quantity（NUMERIC(10,3)）
   - variance_rate: 偏差率 = variance / planned_quantity × 100%（NUMERIC(5,2)）
   - inbound_time: 入库时间（DATETIME）
   - audit_status: 审核状态（枚举: pending_review / approved / rejected）
   - audited_by: 审核人（跨模块 FK → StationEmployee，可选）
   - audited_at: 审核时间（DATETIME，可选）
   - reject_reason: 驳回原因（TEXT，可选）
   - operator_id: 操作员（跨模块 FK → StationEmployee）
   - remark: 备注（TEXT，可选）
   - created_at, updated_at: 时间戳

❓ 问题 2 — 创建触发方式
   [x] 手动创建：班组长在管理后台通过入库 Drawer 录入
   → 创建时自动生成唯一入库单号
   → 创建时根据 tank_id 自动获取 fuel_type_id
   → 创建时自动计算 variance 和 variance_rate

❓ 问题 3 — 副作用与生命周期约束
   - 创建时：audit_status 初始为 pending_review，理论库存不更新
   - 审核通过时：
     · 理论库存 += actual_quantity
     · 生成一条 InventoryLedger 流水（type=inbound）
   - 审核驳回时：理论库存不变，记录 reject_reason
   - 删除限制：入库记录不可物理删除（审计追踪要求）
   - 唯一约束：inbound_no 全局唯一
```

#### OutboundRecord（出库记录）

```
❓ 问题 1 — 自带数据
   - id: UUID 主键
   - outbound_no: 唯一出库单号（格式: OB-站点编码-日期-序号）
   - station_id: 所属站点（跨模块 FK → Station）
   - fuel_type_id: 燃料类型（跨模块 FK → FuelType）
   - outbound_type: 出库类型（枚举: sales / loss / reversal）
   - quantity: 出库量（NUMERIC(10,3)，kg）
   - amount: 出库金额（NUMERIC(12,2)，元）
   - order_id: 关联订单 ID（跨模块 FK → FuelingOrder，仅销售出库/冲红有值）
   - loss_reason: 损耗原因（枚举: evaporation / leakage / transfer / other，仅损耗出库）
   - loss_reason_detail: 损耗原因说明（TEXT，损耗原因为 other 时必填）
   - source: 操作来源（枚举: auto / manual）
   - approval_status: 审批状态（枚举: pending_approval / approved / rejected，仅损耗出库）
   - approved_by: 审批人（跨模块 FK → StationEmployee，可选）
   - approved_at: 审批时间（DATETIME，可选）
   - reject_reason: 驳回原因（TEXT，可选）
   - operator_id: 操作员/来源（跨模块 FK → StationEmployee，自动出库时为 null）
   - related_inbound_id: 关联入库记录（FK → InboundRecord，仅冲红记录）
   - created_at, updated_at: 时间戳

❓ 问题 2 — 创建触发方式
   [x] 自动生成：订单状态变为 paid/completed 时，系统自动创建销售出库记录（source=auto）
   [x] 自动生成：退款（refunded）时，系统自动创建冲红入库记录（outbound_type=reversal, source=auto）
   [x] 手动创建：班组长通过损耗出库 Drawer 登记（source=manual, outbound_type=loss）

❓ 问题 3 — 副作用与生命周期约束
   - 销售出库创建时（auto）：
     · 理论库存 -= quantity
     · 生成 InventoryLedger 流水（type=sales_outbound）
   - 损耗出库创建时（manual）：
     · approval_status 初始为 pending_approval，理论库存不扣减
   - 损耗出库审批通过时：
     · 理论库存 -= quantity
     · 生成 InventoryLedger 流水（type=loss_outbound）
   - 冲红创建时（auto）：
     · 理论库存 += quantity（回库）
     · 生成 InventoryLedger 流水（type=reversal）
   - 删除限制：出库记录不可物理删除
```

#### InventoryLedger（进销存流水）

```
❓ 问题 1 — 自带数据
   - id: UUID 主键
   - station_id: 所属站点（跨模块 FK → Station）
   - fuel_type_id: 燃料类型（跨模块 FK → FuelType）
   - transaction_type: 流水类型（枚举: inbound / sales_outbound / loss_outbound / stock_adjustment / reversal）
   - quantity: 数量（NUMERIC(10,3)，kg；入库/冲红为正，出库为负）
   - amount: 金额（NUMERIC(12,2)，元）
   - stock_balance: 操作后库存余量（NUMERIC(10,3)，kg）
   - operator_or_source: 操作人或来源（VARCHAR(50)，自动出库显示"系统自动"）
   - related_no: 关联单号（VARCHAR(30)，入库单号/出库单号/盘点单号）
   - related_id: 关联记录 ID（UUID，可选）
   - remark: 备注（TEXT，可选）
   - transaction_time: 流水时间（DATETIME）
   - created_at: 创建时间

❓ 问题 2 — 创建触发方式
   [x] 自动生成：由入库审核通过、销售出库、损耗出库审批通过、盘点调整审批通过、冲红等操作自动触发
   → 用户不直接创建流水记录

❓ 问题 3 — 副作用与生命周期约束
   - 创建时：stock_balance 由系统根据当前理论库存计算
   - 不可修改/删除：流水记录只追加，不允许任何修改或删除
   - 完整性要求：每次库存变动必须有对应流水记录
```

#### TankComparisonLog（罐存比对快照）

```
❓ 问题 1 — 自带数据
   - id: UUID 主键
   - station_id: 所属站点（跨模块 FK → Station）
   - tank_id: 储罐（跨模块 FK → Equipment）
   - fuel_type_id: 燃料类型（跨模块 FK → FuelType）
   - snapshot_date: 快照日期（DATE）
   - actual_level: 实际罐存（NUMERIC(10,3)，kg，来自 EquipmentMonitoring）
   - theoretical_stock: 理论库存（NUMERIC(10,3)，kg）
   - deviation: 偏差值 = actual_level - theoretical_stock（NUMERIC(10,3)，kg）
   - deviation_rate: 偏差率 = deviation / theoretical_stock × 100%（NUMERIC(5,2)，%）
   - created_at: 创建时间

❓ 问题 2 — 创建触发方式
   [x] 自动生成：系统每日定时生成各储罐比对快照（如每日 23:59）
   → 每日每储罐一条记录

❓ 问题 3 — 副作用与生命周期约束
   - 创建时：若 |deviation_rate| > 配置阈值，自动触发损耗异常预警
   - 不可修改/删除：快照记录只追加
   - 唯一约束：(station_id, tank_id, snapshot_date) 唯一
```

#### StockAdjustment（盘点调整）

```
❓ 问题 1 — 自带数据
   - id: UUID 主键
   - adjustment_no: 唯一调整单号（格式: SA-站点编码-日期-序号）
   - station_id: 所属站点（跨模块 FK → Station）
   - tank_id: 储罐（跨模块 FK → Equipment）
   - fuel_type_id: 燃料类型（跨模块 FK → FuelType）
   - before_stock: 调整前理论库存（NUMERIC(10,3)，kg）
   - after_stock: 调整后理论库存（NUMERIC(10,3)，kg）
   - adjustment_quantity: 调整量 = after_stock - before_stock（NUMERIC(10,3)，kg）
   - reason: 调整原因（TEXT，必填）
   - audit_status: 审核状态（枚举: pending_review / approved / rejected）
   - applied_by: 发起人（跨模块 FK → StationEmployee）
   - audited_by: 审核人（跨模块 FK → StationEmployee，可选）
   - audited_at: 审核时间（DATETIME，可选）
   - reject_reason: 驳回原因（TEXT，可选）
   - created_at, updated_at: 时间戳

❓ 问题 2 — 创建触发方式
   [x] 手动创建：站长在罐存比对页面偏差分析区域发起盘点调整（MVP+）

❓ 问题 3 — 副作用与生命周期约束
   - 创建时：audit_status 初始为 pending_review
   - 审批路由：|adjustment_quantity| ≤ 理论库存 1% → 班组长审批；> 1% → 站长审批
   - 审核通过时：
     · 理论库存更新为 after_stock
     · 生成 InventoryLedger 流水（type=stock_adjustment）
   - 审核驳回时：理论库存不变，记录 reject_reason
   - 删除限制：不可物理删除
```

#### InventoryAlert（库存预警）

```
❓ 问题 1 — 自带数据
   - id: UUID 主键
   - station_id: 所属站点（跨模块 FK → Station）
   - fuel_type_id: 燃料类型（跨模块 FK → FuelType）
   - tank_id: 储罐（跨模块 FK → Equipment，损耗异常预警时有值）
   - alert_level: 预警级别（枚举: warning / critical / loss_anomaly）
   - alert_type: 预警类型（枚举: low_stock / loss_anomaly）
   - current_value: 当前值（VARCHAR(50)，如 "25.3%" 或 "偏差率 3.12%"）
   - threshold_value: 阈值（VARCHAR(50)，如 "≤ 30%" 或 "> ±2%"）
   - handle_status: 处理状态（枚举: active / acknowledged / dismissed / recovered）
   - triggered_at: 触发时间（DATETIME）
   - handled_by: 处理人（跨模块 FK → StationEmployee，可选）
   - handled_at: 处理时间（DATETIME，可选）
   - resolved_at: 恢复/关闭时间（DATETIME，可选）
   - created_at: 创建时间

❓ 问题 2 — 创建触发方式
   [x] 自动生成：系统检测到罐容比低于阈值或偏差率超过阈值时自动创建
   → 同一预警条件不重复创建（已有 active 预警时不再创建）

❓ 问题 3 — 副作用与生命周期约束
   - 自动恢复：库存回升至安全阈值以上时，handle_status 自动变为 recovered，设置 resolved_at
   - 升级机制：连续多日损耗异常时，alert_level 可升级为 critical
   - handle_status 不可逆：recovered 后不可再变为 active（需新建预警）
```

#### AlertConfig（预警规则配置）

```
❓ 问题 1 — 自带数据
   - id: UUID 主键
   - station_id: 所属站点（跨模块 FK → Station）
   - fuel_type_id: 燃料类型（跨模块 FK → FuelType）
   - safe_threshold: 安全阈值（NUMERIC(5,2)，默认 30，表示 30%）
   - warning_threshold: 预警阈值（NUMERIC(5,2)，默认 30，表示 ≤30%）
   - critical_threshold: 紧急阈值（NUMERIC(5,2)，默认 10，表示 ≤10%）
   - loss_deviation_threshold: 损耗偏差阈值（NUMERIC(5,2)，默认 2，表示 ±2%）
   - threshold_type: 阈值类型（枚举: percentage / absolute）
   - created_at, updated_at: 时间戳

❓ 问题 2 — 创建触发方式
   [x] 系统初始化：站点配置燃料类型时自动创建默认配置
   [x] 手动修改：站长在预警管理→阈值配置 Tab 中编辑

❓ 问题 3 — 副作用与生命周期约束
   - 修改即时生效：保存后新阈值立即用于后续预警判定
   - 校验规则：critical_threshold < warning_threshold < safe_threshold
   - 唯一约束：(station_id, fuel_type_id) 唯一
```

### 1.3 数据完整性约束

| 实体 | 约束类型 | 规则描述 |
|------|---------|---------|
| InboundRecord | 状态约束 | audit_status='approved' 时，必须存在 audited_by 和 audited_at |
| InboundRecord | 状态约束 | audit_status='rejected' 时，必须存在 reject_reason |
| InboundRecord | 唯一性约束 | inbound_no 全局唯一 |
| InboundRecord | 数值约束 | actual_quantity > 0, planned_quantity > 0 |
| OutboundRecord | 关联约束 | outbound_type='sales' 时，order_id 不能为空 |
| OutboundRecord | 关联约束 | outbound_type='loss' 时，loss_reason 不能为空 |
| OutboundRecord | 关联约束 | outbound_type='reversal' 时，order_id 和 related_inbound_id 不能同时为空 |
| OutboundRecord | 状态约束 | outbound_type='loss' 且 approval_status='approved' 时，必须有 approved_by 和 approved_at |
| OutboundRecord | 数值约束 | quantity > 0 |
| InventoryLedger | 不可变 | 创建后不允许 UPDATE 或 DELETE |
| InventoryLedger | 关联完整 | related_no 必须对应存在的入库/出库/盘点记录 |
| TankComparisonLog | 唯一性约束 | (station_id, tank_id, snapshot_date) 唯一 |
| TankComparisonLog | 不可变 | 创建后不允许 UPDATE 或 DELETE |
| StockAdjustment | 状态约束 | audit_status='approved' 时，必须有 audited_by 和 audited_at |
| StockAdjustment | 数值约束 | after_stock >= 0 |
| InventoryAlert | 状态约束 | handle_status='acknowledged'/'dismissed' 时，必须有 handled_by 和 handled_at |
| InventoryAlert | 状态流转 | handle_status 只可 active→acknowledged / active→dismissed / active→recovered |
| AlertConfig | 阈值逻辑 | critical_threshold < warning_threshold < safe_threshold |
| AlertConfig | 唯一性约束 | (station_id, fuel_type_id) 唯一 |

---

## 2. API 端点设计

### 2.1 聚合接口分析

```
页面：库存总览 (InventoryOverview, P01)
需要的数据：
  - 各燃料类型库存卡片数据 → 聚合：InboundRecord + OutboundRecord + EquipmentMonitoring
  - 库存趋势图数据 → TankComparisonLog 按日期聚合
判断：[x] 数据来自多个实体 → 需要聚合接口
聚合接口：GET /api/v1/stations/:stationId/inventory/overview

页面：罐存比对-实时比对 (TankComparison, P05 Tab1)
需要的数据：
  - 每个储罐的实时数据 → Equipment + EquipmentMonitoring + 理论库存聚合
  - 近 7 天偏差趋势 → TankComparisonLog
  - 损耗分类分析 → InboundRecord 偏差 + TankComparisonLog 偏差
判断：[x] 数据来自多个实体 → 需要聚合接口
聚合接口：
  GET /api/v1/stations/:stationId/inventory/tank-comparison/realtime
  GET /api/v1/stations/:stationId/inventory/tank-comparison/loss-analysis
```

### 2.2 端点清单

#### 库存总览

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/inventory/overview` | 库存总览聚合 | Resp: `cards: InventoryCard[]`, `trendData: TrendDataPoint[]` |

```typescript
// InventoryCard
{
  fuelTypeId: string;
  fuelTypeName: string;
  currentStock: number;        // 当前理论库存(kg)
  ratedCapacity: number;       // 总额定容量(kg)，多罐汇总
  tankLevelRatio: number;      // 罐容比(%)
  alertLevel: 'safe' | 'warning' | 'critical';
  todayInbound: number;        // 今日入库量(kg)
  todayOutbound: number;       // 今日出库量(kg)
  todayNetChange: number;      // 今日净变化(kg)
}

// TrendDataPoint
{
  date: string;                // YYYY-MM-DD
  fuelTypeId: string;
  stock: number;               // 当日末库存量(kg)
}
```

#### 入库管理

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/inventory/inbound-records` | 入库记录列表 | Query: `fuelTypeId`, `auditStatus`, `dateFrom`, `dateTo`, `keyword`, `page`, `pageSize` / Resp: `items[]`, `pagination` |
| GET | `/api/v1/stations/:stationId/inventory/inbound-records/:id` | 入库记录详情 | Resp: 完整入库记录含审核链 |
| POST | `/api/v1/stations/:stationId/inventory/inbound-records` | 创建入库单 | Body: `tankId`, `supplierName`, `deliveryNo?`, `plannedQuantity`, `actualQuantity`, `inboundTime`, `remark?` |
| PATCH | `/api/v1/stations/:stationId/inventory/inbound-records/:id/approve` | 审核通过 | 权限: station_master / 更新 audit_status→approved, 理论库存 +actual_qty |
| PATCH | `/api/v1/stations/:stationId/inventory/inbound-records/:id/reject` | 审核驳回 | Body: `reason` / 更新 audit_status→rejected |

**POST /inbound-records 请求 Body：**
```json
{
  "tankId": "tank-lng-01",
  "supplierName": "中海石油",
  "deliveryNo": "DL-20260228-001",
  "plannedQuantity": 5000.000,
  "actualQuantity": 4985.500,
  "inboundTime": "2026-02-28T14:30:00.000Z",
  "remark": "常规补货"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tankId` | string | 是 | 目标储罐 ID（FK → Equipment, type=tank），自动带出 fuel_type_id |
| `supplierName` | string | 是 | 供应商名称 |
| `deliveryNo` | string | 否 | 送货单号 |
| `plannedQuantity` | number | 是 | 计划量（kg），> 0 |
| `actualQuantity` | number | 是 | 实收量（kg），> 0 |
| `inboundTime` | string | 是 | 入库时间（ISO 8601） |
| `remark` | string | 否 | 备注 |

**响应示例（201 Created）：**
```json
{
  "code": 0,
  "data": {
    "id": "ib-uuid-0013",
    "inboundNo": "IB-ST001-20260228-0001",
    "auditStatus": "pending_review",
    "variance": -14.500,
    "varianceRate": -0.29,
    "createdAt": "2026-02-28T14:30:05.000Z"
  }
}
```

**PATCH /inbound-records/:id/approve 请求 Body：**

> 无请求 Body（审核人信息从当前登录用户上下文获取）。

**响应示例（200 OK）：**
```json
{
  "code": 0,
  "data": {
    "id": "ib-uuid-0013",
    "auditStatus": "approved",
    "auditedBy": "emp-station-master",
    "auditedAt": "2026-02-28T16:00:00.000Z"
  }
}
```

**PATCH /inbound-records/:id/reject 请求 Body：**
```json
{
  "reason": "实收量与送货单偏差过大，需重新核验"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `reason` | string | 是 | 驳回原因 |

**响应示例（200 OK）：**
```json
{
  "code": 0,
  "data": {
    "id": "ib-uuid-0013",
    "auditStatus": "rejected",
    "rejectReason": "实收量与送货单偏差过大，需重新核验",
    "auditedBy": "emp-station-master",
    "auditedAt": "2026-02-28T16:05:00.000Z"
  }
}
```

#### 出库管理

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/inventory/outbound-records` | 出库记录列表 | Query: `outboundType`, `fuelTypeId`, `source`, `dateFrom`, `dateTo`, `page`, `pageSize` / Resp: `items[]`, `pagination` |
| POST | `/api/v1/stations/:stationId/inventory/outbound-records` | 创建损耗出库 | Body: `fuelTypeId`, `quantity`, `lossReason`, `lossReasonDetail?` |
| PATCH | `/api/v1/stations/:stationId/inventory/outbound-records/:id/approve` | 损耗审批通过 | 权限: shift_leader, station_master |
| PATCH | `/api/v1/stations/:stationId/inventory/outbound-records/:id/reject` | 损耗审批驳回 | Body: `reason` |

**POST /outbound-records 请求 Body：**
```json
{
  "fuelTypeId": "ft-lng",
  "quantity": 15.500,
  "lossReason": "evaporation",
  "lossReasonDetail": null
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `fuelTypeId` | string | 是 | 燃料类型 ID（FK → FuelType） |
| `quantity` | number | 是 | 损耗量（kg），> 0，不能超过当前理论库存（BR-11） |
| `lossReason` | string | 是 | 损耗原因：`evaporation` / `leakage` / `transfer` / `other` |
| `lossReasonDetail` | string | 条件 | 原因说明（`lossReason=other` 时必填） |

**响应示例（201 Created）：**
```json
{
  "code": 0,
  "data": {
    "id": "ob-uuid-0021",
    "outboundNo": "OB-ST001-20260228-0004",
    "outboundType": "loss",
    "source": "manual",
    "approvalStatus": "pending_approval",
    "createdAt": "2026-02-28T15:20:00.000Z"
  }
}
```

**PATCH /outbound-records/:id/approve 请求 Body：**

> 无请求 Body（审批人信息从当前登录用户上下文获取）。

**响应示例（200 OK）：**
```json
{
  "code": 0,
  "data": {
    "id": "ob-uuid-0021",
    "approvalStatus": "approved",
    "approvedBy": "emp-shift-leader",
    "approvedAt": "2026-02-28T16:10:00.000Z"
  }
}
```

**PATCH /outbound-records/:id/reject 请求 Body：**
```json
{
  "reason": "损耗量异常偏高，请核实后重新提交"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `reason` | string | 是 | 驳回原因 |

**响应示例（200 OK）：**
```json
{
  "code": 0,
  "data": {
    "id": "ob-uuid-0021",
    "approvalStatus": "rejected",
    "rejectReason": "损耗量异常偏高，请核实后重新提交",
    "approvedBy": "emp-shift-leader",
    "approvedAt": "2026-02-28T16:15:00.000Z"
  }
}
```

#### 进销存流水

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/inventory/transactions` | 流水明细列表 | Query: `transactionType[]`, `fuelTypeId`, `dateFrom`, `dateTo`, `page`, `pageSize` / Resp: `items[]`, `pagination` |
| POST | `/api/v1/stations/:stationId/inventory/transactions/export` | 导出流水 | Body: `transactionType[]`, `fuelTypeId`, `dateFrom`, `dateTo` / Resp: Blob (Excel) |

**POST /transactions/export 请求 Body：**
```json
{
  "transactionType": ["inbound", "sales_outbound", "loss_outbound"],
  "fuelTypeId": "ft-lng",
  "dateFrom": "2026-02-01",
  "dateTo": "2026-02-28"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `transactionType` | string[] | 否 | 流水类型筛选，不传则导出全部类型 |
| `fuelTypeId` | string | 否 | 燃料类型筛选 |
| `dateFrom` | string | 否 | 起始日期（YYYY-MM-DD） |
| `dateTo` | string | 否 | 截止日期（YYYY-MM-DD） |

**响应：** `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`，文件名 `进销存流水_LNG_20260201-20260228.xlsx`

#### 罐存比对

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/inventory/tank-comparison/realtime` | 实时罐存比对 | Resp: `tanks: TankComparisonCard[]` |
| GET | `/api/v1/stations/:stationId/inventory/tank-comparison/loss-analysis` | 损耗分类分析 | Resp: `transportLoss: SupplierLoss[]`, `stationLoss: TankLoss[]` |
| GET | `/api/v1/stations/:stationId/inventory/tank-comparison/history` | 比对历史 | Query: `tankId`, `dateFrom`, `dateTo`, `page`, `pageSize` / Resp: `items[]`, `pagination`, `trendData[]` |

```typescript
// TankComparisonCard
{
  tankId: string;
  tankName: string;
  fuelTypeId: string;
  fuelTypeName: string;
  ratedCapacity: number;        // 额定容量(kg)
  actualLevel: number;          // 实际罐存(kg)，来自 EquipmentMonitoring
  theoreticalStock: number;     // 理论库存(kg)
  deviation: number;            // 偏差值(kg) = actualLevel - theoreticalStock
  deviationRate: number;        // 偏差率(%)
  alertLevel: 'normal' | 'warning'; // 偏差超阈值时为 warning
  trend7d: { date: string; deviationRate: number }[];
}
```

#### 盘点调整

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| POST | `/api/v1/stations/:stationId/inventory/stock-adjustments` | 创建盘点调整 | Body: `tankId`, `adjustedStock`, `reason` / [MVP+] |
| PATCH | `/api/v1/stations/:stationId/inventory/stock-adjustments/:id/approve` | 调整审核通过 | [MVP+] |
| PATCH | `/api/v1/stations/:stationId/inventory/stock-adjustments/:id/reject` | 调整审核驳回 | Body: `reason` / [MVP+] |

**POST /stock-adjustments 请求 Body：** [MVP+]
```json
{
  "tankId": "tank-lng-01",
  "adjustedStock": 8520.000,
  "reason": "月度盘点，实际罐存与理论库存偏差 12.5kg，调整理论库存与实际对齐"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tankId` | string | 是 | 储罐 ID（FK → Equipment, type=tank），自动带出 fuel_type_id |
| `adjustedStock` | number | 是 | 调整后理论库存（kg），≥ 0 |
| `reason` | string | 是 | 调整原因 |

> 系统自动计算 `beforeStock`（当前理论库存）和 `adjustmentQuantity`（= adjustedStock - beforeStock）。
> 审批路由：|adjustmentQuantity| ≤ 理论库存 1% → 班组长审批；> 1% → 站长审批（BR-08）。

**响应示例（201 Created）：**
```json
{
  "code": 0,
  "data": {
    "id": "sa-uuid-0004",
    "adjustmentNo": "SA-ST001-20260228-0001",
    "beforeStock": 8507.500,
    "afterStock": 8520.000,
    "adjustmentQuantity": 12.500,
    "auditStatus": "pending_review",
    "createdAt": "2026-02-28T17:00:00.000Z"
  }
}
```

**PATCH /stock-adjustments/:id/approve 请求 Body：** [MVP+]

> 无请求 Body（审核人信息从当前登录用户上下文获取）。

**响应示例（200 OK）：**
```json
{
  "code": 0,
  "data": {
    "id": "sa-uuid-0004",
    "auditStatus": "approved",
    "auditedBy": "emp-shift-leader",
    "auditedAt": "2026-02-28T17:30:00.000Z"
  }
}
```

**PATCH /stock-adjustments/:id/reject 请求 Body：** [MVP+]
```json
{
  "reason": "调整量较大，需提供盘点照片佐证"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `reason` | string | 是 | 驳回原因 |

**响应示例（200 OK）：**
```json
{
  "code": 0,
  "data": {
    "id": "sa-uuid-0004",
    "auditStatus": "rejected",
    "rejectReason": "调整量较大，需提供盘点照片佐证",
    "auditedBy": "emp-station-master",
    "auditedAt": "2026-02-28T17:35:00.000Z"
  }
}
```

#### 预警管理

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/inventory/alerts` | 预警列表 | Query: `status` (active/history), `page`, `pageSize` / Resp: `items[]`, `pagination`, `activeCount` |
| PATCH | `/api/v1/stations/:stationId/inventory/alerts/:id/acknowledge` | 确认预警 | 更新 handle_status→acknowledged |
| PATCH | `/api/v1/stations/:stationId/inventory/alerts/:id/dismiss` | 忽略预警 | 更新 handle_status→dismissed |
| GET | `/api/v1/stations/:stationId/inventory/alert-config` | 预警规则配置 | Resp: `rules: AlertRule[]` |
| PUT | `/api/v1/stations/:stationId/inventory/alert-config/:fuelTypeId` | 更新预警规则 | Body: `safeThreshold`, `warningThreshold`, `criticalThreshold`, `lossDeviationThreshold`, `thresholdType` |

**PATCH /alerts/:id/acknowledge 请求 Body：**

> 无请求 Body（处理人信息从当前登录用户上下文获取）。

**响应示例（200 OK）：**
```json
{
  "code": 0,
  "data": {
    "id": "alert-uuid-001",
    "handleStatus": "acknowledged",
    "handledBy": "emp-station-master",
    "handledAt": "2026-02-28T18:00:00.000Z"
  }
}
```

**PATCH /alerts/:id/dismiss 请求 Body：**

> 无请求 Body（处理人信息从当前登录用户上下文获取）。

**响应示例（200 OK）：**
```json
{
  "code": 0,
  "data": {
    "id": "alert-uuid-002",
    "handleStatus": "dismissed",
    "handledBy": "emp-station-master",
    "handledAt": "2026-02-28T18:05:00.000Z"
  }
}
```

**PUT /alert-config/:fuelTypeId 请求 Body：**
```json
{
  "safeThreshold": 35.00,
  "warningThreshold": 30.00,
  "criticalThreshold": 10.00,
  "lossDeviationThreshold": 2.50,
  "thresholdType": "percentage"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `safeThreshold` | number | 是 | 安全阈值（%），库存回升至此值以上时预警自动恢复 |
| `warningThreshold` | number | 是 | 预警阈值（%），罐容比 ≤ 此值触发橙色预警 |
| `criticalThreshold` | number | 是 | 紧急阈值（%），罐容比 ≤ 此值触发红色紧急 |
| `lossDeviationThreshold` | number | 是 | 损耗偏差阈值（%），日偏差率 > 此值触发损耗异常 |
| `thresholdType` | string | 是 | 阈值类型：`percentage` / `absolute` |

> 校验规则：`criticalThreshold < warningThreshold ≤ safeThreshold`，`0 < lossDeviationThreshold ≤ 10`

**响应示例（200 OK）：**
```json
{
  "code": 0,
  "data": {
    "id": "ac-uuid-001",
    "fuelTypeId": "ft-lng",
    "safeThreshold": 35.00,
    "warningThreshold": 30.00,
    "criticalThreshold": 10.00,
    "lossDeviationThreshold": 2.50,
    "thresholdType": "percentage",
    "updatedAt": "2026-02-28T18:10:00.000Z"
  }
}
```

### 2.3 权限矩阵

> ⚠️ **Phase 7 依赖（9.1 角色权限管理）：** MVP 阶段前端硬编码角色判断，Phase 7 对接 RBAC 系统。

| 权限代码 | 说明 | 默认角色 |
|----------|------|----------|
| `inventory:overview` | 查看库存总览 | `station_master`, `shift_leader`, `ops_manager`, `finance` |
| `inventory:inbound:list` | 查看入库记录 | `station_master`, `shift_leader`, `ops_manager` |
| `inventory:inbound:create` | 创建入库单 | `shift_leader`, `station_master` |
| `inventory:inbound:audit` | 审核入库单 | `station_master` |
| `inventory:outbound:list` | 查看出库记录 | `station_master`, `shift_leader`, `ops_manager` |
| `inventory:outbound:loss` | 登记损耗出库 | `shift_leader`, `station_master` |
| `inventory:outbound:approve` | 损耗出库审批 | `shift_leader`, `station_master` |
| `inventory:ledger:list` | 查看进销存流水 | `station_master`, `ops_manager`, `finance` |
| `inventory:ledger:export` | 导出流水 | `finance`, `ops_manager` |
| `inventory:tank:view` | 查看罐存比对 | `station_master`, `ops_manager` |
| `inventory:adjustment:create` | 创建盘点调整 | `station_master` |
| `inventory:adjustment:audit` | 审核盘点调整 | `station_master` |
| `inventory:alert:list` | 查看预警列表 | `station_master`, `ops_manager` |
| `inventory:alert:handle` | 处理预警 | `station_master` |
| `inventory:alert:config` | 配置预警规则 | `station_master` |

---

## 3. 业务规则与状态机

### 3.1 入库审核状态机

```
┌─────────┐  提交  ┌────────────────┐  通过  ┌──────────┐
│ (入口)  │ ────→ │ pending_review │ ────→ │ approved │
└─────────┘       └───────┬────────┘       └──────────┘
                          │
                       驳回│
                          ▼
                   ┌──────────┐
                   │ rejected │
                   └──────────┘
```

### 3.2 损耗出库审批状态机

```
┌─────────┐  提交  ┌────────────────────┐  通过  ┌──────────┐
│ (入口)  │ ────→ │ pending_approval   │ ────→ │ approved │
└─────────┘       └──────────┬─────────┘       └──────────┘
                             │
                          驳回│
                             ▼
                      ┌──────────┐
                      │ rejected │
                      └──────────┘
```

### 3.3 预警处理状态机

```
                    ┌──────────────┐
         ┌────────→│ acknowledged │
         │         └──────────────┘
         │
┌────────┴─┐       ┌──────────────┐
│  active  ├──────→│  dismissed   │
└────────┬─┘       └──────────────┘
         │
         └────────→┌──────────────┐
                   │  recovered   │ ← 系统自动
                   └──────────────┘
```

### 3.4 核心业务规则

| # | 规则 | 说明 |
|---|------|------|
| BR-01 | 理论库存公式 | 理论库存 = 期初 + Σ入库(approved) - Σ销售出库 - Σ损耗出库(approved) ± Σ盘点调整(approved) |
| BR-02 | 罐容比公式 | 罐容比 = 实际罐存(EquipmentMonitoring) / 储罐额定容量(Equipment) × 100% |
| BR-03 | 偏差公式 | 偏差值 = 实际罐存 - 理论库存；偏差率 = 偏差值 / 理论库存 × 100% |
| BR-04 | 入库偏差公式 | 入库偏差 = 实收量 - 计划量；偏差率 = 偏差 / 计划量 × 100% |
| BR-05 | 低库存预警 | 罐容比 ≤ warning_threshold → 橙色预警；≤ critical_threshold → 红色紧急 |
| BR-06 | 损耗异常预警 | 日偏差率 > loss_deviation_threshold → 自动生成损耗异常预警 |
| BR-07 | 入库审批路由 | 金额 ≤ 5 万 → 班组长可审批；> 5 万 → 站长审批 |
| BR-08 | 盘点审批路由 | |adjustment_quantity| ≤ 理论库存 1% → 班组长；> 1% → 站长 |
| BR-09 | 订单自动出库 | 订单状态 paid/completed → 自动创建销售出库记录，关联 order_id |
| BR-10 | 退款自动冲红 | 退款 refunded → 自动创建冲红记录（quantity 为正，回库） |
| BR-11 | 损耗量上限 | 损耗出库量不能超过当前理论库存 |
| BR-12 | 预警自动恢复 | 库存回升至 safe_threshold 以上 → 预警自动变为 recovered |
| BR-13 | 预警不重复 | 同一 (station_id, fuel_type_id, alert_type) 已有 active 预警时不再创建新预警 |

---

## 4. 跨模块依赖

### 4.1 依赖其他模块的接口

| 本模块实体/功能 | 依赖模块 | 依赖实体/接口 | 依赖类型 | 说明 |
|---------------|---------|-------------|---------|------|
| InboundRecord.station_id | 1.1 站点管理 | Station | FK 引用 | 入库所属站点 |
| InboundRecord.tank_id | 1.3 设备设施 | Equipment (type=tank) | FK 引用 | 目标储罐 |
| InboundRecord.fuel_type_id | 1.1 站点管理 | FuelType | FK 引用 | 燃料类型（储罐自动带出） |
| InboundRecord.operator_id | 1.1 站点管理 | StationEmployee | FK 引用 | 操作员 |
| InboundRecord.audited_by | 1.1 站点管理 | StationEmployee | FK 引用 | 审核人 |
| OutboundRecord.order_id | 2.2 订单交易 | FuelingOrder | FK 引用 | 销售出库关联订单 |
| OutboundRecord.fuel_type_id | 1.1 站点管理 | FuelType | FK 引用 | 燃料类型 |
| TankComparisonLog.actual_level | 1.3 设备设施 | EquipmentMonitoring.level_volume | 数据读取 | 实际罐存来源 |
| TankComparisonCard.ratedCapacity | 1.3 设备设施 | Equipment.rated_capacity | 数据读取 | 储罐额定容量 |
| D02 损耗金额计算 | 2.1 价格管理 | getPriceOverviewData() | API 调用 | 按当前价格计算损耗金额 |
| 全局站点上下文 | 1.1 站点管理 | useOutletContext | 前端共享 | 站点选择器 |

### 4.2 被其他模块依赖的接口

| 接口 | 消费模块 | 说明 |
|------|---------|------|
| GET /api/v1/stations/:id/inventory/overview | 1.2 交接班管理 | 交接班库存快照（FUTURE） |
| GET /api/v1/stations/:id/inventory/overview | 7.1 数据分析 | 经营看板库存数据 |
| GET /api/v1/stations/:id/inventory/alerts (activeCount) | AppLayout | 侧边栏预警 Badge |

---

## 5. Mock 数据规格

### 5.1 InboundRecord Mock 数据

| 数据量 | 覆盖范围 | 说明 |
|--------|---------|------|
| 12 条 | 各状态覆盖 | pending_review(2), approved(8), rejected(2) |
| 储罐 | 3 个 | LNG-01, CNG-01, L-CNG-01 |
| 供应商 | 3 个 | 中海石油、昆仑能源、新奥燃气 |
| 时间分布 | 近 30 天 | 每周 2-3 次入库 |

### 5.2 OutboundRecord Mock 数据

| 数据量 | 覆盖范围 | 说明 |
|--------|---------|------|
| 20 条 | 各类型覆盖 | sales(15, auto), loss(3, manual), reversal(2, auto) |
| 损耗原因 | 3 种 | evaporation(2), leakage(1) |
| 审批状态 | 3 种 | pending_approval(1), approved(2) |

### 5.3 InventoryLedger Mock 数据

| 数据量 | 说明 |
|--------|------|
| 35 条 | 与入库/出库/盘点记录对应，按时间排序，含 stock_balance |

### 5.4 TankComparisonLog Mock 数据

| 数据量 | 说明 |
|--------|------|
| 90 条 | 3 储罐 × 30 天，每日一条快照 |

### 5.5 StockAdjustment Mock 数据

| 数据量 | 说明 |
|--------|------|
| 3 条 | pending_review(1), approved(1), rejected(1) |

### 5.6 InventoryAlert Mock 数据

| 数据量 | 覆盖范围 |
|--------|---------|
| 8 条 | active: warning(1), critical(1), loss_anomaly(1); history: acknowledged(2), dismissed(1), recovered(2) |

### 5.7 AlertConfig Mock 数据

| 数据量 | 说明 |
|--------|------|
| 3 条 | LNG/CNG/L-CNG 各一条，使用默认阈值 |

---

## 6. Database Schema (MySQL 8.0)

```sql
-- ============================================================
-- Module 2.3 库存管理 Database Schema (MySQL 8.0)
-- 版本: 草案 v1  |  生成日期: 2026-02-28
-- ============================================================
-- ---------- ENUM 类型 ----------

-- ---------- 入库记录 ----------

CREATE TABLE inbound_record (
  id                CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  inbound_no        VARCHAR(30) NOT NULL UNIQUE,
  station_id        CHAR(36) NOT NULL,       -- → stations.id (1.1)
  tank_id           CHAR(36) NOT NULL,       -- → equipment.id (1.3, type=tank)
  fuel_type_id      CHAR(36) NOT NULL,       -- → fuel_types.id (1.1)
  supplier_name     VARCHAR(100) NOT NULL,
  delivery_no       VARCHAR(50),
  planned_quantity  NUMERIC(10,3) NOT NULL CHECK (planned_quantity > 0),
  actual_quantity   NUMERIC(10,3) NOT NULL CHECK (actual_quantity > 0),
  variance          NUMERIC(10,3) NOT NULL,   -- = actual_quantity - planned_quantity
  variance_rate     NUMERIC(5,2) NOT NULL,    -- = variance / planned_quantity × 100
  inbound_time      DATETIME NOT NULL,
  audit_status      ENUM('pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'pending_review',
  audited_by        CHAR(36),                -- → station_employees.id (1.1)
  audited_at        DATETIME,
  reject_reason     TEXT,
  operator_id       CHAR(36) NOT NULL,       -- → station_employees.id (1.1)
  remark            TEXT,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Column comments for inbound_record:
-- ALTER TABLE inbound_record MODIFY COLUMN station_id ... COMMENT '跨模块引用 → 1.1 stations.id';
-- ALTER TABLE inbound_record MODIFY COLUMN tank_id ... COMMENT '跨模块引用 → 1.3 equipment.id (type=tank)';
-- ALTER TABLE inbound_record MODIFY COLUMN fuel_type_id ... COMMENT '跨模块引用 → 1.1 fuel_types.id';
-- ALTER TABLE inbound_record MODIFY COLUMN operator_id ... COMMENT '跨模块引用 → 1.1 station_employees.id';
-- ALTER TABLE inbound_record MODIFY COLUMN audited_by ... COMMENT '跨模块引用 → 1.1 station_employees.id';

CREATE INDEX idx_inbound_record_station ON inbound_record(station_id);
CREATE INDEX idx_inbound_record_created ON inbound_record(created_at DESC);
CREATE INDEX idx_inbound_record_status ON inbound_record(audit_status);
CREATE INDEX idx_inbound_record_fuel ON inbound_record(fuel_type_id);

-- ---------- 出库记录 ----------

CREATE TABLE outbound_record (
  id                CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  outbound_no       VARCHAR(30) NOT NULL UNIQUE,
  station_id        CHAR(36) NOT NULL,       -- → stations.id (1.1)
  fuel_type_id      CHAR(36) NOT NULL,       -- → fuel_types.id (1.1)
  outbound_type     ENUM('sales', 'loss', 'reversal') NOT NULL,
  quantity          NUMERIC(10,3) NOT NULL CHECK (quantity > 0),
  amount            NUMERIC(12,2) NOT NULL DEFAULT 0,
  order_id          CHAR(36),                -- → fueling_order.id (2.2), 销售出库/冲红时有值
  loss_reason       ENUM('evaporation', 'leakage', 'transfer', 'other'),  -- 仅损耗出库
  loss_reason_detail TEXT,               -- 损耗原因为 other 时详情
  source            ENUM('auto', 'manual') NOT NULL,
  approval_status   ENUM('pending_approval', 'approved', 'rejected'), -- 仅损耗出库
  approved_by       CHAR(36),                -- → station_employees.id (1.1)
  approved_at       DATETIME,
  reject_reason     TEXT,
  operator_id       CHAR(36),                -- → station_employees.id (1.1), auto 时为 null
  related_inbound_id CHAR(36),               -- 冲红时关联的原出库记录 ID
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Column comments for outbound_record:
-- ALTER TABLE outbound_record MODIFY COLUMN station_id ... COMMENT '跨模块引用 → 1.1 stations.id';
-- ALTER TABLE outbound_record MODIFY COLUMN fuel_type_id ... COMMENT '跨模块引用 → 1.1 fuel_types.id';
-- ALTER TABLE outbound_record MODIFY COLUMN order_id ... COMMENT '跨模块引用 → 2.2 fueling_order.id';
-- ALTER TABLE outbound_record MODIFY COLUMN operator_id ... COMMENT '跨模块引用 → 1.1 station_employees.id';

CREATE INDEX idx_outbound_record_station ON outbound_record(station_id);
CREATE INDEX idx_outbound_record_created ON outbound_record(created_at DESC);
CREATE INDEX idx_outbound_record_type ON outbound_record(outbound_type);
CREATE INDEX idx_outbound_record_fuel ON outbound_record(fuel_type_id);
CREATE INDEX idx_outbound_record_order ON outbound_record(order_id);
-- MySQL: partial index (WHERE order_id IS NOT NULL) not supported;
-- Consider generated column + index or application-level filtering

-- ---------- 进销存流水 ----------

CREATE TABLE inventory_ledger (
  id                CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  station_id        CHAR(36) NOT NULL,       -- → stations.id (1.1)
  fuel_type_id      CHAR(36) NOT NULL,       -- → fuel_types.id (1.1)
  transaction_type  ENUM('inbound', 'sales_outbound', 'loss_outbound', 'stock_adjustment', 'reversal') NOT NULL,
  quantity          NUMERIC(10,3) NOT NULL,  -- 入库/冲红为正，出库为负
  amount            NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_balance     NUMERIC(10,3) NOT NULL,  -- 操作后库存余量
  operator_or_source VARCHAR(50) NOT NULL,
  related_no        VARCHAR(30),         -- 关联单号
  related_id        CHAR(36),                -- 关联记录 ID
  remark            TEXT,
  transaction_time  DATETIME NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  -- ⚠️ 不设 updated_at — 流水记录不可修改
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Column comments for inventory_ledger:
-- ALTER TABLE inventory_ledger MODIFY COLUMN station_id ... COMMENT '跨模块引用 → 1.1 stations.id';
-- ALTER TABLE inventory_ledger MODIFY COLUMN fuel_type_id ... COMMENT '跨模块引用 → 1.1 fuel_types.id';

-- ⚡ 预计超 100 万行时建议按 station_id + transaction_time 分区

CREATE INDEX idx_inventory_ledger_station ON inventory_ledger(station_id);
CREATE INDEX idx_inventory_ledger_time ON inventory_ledger(transaction_time DESC);
CREATE INDEX idx_inventory_ledger_type ON inventory_ledger(transaction_type);
CREATE INDEX idx_inventory_ledger_fuel ON inventory_ledger(fuel_type_id);

-- ---------- 罐存比对快照 ----------

CREATE TABLE tank_comparison_log (
  id                CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  station_id        CHAR(36) NOT NULL,       -- → stations.id (1.1)
  tank_id           CHAR(36) NOT NULL,       -- → equipment.id (1.3)
  fuel_type_id      CHAR(36) NOT NULL,       -- → fuel_types.id (1.1)
  snapshot_date     DATE NOT NULL,
  actual_level      NUMERIC(10,3) NOT NULL,
  theoretical_stock NUMERIC(10,3) NOT NULL,
  deviation         NUMERIC(10,3) NOT NULL,
  deviation_rate    NUMERIC(5,2) NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (station_id, tank_id, snapshot_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Column comments for tank_comparison_log:
-- ALTER TABLE tank_comparison_log MODIFY COLUMN station_id ... COMMENT '跨模块引用 → 1.1 stations.id';
-- ALTER TABLE tank_comparison_log MODIFY COLUMN tank_id ... COMMENT '跨模块引用 → 1.3 equipment.id';
-- ALTER TABLE tank_comparison_log MODIFY COLUMN fuel_type_id ... COMMENT '跨模块引用 → 1.1 fuel_types.id';

-- ⚡ TimescaleDB hypertable 推荐: 分区键 snapshot_date

CREATE INDEX idx_tank_comparison_station ON tank_comparison_log(station_id);
CREATE INDEX idx_tank_comparison_date ON tank_comparison_log(snapshot_date DESC);
CREATE INDEX idx_tank_comparison_tank ON tank_comparison_log(tank_id);

-- ---------- 盘点调整 ----------

CREATE TABLE stock_adjustment (
  id                  CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  adjustment_no       VARCHAR(30) NOT NULL UNIQUE,
  station_id          CHAR(36) NOT NULL,       -- → stations.id (1.1)
  tank_id             CHAR(36) NOT NULL,       -- → equipment.id (1.3)
  fuel_type_id        CHAR(36) NOT NULL,       -- → fuel_types.id (1.1)
  before_stock        NUMERIC(10,3) NOT NULL,
  after_stock         NUMERIC(10,3) NOT NULL CHECK (after_stock >= 0),
  adjustment_quantity NUMERIC(10,3) NOT NULL,  -- = after_stock - before_stock
  reason              TEXT NOT NULL,
  audit_status        ENUM('pending_review', 'approved', 'rejected') NOT NULL DEFAULT 'pending_review',
  applied_by          CHAR(36) NOT NULL,       -- → station_employees.id (1.1)
  audited_by          CHAR(36),                -- → station_employees.id (1.1)
  audited_at          DATETIME,
  reject_reason       TEXT,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Column comments for stock_adjustment:
-- ALTER TABLE stock_adjustment MODIFY COLUMN station_id ... COMMENT '跨模块引用 → 1.1 stations.id';
-- ALTER TABLE stock_adjustment MODIFY COLUMN tank_id ... COMMENT '跨模块引用 → 1.3 equipment.id';
-- ALTER TABLE stock_adjustment MODIFY COLUMN fuel_type_id ... COMMENT '跨模块引用 → 1.1 fuel_types.id';
-- ALTER TABLE stock_adjustment MODIFY COLUMN applied_by ... COMMENT '跨模块引用 → 1.1 station_employees.id';

CREATE INDEX idx_stock_adjustment_station ON stock_adjustment(station_id);
CREATE INDEX idx_stock_adjustment_status ON stock_adjustment(audit_status);

-- ---------- 库存预警 ----------

CREATE TABLE inventory_alert (
  id                CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  station_id        CHAR(36) NOT NULL,       -- → stations.id (1.1)
  fuel_type_id      CHAR(36) NOT NULL,       -- → fuel_types.id (1.1)
  tank_id           CHAR(36),                -- → equipment.id (1.3), 损耗异常时有值
  ENUM('warning', 'critical', 'loss_anomaly')       alert_level NOT NULL,
  alert_type        ENUM('low_stock', 'loss_anomaly') NOT NULL,
  current_value     VARCHAR(50) NOT NULL,
  threshold_value   VARCHAR(50) NOT NULL,
  handle_status     ENUM('active', 'acknowledged', 'dismissed', 'recovered') NOT NULL DEFAULT 'active',
  triggered_at      DATETIME NOT NULL,
  handled_by        CHAR(36),                -- → station_employees.id (1.1)
  handled_at        DATETIME,
  resolved_at       DATETIME,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Column comments for inventory_alert:
-- ALTER TABLE inventory_alert MODIFY COLUMN station_id ... COMMENT '跨模块引用 → 1.1 stations.id';
-- ALTER TABLE inventory_alert MODIFY COLUMN fuel_type_id ... COMMENT '跨模块引用 → 1.1 fuel_types.id';
-- ALTER TABLE inventory_alert MODIFY COLUMN tank_id ... COMMENT '跨模块引用 → 1.3 equipment.id';

CREATE INDEX idx_inventory_alert_station ON inventory_alert(station_id);
CREATE INDEX idx_inventory_alert_status ON inventory_alert(handle_status);
CREATE INDEX idx_inventory_alert_triggered ON inventory_alert(triggered_at DESC);

-- ---------- 预警规则配置 ----------

CREATE TABLE alert_config (
  id                       CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  station_id               CHAR(36) NOT NULL,       -- → stations.id (1.1)
  fuel_type_id             CHAR(36) NOT NULL,       -- → fuel_types.id (1.1)
  safe_threshold           NUMERIC(5,2) NOT NULL DEFAULT 30,
  warning_threshold        NUMERIC(5,2) NOT NULL DEFAULT 30,
  critical_threshold       NUMERIC(5,2) NOT NULL DEFAULT 10,
  loss_deviation_threshold NUMERIC(5,2) NOT NULL DEFAULT 2,
  threshold_type           ENUM('percentage', 'absolute') NOT NULL DEFAULT 'percentage',
  created_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at               DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (station_id, fuel_type_id),
  CHECK (critical_threshold < warning_threshold),
  CHECK (warning_threshold <= safe_threshold),
  CHECK (loss_deviation_threshold > 0 AND loss_deviation_threshold <= 10)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Column comments for alert_config:
-- ALTER TABLE alert_config MODIFY COLUMN station_id ... COMMENT '跨模块引用 → 1.1 stations.id';
-- ALTER TABLE alert_config MODIFY COLUMN fuel_type_id ... COMMENT '跨模块引用 → 1.1 fuel_types.id';

```

---

## 7. 功能需求覆盖检查

| User Story | 覆盖实体 | 覆盖 API | 状态 |
|-----------|---------|---------|------|
| US-001 库存仪表盘 | 聚合 | GET /inventory/overview | ✅ |
| US-002 库存趋势图 | TankComparisonLog | GET /inventory/overview (trendData) | ✅ |
| US-003 入库记录 | InboundRecord | GET /inbound-records | ✅ |
| US-004 创建入库单 | InboundRecord | POST /inbound-records | ✅ |
| US-005 审核入库单 | InboundRecord | PATCH /inbound-records/:id/approve\|reject | ✅ |
| US-006 供应商管理 | InboundRecord.supplier_name | — (MVP+ 简化为字段) | ✅ |
| US-007 出库记录 | OutboundRecord | GET /outbound-records | ✅ |
| US-008 损耗出库 | OutboundRecord | POST /outbound-records | ✅ |
| US-009 进销存流水 | InventoryLedger | GET /transactions | ✅ |
| US-010 罐存面板 | 聚合 | GET /tank-comparison/realtime | ✅ |
| US-011 偏差分析 | TankComparisonCard | — (realtime 接口内含) | ✅ |
| US-012 比对历史 | TankComparisonLog | GET /tank-comparison/history | ✅ |
| US-013 损耗分类 | 聚合 | GET /tank-comparison/loss-analysis | ✅ |
| US-014 盘点调整 | StockAdjustment | POST /stock-adjustments [MVP+] | ✅ |
| US-015 低库存预警 | InventoryAlert | — (系统自动触发) | ✅ |
| US-016 预警阈值配置 | AlertConfig | GET/PUT /alert-config | ✅ |
| US-017 预警通知列表 | InventoryAlert | GET /alerts | ✅ |
| US-018 损耗异常预警 | InventoryAlert | — (系统自动触发) | ✅ |
| US-019 预警仪表盘 | InventoryAlert 聚合 | GET /alerts (activeCount) [MVP+] | ✅ |

**覆盖率：19/19 (100%)**

---

*文档生成时间：2026-02-28*
*基于：data-model-design.md Skill v1.2 + architecture 设计规范*
