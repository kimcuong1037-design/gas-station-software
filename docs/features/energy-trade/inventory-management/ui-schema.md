# 库存管理 — UI Schema

**模块：** 能源交易 > 库存管理 (2.3)
**基于：** user-stories.md v1.0 + ux-design.md v1.0
**设计日期：** 2026-02-28
**状态：** 待确认

---

## 1. 页面清单

| # | 页面名称 | 类型 | 路由 | 对应 Story | 响应式支持 |
|---|---------|------|------|-----------|-----------|
| P01 | 库存总览 | 看板页 | /energy-trade/inventory/overview | US-001, US-002 | ✅ 卡片→堆叠 |
| P02 | 入库管理 | 列表页 | /energy-trade/inventory/inbound | US-003, US-004, US-005 | ✅ 表格→卡片 |
| P03 | 出库记录 | 列表页 | /energy-trade/inventory/outbound | US-007, US-008 | ✅ 表格→卡片 |
| P04 | 进销存流水 | 列表页 | /energy-trade/inventory/ledger | US-009 | ✅ 表格→卡片 |
| P05 | 罐存比对 | Tab 看板+列表 | /energy-trade/inventory/tank-comparison | US-010~US-014 | ✅ 卡片→堆叠 |
| P06 | 预警管理 | Tab 列表页 | /energy-trade/inventory/alerts | US-015~US-019 | ✅ 表格→卡片 |
| D01 | 创建入库单抽屉 | Drawer | — (Drawer) | US-004 | ✅ 全宽 |
| D02 | 损耗出库登记抽屉 | Drawer | — (Drawer) | US-008 | ✅ 全宽 |
| D03 | 入库详情抽屉 | Drawer | — (Drawer) | US-003 | ✅ 全宽 |
| M01 | 盘点调整弹窗 | Modal | — (Modal) | US-014 [MVP+] | ✅ |
| M02 | 审核弹窗 | Modal | — (Modal) | US-005, US-008 | ✅ |

---

## 2. 侧边栏菜单结构

```text
能源交易 (energy-trade)
├── 价格管理 (price-management)                    # 模块 2.1
│   ├── ...（已有 7 个菜单项）
├── 订单管理 (order)                               # 模块 2.2
│   ├── ...（已有 4 个菜单项）
└── 库存管理 (inventory)                           # 本模块 2.3
    ├── 库存总览 → P01 (默认落地页)
    ├── 入库管理 → P02
    ├── 出库记录 → P03
    ├── 进销存流水 → P04
    ├── 罐存比对 → P05
    └── 预警管理 → P06  (Badge: 活跃预警数)
```

**侧边栏 Badge：**
- "预警管理"菜单项旁显示红色 Badge（活跃预警数量），仅当活跃预警 > 0 时显示

---

## 3. 页面详细设计

### P01: 库存总览 (InventoryOverview)

**路由：** `/energy-trade/inventory/overview`
**对应 Story：** US-001, US-002
**权限：** `station_master`, `shift_leader`, `ops_manager`, `finance`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 库存管理 / 库存总览
- **标题：** 库存总览

#### 库存卡片区 (InventoryCards)

**布局：** Row + Col（按燃料类型动态生成，每卡片 span=8，3 列）

每张卡片内容：

| 区域 | 组件 | 内容 |
|------|------|------|
| 标题 | Text + Tag | 燃料类型名称 + 预警级别 Tag（safe 不显示 / warning 橙 / critical 红） |
| 罐容比 | Progress(type="line") | 进度条 + 百分比文字，颜色三级：绿(>30%) → 橙(≤30%) → 红(≤10%) |
| 当前库存 | Statistic | `XX,XXX.XX kg` |
| 今日变化 | Space(3组) | 入库 ↑XX kg (绿) / 出库 ↓XX kg (蓝) / 净变化 ±XX kg (红或绿) |

**Tooltip（罐容比进度条）：** "罐容比 = 实际罐存 ÷ 储罐额定容量 × 100%"

#### 库存趋势图区 (TrendChart)

**布局：** Card 包裹 ECharts 折线图

| 配置项 | 说明 |
|--------|------|
| 图表类型 | Line Chart (ECharts) |
| X 轴 | 日期 |
| Y 轴 | 库存量 (kg) |
| 系列 | 按燃料类型分色（LNG=#1890ff, CNG=#52c41a, L-CNG=#722ed1） |
| 时间维度 | 右上角 Radio.Group: 近 7 天(默认) / 近 30 天 |
| 交互 | Tooltip 显示每日各类型库存量 |

**空状态：** "暂无库存数据，请先完成入库操作" + `[新增入库]` 按钮（跳转 `/energy-trade/inventory/inbound`）

#### 数据源 (Mock API)

```
GET /api/v1/stations/:stationId/inventory/overview
Response: { cards: InventoryCard[], trendData: TrendDataPoint[] }

InventoryCard: { fuelTypeId, fuelTypeName, currentStock, ratedCapacity, tankLevelRatio, alertLevel, todayInbound, todayOutbound, todayNetChange }
TrendDataPoint: { date, fuelTypeId, stock }
```

---

### P02: 入库管理 (InboundManagement)

