# 订单与交易 — UI Schema

**模块：** 能源交易 > 订单与交易 (2.2)
**基于：** user-stories.md v1.0 + ux-design.md v1.0
**设计日期：** 2026-02-25
**状态：** ✅ 已确认（2026-02-25）

---

## 1. 页面清单

| # | 页面名称 | 类型 | 路由 | 对应 Story | 响应式支持 |
|---|---------|------|------|-----------|-----------|
| P01 | 订单列表页 | 统计+列表页 | /energy-trade/order/list | US-001~005 | ✅ 卡片→堆叠 |
| P02 | 异常订单页 | 列表页 | /energy-trade/order/exceptions | US-012~014 | ✅ 表格→卡片 |
| P03 | 退款管理页 | Tab 列表页 | /energy-trade/order/refunds | US-016~018 | ✅ 表格→卡片 |
| P04 | 订单设置页 | 列表页 | /energy-trade/order/settings | US-019~020 | ✅ 单列堆叠 |
| D01 | 订单详情抽屉 | Drawer | — (Drawer) | US-004, US-006, US-019 | ✅ 全宽 |
| D02 | 创建订单抽屉 | Drawer | — (Drawer) | US-007 | ✅ 全宽 |
| D03 | 补单抽屉 | Drawer | — (Drawer) | US-014 | ✅ 全宽 |
| M01 | 支付面板弹窗 | Modal | — (Modal) | US-009, US-010 | ✅ |
| M02 | 退款申请弹窗 | Modal | — (Modal) | US-016 | ✅ |
| M03 | 小票预览弹窗 | Modal | — (Modal) | US-011 | ✅ |

---

## 2. 侧边栏菜单结构

```text
能源交易 (energy-trade)
├── 价格管理 (price-management)                    # 模块 2.1
│   ├── ...（已有 7 个菜单项）
├── 订单管理 (order)                               # 本模块 2.2
│   ├── 订单列表 → P01 (默认落地页)
│   ├── 异常订单 → P02  (Badge: 待处理数)
│   ├── 退款管理 → P03  (Badge: 待审批数)
│   └── 订单设置 → P04  [MVP+]
└── 库存管理 (2.3) [未开发]
```

**侧边栏 Badge：**
- "异常订单"菜单项旁显示红色 Badge（待处理异常数量），仅当 `pending` 状态异常订单 > 0 时显示
- "退款管理"菜单项旁显示橙色 Badge（待审批退款数量），仅当 `pending_approval` 状态退款 > 0 时显示

---

## 3. 页面详细设计

### P01: 订单列表页 (OrderList)

**路由：** `/energy-trade/order/list`
**对应 Story：** US-001, US-002, US-003, US-004, US-005, US-007, US-008, US-009, US-021
**权限：** `cashier`, `station_master`, `ops_manager`, `finance`, `admin`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 订单管理 / 订单列表
- **标题：** 订单列表
- **操作按钮：**
  - `[+ 创建订单]` (Primary) — 权限: `station_master`, `admin`，打开 D02
  - `[↓ 导出]` (Default, DownloadOutlined) — 权限: `finance`, `admin`，[MVP+] 按当前筛选条件导出 Excel

#### 顶部统计卡片区 (StatCards)

**布局：** 4列等宽卡片（Row + Col span=6），可切换维度（当日/当班）

| 卡片 | 字段 | 图标 | 颜色 | 说明 |
|------|------|------|------|------|
| 总订单数 | `totalOrders` | FileTextOutlined | `#1890ff` | 当日/当班总订单数 |
| 总金额 | `totalAmount` | MoneyCollectOutlined | `#52c41a` | 当日/当班总金额（元） |
| 总充装量 | `totalQuantity` | ExperimentOutlined | `#722ed1` | 当日/当班总充装量（kg） |
| 待支付 | `pendingPaymentCount` | ClockCircleOutlined | `#faad14` | 当前待支付订单数，0时灰色 |

**维度切换：** 卡片区右上角 Radio.Group（当日/当班），切换后统计数据更新

#### 筛选栏 (FilterBar)

**布局：** Row + Space.wrap，筛选栏常驻页面顶部

| 筛选项 | 组件 | 默认值 | 说明 |
|--------|------|--------|------|
| 时间范围 | DatePicker.RangePicker | 今日 | 订单创建时间范围 |
| 枪号 | Select (allowClear) | 全部 | 当前站点枪列表 |
| 燃料类型 | Select (allowClear) | 全部 | 当前站点燃料类型 |
| 支付状态 | Select (allowClear) | 全部 | filling/pending_payment/paid/completed/cancelled/exception/refunded |
| 支付方式 | Select (allowClear) | 全部 | cash/wechat/alipay/unionpay |
| 搜索 | Input.Search | — | 订单号/车牌号/会员手机号 |

