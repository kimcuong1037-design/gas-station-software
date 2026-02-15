# 交接班管理 — 架构设计

**模块：** 基础运营 > 交接班管理 (1.2)
**基于：** requirements.md v1.0 + user-stories.md v1.0
**设计日期：** 2026-02-15
**状态：** 待评审

---

## 1. 数据模型

### 1.1 ShiftHandover（交接班记录）

交接班记录是本模块的核心实体，记录每次班次交接的完整信息。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `handover_no` | `VARCHAR(32)` | UNIQUE, NOT NULL | 交接班编号（格式：JJ-站点编码-日期-序号） |
| `station_id` | `UUID` | FK → Station, NOT NULL | 站点ID |
| `shift_id` | `UUID` | FK → Shift, NOT NULL | 班次定义ID |
| `shift_date` | `DATE` | NOT NULL | 班次日期 |
| `handover_time` | `TIMESTAMP` | NOT NULL | 交接班时间 |
| `handover_by` | `UUID` | FK → Employee, NOT NULL | 交班人（员工ID） |
| `received_by` | `UUID` | FK → Employee | 接班人（员工ID，接班前为NULL） |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'initiated' | 状态：initiated/pending_review/completed/cancelled |
| `is_forced` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | 是否强制交接 |
| `forced_by` | `UUID` | FK → User | 强制交接审批人 |
| `forced_reason` | `TEXT` | | 强制交接原因 |
| `remarks` | `TEXT` | | 交接备注 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |
| `completed_at` | `TIMESTAMP` | | 完成时间 |

**索引：**
- `idx_handover_no` ON `handover_no` — 编号查询
- `idx_handover_station` ON `station_id` — 站点筛选
- `idx_handover_shift` ON `shift_id` — 班次筛选
- `idx_handover_date` ON `shift_date` — 日期筛选
- `idx_handover_status` ON `status` — 状态筛选
- `idx_handover_time` ON `handover_time` — 时间排序

---

### 1.2 ShiftSummary（班次汇总）

班次经营数据汇总，在交接班时生成并存档。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `handover_id` | `UUID` | FK → ShiftHandover, NOT NULL | 关联交接班记录 |
| `total_amount` | `DECIMAL(12, 2)` | NOT NULL, DEFAULT 0 | 营业额总计 |
| `total_orders` | `INTEGER` | NOT NULL, DEFAULT 0 | 交易笔数 |
| `total_refund_amount` | `DECIMAL(12, 2)` | NOT NULL, DEFAULT 0 | 退款总额 |
| `total_refund_orders` | `INTEGER` | NOT NULL, DEFAULT 0 | 退款笔数 |
| `net_amount` | `DECIMAL(12, 2)` | NOT NULL, DEFAULT 0 | 净营业额（营业额-退款） |
| `fuel_summary` | `JSONB` | | 按燃料类型汇总：`[{fuelType, quantity, amount, unit}]` |
| `payment_summary` | `JSONB` | | 按支付方式汇总：`[{paymentMethod, amount, orders}]` |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |

**fuel_summary 示例：**
```json
[
  {"fuelType": "LNG", "quantity": 1520.5, "amount": 9123.00, "unit": "kg"},
  {"fuelType": "CNG", "quantity": 850.0, "amount": 4250.00, "unit": "m³"}
]
```

**payment_summary 示例：**
```json
[
  {"paymentMethod": "cash", "amount": 3500.00, "orders": 15},
  {"paymentMethod": "wechat", "amount": 5200.00, "orders": 28},
  {"paymentMethod": "alipay", "amount": 3100.00, "orders": 18},
  {"paymentMethod": "ic_card", "amount": 1573.00, "orders": 8}
]
```

---

### 1.3 CashSettlement（现金解缴）