**路由：** `/energy-trade/inventory/inbound`
**对应 Story：** US-003, US-004, US-005
**权限：** `station_master`, `shift_leader`, `ops_manager`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 库存管理 / 入库管理
- **标题：** 入库管理
- **操作按钮：**
  - `[+ 新增入库]` (Primary) — 权限: `shift_leader`, `station_master`，打开 D01

#### 筛选栏 (FilterBar)

**布局：** Row + Space.wrap

| 筛选项 | 组件 | 默认值 | 说明 |
|--------|------|--------|------|
| 时间范围 | DatePicker.RangePicker | 近 7 天 | 入库时间范围 |
| 燃料类型 | Select (allowClear) | 全部 | 当前站点燃料类型 |
| 审核状态 | Select (allowClear) | 全部 | pending_review / approved / rejected |
| 搜索 | Input.Search | — | 入库单号/供应商名称/送货单号 |

#### 数据表格 (Table)

| 列 | dataIndex | 宽度 | 渲染 | 排序 |
|----|-----------|------|------|------|
| 入库单号 | `inboundNo` | 160 | 文字链接，点击打开 D03 | — |
| 供应商 | `supplierName` | 140 | 文本 | — |
| 送货单号 | `deliveryNo` | 140 | 文本 | — |
| 燃料类型 | `fuelTypeName` | 100 | 文本 | — |
| 目标储罐 | `tankName` | 120 | 文本 | — |
| 计划量(kg) | `plannedQuantity` | 110 | 数字，3位小数 | ✅ |
| 实收量(kg) | `actualQuantity` | 110 | 数字，3位小数 | ✅ |
| 入库偏差 | `variance` | 110 | 数字 + 百分比，负值红色标注 | — |
| 入库时间 | `inboundTime` | 170 | YYYY-MM-DD HH:mm:ss | ✅ 默认倒序 |
| 操作员 | `operatorName` | 100 | 文本 | — |
| 审核状态 | `auditStatus` | 100 | Tag（待审核=橙warning / 已通过=绿success / 已驳回=红error） | — |
| 操作 | — | 120 | 按审核状态显示 | — |

**scroll.x：** 1480

**操作列逻辑：**

| 审核状态 | 操作按钮 |
|---------|---------|
| pending_review | `[通过]`(绿色) `[驳回]`(红色) — 权限: `station_master` |
| approved / rejected | `[详情]`(文字链接) |

**通过操作：** Popconfirm "确认通过此入库单？通过后将更新理论库存。" → 通过 → message.success "审核通过，库存已更新" → 列表刷新

**驳回操作：** 打开 M02 审核弹窗，输入驳回原因（必填） → 驳回 → message.warning "已驳回，原因：XXX" → 列表刷新

**分页配置：** `pageSize: 20`, `showSizeChanger: true`, `showQuickJumper: true`, `showTotal`

**空状态：** "暂无入库记录" + `[新增入库]` 按钮

#### 数据源 (Mock API)

```
GET /api/v1/stations/:stationId/inventory/inbound-records
Query: fuelTypeId, auditStatus, dateFrom, dateTo, keyword, page, pageSize
Response: { items: InboundRecord[], pagination: { total, page, pageSize } }

PATCH /api/v1/stations/:stationId/inventory/inbound-records/:id/approve
Response: { success: true }

PATCH /api/v1/stations/:stationId/inventory/inbound-records/:id/reject
Body: { reason: string }
Response: { success: true }
```

---

### P03: 出库记录 (OutboundRecords)

**路由：** `/energy-trade/inventory/outbound`
**对应 Story：** US-007, US-008
**权限：** `station_master`, `shift_leader`, `ops_manager`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 库存管理 / 出库记录
- **标题：** 出库记录
- **操作按钮：**
  - `[+ 登记损耗出库]` (Default) — 权限: `shift_leader`, `station_master`，打开 D02

#### 筛选栏 (FilterBar)

| 筛选项 | 组件 | 默认值 | 说明 |
|--------|------|--------|------|
| 时间范围 | DatePicker.RangePicker | 近 7 天 | 出库时间范围 |
| 出库类型 | Select (allowClear) | 全部 | sales(销售出库) / loss(损耗出库) / reversal(冲红) |
| 燃料类型 | Select (allowClear) | 全部 | 当前站点燃料类型 |
| 操作来源 | Select (allowClear) | 全部 | auto(自动) / manual(手动) |

#### 数据表格 (Table)

| 列 | dataIndex | 宽度 | 渲染 | 排序 |
|----|-----------|------|------|------|
| 出库单号 | `outboundNo` | 160 | 文本 | — |
| 出库类型 | `outboundType` | 100 | Tag（销售=蓝 / 损耗=橙 / 冲红=红） | — |
| 燃料类型 | `fuelTypeName` | 100 | 文本 | — |
| 数量(kg) | `quantity` | 110 | 数字，3位小数 | ✅ |
| 金额(元) | `amount` | 110 | ¥ 数字，2位小数 | ✅ |
| 关联单号 | `relatedOrderNo` | 180 | 文字链接（销售出库→跳转订单详情 `/energy-trade/order/list` 并打开 D01；损耗→无链接） | — |
| 损耗原因 | `lossReason` | 120 | 文本（仅损耗出库显示；销售出库显示 "—"） | — |
| 操作来源 | `source` | 80 | Tag（自动=蓝default / 手动=橙warning） | — |
| 审批状态 | `approvalStatus` | 100 | Tag（仅损耗出库显示；待审批=橙 / 已通过=绿 / 已驳回=红；销售出库显示 "—"） | — |
| 出库时间 | `outboundTime` | 170 | YYYY-MM-DD HH:mm:ss | ✅ 默认倒序 |
| 操作 | — | 100 | 按类型和状态显示 | — |