#### 数据表格 (Table)

| 列 | dataIndex | 宽度 | 渲染 | 排序 |
|----|-----------|------|------|------|
| 订单号 | `orderNo` | 180 | 文字链接，点击打开 D01 | — |
| 时间 | `createdAt` | 170 | YYYY-MM-DD HH:mm:ss | ✅ 默认倒序 |
| 枪号 | `nozzleNo` | 80 | 文本 | — |
| 燃料类型 | `fuelTypeName` | 100 | 文本 | — |
| 数量(kg) | `quantity` | 100 | 数字，2位小数 | ✅ |
| 金额(元) | `totalAmount` | 110 | ¥ 数字，2位小数，金额加粗 | ✅ |
| 支付状态 | `paymentStatus` | 100 | Tag（颜色见 ux-design §4.2） | — |
| 支付方式 | `paymentMethod` | 100 | 图标 + 文字 | — |
| 操作 | — | 120 | 按状态显示操作按钮 | — |

**操作列逻辑：**

| 订单状态 | 操作按钮 |
|---------|---------|
| pending_payment | `[收银]`(Primary) `[取消]`(文字) |
| paid / completed | `[详情]`(文字) `[退款]`(文字,红色) |
| exception | `[详情]`(文字) `[处理]`(文字,跳转P02) |
| 其他 | `[详情]`(文字) |

**分页配置：** `pageSize: 20`, `showSizeChanger: true`, `showQuickJumper: true`, `showTotal`

**空状态：** "暂无订单记录" + "创建第一笔订单开始管理"按钮

#### 数据源 (Mock API)

```
GET /api/v1/stations/:stationId/fueling-orders
Query: status, paymentMethod, fuelTypeId, nozzleNo, dateFrom, dateTo, keyword, page, pageSize
Response: { items: FuelingOrder[], pagination: { total, page, pageSize } }

GET /api/v1/stations/:stationId/fueling-orders/statistics
Query: dimension (today/shift), shiftId?
Response: { totalOrders, totalAmount, totalQuantity, pendingPaymentCount, paymentMethodBreakdown }
```

---

### P02: 异常订单页 (ExceptionOrderList)

**路由：** `/energy-trade/order/exceptions`
**对应 Story：** US-012, US-013, US-014, US-015
**权限：** `station_master`, `ops_manager`, `admin`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 订单管理 / 异常订单
- **标题：** 异常订单

#### 顶部统计卡片区

**布局：** 4列等宽卡片（Row + Col span=6）

| 卡片 | 字段 | 颜色 | 说明 | 点击行为 |
|------|------|------|------|---------|
| 待处理 | `pendingCount` | 红色 | 待处理异常数 | 筛选列表 |
| 已挂起 | `suspendedCount` | 黄色 | 已挂起数 | 筛选列表 |
| 已补单 | `supplementedCount` | 蓝色 | 已补单数（当日） | 筛选列表 |
| 已关闭 | `closedCount` | 灰色 | 已关闭数（当日） | 筛选列表 |

#### 筛选栏

| 筛选项 | 组件 | 默认值 |
|--------|------|--------|
| 异常类型 | Select | 全部 (power_loss/timeout/amount_error/other) |
| 处理状态 | Select | 全部 (pending/suspended/supplemented/pending_review/closed) |
| 时间范围 | DatePicker.RangePicker | 近 7 天 |

#### 数据表格

| 列 | dataIndex | 宽度 | 渲染 |
|----|-----------|------|------|
| 订单号 | `orderNo` | 180 | 文字链接，点击打开 D01 |
| 时间 | `createdAt` | 170 | YYYY-MM-DD HH:mm:ss |
| 异常类型 | `exceptionType` | 120 | Tag（掉电=红、超时=橙、金额异常=紫） |
| 异常原因 | `exceptionReason` | 200 | 文本，超长省略 |
| 金额(元) | `totalAmount` | 100 | ¥ 数字 |
| 处理状态 | `handleStatus` | 100 | Tag（颜色见 ux-design §4.3） |
| 操作 | — | 160 | 按处理状态显示 |

**操作列逻辑：**

| 处理状态 | 操作按钮 |
|---------|---------|
| pending | `[挂起]`(Default) `[补单]`(Primary) |
| suspended | `[取消挂起]`(文字) `[补单]`(Primary) |
| pending_review | `[通过]`(绿色) `[驳回]`(红色) — [MVP+] |
| supplemented / closed | `[详情]`(文字) |