现金解缴记录，关联到交接班。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `settlement_no` | `VARCHAR(32)` | UNIQUE, NOT NULL | 解缴编号 |
| `handover_id` | `UUID` | FK → ShiftHandover, NOT NULL | 关联交接班记录 |
| `station_id` | `UUID` | FK → Station, NOT NULL | 站点ID |
| `expected_amount` | `DECIMAL(12, 2)` | NOT NULL | 系统应收现金 |
| `actual_amount` | `DECIMAL(12, 2)` | NOT NULL | 实收现金 |
| `difference` | `DECIMAL(12, 2)` | NOT NULL | 差额（实收-应收） |
| `difference_type` | `VARCHAR(20)` | NOT NULL | 差异类型：surplus/shortage/balanced |
| `difference_reason` | `VARCHAR(50)` | | 差异原因代码 |
| `difference_note` | `TEXT` | | 差异说明 |
| `settlement_method` | `VARCHAR(50)` | NOT NULL | 解缴方式：safe/bank/manager |
| `settled_by` | `UUID` | FK → Employee, NOT NULL | 解缴人 |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending' | 状态：pending/approved/rejected |
| `reviewed_by` | `UUID` | FK → User | 审核人 |
| `reviewed_at` | `TIMESTAMP` | | 审核时间 |
| `review_note` | `TEXT` | | 审核备注 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

**索引：**
- `idx_settlement_no` ON `settlement_no`
- `idx_settlement_handover` ON `handover_id`
- `idx_settlement_station` ON `station_id`
- `idx_settlement_status` ON `status`

---

### 1.4 SettlementDocument（解缴凭证）

现金解缴的凭证照片。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `settlement_id` | `UUID` | FK → CashSettlement, NOT NULL | 关联解缴记录 |
| `file_name` | `VARCHAR(255)` | NOT NULL | 文件名 |
| `file_path` | `VARCHAR(500)` | NOT NULL | 存储路径 |
| `file_size` | `INTEGER` | NOT NULL | 文件大小（字节） |
| `mime_type` | `VARCHAR(100)` | NOT NULL | MIME类型 |
| `sort_order` | `INTEGER` | NOT NULL, DEFAULT 0 | 排序序号 |
| `uploaded_by` | `UUID` | FK → Employee, NOT NULL | 上传人 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |

---

### 1.5 HandoverIssue（交接班异常）

