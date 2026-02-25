# 价格管理 — 架构设计

**模块：** 能源交易 > 价格管理 (2.1)
**基于：** user-stories.md v1.0（✅ 已确认）
**设计日期：** 2026-02-24
**状态：** 待确认

---

## 0. 设计原则

- **价格精度**：所有价格字段使用 `NUMERIC(10,2)`，最小单位 0.01 元/千克（或元/升）
- **以燃料类型为基准**：每站每类燃料有唯一基准价，枪可设独立覆盖价
- **调价全留痕**：所有价格变更产生不可篡改的调价记录
- **防御优先**：调价前必须通过幅度检查 + 二次确认
- **跨阶段预留**：会员专享价、大客户协议数据模型预先设计，UI 使用 mock 数据

---

## 1. 核心实体与数据模型

### 1.1 实体关系图

```
                    ┌────────────────┐
                    │    Station     │ (1.1)
                    │    FuelType    │ (1.1)
                    │    Nozzle      │ (1.1)
                    └───────┬────────┘
                            │
           ┌────────────────┼────────────────────────────────┐
           │                │                                │
           ▼                ▼                                ▼
┌──────────────────┐ ┌────────────────────┐ ┌──────────────────────┐
│  FuelTypePrice   │ │ NozzlePriceOverride│ │ PriceDefenseConfig   │
│──────────────────│ │────────────────────│ │──────────────────────│
│ station_id (FK)  │ │ nozzle_id (FK)     │ │ station_id (FK/NULL) │
│ fuel_type_id(FK) │ │ station_id (FK)    │ │ fuel_type_id(FK/NULL)│
│ base_price       │ │ override_price     │ │ max_increase_pct     │
│ effective_from   │ │ effective_from     │ │ max_decrease_pct     │
│ status           │ │ created_by (FK)    │ │ require_approval     │
└───────┬──────────┘ └────────────────────┘ └──────────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────┐
│ PriceAdjustment  │
│──────────────────│
│ station_id (FK)  │
│ fuel_type_id(FK) │
│ nozzle_id (FK?)  │───── 为空=按燃料类型调价; 非空=按枪调价
│ old_price        │
│ new_price        │
│ adjustment_type  │───── immediate / scheduled
│ effective_at     │
│ status           │───── pending_approval / approved / executed / cancelled
│ adjusted_by (FK) │
│ approved_by (FK?)│
└──────────────────┘

┌──────────────────┐                    ┌──────────────────┐
│ MemberPriceRule  │ ⚠️ Phase 4 依赖    │  PriceAgreement  │ ⚠️ Phase 4 依赖
│──────────────────│                    │──────────────────│
│ station_id (FK)  │                    │ enterprise_id    │ ← mock UUID
│ fuel_type_id(FK) │                    │ station_id (FK)  │
│ member_tier      │ ← mock enum       │ fuel_type_id(FK) │
│ discount_type    │                    │ agreed_price     │
│ discount_value   │                    │ valid_from/to    │
└──────────────────┘                    │ status           │
                                        └──────────────────┘
```

### 1.2 实体三问分析

#### FuelTypePrice（燃料类型基准价）

```
❓ 问题 1 — 自带数据
   - station_id: 所属站点（跨模块 FK → Station）
   - fuel_type_id: 燃料类型（跨模块 FK → FuelType）
   - base_price: 基准单价（NUMERIC(10,2)，元/千克或元/升）
   - effective_from: 当前价格生效时间
   - status: active / inactive
   - updated_by: 最后更新人

❓ 问题 2 — 创建触发方式
   [x] 手动创建：运营经理为新站点新燃料类型设置初始价格
   [x] 自动更新：调价（PriceAdjustment）执行后自动更新 base_price 和 effective_from
   → 站点新增枪配置时，若该燃料类型尚无基准价，需提示先设置

❓ 问题 3 — 副作用与生命周期约束
   - 更新时：自动生成 PriceAdjustment 记录（old_price → new_price）
   - 更新时：自动同步公示看板数据
   - 唯一约束：同一 station_id + fuel_type_id 只能有一条 active 记录
   - 删除限制：status='active' 且有关联枪时不允许删除
```

#### PriceAdjustment（调价记录）

