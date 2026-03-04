# 订单与交易 — 架构设计

**模块：** 能源交易 > 订单与交易 (2.2)
**基于：** user-stories.md v1.0 + ui-schema.md v1.0
**设计日期：** 2026-02-25
**状态：** ✅ 已确认（2026-02-25）

---

## 0. 设计原则

- **金额精度**：所有金额字段使用 `NUMERIC(12,2)`，最小单位 0.01 元
- **数量精度**：充装量使用 `NUMERIC(10,3)`，最小单位 0.001 kg
- **订单全留痕**：所有订单状态变更产生操作日志
- **支付幂等**：支付操作保证幂等性，防止重复支付
- **退款审批**：所有退款必须经过审批才能执行
- **跨阶段预留**：会员信息、车辆信息、IC卡支付数据模型预先设计，UI 使用 mock 数据

---

## 1. 核心实体与数据模型

### 1.1 实体关系图

```
                    ┌────────────────┐
                    │    Station     │ (1.1)
                    │    FuelType    │ (1.1)
                    │    Nozzle      │ (1.1)
                    │    Shift       │ (1.1)
                    │ StationEmployee│ (1.1)
                    └───────┬────────┘
                            │
                            ▼
              ┌──────────────────────┐
              │    FuelingOrder      │ ← 核心实体
              │──────────────────────│
              │ id                   │
              │ order_no             │ ← 唯一，格式: ST001-20260225-0001
              │ station_id (FK)      │ → Station
              │ nozzle_id (FK)       │ → Nozzle
              │ fuel_type_id (FK)    │ → FuelType
              │ shift_id (FK?)       │ → Shift
              │ operator_id (FK?)    │ → StationEmployee
              │ unit_price           │ ← 下单时锁定价格
              │ quantity             │ ← 充装量(kg)
              │ total_amount         │ ← 订单金额
              │ discount_amount      │ ← 优惠金额
              │ payable_amount       │ ← 实付金额
              │ order_status         │ ← 状态机（见 §3）
              │ vehicle_plate_no     │ ← 车牌号（可选）
              │ member_id (FK?)      │ ← ⚠️ Phase 4 mock
              │ enterprise_id (FK?)  │ ← ⚠️ Phase 4 mock
              │ notes                │
              │ created_at           │
              │ updated_at           │
              └──────┬───────┬───────┘
                     │       │
            1:N      │       │  1:N
                     ▼       ▼
    ┌────────────────────┐  ┌──────────────────┐
    │   PaymentRecord    │  │   RefundRecord   │
    │────────────────────│  │──────────────────│
    │ id                 │  │ id               │
    │ order_id (FK)      │  │ order_id (FK)    │
    │ payment_method     │  │ refund_type      │ ← full / partial
    │ amount             │  │ refund_amount    │
    │ transaction_ref    │  │ refund_reason    │
    │ payment_status     │  │ refund_status    │ ← 状态机（见 §3）
    │ paid_at            │  │ applied_by (FK)  │
    │ created_at         │  │ approved_by (FK?)│
    └────────────────────┘  │ approved_at      │
                            │ created_at       │
                            └──────────────────┘

    ┌──────────────────┐       ┌──────────────────┐
    │  OrderTag        │       │  OrderTagConfig  │
    │──────────────────│       │──────────────────│
    │ id               │       │ id               │
    │ order_id (FK)    │       │ name             │
    │ tag_name         │       │ station_id (FK)  │
    │ created_at       │       │ sort_order       │
    └──────────────────┘       │ created_at       │
                               └──────────────────┘
```

### 1.2 实体三问分析

#### FuelingOrder（充装订单）