交接班过程中标注的异常情况。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `handover_id` | `UUID` | FK → ShiftHandover, NOT NULL | 关联交接班记录 |
| `issue_type` | `VARCHAR(50)` | NOT NULL | 异常类型：equipment/inventory/cash/safety/other |
| `severity` | `VARCHAR(20)` | NOT NULL, DEFAULT 'normal' | 严重程度：low/normal/high/critical |
| `description` | `TEXT` | NOT NULL | 异常描述 |
| `reported_by` | `UUID` | FK → Employee, NOT NULL | 报告人 |
| `resolved` | `BOOLEAN` | NOT NULL, DEFAULT FALSE | 是否已解决 |
| `resolved_by` | `UUID` | FK → Employee | 解决人 |
| `resolved_at` | `TIMESTAMP` | | 解决时间 |
| `resolution_note` | `TEXT` | | 解决说明 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |
| `updated_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 更新时间 |

---

### 1.6 HandoverPrecheck（交接班预检结果）

交接班预检的检查结果快照。

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | `UUID` | PK | 主键 |
| `handover_id` | `UUID` | FK → ShiftHandover, NOT NULL | 关联交接班记录 |
| `check_type` | `VARCHAR(50)` | NOT NULL | 检查类型：pending_orders/unsettled_cash/cash_difference/abnormal_orders |
| `check_result` | `VARCHAR(20)` | NOT NULL | 检查结果：pass/warning/fail |
| `check_value` | `VARCHAR(100)` | | 检查数值（如待处理订单数量） |
| `check_detail` | `JSONB` | | 检查详情 |
| `created_at` | `TIMESTAMP` | NOT NULL, DEFAULT NOW() | 创建时间 |

---

## 2. 枚举定义

### 2.1 交接班状态 (HandoverStatus)

| 值 | 说明 |
|----|------|
| `initiated` | 已发起，等待接班 |
| `pending_review` | 待审核（存在异常需审核） |
| `completed` | 已完成 |
| `cancelled` | 已取消 |

### 2.2 解缴状态 (SettlementStatus)

| 值 | 说明 |
|----|------|
| `pending` | 待审核 |
| `approved` | 已通过 |
| `rejected` | 已驳回 |

### 2.3 差异类型 (DifferenceType)

| 值 | 说明 |
|----|------|
| `surplus` | 长款（实收 > 应收） |
| `shortage` | 短款（实收 < 应收） |
| `balanced` | 平账 |

### 2.4 差异原因 (DifferenceReason)

| 值 | 说明 |
|----|------|
| `change_error` | 找零误差 |
| `receipt_lost` | 票据丢失 |
| `equipment_fault` | 设备故障 |
| `pending_verify` | 待核实 |
| `other` | 其他 |

### 2.5 解缴方式 (SettlementMethod)

| 值 | 说明 |
|----|------|
| `safe` | 存入保险柜 |
| `bank` | 银行存款 |
| `manager` | 交站长 |

### 2.6 异常类型 (IssueType)

| 值 | 说明 |
|----|------|
| `equipment` | 设备故障 |
| `inventory` | 库存异常 |
| `cash` | 现金差异 |
| `safety` | 安全隐患 |
| `other` | 其他 |

### 2.7 支付方式 (PaymentMethod)

| 值 | 名称 | 分类 |
|----|------|------|
| `cash` | 现金 | 现金类 |
| `wechat` | 微信支付 | 电子支付 |
| `alipay` | 支付宝 | 电子支付 |
| `unionpay` | 银联 | 电子支付 |
| `ic_card` | IC卡 | 储值卡 |
| `member_card` | 会员卡 | 储值卡 |
| `credit` | 挂账 | 赊销 |
| `other` | 其他 | 其他 |

---

## 3. API 设计

### 3.1 班次汇总 API

#### GET /api/shifts/current/summary

获取当前班次的实时汇总数据。

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `station_id` | UUID | 否 | 站点ID，默认当前用户站点 |

**响应示例：**
```json
{
  "success": true,
  "data": {
    "shift": {
      "id": "shift-001",
      "name": "早班",
      "startTime": "2026-02-15T06:00:00Z",
      "endTime": "2026-02-15T14:00:00Z",
      "supervisor": "张建国"
    },
    "summary": {
      "totalAmount": 13373.00,
      "totalOrders": 69,
      "netAmount": 13373.00,
      "refundAmount": 0,
      "refundOrders": 0
    },
    "fuelSummary": [
      {"fuelType": "LNG", "fuelTypeName": "LNG液化天然气", "quantity": 1520.5, "amount": 9123.00, "unit": "kg"},
      {"fuelType": "CNG", "fuelTypeName": "CNG压缩天然气", "quantity": 850.0, "amount": 4250.00, "unit": "m³"}
    ],
    "paymentSummary": [
      {"paymentMethod": "cash", "paymentMethodName": "现金", "amount": 3500.00, "orders": 15},
      {"paymentMethod": "wechat", "paymentMethodName": "微信支付", "amount": 5200.00, "orders": 28},
      {"paymentMethod": "alipay", "paymentMethodName": "支付宝", "amount": 3100.00, "orders": 18},
      {"paymentMethod": "ic_card", "paymentMethodName": "IC卡", "amount": 1573.00, "orders": 8}
    ],
    "lastUpdated": "2026-02-15T10:30:00Z"
  }
}
```

---

### 3.2 交接班 API

#### POST /api/handovers

发起交接班。

**请求体：**
```json
{
  "stationId": "station-001",
  "shiftId": "shift-001",
  "shiftDate": "2026-02-15",
  "remarks": "设备运行正常，库存充足"
}
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "handover-001",
    "handoverNo": "JJ-BJ001-20260215-001",
    "status": "initiated",
    "precheck": {
      "pendingOrders": {"result": "pass", "value": 0},
      "unsettledCash": {"result": "warning", "value": 3500.00},
      "cashDifference": {"result": "pass", "value": 0},
      "abnormalOrders": {"result": "pass", "value": 0}
    }
  }
}
```

#### GET /api/handovers/{id}/precheck

获取交接班预检结果。

**响应示例：**
```json
{
  "success": true,
  "data": {
    "checkItems": [
      {
        "type": "pending_orders",
        "name": "未完成订单",
        "result": "pass",
        "value": "0",
        "message": "无待处理订单"
      },
      {
        "type": "unsettled_cash",
        "name": "未解缴现金",
        "result": "warning",
        "value": "3500.00",
        "message": "有 ¥3500.00 现金待解缴"
      },
      {
        "type": "cash_difference",
        "name": "现金差异",
        "result": "pass",
        "value": "0",
        "message": "现金已平账"
      },
      {
        "type": "abnormal_orders",
        "name": "异常订单",
        "result": "pass",
        "value": "0",
        "message": "无异常订单"
      }
    ],
    "canProceed": true,
    "warnings": 1
  }
}
```

#### PUT /api/handovers/{id}/complete

确认接班，完成交接。

**请求体：**
```json
{
  "receivedBy": "emp-004"
}
```

#### POST /api/handovers/{id}/force

强制交接班（需站长权限）。

**请求体：**
```json
{
  "reason": "接班人员迟到，紧急班次切换"
}
```

---

### 3.3 现金解缴 API

#### POST /api/settlements

创建现金解缴记录。

**请求体：**
```json
{
  "handoverId": "handover-001",
  "actualAmount": 3480.00,
  "settlementMethod": "safe",
  "differenceReason": "change_error",
  "differenceNote": "找零时多找了20元"
}
```

#### PUT /api/settlements/{id}/review

审核现金解缴。

**请求体：**
```json
{
  "approved": true,
  "note": "差额在允许范围内，审核通过"
}
```

#### POST /api/settlements/{id}/documents

上传解缴凭证。

**Content-Type:** `multipart/form-data`

---

### 3.4 交接班报表 API

#### GET /api/handovers

获取交接班历史列表。

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `station_id` | UUID | 否 | 站点ID |
| `shift_id` | UUID | 否 | 班次ID |
| `start_date` | date | 否 | 开始日期 |
| `end_date` | date | 否 | 结束日期 |
| `handover_by` | UUID | 否 | 交班人ID |
| `status` | string | 否 | 状态筛选 |
| `page` | int | 否 | 页码，默认1 |
| `page_size` | int | 否 | 每页数量，默认20 |

**响应示例：**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "handover-001",
        "handoverNo": "JJ-BJ001-20260215-001",
        "stationName": "北京朝阳加气站",
        "shiftName": "早班",
        "shiftDate": "2026-02-15",
        "handoverTime": "2026-02-15T14:05:00Z",
        "handoverByName": "张建国",
        "receivedByName": "李强",
        "totalAmount": 13373.00,
        "totalOrders": 69,
        "status": "completed",
        "hasIssues": false
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

#### GET /api/handovers/{id}

获取交接班详情。

#### GET /api/handovers/export

导出交接班报表。

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `format` | string | 是 | 导出格式：excel/pdf |
| `start_date` | date | 是 | 开始日期 |
| `end_date` | date | 是 | 结束日期 |
| `station_id` | UUID | 否 | 站点ID |

---

## 4. TypeScript 类型定义

```typescript
// 交接班状态
export type HandoverStatus = 'initiated' | 'pending_review' | 'completed' | 'cancelled';