```
❓ 问题 1 — 自带数据
   - station_id, fuel_type_id: 调价目标
   - nozzle_id: 可选，为空=燃料类型调价，非空=枪级调价
   - old_price, new_price: 变更前后价格
   - change_amount: new_price - old_price（冗余字段，便于查询）
   - change_pct: 变动百分比（冗余字段）
   - adjustment_type: immediate（立即生效）/ scheduled（定时生效）
   - effective_at: 生效时间（immediate 时=created_at，scheduled 时=未来时间）
   - status: pending_approval / approved / executed / cancelled / rejected
   - reason: 调价原因/备注
   - adjusted_by: 提交人（跨模块 FK → StationEmployee）
   - approved_by: 审批人（可选）
   - executed_at: 实际执行时间

❓ 问题 2 — 创建触发方式
   [x] 手动创建：用户提交调价操作
   → 自动填充 old_price、change_amount、change_pct
   → 立即生效：通过幅度检查 + 二次确认后，status 直接设为 executed
   → 定时生效：status 设为 approved，等待 effective_at 到达后执行
   → 需审批：status 设为 pending_approval

❓ 问题 3 — 副作用与生命周期约束
   - 创建时：校验调价幅度是否在 PriceDefenseConfig 限制范围内
   - executed 时：更新 FuelTypePrice.base_price 或 NozzlePriceOverride.override_price
   - executed 时：触发公示看板刷新
   - cancelled/rejected 后：不可再修改状态
   - 不可篡改：已创建的记录不允许修改价格字段（仅可变更 status）
```

#### NozzlePriceOverride（枪独立定价）

```
❓ 问题 1 — 自带数据
   - nozzle_id: 目标枪（跨模块 FK → Nozzle）
   - station_id: 所属站点
   - fuel_type_id: 燃料类型（冗余，便于查询）
   - override_price: 覆盖价格
   - effective_from: 生效时间
   - created_by: 创建人

❓ 问题 2 — 创建触发方式
   [x] 手动创建：用户为特定枪设置独立价格
   → 当枪级 PriceAdjustment 执行时，自动创建/更新

❓ 问题 3 — 副作用与生命周期约束
   - 存在覆盖价时：该枪不受燃料类型基准价调价影响
   - 删除覆盖价时：该枪自动回落到燃料类型基准价
   - 唯一约束：同一 nozzle_id 只能有一条记录（一枪一覆盖价）
```

#### PriceDefenseConfig（调价防御配置）

```
❓ 问题 1 — 自带数据
   - station_id: 可选，为空=全局配置，非空=站点级配置
   - fuel_type_id: 可选，为空=所有燃料类型，非空=特定类型
   - max_increase_pct: 最大涨价幅度（%），默认 20
   - max_decrease_pct: 最大降价幅度（%），默认 20
   - require_approval: 是否需要审批（布尔）
   - approval_threshold_pct: 超过此幅度需审批（%），默认 10
   - updated_by: 最后更新人

❓ 问题 2 — 创建触发方式
   [x] 手动创建/更新：运营经理配置
   → 系统初始化时预置全局默认配置

❓ 问题 3 — 副作用与生命周期约束
   - 生效优先级：站点+燃料类型级 > 站点级 > 全局级
   - 变更时：不影响已执行的调价记录
```

#### MemberPriceRule（会员专享价规则） ⚠️ Phase 4 依赖

```
❓ 问题 1 — 自带数据
   - station_id, fuel_type_id: 适用范围
   - member_tier: 会员等级（MVP 使用预设 enum: normal/vip/svip）
   - discount_type: 优惠类型（fixed_amount: 固定金额减免 / percentage: 百分比折扣）
   - discount_value: 优惠值（固定金额 或 百分比）
   - status: active / inactive

❓ 问题 2 — 创建触发方式
   [x] 手动创建：运营经理配置会员价规则

❓ 问题 3 — 副作用与生命周期约束
   - 基准价变更时：会员专享价自动联动（专享价 = 基准价 - discount_value）
   - 唯一约束：同一 station_id + fuel_type_id + member_tier 唯一
```

#### PriceAgreement（大客户价格协议） ⚠️ Phase 4 依赖

```
❓ 问题 1 — 自带数据
   - enterprise_id: 企业 ID（MVP 使用 mock UUID）
   - enterprise_name: 企业名称（冗余，便于展示）
   - station_id, fuel_type_id: 适用范围
   - agreed_price: 协议价
   - valid_from, valid_to: 有效期
   - status: active / expired / terminated
   - created_by: 创建人
   - terminated_at: 提前终止时间
   - termination_reason: 终止原因

❓ 问题 2 — 创建触发方式
   [x] 手动创建：运营经理为大客户创建

❓ 问题 3 — 副作用与生命周期约束
   - 到期时：status 自动变为 expired
   - 唯一约束：同一 enterprise_id + station_id + fuel_type_id 只能有一条 active 协议
   - 终止时：记录 terminated_at 和 termination_reason
```