**scroll.x：** 1430

**操作列逻辑：**

| 条件 | 操作按钮 |
|------|---------|
| 损耗出库 + pending_approval | `[通过]`(绿色) `[驳回]`(红色) — 权限: `shift_leader`, `station_master` |
| 销售出库 | `[查看订单]`(文字) — 跳转 `/energy-trade/order/list` 并打开关联订单详情 |
| 冲红 | `[查看原单]`(文字) |
| 其他 | — |

**分页配置：** `pageSize: 20`, `showSizeChanger: true`, `showQuickJumper: true`, `showTotal`

**空状态：** "暂无出库记录，订单完成后将自动生成销售出库"

#### 数据源 (Mock API)

```
GET /api/v1/stations/:stationId/inventory/outbound-records
Query: outboundType, fuelTypeId, source, dateFrom, dateTo, page, pageSize
Response: { items: OutboundRecord[], pagination: { total, page, pageSize } }

PATCH /api/v1/stations/:stationId/inventory/outbound-records/:id/approve
Response: { success: true }

PATCH /api/v1/stations/:stationId/inventory/outbound-records/:id/reject
Body: { reason: string }
Response: { success: true }
```

---

### P04: 进销存流水 (TransactionLedger)

**路由：** `/energy-trade/inventory/ledger`
**对应 Story：** US-009
**权限：** `station_master`, `ops_manager`, `finance`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 库存管理 / 进销存流水
- **标题：** 进销存流水
- **操作按钮：**
  - `[↓ 导出]` (Default, DownloadOutlined) — 权限: `finance`, `ops_manager`，按当前筛选条件导出 Excel

#### 筛选栏 (FilterBar)

| 筛选项 | 组件 | 默认值 | 说明 |
|--------|------|--------|------|
| 时间范围 | DatePicker.RangePicker | 近 7 天 | 流水时间范围 |
| 流水类型 | Select (allowClear, mode=multiple) | 全部 | inbound(入库) / sales_outbound(销售出库) / loss_outbound(损耗出库) / stock_adjustment(盘点调整) / reversal(冲红) |
| 燃料类型 | Select (allowClear) | 全部 | 当前站点燃料类型 |

#### 数据表格 (Table)

| 列 | dataIndex | 宽度 | 渲染 | 排序 |
|----|-----------|------|------|------|
| 时间 | `transactionTime` | 170 | YYYY-MM-DD HH:mm:ss | ✅ 默认倒序 |
| 类型 | `transactionType` | 100 | Tag（入库=绿 / 销售出库=蓝 / 损耗出库=橙 / 盘点调整=灰 / 冲红=红） | — |
| 燃料类型 | `fuelTypeName` | 100 | 文本 | — |
| 数量(kg) | `quantity` | 110 | 数字，3位小数；入库/冲红为正(绿色+号)，出库为负(红色−号) | ✅ |
| 金额(元) | `amount` | 110 | ¥ 数字，2位小数 | ✅ |
| 库存余量(kg) | `stockBalance` | 120 | 数字，3位小数 | — |
| 操作人/来源 | `operatorOrSource` | 120 | 文本（自动出库显示"系统自动"） | — |
| 关联单号 | `relatedNo` | 180 | 文字链接（入库→打开 D03 / 销售→订单详情 / 损耗→无 / 盘点→无 / 冲红→原出库记录） | — |

**scroll.x：** 1010

**行展开（expandedRowRender）：**

| 展开字段 | 内容 |
|---------|------|
| 审批记录 | 审批人、审批时间、审批结果（如有） |
| 备注 | 文本（如有） |

**分页配置：** `pageSize: 20`, `showSizeChanger: true`, `showQuickJumper: true`, `showTotal`

**空状态：** "暂无流水记录"

#### 数据源 (Mock API)

```
GET /api/v1/stations/:stationId/inventory/transactions
Query: transactionType[], fuelTypeId, dateFrom, dateTo, page, pageSize
Response: { items: InventoryTransaction[], pagination: { total, page, pageSize } }

POST /api/v1/stations/:stationId/inventory/transactions/export
Body: { transactionType[], fuelTypeId, dateFrom, dateTo }
Response: Blob (Excel file)
```

---

### P05: 罐存比对 (TankComparison)

**路由：** `/energy-trade/inventory/tank-comparison`
**对应 Story：** US-010, US-011, US-012, US-013, US-014
**权限：** `station_master`, `ops_manager`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 库存管理 / 罐存比对
- **标题：** 罐存比对

#### Tab 切换

**组件：** Tabs，2 个 Tab