// 解缴状态
export type SettlementStatus = 'pending' | 'approved' | 'rejected';

// 差异类型
export type DifferenceType = 'surplus' | 'shortage' | 'balanced';

// 差异原因
export type DifferenceReason = 'change_error' | 'receipt_lost' | 'equipment_fault' | 'pending_verify' | 'other';

// 解缴方式
export type SettlementMethod = 'safe' | 'bank' | 'manager';

// 异常类型
export type IssueType = 'equipment' | 'inventory' | 'cash' | 'safety' | 'other';

// 异常严重程度
export type IssueSeverity = 'low' | 'normal' | 'high' | 'critical';

// 支付方式
export type PaymentMethod = 'cash' | 'wechat' | 'alipay' | 'unionpay' | 'ic_card' | 'member_card' | 'credit' | 'other';

// 预检结果
export type PrecheckResult = 'pass' | 'warning' | 'fail';

// 交接班记录
export interface ShiftHandover {
  id: string;
  handoverNo: string;
  stationId: string;
  stationName?: string;
  shiftId: string;
  shiftName?: string;
  shiftDate: string;
  handoverTime: string;
  handoverBy: string;
  handoverByName?: string;
  receivedBy?: string;
  receivedByName?: string;
  status: HandoverStatus;
  isForced: boolean;
  forcedBy?: string;
  forcedReason?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  summary?: ShiftSummary;
  settlement?: CashSettlement;
  issues?: HandoverIssue[];
}