### 1.3 数据完整性约束

| 实体 | 约束类型 | 规则描述 |
|------|---------|---------|
| FuelTypePrice | 唯一性约束 | station_id + fuel_type_id + status='active' 唯一 |
| FuelTypePrice | 数值约束 | base_price > 0 |
| PriceAdjustment | 不可篡改 | old_price, new_price, adjustment_type 创建后不可修改 |
| PriceAdjustment | 状态约束 | executed 状态必须有 executed_at |
| PriceAdjustment | 状态约束 | pending_approval 状态的 approved_by 必须为空 |
| PriceAdjustment | 数值约束 | new_price > 0 |
| PriceAdjustment | 时间约束 | scheduled 类型的 effective_at 必须 > created_at |
| NozzlePriceOverride | 唯一性约束 | nozzle_id 唯一（一枪一覆盖价） |
| NozzlePriceOverride | 数值约束 | override_price > 0 |
| PriceDefenseConfig | 数值约束 | max_increase_pct BETWEEN 1 AND 100 |
| PriceDefenseConfig | 数值约束 | max_decrease_pct BETWEEN 1 AND 100 |
| MemberPriceRule | 唯一性约束 | station_id + fuel_type_id + member_tier 唯一 |
| MemberPriceRule | 数值约束 | discount_value > 0 |
| PriceAgreement | 唯一性约束 | enterprise_id + station_id + fuel_type_id 同时只有一条 active |
| PriceAgreement | 时间约束 | valid_to > valid_from |
| PriceAgreement | 数值约束 | agreed_price > 0 |

---

## 2. API 端点设计

### 2.1 聚合接口分析

```
页面：价格管理首页（PriceManagement Dashboard）
需要的数据：
  - 各燃料类型基准价 → FuelTypePrice
  - 各枪独立价格（如有覆盖） → NozzlePriceOverride
  - 待生效定时调价 → PriceAdjustment (status=approved, type=scheduled)
  - 调价防御配置 → PriceDefenseConfig
判断：[x] 数据来自多个实体 → 需要聚合接口
聚合接口：GET /api/v1/stations/:stationId/price-overview

页面：价格公示看板（PriceDisplayBoard）
需要的数据：
  - 各燃料类型标准价 → FuelTypePrice
  - 会员专享价 → MemberPriceRule + FuelTypePrice 计算
  - 站点基本信息 → Station
判断：[x] 数据来自多个实体 → 需要聚合接口
聚合接口：GET /api/v1/stations/:stationId/price-board
```

### 2.2 端点清单

#### 燃料类型基准价

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/fuel-type-prices` | 获取站点所有燃料类型基准价列表 | Query: `status`, `fuelTypeId` / Resp: `items[]` 含燃料类型信息 + 关联枪数量 |
| POST | `/api/v1/stations/:stationId/fuel-type-prices` | 设置燃料类型初始基准价 | Body: `fuelTypeId`, `basePrice` |
| PUT | `/api/v1/stations/:stationId/fuel-type-prices/:id` | 更新基准价（通过调价流程） | Body: `basePrice` → 内部走 PriceAdjustment 流程 |

#### 调价操作

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/price-adjustments` | 调价记录列表（历史 + 待生效） | Query: `status`, `fuelTypeId`, `adjustmentType`, `dateFrom`, `dateTo`, `page`, `pageSize` |
| GET | `/api/v1/stations/:stationId/price-adjustments/:id` | 调价记录详情 | Resp: 含影响枪列表、审批信息 |
| POST | `/api/v1/stations/:stationId/price-adjustments` | 提交调价 | Body: `fuelTypeId`, `nozzleId?`, `newPrice`, `adjustmentType`, `effectiveAt?`, `reason?` |
| PATCH | `/api/v1/stations/:stationId/price-adjustments/:id/approve` | 审批通过 | Body: `approvedBy` |
| PATCH | `/api/v1/stations/:stationId/price-adjustments/:id/reject` | 审批驳回 | Body: `rejectedBy`, `reason` |
| PATCH | `/api/v1/stations/:stationId/price-adjustments/:id/cancel` | 取消调价计划 | — |
| POST | `/api/v1/stations/:stationId/price-adjustments/batch` | 批量调价 | Body: `fuelTypeIds[]`, `adjustmentMode` (absolute/percentage), `adjustmentValue` |