```
❓ 问题 1 — 自带数据
   - id: UUID 主键
   - order_no: 唯一订单号（格式: 站点编码-日期-序号，如 ST001-20260225-0001）
   - station_id: 所属站点（跨模块 FK → Station）
   - nozzle_id: 使用枪号（跨模块 FK → Nozzle）
   - fuel_type_id: 燃料类型（跨模块 FK → FuelType）
   - shift_id: 所属班次（跨模块 FK → Shift，可选）
   - operator_id: 操作员/收银员（跨模块 FK → StationEmployee，可选）
   - unit_price: 下单时锁定的单价（NUMERIC(10,2)，元/kg）
   - quantity: 充装量（NUMERIC(10,3)，kg）
   - total_amount: 订单金额 = unit_price × quantity（NUMERIC(12,2)）
   - discount_amount: 优惠金额（NUMERIC(12,2)，默认 0）
   - payable_amount: 实付金额 = total_amount - discount_amount（NUMERIC(12,2)）
   - order_status: 订单状态（枚举，见 §3.1）
   - vehicle_plate_no: 车牌号（VARCHAR(20)，可选）
   - member_id: 会员 ID（UUID，⚠️ Phase 4 mock，可选）
   - enterprise_id: 企业 ID（UUID，⚠️ Phase 4 mock，可选）
   - notes: 备注（TEXT，可选）
   - created_at, updated_at: 时间戳

❓ 问题 2 — 创建触发方式
   [x] 站端 POS 自动创建：设备数据采集生成（主要来源）
   [x] 管理后台手动创建：站长通过管理后台补录订单
   → 创建时自动获取当前价格（来自 2.1 价格管理 API）
   → 创建时自动生成唯一订单号

❓ 问题 3 — 副作用与生命周期约束
   - 创建时：unit_price 从价格管理模块获取当前生效价格并锁定
   - 支付时：创建 PaymentRecord，订单状态变更为 paid
   - 退款时：创建 RefundRecord，进入退款审批流程
   - 取消时：仅 filling/pending_payment 状态可取消
   - 唯一约束：order_no 全局唯一
   - 删除限制：订单不可物理删除，仅可取消
```

#### PaymentRecord（支付记录）

```
❓ 问题 1 — 自带数据
   - id: UUID 主键
   - order_id: 关联订单（FK → FuelingOrder）
   - payment_method: 支付方式（枚举: cash/wechat/alipay/unionpay/member_card/ic_card/credit/etc）
   - amount: 支付金额（NUMERIC(12,2)）
   - transaction_ref: 第三方交易流水号（VARCHAR(64)，可选）
   - payment_status: 支付状态（枚举: pending/success/failed/cancelled）
   - paid_at: 支付成功时间
   - created_at: 记录创建时间

❓ 问题 2 — 创建触发方式
   [x] 收银操作：收银员在支付面板选择支付方式并确认
   [x] 补单操作：站长为异常订单补录支付信息
   → 一笔订单可有多条 PaymentRecord（混合支付场景）

❓ 问题 3 — 副作用与生命周期约束
   - 创建时：若单笔/累计支付金额 ≥ payable_amount，订单状态自动变更为 paid
   - 退款时：退款金额不能超过已支付总额
   - 不可修改：支付记录创建后不可修改，仅可通过退款冲抵
```

#### RefundRecord（退款记录）

```
❓ 问题 1 — 自带数据
   - id: UUID 主键
   - order_id: 关联订单（FK → FuelingOrder）
   - refund_type: 退款类型（枚举: full/partial）
   - refund_amount: 退款金额（NUMERIC(12,2)）
   - refund_reason: 退款原因（TEXT）
   - refund_status: 退款状态（枚举，见 §3.2）
   - applied_by: 申请人（FK → StationEmployee）
   - approved_by: 审批人（FK → StationEmployee，可选）
   - approved_at: 审批时间
   - refunded_at: 退款执行时间
   - rejection_reason: 驳回原因（TEXT，可选）
   - created_at: 申请时间

❓ 问题 2 — 创建触发方式
   [x] 收银员发起退款申请
   → 全额退款时 refund_amount 自动填入 payable_amount
   → 部分退款时 refund_amount ≤ (payable_amount - 已退金额)

❓ 问题 3 — 副作用与生命周期约束
   - 审批通过后：订单状态根据退款类型变更（全额→refunded，部分→保持paid）
   - 驳回后：退款状态变更为 rejected，订单状态不变
   - 不可修改：退款记录创建后不可修改金额
```