// 班次汇总
export interface ShiftSummary {
  id: string;
  handoverId: string;
  totalAmount: number;
  totalOrders: number;
  totalRefundAmount: number;
  totalRefundOrders: number;
  netAmount: number;
  fuelSummary: FuelSummaryItem[];
  paymentSummary: PaymentSummaryItem[];
  createdAt: string;
}

// 燃料汇总项
export interface FuelSummaryItem {
  fuelType: string;
  fuelTypeName: string;
  quantity: number;
  amount: number;
  unit: string;
}

// 支付方式汇总项
export interface PaymentSummaryItem {
  paymentMethod: PaymentMethod;
  paymentMethodName: string;
  amount: number;
  orders: number;
}

// 现金解缴
export interface CashSettlement {
  id: string;
  settlementNo: string;
  handoverId: string;
  stationId: string;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  differenceType: DifferenceType;
  differenceReason?: DifferenceReason;
  differenceNote?: string;
  settlementMethod: SettlementMethod;
  settledBy: string;
  settledByName?: string;
  status: SettlementStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNote?: string;
  documents?: SettlementDocument[];
  createdAt: string;
  updatedAt: string;
}

// 解缴凭证
export interface SettlementDocument {
  id: string;
  settlementId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  uploadedBy: string;
  createdAt: string;
}

// 交接班异常
export interface HandoverIssue {
  id: string;
  handoverId: string;
  issueType: IssueType;
  severity: IssueSeverity;
  description: string;
  reportedBy: string;
  reportedByName?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

// 预检项
export interface PrecheckItem {
  type: string;
  name: string;
  result: PrecheckResult;
  value: string;
  message: string;
  detail?: Record<string, unknown>;
}

// 预检结果汇总
export interface PrecheckSummary {
  checkItems: PrecheckItem[];
  canProceed: boolean;
  warnings: number;
  failures: number;
}

// 当前班次实时数据
export interface CurrentShiftData {
  shift: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    supervisor: string;
  };
  summary: {
    totalAmount: number;
    totalOrders: number;
    netAmount: number;
    refundAmount: number;
    refundOrders: number;
  };
  fuelSummary: FuelSummaryItem[];
  paymentSummary: PaymentSummaryItem[];
  lastUpdated: string;
}
```

---

## 5. 模块依赖

### 5.1 依赖的外部模块

| 模块 | 依赖内容 | 说明 |
|------|----------|------|
| 站点管理 (1.1) | Station, Shift, Employee | 站点、班次定义、员工信息 |
| 订单与交易 (2.2) | Order | 班次内的订单数据 |
| 系统权限 (9.1) | User, Role, Permission | 用户认证、权限控制 |

### 5.2 被依赖的模块

| 模块 | 依赖内容 | 说明 |
|------|----------|------|
| 财务管理 (5.1) | CashSettlement | 现金解缴数据同步至财务 |

---

## 6. 安全与权限

### 6.1 权限矩阵

| 权限代码 | 说明 | 站长 | 班组长 | 收银员 | 财务 |
|----------|------|------|--------|--------|------|
| `handover:view_summary` | 查看班次汇总 | ✓ | ✓ | ✓ | ✓ |
| `handover:initiate` | 发起交接班 | ✓ | ✓ | ✗ | ✗ |
| `handover:complete` | 确认接班 | ✓ | ✓ | ✗ | ✗ |
| `handover:force` | 强制交接班 | ✓ | ✗ | ✗ | ✗ |
| `settlement:create` | 登记现金解缴 | ✓ | ✓ | ✗ | ✗ |
| `settlement:review` | 审核现金解缴 | ✓ | ✗ | ✗ | ✓ |
| `handover:view_history` | 查看交接班历史 | ✓ | ✓ | ✗ | ✓ |
| `handover:export` | 导出报表 | ✓ | ✗ | ✗ | ✓ |

### 6.2 数据范围限制

| 角色 | 数据范围 |
|------|----------|
| 站长 | 本站点所有交接班数据 |
| 班组长 | 本站点所有交接班数据 |
| 收银员 | 仅当前班次汇总数据 |
| 财务 | 所有站点的交接班数据（只读） |

---

*创建时间：2026-02-15*
*最后更新：2026-02-15*