#### 枪独立定价

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/nozzle-price-overrides` | 获取站点所有枪覆盖价列表 | Query: `nozzleId`, `fuelTypeId` |
| POST | `/api/v1/stations/:stationId/nozzle-price-overrides` | 创建枪覆盖价 | Body: `nozzleId`, `overridePrice` → 内部走 PriceAdjustment 流程 |
| DELETE | `/api/v1/stations/:stationId/nozzle-price-overrides/:id` | 删除覆盖价（恢复基准价） | — |

#### 调价防御配置

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/price-defense-configs` | 获取防御配置列表 | Query: `stationId?`, `fuelTypeId?` |
| POST | `/api/v1/price-defense-configs` | 创建防御配置 | Body: `stationId?`, `fuelTypeId?`, `maxIncreasePct`, `maxDecreasePct`, `requireApproval`, `approvalThresholdPct` |
| PUT | `/api/v1/price-defense-configs/:id` | 更新防御配置 | Body: 同上 |

#### 会员专享价 ⚠️ Phase 4 依赖

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/stations/:stationId/member-price-rules` | 获取会员价规则列表 | Query: `fuelTypeId`, `memberTier` |
| POST | `/api/v1/stations/:stationId/member-price-rules` | 创建会员价规则 | Body: `fuelTypeId`, `memberTier`, `discountType`, `discountValue` |
| PUT | `/api/v1/stations/:stationId/member-price-rules/:id` | 更新会员价规则 | Body: 同上 |
| DELETE | `/api/v1/stations/:stationId/member-price-rules/:id` | 删除会员价规则 | — |

#### 价格协议 ⚠️ Phase 4 依赖

| 方法 | 路径 | 说明 | 请求 / 响应要点 |
|------|------|------|----------------|
| GET | `/api/v1/price-agreements` | 价格协议列表 | Query: `enterpriseId?`, `stationId?`, `status`, `page`, `pageSize` |
| GET | `/api/v1/price-agreements/:id` | 协议详情 | — |
| POST | `/api/v1/price-agreements` | 创建协议 | Body: `enterpriseId`, `enterpriseName`, `stationId`, `fuelTypeId`, `agreedPrice`, `validFrom`, `validTo` |
| PUT | `/api/v1/price-agreements/:id` | 更新协议 | Body: 可修改 `agreedPrice`, `validTo` |
| PATCH | `/api/v1/price-agreements/:id/terminate` | 终止协议 | Body: `terminationReason` |

#### 聚合接口

| 方法 | 路径 | 说明 | 响应要点 |
|------|------|------|---------|
| GET | `/api/v1/stations/:stationId/price-overview` | 价格管理首页聚合数据 | `fuelTypePrices[]`（含每个类型的枪覆盖情况）、`pendingAdjustments[]`、`defenseConfig` |
| GET | `/api/v1/stations/:stationId/price-board` | 价格公示看板数据 | `stationName`、`prices[]`（含标准价 + 会员价）、`lastUpdatedAt` |

### 2.3 权限矩阵

> ⚠️ **Phase 7 依赖（9.1 角色权限管理）：** 以下权限矩阵为本模块的设计约定。MVP 阶段前端通过硬编码角色判断实现基本的权限控制（如按角色隐藏/禁用按钮）。Phase 7 模块 9.1 上线后，需对接统一 RBAC 系统，实现：(1) 动态功能权限分配、(2) 按站点的数据权限隔离、(3) 菜单可见性控制。届时下表中的"默认角色"将作为角色权限的初始模板导入 RBAC 系统。

| 权限代码 | 说明 | 默认角色 |
|----------|------|----------|
| `price:overview` | 查看价格管理首页 | `station_master`, `ops_manager`, `finance`, `admin` |
| `price:adjust` | 执行调价操作 | `station_master`, `ops_manager`, `admin` |
| `price:adjust:batch` | 批量调价 | `ops_manager`, `admin` |
| `price:adjust:approve` | 审批调价 | `ops_manager`, `admin` |
| `price:history` | 查看调价历史 | `station_master`, `ops_manager`, `finance`, `admin` |
| `price:defense:read` | 查看防御配置 | `station_master`, `ops_manager`, `admin` |
| `price:defense:write` | 修改防御配置 | `ops_manager`, `admin` |
| `price:board` | 查看价格公示看板 | 所有角色 |
| `price:member:read` | 查看会员价规则 | `station_master`, `ops_manager`, `admin` |
| `price:member:write` | 配置会员价规则 | `ops_manager`, `admin` |
| `price:agreement:read` | 查看价格协议 | `ops_manager`, `finance`, `admin` |
| `price:agreement:write` | 管理价格协议 | `ops_manager`, `admin` |

---

## 3. 业务规则与状态机

### 3.1 核心业务规则

| # | 规则 | 说明 |
|---|------|------|
| BR-01 | 每站每燃料类型有且仅有一个 active 基准价 | station_id + fuel_type_id + status='active' UNIQUE |
| BR-02 | 枪覆盖价优先于基准价 | 前端展示和订单计算时优先使用覆盖价 |
| BR-03 | 调价幅度校验 | 提交调价时，系统自动校验变动幅度是否在 PriceDefenseConfig 限制内 |
| BR-04 | 调价记录不可篡改 | PriceAdjustment 的 old_price, new_price 创建后不可修改 |
| BR-05 | 定时调价可取消 | status=approved 且 effective_at > now() 的记录可取消 |
| BR-06 | 会员价联动基准价 | 基准价变更后，会员专享价 = 新基准价 - discount_value，自动联动 |
| BR-07 | 协议价独立于基准价 | PriceAgreement 的 agreed_price 为绝对值，不随基准价变动 |
| BR-08 | 防御配置优先级 | 站点+燃料类型级 > 站点级 > 全局级 |

### 3.2 PriceAdjustment 状态流转

> ⚠️ **Phase 7 依赖（9.5 审批流程引擎）：** 以下状态机为本模块的简单规则审批实现。审批触发条件由 `PriceDefenseConfig.require_approval` + `approval_threshold_pct` 控制，审批角色硬编码为 `ops_manager` / `admin`。Phase 7 模块 9.5 上线后，需重构为：(1) 通过统一审批流程引擎配置审批规则和节点、(2) 支持多级审批链、(3) 对接审批通知系统。届时 `PriceAdjustment` 的 `pending_approval → approved/rejected` 流转将由审批引擎驱动，而非本模块内部逻辑。

```
                ┌─────────────────────────────────────────┐
                │                                         │
                ▼                                         │