| Tab | Key | 内容 | 说明 |
|-----|-----|------|------|
| 实时比对 | realtime | 储罐卡片网格 + 偏差分析 | US-010, US-011, US-013 |
| 比对历史 | history | 历史快照列表 + 趋势图 | US-012 |

#### Tab 1: 实时比对 (RealtimeComparison)

**储罐卡片网格：**

**布局：** Row + Col（span=8，3列），每个储罐一张卡片

每张卡片内容：

```
┌─────────────────────────────────┐
│  LNG储罐-01         ⚠️ (偏差警告图标)
│  燃料类型: LNG                   │
│                                  │
│  额定容量     20,000 kg          │
│  实际罐存     15,230.500 kg      │
│  ████████████░░░░  76.2%        │  ← Progress bar (绿色)
│                                  │
│  理论库存     15,480.200 kg      │
│  偏差值       -249.700 kg (红色)  │
│  偏差率       -1.61%  (默认色)    │
│                                  │
│  ────────── 展开详情 ──────────  │
│                                  │
│  [偏差分析]     [盘点调整] (MVP+) │
└─────────────────────────────────┘
```

**卡片样式规则：**

| 偏差率 | 卡片边框 | 偏差值颜色 | 偏差率颜色 |
|--------|---------|-----------|-----------|
| ±2% 以内 | 默认边框 | 正值绿 / 负值红 | 默认色 |
| 超过 ±2% | 红色边框 | 红色 | 红色 + 警告图标 |

**Tooltip（理论库存值）：** "理论库存 = 期初 + Σ入库 − Σ销售出库 − Σ损耗出库 ± Σ盘点调整"
**Tooltip（偏差率数值）：** "偏差率 = (实际罐存 − 理论库存) ÷ 理论库存 × 100%"

**偏差分析展开区域：**

点击卡片 `[偏差分析]` 按钮，卡片下方展开 Collapse 面板：

| 区域 | 内容 |
|------|------|
| 偏差结论 | "盈余"(绿) 或 "亏损"(红) + 偏差值 + 偏差率 |
| 可能原因 | 列表：泄漏、计量误差、未登记损耗、温度变化蒸发（仅亏损时显示） |
| 建议操作 | 偏差 >2%: "建议检查储罐密封性并执行盘点调整"；≤2%: "偏差在正常范围内" |
| 近 7 天偏差趋势 | 迷你折线图 (ECharts, 高80px)：X=日期，Y=偏差率(%) |

**损耗分类区域（卡片网格下方）：**

**布局：** Card，标题 "损耗分类分析"，2 列布局（Row + Col span=12）

| 左栏：运输损耗 | 右栏：站内损耗 |
|--------------|--------------|
| 按供应商汇总入库偏差 | 按储罐汇总日均偏差率 |
| 表格：供应商、批次数、计划量合计、实收量合计、偏差率 | 表格：储罐、日均偏差率、损耗趋势(迷你Sparkline) |
| 超行业基准(2%)标红 | 超行业基准标红 |

**空状态：** "暂无储罐数据，请在设备设施中配置储罐" + 链接跳转 `/operations/equipment`

#### Tab 2: 比对历史 (ComparisonHistory)

**筛选栏：**

| 筛选项 | 组件 | 默认值 |
|--------|------|--------|
| 储罐 | Select (allowClear) | 全部 |
| 时间范围 | DatePicker.RangePicker | 近 30 天 |

**数据表格：**

| 列 | dataIndex | 宽度 | 渲染 | 排序 |
|----|-----------|------|------|------|
| 日期 | `snapshotDate` | 120 | YYYY-MM-DD | ✅ 默认倒序 |
| 储罐 | `tankName` | 120 | 文本 | — |
| 燃料类型 | `fuelTypeName` | 100 | 文本 | — |
| 实际罐存(kg) | `actualLevel` | 130 | 数字，3位小数 | — |
| 理论库存(kg) | `theoreticalStock` | 130 | 数字，3位小数 | — |
| 偏差值(kg) | `deviation` | 120 | 数字，正绿负红 | — |
| 偏差率(%) | `deviationRate` | 110 | 百分比，超 ±2% 红色 | ✅ |

**scroll.x：** 830

**偏差趋势图：**

选择特定储罐后，表格上方显示偏差率趋势折线图（ECharts）：
- X 轴：日期
- Y 轴：偏差率(%)
- 参考线：±2% 虚线（红色）
- 点击图表中的点可关联当日进出库流水

**分页配置：** `pageSize: 20`, `showSizeChanger: true`, `showQuickJumper: true`, `showTotal`

#### 数据源 (Mock API)

```
GET /api/v1/stations/:stationId/inventory/tank-comparison/realtime
Response: { tanks: TankComparisonCard[] }

TankComparisonCard: { tankId, tankName, fuelTypeId, fuelTypeName, ratedCapacity, actualLevel, theoreticalStock, deviation, deviationRate, alertLevel, trend7d: { date, deviationRate }[] }

GET /api/v1/stations/:stationId/inventory/tank-comparison/loss-analysis
Response: { transportLoss: SupplierLoss[], stationLoss: TankLoss[] }

GET /api/v1/stations/:stationId/inventory/tank-comparison/history
Query: tankId, dateFrom, dateTo, page, pageSize
Response: { items: ComparisonSnapshot[], pagination, trendData: TrendPoint[] }
```