---

## 2. API 端点设计

### 2.1 聚合接口分析

```
页面：订单列表页（OrderList）
需要的数据：
  - 订单列表 → FuelingOrder
  - 统计数据 → 聚合计算
  - 支付明细 → PaymentRecord（在详情中）
判断：[x] 统计需聚合计算 → 需要独立统计接口
聚合接口：GET /api/v1/stations/:stationId/fueling-orders/statistics

页面：异常订单页（ExceptionOrderList）
需要的数据：
  - 异常订单列表 → FuelingOrder (status=exception)
  - 统计数据 → 按异常类型聚合
判断：[x] 可作为 fueling-orders 的筛选子集，但需独立统计
```

### 2.2 端点清单

#### 充装订单

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/fueling-orders` | 订单列表 | Query: `status`, `paymentMethod`, `fuelTypeId`, `nozzleNo`, `dateFrom`, `dateTo`, `keyword`, `page`, `pageSize` / Resp: `items[]`, `pagination` |
| GET | `/api/v1/stations/:stationId/fueling-orders/:id` | 订单详情 | Resp: 含 paymentRecords[], refundRecords[], tags[] |
| POST | `/api/v1/stations/:stationId/fueling-orders` | 手动创建订单 | Body: `nozzleId`, `quantity`, `vehiclePlateNo?`, `notes?` → 内部获取当前价格 |
| PATCH | `/api/v1/stations/:stationId/fueling-orders/:id/cancel` | 取消订单 | Body: `cancelReason` → 仅 filling/pending_payment 可取消 |
| PATCH | `/api/v1/stations/:stationId/fueling-orders/:id/notes` | 更新备注 | Body: `notes` |
| GET | `/api/v1/stations/:stationId/fueling-orders/statistics` | 订单统计 | Query: `dimension` (today/shift), `shiftId?` / Resp: `totalOrders`, `totalAmount`, `totalQuantity`, `pendingPaymentCount`, `paymentMethodBreakdown` |
| GET | `/api/v1/stations/:stationId/fueling-orders/export` | 导出订单 | Query: 同列表筛选参数 / Resp: Excel 文件流 [MVP+] |

#### 异常订单

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/fueling-orders/exceptions` | 异常订单列表 | Query: `exceptionType`, `handleStatus`, `dateFrom`, `dateTo`, `page`, `pageSize` / Resp: `items[]`, `pagination`, `statistics` |
| PATCH | `/api/v1/stations/:stationId/fueling-orders/:id/suspend` | 挂起异常订单 | — |
| PATCH | `/api/v1/stations/:stationId/fueling-orders/:id/unsuspend` | 取消挂起 | — |
| POST | `/api/v1/stations/:stationId/fueling-orders/:id/supplement` | 补单 | Body: `paymentMethod`, `amount`, `supplementReason` |
| PATCH | `/api/v1/stations/:stationId/fueling-orders/:id/supplement-approve` | 补单审核通过 | [MVP+] |
| PATCH | `/api/v1/stations/:stationId/fueling-orders/:id/supplement-reject` | 补单审核驳回 | Body: `reason` [MVP+] |

#### 支付

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| POST | `/api/v1/stations/:stationId/fueling-orders/:id/pay` | 支付（单一方式） | Body: `paymentMethod`, `amount`, `receivedAmount?`（现金） |
| POST | `/api/v1/stations/:stationId/fueling-orders/:id/pay-mixed` | 混合支付 | Body: `payments[]: { paymentMethod, amount }[]` [MVP+] |