[提交调价] ──→ (幅度检查) ──→ 需审批？                     │
                │               │                         │
                │ 否            │ 是                       │
                ▼               ▼                         │
          ┌──────────┐   ┌──────────────┐                │
          │ executed  │   │pending_approval│               │
          │(立即生效)  │   └───────┬───────┘               │
          └──────────┘           │                        │
                           ┌─────┴─────┐                  │
                           │           │                  │
                           ▼           ▼                  │
                    ┌──────────┐ ┌──────────┐            │
                    │ approved │ │ rejected │            │
                    │(待执行)   │ └──────────┘            │
                    └─────┬────┘                          │
                          │                               │
                    ┌─────┴─────┐                         │
                    │           │                         │
                    ▼           ▼                         │
             ┌──────────┐ ┌──────────┐                   │
             │ executed  │ │cancelled │───────────────────┘
             │(定时生效)  │ └──────────┘ (用户取消待执行计划)
             └──────────┘
```

**状态说明：**

| 状态 | 说明 | 可转换到 |
|------|------|---------|
| `pending_approval` | 等待上级审批 | `approved`, `rejected` |
| `approved` | 审批通过，等待定时执行 | `executed`, `cancelled` |
| `rejected` | 审批驳回（终态） | — |
| `executed` | 已执行生效（终态） | — |
| `cancelled` | 已取消（终态） | — |

### 3.3 PriceAgreement 状态流转

```
[创建协议] ──→ active ──→ expired (valid_to 到期自动)
                  │
                  └──→ terminated (手动终止)