#### 数据源

```
GET /api/v1/stations/:stationId/fueling-orders/exceptions
Query: exceptionType, handleStatus, dateFrom, dateTo, page, pageSize
Response: { items: ExceptionOrder[], pagination, statistics }
```

---

### P03: 退款管理页 (RefundManagement)

**路由：** `/energy-trade/order/refunds`
**对应 Story：** US-016, US-017, US-018
**权限：** `station_master`, `ops_manager`, `finance`, `admin`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 订单管理 / 退款管理
- **标题：** 退款管理

#### Tab 切换

**组件：** Tabs，2 个 Tab

| Tab | Key | 内容 | Badge |
|-----|-----|------|-------|
| 退款记录 | records | 退款记录列表 | — |
| 退款审批 | approvals | 待审批退款列表 | 待审批数量 |

#### Tab 1: 退款记录列表

**筛选栏：**

| 筛选项 | 组件 | 默认值 |
|--------|------|--------|
| 退款状态 | Select | 全部 (pending/approved/refunded/rejected) |
| 时间范围 | DatePicker.RangePicker | 近 30 天 |
| 搜索 | Input.Search | 按订单号搜索 |

**表格列：**

| 列 | dataIndex | 宽度 | 渲染 |
|----|-----------|------|------|
| 原订单号 | `orderNo` | 180 | 文字链接，点击打开 D01 |
| 退款金额 | `refundAmount` | 110 | ¥ 数字，红色 |
| 退款类型 | `refundType` | 100 | 全额退款/部分退款 |
| 退款原因 | `refundReason` | 200 | 文本 |
| 退款状态 | `refundStatus` | 100 | Tag |
| 申请人 | `applicant` | 100 | 文本 |
| 申请时间 | `createdAt` | 160 | YYYY-MM-DD HH:mm |
| 操作 | — | 80 | `[详情]` |

#### Tab 2: 退款审批列表

**表格列同退款记录，操作列：**

| 退款状态 | 操作按钮 |
|---------|---------|
| pending | `[通过]`(绿色) `[驳回]`(红色) |
| 其他 | `[详情]` |

**通过操作：** Popconfirm "确认通过此退款申请？"→ 通过 → Toast "审批通过，退款已执行" → 从列表移除

**驳回操作：** Modal 输入驳回原因（必填） → 驳回 → Toast "已驳回" → 从列表移除

#### 数据源

```
GET /api/v1/stations/:stationId/refunds
Query: refundStatus, dateFrom, dateTo, keyword, page, pageSize
Response: { items: RefundRecord[], pagination }

PATCH /api/v1/stations/:stationId/refunds/:id/approve
PATCH /api/v1/stations/:stationId/refunds/:id/reject
Body: { reason }
```

---

### P04: 订单设置页 (OrderSettings)

**路由：** `/energy-trade/order/settings`
**对应 Story：** US-020
**权限：** `station_master`, `admin`
**优先级：** [MVP+]

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 订单管理 / 订单设置
- **标题：** 订单设置

#### 标签管理卡片

**组件：** Card，标题 "订单标签管理"

**操作按钮：** `[+ 新增标签]` → 弹出 Popover 输入标签名称

**表格列：**

| 列 | dataIndex | 宽度 | 渲染 |
|----|-----------|------|------|
| 标签名称 | `name` | 200 | Tag 样式展示 |
| 使用次数 | `usageCount` | 100 | 数字 |
| 创建时间 | `createdAt` | 160 | YYYY-MM-DD |
| 操作 | — | 120 | `[编辑]` `[删除]`(Popconfirm) |

---

## 4. 抽屉与弹窗设计

### D01: 订单详情抽屉 (OrderDetailDrawer)

**宽度：** 640px
**触发：** P01/P02/P03 列表中点击订单号或"详情"按钮

**内容区域：**

| 区域 | 组件 | 内容 |
|------|------|------|
| 订单状态 | Steps | 创建 → 加注完成 → 支付完成 → 完成，当前状态高亮 |
| 基本信息 | Descriptions(2列) | 订单号、创建时间、枪号、燃料类型、订单状态、操作人 |
| 加注明细 | Descriptions(2列) | 充装量(kg)、单价(元/kg)、订单金额(元) |
| 支付明细 | Table(小表格) | 支付方式、支付金额、交易流水号、支付时间 |
| 优惠明细 | Descriptions | 优惠类型、优惠金额（如有） |
| 会员信息 | Descriptions | 会员姓名、手机号、等级 ⚠️ Phase 4 mock |
| 车辆信息 | Descriptions | 车牌号、车型 ⚠️ Phase 4 mock |
| 标签/备注 | Tag + Text | 订单标签 + 备注内容 |
| 退款记录 | Table(小表格) | 退款金额、退款原因、退款状态、退款时间（如有退款） |