---

### P06: 预警管理 (AlertManagement)

**路由：** `/energy-trade/inventory/alerts`
**对应 Story：** US-015, US-016, US-017, US-018, US-019
**权限：** `station_master`, `ops_manager`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 库存管理 / 预警管理
- **标题：** 预警管理

#### Tab 切换

**组件：** Tabs，2 个 Tab

| Tab | Key | 内容 | Badge |
|-----|-----|------|-------|
| 预警通知 | notifications | 预警列表（活跃+历史） | 活跃预警数量 |
| 阈值配置 | config | 预警规则配置表 | — |

#### Tab 1: 预警通知 (AlertNotifications)

**子 Tab 切换：** Tabs (type="card") — 活跃预警 / 历史预警

**活跃预警列表：**

| 列 | dataIndex | 宽度 | 渲染 | 排序 |
|----|-----------|------|------|------|
| 预警级别 | `alertLevel` | 90 | Tag（预警=橙warning / 紧急=红error / 损耗异常=紫色自定义#722ed1） | — |
| 预警类型 | `alertType` | 110 | 文本（低库存 / 损耗异常） | — |
| 燃料类型 | `fuelTypeName` | 100 | 文本 | — |
| 储罐 | `tankName` | 120 | 文本 | — |
| 当前值 | `currentValue` | 120 | 低库存: "XX.X% (XX,XXX kg)"；损耗: "偏差率 X.XX%" | — |
| 阈值 | `threshold` | 100 | "≤ XX%" 或 "> ±X%" | — |
| 触发时间 | `triggeredAt` | 170 | YYYY-MM-DD HH:mm:ss | ✅ 默认倒序 |
| 操作 | — | 140 | `[确认]`(Primary) `[忽略]`(Default) |

**scroll.x：** 950

**排序规则：** 按紧急度排序 — critical → warning → loss_anomaly

**确认操作：** Popconfirm "确认已知晓此预警？" → message.info "预警已确认" → 状态变为"已确认"

**忽略操作：** Popconfirm "确认忽略此预警？" → message.info "预警已忽略" → 从活跃列表移除

**历史预警列表：**

| 列 | dataIndex | 宽度 | 渲染 |
|----|-----------|------|------|
| 预警级别 | `alertLevel` | 90 | Tag |
| 预警类型 | `alertType` | 110 | 文本 |
| 燃料类型 | `fuelTypeName` | 100 | 文本 |
| 触发时间 | `triggeredAt` | 160 | YYYY-MM-DD HH:mm |
| 处理状态 | `handleStatus` | 100 | Tag（已确认=蓝 / 已忽略=灰 / 已恢复=绿） |
| 处理人 | `handledBy` | 100 | 文本 |
| 恢复/关闭时间 | `resolvedAt` | 160 | YYYY-MM-DD HH:mm |

**scroll.x：** 820

**空状态（活跃）：** "当前无活跃预警" + "✅ 所有指标正常"
**空状态（历史）：** "暂无历史预警记录"

#### Tab 2: 阈值配置 (ThresholdConfig)

**布局：** Card，按燃料类型分行配置

**配置表格（可编辑行）：**

| 列 | dataIndex | 宽度 | 组件 | 说明 |
|----|-----------|------|------|------|
| 燃料类型 | `fuelTypeName` | 120 | Text(只读) | 系统自动读取 |
| 安全阈值 | `safeThreshold` | 120 | InputNumber(suffix="%" / "kg") | 罐容比 > 此值为安全（默认 30%） |
| 预警阈值 | `warningThreshold` | 120 | InputNumber(suffix="%" / "kg") | 罐容比 ≤ 此值触发预警（默认 30%） |
| 紧急阈值 | `criticalThreshold` | 120 | InputNumber(suffix="%" / "kg") | 罐容比 ≤ 此值触发紧急（默认 10%） |
| 损耗偏差阈值 | `lossDeviationThreshold` | 140 | InputNumber(suffix="%") | 日偏差率超此值触发异常（默认 2%） |
| 阈值类型 | `thresholdType` | 120 | Radio.Group("百分比"/"绝对值") | 百分比=罐容比，绝对值=kg |
| 操作 | — | 100 | `[编辑]` `[保存]` | 行内编辑模式 |

**校验规则：**
- 紧急阈值 < 预警阈值 < 安全阈值，否则提示 "阈值设置不合理：紧急 < 预警 < 安全"
- 损耗偏差阈值范围：0.5% ~ 10%

**Tooltip（阈值类型）：** "百分比按罐容比判定，绝对值按实际库存(kg)判定"

**保存操作：** message.success "预警规则已更新，新阈值立即生效"

#### 数据源 (Mock API)

```
GET /api/v1/stations/:stationId/inventory/alerts
Query: status (active/history), page, pageSize
Response: { items: InventoryAlert[], pagination, activeCount: number }

PATCH /api/v1/stations/:stationId/inventory/alerts/:id/acknowledge
Response: { success: true }

PATCH /api/v1/stations/:stationId/inventory/alerts/:id/dismiss
Response: { success: true }

GET /api/v1/stations/:stationId/inventory/alert-config
Response: { rules: AlertRule[] }

PUT /api/v1/stations/:stationId/inventory/alert-config/:fuelTypeId
Body: { safeThreshold, warningThreshold, criticalThreshold, lossDeviationThreshold, thresholdType }
Response: { success: true }
```