```

---

## 4. 跨模块依赖

### 4.1 依赖其他模块的接口

| 本模块实体 | 引用字段 | 目标模块 | 目标实体 | 说明 |
|-----------|---------|---------|---------|------|
| FuelTypePrice | station_id | 1.1 站点管理 | Station | 价格所属站点 |
| FuelTypePrice | fuel_type_id | 1.1 站点管理 | FuelType | 燃料类型 |
| PriceAdjustment | station_id | 1.1 站点管理 | Station | 调价所属站点 |
| PriceAdjustment | fuel_type_id | 1.1 站点管理 | FuelType | 调价燃料类型 |
| PriceAdjustment | nozzle_id | 1.1 站点管理 | Nozzle | 枪级调价目标 |
| PriceAdjustment | adjusted_by | 1.1 站点管理 | StationEmployee | 调价操作人 |
| PriceAdjustment | approved_by | 1.1 站点管理 | StationEmployee | 审批人 |
| NozzlePriceOverride | nozzle_id | 1.1 站点管理 | Nozzle | 覆盖价目标枪 |
| NozzlePriceOverride | station_id | 1.1 站点管理 | Station | 所属站点 |
| MemberPriceRule | — | 3.1 会员管理 | MemberTier | ⚠️ Phase 4，MVP 用预设 enum |
| PriceAgreement | enterprise_id | 3.2 大客户管理 | Enterprise | ⚠️ Phase 4，MVP 用 mock UUID |

### 4.2 被其他模块依赖的接口

| 依赖模块 | 引用的数据 | 接口 | 说明 |
|---------|-----------|------|------|
| 2.2 订单与交易 | 当前生效价格 | `GET /api/v1/stations/:id/price-overview` | 订单创建时获取当前价格 |
| 2.2 订单与交易 | 会员价/协议价 | `GET /api/v1/stations/:id/member-price-rules`, `GET /api/v1/price-agreements` | 订单结算时应用优惠价 |

---

## 5. 模拟数据规范

### Mock 数据黄金规则

- 每条 FuelTypePrice mock 记录必须有合理的 base_price（参考市场价）
- status='executed' 的 PriceAdjustment 必须有 executed_at
- status='pending_approval' 的 PriceAdjustment 的 approved_by 必须为空
- PriceAgreement 的 valid_to > valid_from
- 覆盖价必须与基准价不同（否则覆盖无意义）

### 参考市场价格（mock 数据用）

| 燃料类型 | 参考基准价 | 单位 |
|---------|-----------|------|
| CNG (压缩天然气) | 3.50 | 元/立方米 |
| LNG (液化天然气) | 5.80 | 元/千克 |
| 92# 汽油 | 7.50 | 元/升 |
| 95# 汽油 | 8.00 | 元/升 |
| 98# 汽油 | 9.00 | 元/升 |
| 0# 柴油 | 7.20 | 元/升 |

---

## 6. Database Schema (PostgreSQL)

```sql
-- ============================================================
-- 价格管理 (Price Management) Database Schema
-- 版本: 草案 v1  |  生成日期: 2026-02-24
-- ============================================================

BEGIN;

-- ---------- ENUM 类型 ----------

CREATE TYPE price_status AS ENUM ('active', 'inactive');

CREATE TYPE adjustment_type AS ENUM ('immediate', 'scheduled');

CREATE TYPE adjustment_status AS ENUM (
    'pending_approval',
    'approved',
    'rejected',
    'executed',
    'cancelled'
);

CREATE TYPE discount_type AS ENUM ('fixed_amount', 'percentage');

CREATE TYPE member_tier AS ENUM ('normal', 'vip', 'svip');
-- ⚠️ Phase 4 会员模块上线后，member_tier 可能迁移为关联表

CREATE TYPE agreement_status AS ENUM ('active', 'expired', 'terminated');

-- ---------- 1. FuelTypePrice（燃料类型基准价） ----------

CREATE TABLE fuel_type_price (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id      UUID            NOT NULL,   -- → Station (1.1) 跨模块 FK
    fuel_type_id    UUID            NOT NULL,   -- → FuelType (1.1) 跨模块 FK
    base_price      NUMERIC(10,2)   NOT NULL,
    effective_from  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    status          price_status    NOT NULL DEFAULT 'active',
    updated_by      UUID,                       -- → StationEmployee (1.1) 跨模块 FK
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_fuel_type_price_positive CHECK (base_price > 0)
);

-- 同一站点同一燃料类型只能有一条 active 记录
CREATE UNIQUE INDEX uq_fuel_type_price_active
    ON fuel_type_price (station_id, fuel_type_id) WHERE status = 'active';

CREATE INDEX idx_fuel_type_price_station ON fuel_type_price (station_id);

COMMENT ON COLUMN fuel_type_price.station_id IS '跨模块 FK → module 1.1 Station.id';
COMMENT ON COLUMN fuel_type_price.fuel_type_id IS '跨模块 FK → module 1.1 FuelType.id';