#### 退款

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/refunds` | 退款记录列表 | Query: `refundStatus`, `dateFrom`, `dateTo`, `keyword`, `page`, `pageSize` |
| POST | `/api/v1/stations/:stationId/fueling-orders/:id/refund` | 发起退款申请 | Body: `refundType` (full/partial), `refundAmount`, `refundReason` |
| PATCH | `/api/v1/stations/:stationId/refunds/:id/approve` | 退款审批通过 | — |
| PATCH | `/api/v1/stations/:stationId/refunds/:id/reject` | 退款审批驳回 | Body: `reason` |

#### 标签管理

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/order-tags` | 标签配置列表 | [MVP+] |
| POST | `/api/v1/stations/:stationId/order-tags` | 创建标签 | Body: `name` [MVP+] |
| PUT | `/api/v1/stations/:stationId/order-tags/:id` | 更新标签 | Body: `name` [MVP+] |
| DELETE | `/api/v1/stations/:stationId/order-tags/:id` | 删除标签 | [MVP+] |
| POST | `/api/v1/stations/:stationId/fueling-orders/:id/tags` | 为订单添加标签 | Body: `tagName` [MVP+] |
| DELETE | `/api/v1/stations/:stationId/fueling-orders/:orderId/tags/:tagId` | 移除订单标签 | [MVP+] |

### 2.3 权限矩阵

> ⚠️ **Phase 7 依赖（9.1 角色权限管理）：** MVP 阶段前端硬编码角色判断，Phase 7 对接 RBAC 系统。

| 权限代码 | 说明 | 默认角色 |
|----------|------|----------|
| `order:list` | 查看订单列表 | `cashier`, `station_master`, `ops_manager`, `finance`, `admin` |
| `order:detail` | 查看订单详情 | 同上 |
| `order:create` | 手动创建订单 | `station_master`, `admin` |
| `order:cancel` | 取消订单 | `cashier`, `station_master`, `admin` |
| `order:pay` | 收银/支付操作 | `cashier`, `station_master`, `admin` |
| `order:exception:handle` | 处理异常订单 | `station_master`, `ops_manager`, `admin` |
| `order:supplement` | 补单操作 | `station_master`, `admin` |
| `order:supplement:approve` | 补单审核 | `ops_manager`, `admin` |
| `order:refund:apply` | 发起退款申请 | `cashier`, `station_master`, `admin` |
| `order:refund:approve` | 退款审批 | `station_master`, `ops_manager`, `admin` |
| `order:export` | 导出订单数据 | `finance`, `admin` |
| `order:tag:manage` | 管理标签配置 | `station_master`, `admin` |

---

## 3. 业务规则与状态机

### 3.1 订单状态机

```
                ┌──────────┐
                │ filling  │ ← 加注中（设备采集/手动创建初始状态）
                └────┬─────┘
                     │ 加注完成/手动创建
                     ▼
            ┌──────────────────┐
            │ pending_payment  │ ← 待支付
            └───┬──────┬───┬──┘
                │      │   │
     支付成功   │      │   │ 取消
                ▼      │   ▼
           ┌────────┐  │  ┌───────────┐
           │  paid  │  │  │ cancelled │
           └───┬────┘  │  └───────────┘
               │       │
    全额退款   │       │ 异常标记
               ▼       ▼
        ┌──────────┐  ┌───────────┐
        │ refunded │  │ exception │
        └──────────┘  └─────┬─────┘
                            │
                  ┌─────────┼─────────┐
                  │         │         │
               挂起      补单      关闭
                  ▼         ▼         ▼
          ┌───────────┐ ┌───────┐ ┌────────┐
          │ suspended │ │ paid  │ │ closed │
          └───────────┘ └───────┘ └────────┘
```

**状态转换规则：**

| 当前状态 | 可转换到 | 触发条件 |
|---------|---------|---------|
| filling | pending_payment | 加注完成 |
| filling | cancelled | 用户取消 |
| pending_payment | paid | 支付成功 |
| pending_payment | cancelled | 用户取消 |
| pending_payment | exception | 超时/掉电 |
| paid | refunded | 全额退款审批通过 |
| paid | paid | 部分退款（状态不变） |
| exception | suspended | 站长挂起 |
| exception | paid | 补单成功 |
| exception | closed | 关闭处理 |
| suspended | exception | 取消挂起 |
| suspended | paid | 补单成功 |