---

## 4. 抽屉与弹窗设计

### D01: 创建入库单抽屉 (CreateInboundDrawer)

**宽度：** 480px
**触发：** P02 "新增入库"按钮

**表单字段：**

| 字段 | 标签 | 组件 | 必填 | 校验规则 | 说明 |
|------|------|------|------|---------|------|
| `tankId` | 目标储罐 | Select | ✅ | — | 当前站点储罐列表；选中后自动显示燃料类型和当前罐存 |
| `fuelTypeName` | 燃料类型 | Input(只读) | — | — | 自动根据储罐填充 |
| `currentLevel` | 当前罐存 | Input(只读) | — | — | 自动显示该储罐当前罐存(kg) |
| `supplierName` | 供应商 | Select (或 Input) | ✅ | 最大 100 字符 | MVP+ 使用 Select 下拉；MVP 阶段 Input 手动输入 |
| `deliveryNo` | 送货单号 | Input | — | 最大 50 字符 | 可选填 |
| `plannedQuantity` | 计划量(kg) | InputNumber | ✅ | min: 0.001, max: 99999 | 供应商送货单标注量 |
| `actualQuantity` | 实收量(kg) | InputNumber | ✅ | min: 0.001, max: 99999 | 实际接收量 |
| `inboundTime` | 入库时间 | DatePicker(showTime) | ✅ | — | 默认当前时间 |
| `remark` | 备注 | TextArea | — | 最大 200 字符 | 可选填 |

**入库偏差即时计算区域（表单下方）：**

```
┌──────────────────────────────────────────┐
│  入库偏差                                 │
│  偏差量: -50.000 kg        (红色)         │
│  偏差率: -2.00%            (红色)         │
│  ⚠️ 运输损耗 50.000 kg，占计划量 2.00%     │
└──────────────────────────────────────────┘
```

- 实收量 < 计划量时：偏差值红色，显示运输损耗提示
- 实收量 ≥ 计划量时：偏差值绿色，显示"实收量符合或超出计划"
- 仅当 `plannedQuantity` 和 `actualQuantity` 都有值时才显示

**容量校验：** 实收量 > 储罐剩余容量时显示警告 "⚠️ 超出储罐剩余容量 (剩余 X kg)"（不阻断提交，仅提示）

**底部操作：** `[提交入库单]`(Primary) `[取消]`(Default)

**提交后：** message.success "入库单已提交，等待审核" → Drawer 关闭 → P02 列表刷新

---

### D02: 损耗出库登记抽屉 (LossOutboundDrawer)

**宽度：** 480px
**触发：** P03 "登记损耗出库"按钮

**表单字段：**

| 字段 | 标签 | 组件 | 必填 | 校验规则 | 说明 |
|------|------|------|------|---------|------|
| `fuelTypeId` | 燃料类型 | Select | ✅ | — | 当前站点燃料类型 |
| `quantity` | 损耗量(kg) | InputNumber | ✅ | min: 0.001；max: 当前理论库存 | 不可超过当前理论库存 |
| `amount` | 金额(元) | Input(只读) | — | — | 自动计算：损耗量 × 当前单价 |
| `lossReason` | 损耗原因 | Select | ✅ | — | 蒸发损耗 / 泄漏 / 站间调拨 / 其他 |
| `reasonDetail` | 原因说明 | TextArea | 条件必填 | 最大 500 字符 | 选择"其他"时必填 |

**校验提示：**
- 损耗量 > 当前理论库存：禁止提交，错误提示 "损耗量不能超过当前理论库存 (XX.XXX kg)"
- 损耗量 > 理论库存 10%：警告提示 "⚠️ 损耗量较大，请确认数据准确性"

**底部操作：** `[提交损耗登记]`(Primary) `[取消]`(Default)

**提交后：** message.success "损耗记录已提交，等待审批" → Drawer 关闭 → P03 列表刷新

---

### D03: 入库详情抽屉 (InboundDetailDrawer)

**宽度：** 640px
**触发：** P02 列表中点击入库单号

**内容区域：**

| 区域 | 组件 | 内容 |
|------|------|------|
| 审核状态 | Steps(3步) | 提交 → 审核 → 入账，当前状态高亮 |
| 基本信息 | Descriptions(2列) | 入库单号、入库时间、供应商、送货单号、目标储罐、燃料类型、操作员 |
| 数量信息 | Descriptions(2列) | 计划量(kg)、实收量(kg)、入库偏差(kg)、偏差率(%) |
| 审核记录 | Table(小表格) | 审核人、审核时间、审核结果、驳回原因（如有） |

**底部操作按钮（按审核状态显示）：**
- pending_review: `[通过]`(Primary) `[驳回]`(Danger) — 权限: `station_master`
- approved / rejected: 无操作按钮

---

### M01: 盘点调整弹窗 (StockAdjustmentModal)

**宽度：** 480px
**触发：** P05 储罐卡片"盘点调整"按钮
**优先级：** [MVP+]

**预填信息（只读区域）：**