-- ---------- 2. PriceAdjustment（调价记录） ----------

CREATE TABLE price_adjustment (
    id                  UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id          UUID                NOT NULL,   -- → Station (1.1)
    fuel_type_id        UUID                NOT NULL,   -- → FuelType (1.1)
    nozzle_id           UUID,                           -- → Nozzle (1.1)，NULL=按燃料类型调价
    old_price           NUMERIC(10,2)       NOT NULL,
    new_price           NUMERIC(10,2)       NOT NULL,
    change_amount       NUMERIC(10,2)       NOT NULL,   -- new_price - old_price
    change_pct          NUMERIC(6,2)        NOT NULL,   -- 变动百分比
    adjustment_type     adjustment_type     NOT NULL,
    effective_at        TIMESTAMPTZ         NOT NULL,
    status              adjustment_status   NOT NULL DEFAULT 'pending_approval',
    reason              TEXT,
    adjusted_by         UUID                NOT NULL,   -- → StationEmployee (1.1)
    approved_by         UUID,                           -- → StationEmployee (1.1)
    rejected_by         UUID,                           -- → StationEmployee (1.1)
    rejection_reason    TEXT,
    executed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT now(),

    CONSTRAINT chk_price_adjustment_positive CHECK (new_price > 0),
    CONSTRAINT chk_price_adjustment_executed CHECK (
        status != 'executed' OR executed_at IS NOT NULL
    ),
    CONSTRAINT chk_price_adjustment_scheduled CHECK (
        adjustment_type != 'scheduled' OR effective_at > created_at
    )
);

CREATE INDEX idx_price_adjustment_station ON price_adjustment (station_id);
CREATE INDEX idx_price_adjustment_status ON price_adjustment (status);
CREATE INDEX idx_price_adjustment_effective ON price_adjustment (effective_at) WHERE status = 'approved';
CREATE INDEX idx_price_adjustment_time ON price_adjustment (created_at DESC);

COMMENT ON COLUMN price_adjustment.station_id IS '跨模块 FK → module 1.1 Station.id';
COMMENT ON COLUMN price_adjustment.fuel_type_id IS '跨模块 FK → module 1.1 FuelType.id';
COMMENT ON COLUMN price_adjustment.nozzle_id IS '跨模块 FK → module 1.1 Nozzle.id (NULL=燃料类型调价)';
COMMENT ON COLUMN price_adjustment.adjusted_by IS '跨模块 FK → module 1.1 StationEmployee.id';

-- ---------- 3. NozzlePriceOverride（枪独立定价） ----------

CREATE TABLE nozzle_price_override (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    nozzle_id       UUID            NOT NULL UNIQUE,    -- → Nozzle (1.1)，一枪一覆盖价
    station_id      UUID            NOT NULL,           -- → Station (1.1)
    fuel_type_id    UUID            NOT NULL,           -- → FuelType (1.1)，冗余便于查询
    override_price  NUMERIC(10,2)   NOT NULL,
    effective_from  TIMESTAMPTZ     NOT NULL DEFAULT now(),
    created_by      UUID            NOT NULL,           -- → StationEmployee (1.1)
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_nozzle_override_positive CHECK (override_price > 0)
);

CREATE INDEX idx_nozzle_override_station ON nozzle_price_override (station_id);

COMMENT ON COLUMN nozzle_price_override.nozzle_id IS '跨模块 FK → module 1.1 Nozzle.id';
COMMENT ON COLUMN nozzle_price_override.station_id IS '跨模块 FK → module 1.1 Station.id';

-- ---------- 4. PriceDefenseConfig（调价防御配置） ----------

CREATE TABLE price_defense_config (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id              UUID,                       -- → Station (1.1)，NULL=全局配置
    fuel_type_id            UUID,                       -- → FuelType (1.1)，NULL=所有类型
    max_increase_pct        NUMERIC(5,2)    NOT NULL DEFAULT 20.00,
    max_decrease_pct        NUMERIC(5,2)    NOT NULL DEFAULT 20.00,
    require_approval        BOOLEAN         NOT NULL DEFAULT false,
    approval_threshold_pct  NUMERIC(5,2)    NOT NULL DEFAULT 10.00,
    updated_by              UUID,                       -- → StationEmployee (1.1)
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_defense_increase CHECK (max_increase_pct BETWEEN 1 AND 100),
    CONSTRAINT chk_defense_decrease CHECK (max_decrease_pct BETWEEN 1 AND 100),
    CONSTRAINT chk_defense_threshold CHECK (approval_threshold_pct BETWEEN 0 AND 100)
);