### 3.2 退款状态机

```
┌─────────┐  提交  ┌──────────────────┐  通过  ┌──────────┐
│ (入口)  │ ────→ │ pending_approval │ ────→ │ refunded │
└─────────┘       └────────┬─────────┘       └──────────┘
                           │
                        驳回│
                           ▼
                    ┌──────────┐
                    │ rejected │
                    └──────────┘
```

### 3.3 核心业务规则

| # | 规则 | 说明 |
|---|------|------|
| BR-01 | 订单号全局唯一 | 格式: 站点编码-日期(YYYYMMDD)-4位序号，同站同日递增 |
| BR-02 | 价格锁定 | 订单创建时从价格管理 API 获取当前价格，锁定在 unit_price 字段，后续价格变更不影响已创建订单 |
| BR-03 | 退款金额约束 | 退款金额 ≤ (payable_amount - 已退总额)，部分退款可多次 |
| BR-04 | 取消约束 | 仅 filling/pending_payment 状态可取消；已支付需走退款流程 |
| BR-05 | 补单仅限异常 | 补单操作仅对 exception/suspended 状态订单可用 |
| BR-06 | 挂起不结算 | suspended 状态订单不参与班次结算统计 |
| BR-07 | 支付幂等 | 同一笔订单同一笔支付不可重复提交（通过 transaction_ref 去重） |

---

## 4. 跨模块依赖

| 本模块实体/功能 | 依赖模块 | 依赖实体/接口 | 依赖类型 | 说明 |
|---------------|---------|-------------|---------|------|
| FuelingOrder.station_id | 1.1 站点管理 | Station | FK 引用 | 订单所属站点 |
| FuelingOrder.nozzle_id | 1.1 站点管理 | Nozzle | FK 引用 | 使用枪号 |
| FuelingOrder.fuel_type_id | 1.1 站点管理 | FuelType | FK 引用 | 燃料类型 |
| FuelingOrder.shift_id | 1.1 站点管理 | Shift | FK 引用 | 所属班次 |
| FuelingOrder.operator_id | 1.1 站点管理 | StationEmployee | FK 引用 | 操作员 |
| 订单统计（按班次） | 1.2 交接班管理 | Shift / ShiftHandover | 数据引用 | 班次维度统计 |
| 价格获取 | 2.1 价格管理 | GET /api/v1/stations/:id/price-overview | API 调用 | 创建订单时获取当前价格 |
| 会员价应用 | 2.1 + 3.1 | member-price-rules | API 调用 | ⚠️ Phase 4 mock |
| 协议价应用 | 2.1 + 3.2 | price-agreements | API 调用 | ⚠️ Phase 4 mock |
| 会员信息 | 3.1 会员管理 | Member | 数据引用 | ⚠️ Phase 4 mock |
| 车辆信息 | 3.4 车辆管理 | Vehicle | 数据引用 | ⚠️ Phase 4 mock |
| IC 卡支付 | 3.3 IC 卡管理 | IC Card | 支付接口 | ⚠️ Phase 4 mock |

### 本模块向外暴露的接口

| 接口 | 消费模块 | 说明 |
|------|---------|------|
| GET /api/v1/stations/:id/fueling-orders | 1.2 交接班管理 | 班次订单汇总 |
| GET /api/v1/stations/:id/fueling-orders/statistics | 7.1 数据分析 | 经营看板数据 |
| GET /api/v1/stations/:id/fueling-orders | 5.1 财务管理 | 财务对账 |

---

## 5. Mock 数据规格

### 5.1 FuelingOrder Mock 数据

| 数据量 | 覆盖范围 | 说明 |
|--------|---------|------|
| 30 条 | 各状态覆盖 | filling(2), pending_payment(3), paid(15), completed(5), cancelled(2), exception(2), refunded(1) |
| 支付方式 | 4 种 MVP | cash(10), wechat(8), alipay(7), unionpay(5) |
| 枪号 | 4 个 | 01~04 号枪 |
| 燃料类型 | 3 种 | LNG, CNG, L-CNG |
| 时间分布 | 近 7 天 | 每天 3-5 条 |