| 字段 | 内容 |
|------|------|
| 储罐 | 储罐名称 + 燃料类型 |
| 当前理论库存 | XX,XXX.XXX kg |
| 当前实际罐存 | XX,XXX.XXX kg |
| 当前偏差 | XX.XXX kg (X.XX%) |

**表单字段：**

| 字段 | 标签 | 组件 | 必填 | 校验规则 | 说明 |
|------|------|------|------|---------|------|
| `adjustedStock` | 调整后理论库存(kg) | InputNumber | ✅ | min: 0, max: 额定容量 | 默认预填实际罐存值 |
| `adjustmentReason` | 调整原因 | TextArea | ✅ | 最大 500 字符 | — |

**调整量预览：**
- 调整量 = 调整后理论库存 − 当前理论库存
- 正值显示 "+XX.XXX kg"(绿色)，负值显示 "−XX.XXX kg"(红色)
- 调整量 > 1%: 提示 "调整量超过 1%，需站长审批"
- 调整量 ≤ 1%: 提示 "班组长可审批"

**底部操作：** `[提交盘点调整]`(Primary) `[取消]`(Default)

**提交前确认：** Popconfirm "确认提交盘点调整？调整将影响理论库存。"

**提交后：** message.success "盘点调整已提交审批" → Modal 关闭 → P05 卡片刷新

---

### M02: 审核弹窗 (AuditModal)

**宽度：** 400px
**触发：** P02 入库单"驳回"按钮 / P03 损耗出库"驳回"按钮

**表单字段：**

| 字段 | 标签 | 组件 | 必填 | 校验规则 |
|------|------|------|------|---------|
| `rejectReason` | 驳回原因 | TextArea | ✅ | 最大 500 字符 |

**底部操作：** `[确认驳回]`(Danger) `[取消]`(Default)

---

## 5. 路由设计

```typescript
// router.tsx 新增路由
{
  path: 'energy-trade/inventory',
  children: [
    { index: true, element: <Navigate to="overview" replace /> },
    { path: 'overview', element: withSuspense(lazy(() => import('./features/energy-trade/inventory-management/pages/InventoryOverview'))) },
    { path: 'inbound', element: withSuspense(lazy(() => import('./features/energy-trade/inventory-management/pages/InboundManagement'))) },
    { path: 'outbound', element: withSuspense(lazy(() => import('./features/energy-trade/inventory-management/pages/OutboundRecords'))) },
    { path: 'ledger', element: withSuspense(lazy(() => import('./features/energy-trade/inventory-management/pages/TransactionLedger'))) },
    { path: 'tank-comparison', element: withSuspense(lazy(() => import('./features/energy-trade/inventory-management/pages/TankComparison'))) },
    { path: 'alerts', element: withSuspense(lazy(() => import('./features/energy-trade/inventory-management/pages/AlertManagement'))) },
  ],
}
```

---

## 6. 状态管理

### 6.1 页面级状态

| 页面 | 状态 | 类型 | 说明 |
|------|------|------|------|
| P01 | `trendRange` | useState<'7d'\|'30d'> | 趋势图时间维度切换 |
| P02 | `filters` | 多个 useState | 各筛选条件 |
| P02 | `createDrawerVisible` | useState\<boolean> | 创建入库单 Drawer 显示 |
| P02 | `selectedRecord` | useState<InboundRecord\|null> | 当前选中记录（详情 Drawer） |
| P03 | `lossDrawerVisible` | useState\<boolean> | 损耗出库 Drawer 显示 |
| P04 | `filters` | 多个 useState | 各筛选条件 |
| P05 | `activeTab` | useState<'realtime'\|'history'> | 当前 Tab |
| P05 | `expandedTankId` | useState<string\|null> | 展开偏差分析的储罐 ID |
| P05 | `adjustmentModalVisible` | useState\<boolean> | 盘点调整 Modal 显示 |
| P05 | `selectedTank` | useState<TankCard\|null> | 当前操作储罐 |
| P06 | `activeTab` | useState<'notifications'\|'config'> | 当前 Tab |
| P06 | `alertSubTab` | useState<'active'\|'history'> | 通知子 Tab |
| P06 | `editingRuleId` | useState<string\|null> | 正在编辑的配置行 ID |

### 6.2 跨模块数据消费

| 数据 | 来源 | 接口 | 用途 |
|------|------|------|------|
| 当前站点 | AppLayout | `useOutletContext<LayoutContext>()` | 所有页面的站点上下文 |
| 储罐列表 | 1.3 设备设施 | mock 数据 (Equipment type=tank) | D01 储罐选择器、P05 储罐卡片 |
| 储罐实时液位 | 1.3 设备设施 | mock 数据 (EquipmentMonitoring) | P05 实际罐存 |
| 燃料类型 | 1.1 站点管理 | mock 数据 (FuelType) | 全局筛选器、卡片展示 |
| 当前价格 | 2.1 价格管理 | `getPriceOverviewData()` | D02 损耗金额自动计算 |
| 订单详情 | 2.2 订单交易 | 出库记录中关联订单号跳转 | P03 关联订单号链接 |

---

## 7. i18n 命名空间

**命名空间前缀：** `inventory.*`