-- 同一范围只能有一条配置
CREATE UNIQUE INDEX uq_defense_config_scope
    ON price_defense_config (
        COALESCE(station_id, '00000000-0000-0000-0000-000000000000'),
        COALESCE(fuel_type_id, '00000000-0000-0000-0000-000000000000')
    );

COMMENT ON COLUMN price_defense_config.station_id IS '跨模块 FK → module 1.1 Station.id (NULL=全局)';

-- ---------- 5. MemberPriceRule（会员专享价规则）⚠️ Phase 4 依赖 ----------

CREATE TABLE member_price_rule (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id      UUID            NOT NULL,           -- → Station (1.1)
    fuel_type_id    UUID            NOT NULL,           -- → FuelType (1.1)
    member_tier     member_tier     NOT NULL,           -- ⚠️ Phase 4 后可能改为 FK → MemberTier
    discount_type   discount_type   NOT NULL,
    discount_value  NUMERIC(10,2)   NOT NULL,
    status          price_status    NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),

    CONSTRAINT chk_member_discount_positive CHECK (discount_value > 0)
);

CREATE UNIQUE INDEX uq_member_price_rule
    ON member_price_rule (station_id, fuel_type_id, member_tier) WHERE status = 'active';

COMMENT ON TABLE member_price_rule IS '⚠️ Phase 4 依赖：member_tier 当前为 ENUM，会员模块上线后考虑改为 FK';
COMMENT ON COLUMN member_price_rule.station_id IS '跨模块 FK → module 1.1 Station.id';

-- ---------- 6. PriceAgreement（大客户价格协议）⚠️ Phase 4 依赖 ----------

CREATE TABLE price_agreement (
    id                  UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id       UUID                NOT NULL,   -- ⚠️ → Enterprise (3.2)，MVP 使用 mock UUID
    enterprise_name     VARCHAR(100)        NOT NULL,   -- 冗余字段，便于展示
    station_id          UUID                NOT NULL,   -- → Station (1.1)
    fuel_type_id        UUID                NOT NULL,   -- → FuelType (1.1)
    agreed_price        NUMERIC(10,2)       NOT NULL,
    valid_from          DATE                NOT NULL,
    valid_to            DATE                NOT NULL,
    status              agreement_status    NOT NULL DEFAULT 'active',
    terminated_at       TIMESTAMPTZ,
    termination_reason  TEXT,
    created_by          UUID                NOT NULL,   -- → StationEmployee (1.1)
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT now(),

    CONSTRAINT chk_agreement_price_positive CHECK (agreed_price > 0),
    CONSTRAINT chk_agreement_date_range CHECK (valid_to > valid_from),
    CONSTRAINT chk_agreement_terminated CHECK (
        status != 'terminated' OR terminated_at IS NOT NULL
    )
);

-- 同一企业同一站点同一燃料类型只能有一条 active 协议
CREATE UNIQUE INDEX uq_price_agreement_active
    ON price_agreement (enterprise_id, station_id, fuel_type_id) WHERE status = 'active';

CREATE INDEX idx_agreement_enterprise ON price_agreement (enterprise_id);
CREATE INDEX idx_agreement_station ON price_agreement (station_id);
CREATE INDEX idx_agreement_expiry ON price_agreement (valid_to) WHERE status = 'active';

COMMENT ON TABLE price_agreement IS '⚠️ Phase 4 依赖：enterprise_id 当前为 mock UUID，大客户模块上线后加 FK';
COMMENT ON COLUMN price_agreement.enterprise_id IS '⚠️ 跨模块 FK → module 3.2 Enterprise.id (MVP=mock)';
COMMENT ON COLUMN price_agreement.station_id IS '跨模块 FK → module 1.1 Station.id';

COMMIT;
```

**Schema 统计：**
- ENUM 类型：6 个（price_status, adjustment_type, adjustment_status, discount_type, member_tier, agreement_status）
- CREATE TABLE：6 个
- 跨模块 FK（UUID 无约束）：11 处
- CHECK 约束：10 个
- UNIQUE 索引（条件唯一）：4 个

---

*文档生成时间：2026-02-24*
*基于：data-model-design.md Skill v1.2*