**底部操作按钮（按订单状态显示）：**
- pending_payment: `[收银]`(Primary) `[取消订单]`(Default)
- paid/completed: `[退款]`(Danger text) `[添加备注]`(Default)
- exception: `[补单]`(Primary) `[挂起]`(Default)

---

### D02: 创建订单抽屉 (CreateOrderDrawer)

**宽度：** 480px
**触发：** P01 "创建订单"按钮

**表单字段：**

| 字段 | 组件 | 必填 | 说明 |
|------|------|------|------|
| 枪号 | Select | ✅ | 当前站点枪列表，选中后显示燃料类型和当前单价 |
| 燃料类型 | Input(只读) | — | 自动根据枪号填充 |
| 当前单价 | Input(只读) | — | 自动获取价格（元/kg），来自价格管理 API |
| 充装量 | InputNumber | ✅ | 单位 kg，最小 0.01，最大 9999 |
| 订单金额 | Input(只读) | — | 自动计算：充装量 × 单价 |
| 车牌号 | Input | — | 可选填 |
| 备注 | TextArea | — | 可选填，最多 200 字 |

**底部操作：** `[创建订单]`(Primary) `[取消]`(Default)

**提交后：** Toast "订单创建成功" → Drawer 关闭 → 列表刷新

---

### D03: 补单抽屉 (SupplementDrawer)

**宽度：** 480px
**触发：** P02 异常订单"补单"按钮 / D01 详情"补单"按钮

**内容：**

| 区域 | 说明 |
|------|------|
| 订单摘要 | 只读展示：订单号、枪号、燃料类型、充装量、金额、异常原因 |
| 补单表单 | 见下方字段 |

**表单字段：**

| 字段 | 组件 | 必填 | 说明 |
|------|------|------|------|
| 支付方式 | Radio.Group | ✅ | 现金/微信/支付宝/银联 |
| 实付金额 | InputNumber | ✅ | 默认为订单金额，可修改 |
| 补单原因 | Select + TextArea | ✅ | 预设原因（掉电、设备故障、客户离场、其他）+ 自定义输入 |

**底部操作：** `[提交补单]`(Primary) `[取消]`(Default)

---

### M01: 支付面板弹窗 (PaymentModal)

**宽度：** 520px
**触发：** P01 列表"收银"按钮 / D01 详情"收银"按钮

**布局：**

```
┌──────────────────────────────────────────────┐
│                   收银                        │
│                                              │
│            应付金额                           │
│          ¥ 156.00                            │
│   枪号: 01号  |  LNG  |  32.50 kg           │
│                                              │
│   ┌─────────┐  ┌─────────┐                  │
│   │  💵 现金  │  │ 微信支付 │                  │
│   └─────────┘  └─────────┘                  │
│   ┌─────────┐  ┌─────────┐                  │
│   │ 支付宝   │  │  银联   │                   │
│   └─────────┘  └─────────┘                  │
│                                              │
│   ── 选择"现金"后 ──                         │
│   实收金额: [200.00        ]                 │
│   找零:     ¥ 44.00                          │
│                                              │
│            [确认支付]   [取消]                 │
└──────────────────────────────────────────────┘
```

**支付方式按钮：** 2x2 网格，每个 120x60px，含图标和文字

**现金模式：** 选择后显示实收金额输入框 + 自动计算找零

**电子支付模式：** 选择后显示"等待支付确认…" + 倒计时(5min) + `[确认收到]` 按钮

**混合支付 [MVP+]：** 底部 Link "使用混合支付 →"，展开多种方式各自金额输入

---

### M02: 退款申请弹窗 (RefundModal)

**宽度：** 480px
**触发：** D01 详情"退款"按钮

**表单字段：**

| 字段 | 组件 | 必填 | 说明 |
|------|------|------|------|
| 退款类型 | Radio.Group | ✅ | 全额退款 / 部分退款 |
| 退款金额 | InputNumber | ✅ | 全额退款时自动填入原订单金额(只读)；部分退款时可编辑，max = 可退金额 |
| 退款原因 | TextArea | ✅ | 最多 500 字 |

**可退金额提示：** "可退金额: ¥XX.XX (原订单 ¥XX.XX - 已退 ¥XX.XX)"

**底部操作：** `[提交退款申请]`(Danger) `[取消]`(Default)

**提交前二次确认：** Popconfirm "确认提交退款申请？退款将等待审批。"