```
inventory.title — 库存管理
inventory.overview — 库存总览
inventory.inbound — 入库管理
inventory.outbound — 出库记录
inventory.ledger — 进销存流水
inventory.tankComparison — 罐存比对
inventory.alerts — 预警管理

inventory.card.currentStock — 当前库存
inventory.card.tankLevelRatio — 罐容比
inventory.card.todayInbound — 今日入库
inventory.card.todayOutbound — 今日出库
inventory.card.netChange — 净变化
inventory.card.ratedCapacity — 额定容量
inventory.card.actualLevel — 实际罐存
inventory.card.theoreticalStock — 理论库存
inventory.card.deviation — 偏差值
inventory.card.deviationRate — 偏差率

inventory.inbound.inboundNo — 入库单号
inventory.inbound.supplier — 供应商
inventory.inbound.deliveryNo — 送货单号
inventory.inbound.plannedQuantity — 计划量
inventory.inbound.actualQuantity — 实收量
inventory.inbound.variance — 入库偏差
inventory.inbound.createInbound — 新增入库

inventory.outbound.outboundNo — 出库单号
inventory.outbound.outboundType — 出库类型
inventory.outbound.salesOutbound — 销售出库
inventory.outbound.lossOutbound — 损耗出库
inventory.outbound.reversal — 冲红
inventory.outbound.source — 操作来源
inventory.outbound.autoSource — 系统自动
inventory.outbound.manualSource — 手动
inventory.outbound.registerLoss — 登记损耗出库

inventory.ledger.transactionType — 流水类型
inventory.ledger.stockBalance — 库存余量
inventory.ledger.export — 导出

inventory.loss.evaporation — 蒸发损耗
inventory.loss.leakage — 泄漏
inventory.loss.transfer — 站间调拨
inventory.loss.other — 其他

inventory.tank.surplus — 盈余
inventory.tank.deficit — 亏损
inventory.tank.normalRange — 正常范围
inventory.tank.deviationAnalysis — 偏差分析
inventory.tank.stockAdjustment — 盘点调整
inventory.tank.transportLoss — 运输损耗
inventory.tank.stationLoss — 站内损耗
inventory.tank.comparisonHistory — 比对历史

inventory.alert.level.warning — 预警
inventory.alert.level.critical — 紧急
inventory.alert.level.lossAnomaly — 损耗异常
inventory.alert.type.lowStock — 低库存
inventory.alert.type.lossAnomaly — 损耗异常
inventory.alert.status.active — 活跃
inventory.alert.status.acknowledged — 已确认
inventory.alert.status.dismissed — 已忽略
inventory.alert.status.recovered — 已恢复

inventory.alert.action.acknowledge — 确认
inventory.alert.action.dismiss — 忽略

inventory.audit.pendingReview — 待审核
inventory.audit.approved — 已通过
inventory.audit.rejected — 已驳回
inventory.audit.pendingApproval — 待审批
inventory.audit.approve — 通过
inventory.audit.reject — 驳回

inventory.trend.7days — 近 7 天
inventory.trend.30days — 近 30 天

inventory.config.safeThreshold — 安全阈值
inventory.config.warningThreshold — 预警阈值
inventory.config.criticalThreshold — 紧急阈值
inventory.config.lossDeviationThreshold — 损耗偏差阈值
inventory.config.thresholdType — 阈值类型
inventory.config.percentage — 百分比
inventory.config.absolute — 绝对值
```

---

## 8. 检查清单

- [x] 所有 [MVP] Story 都有对应的页面设计（US-001~US-004, US-007~US-013, US-015~US-018）
- [x] 所有 [MVP+] Story 都有对应的页面设计（US-005 审核, US-014 盘点调整, US-019 仪表盘内容融入 P06）
- [x] 所有页面都有明确的路由定义（6 条路由）
- [x] **路由一致性：所有交互跳转的路径与页面清单中的路由完全一致**
- [x] **无硬编码路径：交互行为中无自行发明的路径**
- [x] 列表页包含筛选/搜索功能（P02, P03, P04, P05-Tab2, P06）
- [x] 表格列定义完整（列名、dataIndex、宽度、渲染方式）
- [x] 所有带 explicit column width 的 Table 都有 scroll.x（P02:1480, P03:1430, P04:1010, P05-Tab2:830, P06-活跃:950, P06-历史:820）
- [x] 表单字段包含校验规则（D01, D02, M01, M02）
- [x] 交互行为明确（每个按钮点击后发生什么）
- [x] 页面间导航关系清晰（侧边栏 + 跨模块链接）
- [x] 组件选择优先使用 Ant Design 标准组件
- [x] 字段命名与 STANDARDS.md 术语表一致（储罐=tank, 罐存=tankLevel, 充装=fueling）
- [x] 侧边栏菜单结构已定义（3 层模式：能源交易→库存管理→叶子页面）
- [x] 侧边栏 Badge 已定义（预警管理菜单 Badge）
- [x] 跨模块数据消费已声明（6 项）
- [x] i18n 命名空间已定义（inventory.* 前缀）
- [x] 空状态设计覆盖所有页面

---

*文档生成时间：2026-02-28*
*基于：user-stories.md v1.0 + ux-design.md v1.0 + ui-schema Skill 定义*