### 5.2 PaymentRecord Mock 数据

| 数据量 | 说明 |
|--------|------|
| 25 条 | 对应 paid/completed/refunded 订单，1:1 关系（MVP 无混合支付） |

### 5.3 RefundRecord Mock 数据

| 数据量 | 覆盖范围 |
|--------|---------|
| 5 条 | pending_approval(2), refunded(2), rejected(1) |

### 5.4 OrderTagConfig Mock 数据

| 数据量 | 示例 |
|--------|------|
| 5 条 | 滴滴, 出租车, 物流车队, 自驾, VIP |

---

## 6. Database Schema (MySQL 8.0)

```sql
-- ============================================================
-- ENUM 类型
-- ============================================================

-- ============================================================
-- 核心表
-- ============================================================

-- 充装订单
CREATE TABLE fueling_order (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_no        VARCHAR(30) NOT NULL UNIQUE,
  station_id      CHAR(36) NOT NULL,   -- → stations.id (1.1)
  nozzle_id       CHAR(36) NOT NULL,   -- → nozzles.id (1.1)
  fuel_type_id    CHAR(36) NOT NULL,   -- → fuel_types.id (1.1)
  shift_id        CHAR(36),            -- → shifts.id (1.1)
  operator_id     CHAR(36),            -- → station_employees.id (1.1)
  unit_price      NUMERIC(10,2) NOT NULL,
  quantity        NUMERIC(10,3) NOT NULL CHECK (quantity > 0),
  total_amount    NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  payable_amount  NUMERIC(12,2) NOT NULL CHECK (payable_amount >= 0),
  order_status    ENUM('filling', 'pending_payment', 'paid', 'completed', 'cancelled', 'exception', 'suspended', 'refunded', 'closed') NOT NULL DEFAULT 'pending_payment',
  exception_type  ENUM('power_loss', 'timeout', 'amount_error', 'other'),
  exception_reason TEXT,
  handle_status   ENUM('pending', 'suspended', 'supplemented', 'pending_review', 'closed'),
  vehicle_plate_no VARCHAR(20),
  member_id       CHAR(36),            -- ⚠️ Phase 4: → members.id
  enterprise_id   CHAR(36),            -- ⚠️ Phase 4: → enterprises.id
  notes           TEXT,
  created_by      CHAR(36),            -- 创建人（手动创建时记录）
  cancelled_at    DATETIME,
  cancel_reason   TEXT,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Column comments for fueling_order:
-- ALTER TABLE fueling_order MODIFY COLUMN station_id ... COMMENT '跨模块引用 → 1.1 stations.id';
-- ALTER TABLE fueling_order MODIFY COLUMN nozzle_id ... COMMENT '跨模块引用 → 1.1 nozzles.id';
-- ALTER TABLE fueling_order MODIFY COLUMN fuel_type_id ... COMMENT '跨模块引用 → 1.1 fuel_types.id';
-- ALTER TABLE fueling_order MODIFY COLUMN shift_id ... COMMENT '跨模块引用 → 1.1 shifts.id';
-- ALTER TABLE fueling_order MODIFY COLUMN member_id ... COMMENT '⚠️ Phase 4 回补: → 3.1 members.id';
-- ALTER TABLE fueling_order MODIFY COLUMN enterprise_id ... COMMENT '⚠️ Phase 4 回补: → 3.2 enterprises.id';

CREATE INDEX idx_fueling_order_station ON fueling_order(station_id);
CREATE INDEX idx_fueling_order_created ON fueling_order(created_at DESC);
CREATE INDEX idx_fueling_order_status ON fueling_order(order_status);
CREATE INDEX idx_fueling_order_shift ON fueling_order(shift_id);

-- 支付记录
CREATE TABLE payment_record (
  id              CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id        CHAR(36) NOT NULL REFERENCES fueling_order(id) ON DELETE RESTRICT,
  payment_method  ENUM('cash', 'wechat', 'alipay', 'unionpay', 'member_card', 'ic_card', 'credit', 'etc', 'other') NOT NULL,
  amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  transaction_ref VARCHAR(64),
  payment_status  ENUM('pending', 'success', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  paid_at         DATETIME,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_payment_record_order ON payment_record(order_id);

-- 退款记录
CREATE TABLE refund_record (
  id               CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id         CHAR(36) NOT NULL REFERENCES fueling_order(id) ON DELETE RESTRICT,
  refund_type      ENUM('full', 'partial') NOT NULL,
  refund_amount    NUMERIC(12,2) NOT NULL CHECK (refund_amount > 0),
  refund_reason    TEXT NOT NULL,
  refund_status    ENUM('pending_approval', 'refunded', 'rejected') NOT NULL DEFAULT 'pending_approval',
  applied_by       CHAR(36) NOT NULL,  -- → station_employees.id
  approved_by      CHAR(36),           -- → station_employees.id
  approved_at      DATETIME,
  refunded_at      DATETIME,
  rejection_reason TEXT,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_refund_record_order ON refund_record(order_id);
CREATE INDEX idx_refund_record_status ON refund_record(refund_status);

-- 订单标签关联
CREATE TABLE order_tag (
  id         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  order_id   CHAR(36) NOT NULL REFERENCES fueling_order(id) ON DELETE CASCADE,
  tag_name   VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (order_id, tag_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 标签配置
CREATE TABLE order_tag_config (
  id         CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  station_id CHAR(36) NOT NULL,  -- → stations.id
  name       VARCHAR(50) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (station_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 7. 功能需求覆盖检查

| User Story | 覆盖实体 | 覆盖 API | 状态 |
|-----------|---------|---------|------|
| US-001 订单列表 | FuelingOrder | GET /fueling-orders | ✅ |
| US-002 筛选 | FuelingOrder | GET /fueling-orders (query) | ✅ |
| US-003 搜索 | FuelingOrder | GET /fueling-orders (keyword) | ✅ |
| US-004 订单详情 | FuelingOrder + PaymentRecord + RefundRecord | GET /fueling-orders/:id | ✅ |
| US-005 订单统计 | 聚合 | GET /fueling-orders/statistics | ✅ |
| US-006 状态展示 | FuelingOrder.order_status | — | ✅ |
| US-007 创建订单 | FuelingOrder | POST /fueling-orders | ✅ |
| US-008 取消订单 | FuelingOrder | PATCH /fueling-orders/:id/cancel | ✅ |
| US-009 支付 | PaymentRecord | POST /fueling-orders/:id/pay | ✅ |
| US-010 混合支付 | PaymentRecord | POST /fueling-orders/:id/pay-mixed | ✅ |
| US-011 小票预览 | — | 前端展示 | ✅ |
| US-012 异常订单列表 | FuelingOrder | GET /fueling-orders/exceptions | ✅ |
| US-013 挂起 | FuelingOrder | PATCH /fueling-orders/:id/suspend | ✅ |
| US-014 补单 | PaymentRecord | POST /fueling-orders/:id/supplement | ✅ |
| US-015 补单审核 | FuelingOrder | PATCH /supplement-approve/reject | ✅ |
| US-016 退款申请 | RefundRecord | POST /fueling-orders/:id/refund | ✅ |
| US-017 退款审批 | RefundRecord | PATCH /refunds/:id/approve/reject | ✅ |
| US-018 退款记录 | RefundRecord | GET /refunds | ✅ |
| US-019 标签/备注 | OrderTag, FuelingOrder.notes | POST /tags, PATCH /notes | ✅ |
| US-020 标签管理 | OrderTagConfig | GET/POST/PUT/DELETE /order-tags | ✅ |
| US-021 导出 | FuelingOrder | GET /fueling-orders/export | ✅ |

**覆盖率：21/21 (100%)**

---

*文档生成时间：2026-02-25*
*基于：data-model-design.md Skill + architecture 设计规范*