---

### M03: 小票预览弹窗 (ReceiptPreviewModal)

**宽度：** 400px
**触发：** 支付成功后自动弹出 / D01 详情"查看小票"按钮
**优先级：** [MVP+]

**内容：**

```
┌──────────────────────────┐
│    ⛽ 北京朝阳加气站       │
│                          │
│  订单号: ST001-0225-0001 │
│  时间: 2026-02-25 14:30  │
│                          │
│  枪号: 01号               │
│  燃料: LNG               │
│  单价: ¥4.80/kg          │
│  数量: 32.50 kg          │
│  ────────────────────    │
│  金额: ¥156.00           │
│  支付: 微信支付           │
│                          │
│  标签: 滴滴(6.05)        │
│  备注: 无                 │
│                          │
│    [🖨 打印]  [关闭]      │
└──────────────────────────┘
```

**打印：** 调用 `window.print()` 或 iframe 打印

---

## 5. 路由设计

```typescript
// router.tsx 新增路由
{
  path: 'energy-trade/order',
  children: [
    { index: true, element: <Navigate to="list" replace /> },
    { path: 'list', element: withSuspense(lazy(() => import('./features/energy-trade/order-transaction/pages/OrderList'))) },
    { path: 'exceptions', element: withSuspense(lazy(() => import('./features/energy-trade/order-transaction/pages/ExceptionOrderList'))) },
    { path: 'refunds', element: withSuspense(lazy(() => import('./features/energy-trade/order-transaction/pages/RefundManagement'))) },
    { path: 'settings', element: withSuspense(lazy(() => import('./features/energy-trade/order-transaction/pages/OrderSettings'))) },
  ],
}
```

---

## 6. 状态管理

### 6.1 页面级状态

| 页面 | 状态 | 类型 | 说明 |
|------|------|------|------|
| P01 | `filters` | 多个 useState | 各筛选条件 |
| P01 | `statisticsDimension` | useState<'today'\|'shift'> | 订单统计维度切换 |
| P01 | `selectedOrder` | useState<FuelingOrder\|null> | 当前选中订单（详情 Drawer） |
| P01 | `paymentModalVisible` | useState<boolean> | 支付 Modal 显示 |
| P02 | `processedIds` | useState<Set<string>> | 已处理的异常订单 ID（从列表移除） |
| P03 | `activeTab` | useState<'records'\|'approvals'> | 当前 Tab |

### 6.2 跨模块数据消费

| 数据 | 来源 | 接口 | 用途 |
|------|------|------|------|
| 当前站点 | AppLayout | `useOutletContext<LayoutContext>()` | 所有页面的站点上下文 |
| 枪列表 | 1.1 站点管理 | mock 数据 | 创建订单时枪选择器 |
| 当前价格 | 2.1 价格管理 | `getPriceOverviewData()` | 创建订单时自动获取单价 |
| 班次信息 | 1.2 交接班管理 | mock 数据 | 统计维度（当班） |

---

## 7. i18n 命名空间

**命名空间前缀：** `order.*`

```
order.title — 订单管理
order.list — 订单列表
order.exceptions — 异常订单
order.refunds — 退款管理
order.settings — 订单设置

order.stats.totalOrders — 总订单数
order.stats.totalAmount — 总金额
order.stats.totalQuantity — 总充装量
order.stats.pendingPayment — 待支付

order.status.filling — 加注中
order.status.pendingPayment — 待支付
order.status.paid — 已支付
order.status.completed — 已完成
order.status.cancelled — 已取消
order.status.exception — 异常
order.status.refundPending — 退款审批中
order.status.refunded — 已退款

order.payment.cash — 现金
order.payment.wechat — 微信支付
order.payment.alipay — 支付宝
order.payment.unionpay — 银联

order.exception.powerLoss — 掉电未付
order.exception.timeout — 超时未付
order.exception.amountError — 金额异常
order.exception.other — 其他

order.action.pay — 收银
order.action.cancel — 取消订单
order.action.refund — 退款
order.action.supplement — 补单
order.action.suspend — 挂起
order.action.unsuspend — 取消挂起
order.action.approve — 通过
order.action.reject — 驳回
order.action.export — 导出
order.action.createOrder — 创建订单
order.action.addNote — 添加备注
order.action.addTag — 添加标签
order.action.print — 打印

order.refund.fullRefund — 全额退款
order.refund.partialRefund — 部分退款
order.refund.refundableAmount — 可退金额
```

---

*文档生成时间：2026-02-25*
*基于：user-stories.md + ux-design.md + ui-schema Skill 定义*
