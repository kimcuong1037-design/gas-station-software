# 价格管理 — UI Schema

**模块：** 能源交易 > 价格管理 (2.1)
**基于：** user-stories.md v1.0 + ux-design.md v1.0 + architecture.md v1.0
**设计日期：** 2026-02-24
**状态：** 待确认

---

## 1. 页面清单

| # | 页面名称 | 类型 | 路由 | 对应 Story | 响应式支持 |
|---|---------|------|------|-----------|-----------|
| P01 | 价格总览页 | 看板+列表页 | /energy-trade/price-management | US-001, US-002, US-003, US-004, US-008 | ✅ 卡片→堆叠 |
| P02 | 调价历史页 | 列表页 | /energy-trade/price-management/history | US-006, US-009 | ✅ 表格→卡片 |
| P03 | 价格公示看板 | 特殊展示页 | /energy-trade/price-management/board | US-011, US-012, US-013 | ✅ 自适应 |
| P04 | 调价审批页 | 列表页 | /energy-trade/price-management/approvals | US-010 | ✅ 表格→卡片 |
| P05 | 会员专享价页 | 列表页 | /energy-trade/price-management/member-prices | US-014 | ✅ 表格→卡片 |
| P06 | 价格协议列表页 | 列表页 | /energy-trade/price-management/agreements | US-015, US-016, US-017 | ✅ 表格→卡片 |
| P07 | 调价设置页 | 列表+表单页 | /energy-trade/price-management/settings | US-007 | ✅ 单列堆叠 |
| D01 | 燃料类型调价抽屉 | Drawer | — (Drawer) | US-002, US-004, US-008 | ✅ 全宽 |
| D02 | 枪单独调价抽屉 | Drawer | — (Drawer) | US-003, US-008 | ✅ 全宽 |
| D03 | 调价详情抽屉 | Drawer | — (Drawer) | US-006 | ✅ 全宽 |
| D04 | 防御配置编辑抽屉 | Drawer | — (Drawer) | US-007 | ✅ 全宽 |
| D05 | 会员价编辑抽屉 | Drawer | — (Drawer) | US-014 | ✅ 全宽 |
| D06 | 协议表单抽屉 | Drawer | — (Drawer) | US-016, US-017 | ✅ 全宽 |
| M01 | 调价确认弹窗 | Modal | — (Modal) | US-008 | ✅ |
| M02 | 批量调价弹窗 | Modal | — (Modal) | US-005 | ✅ |

---

## 2. 侧边栏菜单结构

```text
能源交易 (energy-trade)
├── 价格管理 (price-management)                    # 本模块
│   ├── 价格总览 → P01 (默认落地页)
│   ├── 调价历史 → P02
│   ├── 价格公示 → P03
│   ├── 调价审批 → P04  (Badge: 待审批数)
│   ├── 会员专享价 → P05  [MVP+]
│   ├── 价格协议 → P06  [MVP+]
│   └── 调价设置 → P07
├── 订单管理 (2.2) [未开发]
└── 交易统计 (2.3) [未开发]
```

**侧边栏 Badge：**
- "调价审批" 菜单项旁显示待审批数量 Badge（红色圆点+数字），仅当 `pending_approval` 状态调价记录数量 > 0 时显示

**顶部导航通知：**
- 全局通知铃铛图标中也展示待审批数量，点击可快速跳转 P04

---

## 3. 页面详细设计

### P01: 价格总览页 (PriceOverview)

**路由：** `/energy-trade/price-management`
**对应 Story：** US-001, US-002, US-003, US-004, US-008
**权限：** `station_master`, `ops_manager`, `finance`, `admin`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 价格管理
- **标题：** 价格总览
- **操作按钮：**
  - `[批量调价]` (Default) — 权限: `price:adjust:batch`，打开 M02
  - `[⚙ 调价设置]` (Default, 齿轮图标) — 权限: `price:defense:read`，跳转 `/energy-trade/price-management/settings`

#### 顶部统计卡片区 (StatCards)

**布局：** 4列等宽卡片（Row + Col span=6）

| 卡片 | 字段 | 图标 | 颜色 | 说明 | 点击行为 |
|------|------|------|------|------|---------|
| 燃料类型 | `fuelTypeCount` | AppstoreOutlined | `#1890ff` | 当前站点燃料类型总数 | — |
| 独立定价枪 | `overrideNozzleCount` | AimOutlined | `#722ed1` | 有覆盖价的枪数量，0时灰色 | 滚动到下方列表，展开含覆盖价的行 |
| 待生效计划 | `pendingScheduleCount` | ClockCircleOutlined | `#faad14` | 待生效定时调价数量，0时灰色 | 展开待生效计划折叠面板 |
| 价格公示 | — | DashboardOutlined | `#52c41a` | 快捷入口文字"查看公示看板 →" | 跳转 `/energy-trade/price-management/board` |

**卡片结构：**
```
┌──────────────────────────────────┐
│  📦 燃料类型                      │
│                                  │
│        4                         │
│     CNG / LNG / 92# / 95#       │
└──────────────────────────────────┘
```

#### 待生效计划折叠面板 (Collapse)

**组件：** Collapse，默认收起；`pendingScheduleCount > 0` 时展示橙色边框提醒

**内容：** 待生效调价计划的简明卡片列表

| 字段 | 渲染 | 说明 |
|------|------|------|
| `fuelTypeName` | 文本(加粗) | 燃料类型名称 |
| `newPrice` | 金额(¥X.XX) | 计划新价格 |
| `effectiveAt` | 日期时间 YYYY-MM-DD HH:mm | 计划生效时间 |
| `adjustedBy` | 文本 | 创建人 |
| 操作 | [取消计划] | Popconfirm → 取消 → Toast "调价计划已取消" → 刷新 |

#### 首次使用提示

当站点无燃料类型价格数据时，显示空状态：
```
该站点暂无燃料类型价格，请先设置基准价格
[设置基准价]
```

#### 防御配置缺失提醒

当站点无 PriceDefenseConfig 时，顶部显示黄色 Alert：
```
⚠ 未配置调价防御，建议设置调价幅度限制     [前往设置 →]
```
链接跳转 `/energy-trade/price-management/settings`

#### 主列表：燃料类型价格列表

**组件：** Table (expandable rows)

| 列名 | 字段 | 宽度 | 对齐 | 渲染 | 排序 |
|------|------|------|------|------|------|
| 燃料类型 | `fuelTypeName` | 160px | left | 文本(加粗) + 单位(元/kg或元/L灰色) | — |
| 基准价 | `basePrice` | 120px | right | 金额 ¥X.XX，大字号加粗 `#1890ff` | ✅ |
| 关联枪数 | `nozzleCount` | 90px | center | 数字，有覆盖价时追加"(X枪独立定价)" 蓝色小字 | — |
| 最近调价 | `lastAdjustedAt` | 140px | center | 日期 YYYY-MM-DD HH:mm | ✅ |
| 状态标记 | `pendingAdjustment` | 100px | center | 有待生效调价时显示橙色 Tag "待调价 {日期}" | — |
| 操作 | — | 120px | center | [调价] | — |

**操作列详情：**

| 操作 | 类型 | 权限 | 行为 | 条件显示 |
|------|------|------|------|---------|
| 调价 | Button(Primary) | `price:adjust` | 打开 D01 燃料类型调价抽屉 | 始终显示（无权限时隐藏） |

**展开行（枪级明细）：**

| 列名 | 字段 | 宽度 | 对齐 | 渲染 |
|------|------|------|------|------|
| 枪号 | `nozzleNo` | 120px | left | 文本，如"#01"、"#02" |
| 当前价格 | `currentPrice` | 120px | right | 金额 ¥X.XX |
| 定价方式 | `isOverride` | 120px | center | 覆盖价: 蓝色 Tag "独立定价"；未覆盖: 灰色文字 "同基准价" |
| 操作 | — | 180px | center | [单独调价] 或 [恢复基准价] |

**展开行操作列：**

| 操作 | 类型 | 权限 | 行为 | 条件显示 |
|------|------|------|------|---------|
| 单独调价 | Link | `price:adjust` | 打开 D02 枪调价抽屉 | 始终显示（无权限时隐藏） |
| 恢复基准价 | Link(danger) | `price:adjust` | Popconfirm "确认将该枪恢复为基准价 ¥X.XX？" → 删除覆盖价 → Toast → 刷新 | 仅当 `isOverride=true` 时显示 |

**列表排序：** 默认按燃料类型名称字母序
**分页：** 不分页（燃料类型数量有限，通常 ≤10 条）

#### 交互行为

| 触发 | 行为 | 路由路径 | 说明 |
|------|------|----------|------|
| 点击 [调价] | 打开 D01 Drawer | — | 预填当前燃料类型和基准价 |
| 点击 [单独调价] | 打开 D02 Drawer | — | 预填当前枪号和价格 |
| 点击 [恢复基准价] | Popconfirm → 删除覆盖价 | — | 刷新枪列表 |
| 点击 [批量调价] | 打开 M02 Modal | — | 多选燃料类型 + 百分比/绝对值调价 |
| 点击 [⚙ 调价设置] | 跳转设置页 | `/energy-trade/price-management/settings` | — |
| 点击待生效计划 [取消] | Popconfirm → 取消计划 | — | 刷新待生效数量 |
| 点击价格公示卡片 | 跳转公示看板 | `/energy-trade/price-management/board` | — |

#### 响应式适配

| 断点 | 布局调整 |
|------|---------|
| ≥1200px | 统计卡4列 + 完整表格 + 展开行 |
| 768-1199px | 统计卡2+2列，隐藏"状态标记"列 |
| <768px | 统计卡纵向2列堆叠，表格改为卡片列表 |

---

### D01: 燃料类型调价抽屉 (FuelTypePriceAdjustDrawer)

**组件：** Drawer，宽度 480px，从右侧滑出
**对应 Story：** US-002, US-004, US-008
**权限：** `price:adjust`

#### 抽屉头部

- **标题：** "调整基准价 — {燃料类型名称}"
- **关闭方式：** X 按钮 + Esc + 点击遮罩（有未保存数据时拦截确认）

#### 首次使用提示（一次性）

```
💡 输入新价格后，系统将自动校验幅度并要求确认
```
关闭后写入 localStorage，不再显示。

#### 表单字段

| 字段 | 标签 | 组件 | 必填 | 校验规则 | 默认值 |
|------|------|------|------|---------|--------|
| `fuelTypeName` | 燃料类型 | 文本展示(只读) | — | — | 从列表行传入 |
| `currentPrice` | 当前基准价 | 文本展示(只读，大字号) | — | — | 当前 basePrice |
| `newPrice` | 新价格 | InputNumber | 是 | min: 0.01, precision: 2, 不等于当前价格 | — (自动聚焦) |
| `changeDisplay` | 变动幅度 | 文本展示(实时计算) | — | — | 自动计算：`{差额} ({百分比}%)`，涨价红色↑/降价绿色↓ |
| `adjustmentType` | 生效方式 | Radio.Group | 是 | — | `immediate`(立即生效) |
| `effectiveAt` | 生效时间 | DatePicker(showTime) | 条件必填 | 必须 > 当前时间；过去时间不可选 | 次日 00:00 |
| `reason` | 调价原因 | Input.TextArea | 否 | 最大 200 字符 | — |

**生效方式切换：**
- 选择"立即生效"时：隐藏 `effectiveAt` 字段
- 选择"定时生效"时：展开 `effectiveAt` DatePicker，默认值为次日 00:00

**幅度实时校验（输入 `newPrice` 时）：**
- 实时计算 `changePct = (newPrice - currentPrice) / currentPrice * 100`
- `changePct` 超出当前站点 PriceDefenseConfig 限制时：
  - 输入框下方红色文字："调价幅度超出限制（当前限制：涨价 ≤{max_increase_pct}%，降价 ≤{max_decrease_pct}%）"
  - 提交按钮 disabled

**影响范围展示（输入新价格后自动出现）：**
```
┌─────────────────────────────────────────┐
│ 影响范围：                                │
│ • 该燃料类型下共 X 个枪                   │
│ • 其中 Y 个枪使用基准价（将跟随调整）       │
│ • Z 个枪使用独立定价（不受影响）            │
└─────────────────────────────────────────┘
```

#### 表单行为

| 触发 | 行为 |
|------|------|
| 提交 | 前端校验 → 幅度校验 → 打开 M01 确认弹窗 |
| 取消 | 有未填数据时 Popconfirm "有未保存的修改，确认关闭？" → 关闭 Drawer |
| M01确认执行 | POST 调价 API → Loading → 成功 Toast "调价成功，{类型}新价格 ¥X.XX 已生效" → 关闭 Drawer → 刷新 P01 |
| M01取消 | 关闭 M01，返回 D01 继续编辑 |
| 网络失败 | 保留表单数据，Toast "网络错误，请重试"，提供"重试"按钮 |

---

### D02: 枪单独调价抽屉 (NozzlePriceOverrideDrawer)

**组件：** Drawer，宽度 420px
**对应 Story：** US-003, US-008
**权限：** `price:adjust`

#### 表单字段

| 字段 | 标签 | 组件 | 必填 | 校验规则 | 默认值 |
|------|------|------|------|---------|--------|
| `nozzleNo` | 枪号 | 文本展示(只读) | — | — | 从枪行传入 |
| `fuelTypeName` | 燃料类型 | 文本展示(只读) | — | — | 从枪行传入 |
| `basePrice` | 燃料基准价 | 文本展示(只读，灰色) | — | — | 当前基准价 |
| `currentOverridePrice` | 当前覆盖价 | 文本展示(只读) | — | — | 已有覆盖价时显示，否则显示"无（同基准价）" |
| `overridePrice` | 新覆盖价 | InputNumber | 是 | min: 0.01, precision: 2 | — (自动聚焦) |
| `changeDisplay` | 与基准价对比 | 文本展示(实时) | — | — | `{差额} ({百分比}%)` 相对于基准价 |
| `reason` | 调价原因 | Input.TextArea | 否 | 最大 200 字符 | — |

#### 表单行为

| 触发 | 行为 |
|------|------|
| 提交 | 前端校验 → 打开 M01 确认弹窗（枪级） → POST API → Toast → 关闭 → 刷新 P01 |
| 取消 | 有未填数据时确认 → 关闭 |

---

### M01: 调价确认弹窗 (PriceAdjustConfirmModal)

**组件：** Modal，宽度 500px
**对应 Story：** US-008

#### 确认内容

```
┌─────────────────────────────────────────────────┐
│                  确认调价                         │
│                                                  │
│  燃料类型:    CNG (压缩天然气)                     │
│  调价范围:    按燃料类型 / 枪号 #03                 │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  变更前        →        变更后               │  │
│  │  ¥3.50                  ¥3.80               │  │
│  │              ↑ +¥0.30 (+8.57%)             │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  影响枪数:    3 个枪使用基准价（将跟随调整）         │
│              1 个枪独立定价（不受影响）              │
│  生效方式:    立即生效 / 定时生效 2026-02-25 00:00  │
│  调价原因:    市场价格调整                          │
│                                                  │
│              [取消]        [确认执行]              │
└─────────────────────────────────────────────────┘
```

**按钮：**
- [取消] — Default 按钮，关闭 Modal
- [确认执行] — Primary 按钮（涨价时橙色警示底色，降价时正常蓝色）

---

### M02: 批量调价弹窗 (BatchAdjustModal) [MVP+]

**组件：** Modal，宽度 640px
**对应 Story：** US-005
**权限：** `price:adjust:batch`

#### 表单字段

| 字段 | 标签 | 组件 | 必填 | 校验规则 | 默认值 |
|------|------|------|------|---------|--------|
| `fuelTypeIds` | 选择燃料类型 | Checkbox.Group | 是 | 至少选一项 | 全选 |
| `adjustmentMode` | 调价方式 | Radio.Group | 是 | — | `percentage`(百分比) |
| `adjustmentValue` | 调价值 | InputNumber | 是 | percentage 模式：-100~100(%)；absolute 模式：不等于 0 | — |
| `adjustmentType` | 生效方式 | Radio.Group | 是 | — | `immediate` |
| `effectiveAt` | 生效时间 | DatePicker(showTime) | 条件必填 | > 当前时间 | 次日 00:00 |

**预览区域（输入后自动展示）：**

| 列名 | 渲染 |
|------|------|
| 燃料类型 | 文本 |
| 当前价格 | ¥X.XX |
| 调整后价格 | ¥Y.YY |
| 变动幅度 | ±Z.ZZ% (涨红降绿) |

#### 表单行为

| 触发 | 行为 |
|------|------|
| 提交 | 校验 → 显示预览确认 → POST batch API → Toast "批量调价成功，已调整 N 个燃料类型" → 关闭 → 刷新 P01 |
| 取消 | 关闭 Modal |

---

### P02: 调价历史页 (AdjustmentHistory)

**路由：** `/energy-trade/price-management/history`
**对应 Story：** US-006, US-009
**权限：** `station_master`, `ops_manager`, `finance`, `admin`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 价格管理 / 调价历史
- **标题：** 调价历史
- **操作按钮：**
  - `[导出]` (Default, DownloadOutlined) — 按当前筛选条件导出 CSV/Excel

#### 筛选区域

| 字段 | 组件 | 数据源 | 默认值 | 宽度 |
|------|------|--------|--------|------|
| 时间范围 | DatePicker.RangePicker | — | 最近 7 天 | 280px |
| 燃料类型 | Select | 当前站点燃料类型 API | 全部 | 150px |
| 操作人 | Select(带搜索) | 站点员工列表 | 全部 | 150px |
| 调价方式 | Select | `immediate`(立即)/`scheduled`(定时) | 全部 | 120px |
| 状态 | Select | `executed`/`pending_approval`/`approved`/`rejected`/`cancelled` | 全部 | 120px |

**搜索框：** 无（使用筛选器替代）
**筛选记忆：** 记住上次筛选条件（localStorage），下次进入自动恢复

#### 数据表格

| 列名 | 字段 | 宽度 | 对齐 | 渲染 | 排序 |
|------|------|------|------|------|------|
| 调价时间 | `createdAt` | 160px | left | 日期 YYYY-MM-DD HH:mm | ✅ |
| 操作人 | `adjustedBy.name` | 90px | left | 文本 | — |
| 燃料类型 | `fuelTypeName` | 120px | left | 文本，枪级调价时追加"(枪#XX)" | — |
| 变更前 | `oldPrice` | 90px | right | 金额 ¥X.XX | — |
| 变更后 | `newPrice` | 90px | right | 金额 ¥X.XX，**加粗** | — |
| 变动幅度 | `changePct` | 100px | center | 涨价: 红色 ↑+X.XX%；降价: 绿色 ↓-X.XX% | ✅ |
| 生效方式 | `adjustmentType` | 80px | center | Tag: 立即(蓝) / 定时(紫) | — |
| 状态 | `status` | 80px | center | StatusTag(颜色映射) | ✅ |
| 操作 | — | 80px | center | [详情] | — |

**调价状态 Tag 映射：**

| 状态值 | 显示文本 | Tag 颜色 |
|--------|---------|---------|
| `executed` | 已执行 | `green` |
| `pending_approval` | 待审批 | `orange` |
| `approved` | 待执行 | `blue` |
| `rejected` | 已驳回 | `red` |
| `cancelled` | 已取消 | `default` (灰) |

**操作列详情：**

| 操作 | 类型 | 行为 |
|------|------|------|
| 详情 | Link | 打开 D03 调价详情抽屉 |

**列表排序：** 默认按创建时间倒序
**分页：** 默认 20 条/页，可选 10/20/50/100

#### 导出功能

- 按钮点击 → Loading Toast "正在导出..." → 浏览器下载
- 导出范围：当前筛选条件匹配的所有记录（不受分页限制）
- 导出格式：Excel (.xlsx)
- 导出列：调价时间、操作人、燃料类型、变更前价格、变更后价格、变动幅度%、生效方式、状态、调价原因

#### 交互行为

| 触发 | 行为 | 路由路径 | 说明 |
|------|------|----------|------|
| 更改筛选条件 | 自动刷新列表 | — | 防抖 300ms |
| 点击 [详情] | 打开 D03 Drawer | — | 展示完整调价详情 |
| 点击 [导出] | 导出文件 | — | 按当前筛选条件 |

#### 空状态

```
暂无调价记录
调价操作后，记录将自动出现在此处
```

#### 响应式适配

| 断点 | 布局调整 |
|------|---------|
| ≥1200px | 筛选栏一行展示 + 完整表格 |
| 768-1199px | 筛选栏两行 + 隐藏"操作人""生效方式"列 |
| <768px | 筛选纵向堆叠 + 卡片列表视图 |

---

### D03: 调价详情抽屉 (AdjustmentDetailDrawer)

**组件：** Drawer，宽度 560px
**对应 Story：** US-006

#### 抽屉内容

**组件：** Descriptions (两列布局)

| 字段 | 标签 | 渲染 |
|------|------|------|
| `adjustmentNo` | 调价编号 | 文本 |
| `createdAt` | 调价时间 | 日期 YYYY-MM-DD HH:mm:ss |
| `adjustedBy.name` | 操作人 | 文本 |
| `fuelTypeName` | 燃料类型 | 文本 |
| `nozzleNo` | 枪号 | 文本(无则显示"—，按燃料类型调价") |
| `oldPrice` → `newPrice` | 价格变更 | "¥3.50 → ¥3.80" + 幅度标签 |
| `changePct` | 变动幅度 | 涨红降绿 ±X.XX% |
| `adjustmentType` | 生效方式 | Tag |
| `effectiveAt` | 生效时间 | 日期(立即生效时显示同调价时间) |
| `executedAt` | 执行时间 | 日期 |
| `status` | 状态 | StatusTag |
| `reason` | 调价原因 | 文本(无则"—") |

**审批信息区域（仅审批类型显示）：**

| 字段 | 标签 | 渲染 |
|------|------|------|
| `approvedBy.name` | 审批人 | 文本 |
| `approvedAt` | 审批时间 | 日期 |
| `approvalNote` | 审批意见 | 文本(驳回时显示驳回原因) |

**影响枪列表：**

| 列名 | 字段 | 渲染 |
|------|------|------|
| 枪号 | `nozzleNo` | 文本 |
| 调前价格 | `beforePrice` | ¥X.XX |
| 调后价格 | `afterPrice` | ¥X.XX |
| 定价方式 | `isOverride` | Tag: 独立定价(蓝) / 同基准价(灰) |

---

### P03: 价格公示看板 (PriceDisplayBoard)

**路由：** `/energy-trade/price-management/board`
**对应 Story：** US-011, US-012, US-013
**权限：** `price:board` (所有角色)

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 价格管理 / 价格公示
- **标题：** 价格公示看板
- **操作按钮：**
  - `[🔄 刷新]` (Default) — 手动刷新价格数据
  - `[⛶ 全屏展示]` (Primary, ExpandOutlined) — 浏览器全屏模式

#### 首次使用提示（一次性）

```
💡 点击右上角"全屏展示"可投屏使用，价格每 30 秒自动更新
```
关闭后写入 localStorage，不再显示。

#### LED 看板区域

**整体风格：** 深色背景 `#1a1a2e`，模拟 LED 大屏效果

**布局：** 顶部站点名称 → 价格分栏区 → 底部信息栏

```
┌─────────────────────────────────────────────────────────────────┐
│                    ⛽ 杭州西湖加气站                               │
├──────────────────┬──────────────────┬──────────────────────────┤
│                  │                  │                          │
│    CNG 压缩天然气 │    LNG 液化天然气  │    92# 汽油              │
│                  │                  │                          │
│    ¥ 3.50       │    ¥ 5.80        │    ¥ 7.50               │
│    元/立方米      │    元/千克         │    元/升                 │
│                  │                  │                          │
│   会员价 ¥3.30   │   会员价 ¥5.50    │   会员价 ¥7.30           │
│   (最高优惠¥0.20) │   (最高优惠¥0.30)  │   (最高优惠¥0.20)        │
│                  │                  │                          │
├──────────────────┴──────────────────┴──────────────────────────┤
│  最近更新：2026-02-24 14:30:05         自动刷新中 ⏳ (30秒)       │
└─────────────────────────────────────────────────────────────────┘
```

**价格字段样式：**

| 元素 | 字体/颜色 | 说明 |
|------|----------|------|
| 站点名称 | 28px, `#ffffff`, 居中 | 顶部横幅 |
| 燃料类型名称 | 18px, `#a0a0c0`, 居中 | 分栏标题 |
| 价格数字 | 56px, `#ff6b35` (LED橙色), 加粗, 居中 | 核心信息，等宽数字字体 |
| 单位 | 14px, `#808090`, 居中 | 价格下方 |
| 会员价 | 16px, `#4ecdc4` (青色), 居中 | 标准价下方，`[MVP+]` 无数据时隐藏 |
| 更新时间 | 12px, `#606070`, 底部左侧 | 自动刷新倒计时 |

**自动刷新：**
- 每 30 秒轮询 `GET /api/v1/stations/:stationId/price-board`
- 价格变更时数字有 0.5 秒过渡动画（淡入淡出）
- 底部显示"自动刷新中"和倒计时

**全屏模式：**
- 点击"全屏展示" → `document.requestFullscreen()`
- 全屏后隐藏页面头部和侧边栏，仅保留看板区域
- 按 `Esc` 或 `F` 退出全屏

#### 空状态

```
（深色背景上）
暂无价格数据
请先在价格总览中设置基准价格
[前往价格总览 →]
```
链接跳转 `/energy-trade/price-management`

#### 响应式适配

| 断点 | 布局调整 |
|------|---------|
| ≥1200px | 横向多栏展示（最多 6 栏） |
| 768-1199px | 横向 3 栏，超出换行 |
| <768px | 纵向单栏堆叠 |

---

### P04: 调价审批页 (ApprovalList)

**路由：** `/energy-trade/price-management/approvals`
**对应 Story：** US-010
**权限：** `price:adjust:approve`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 价格管理 / 调价审批
- **标题：** 调价审批
- **右侧信息：** 待审批数量 Badge

#### 状态 Tab 切换

**组件：** Tabs

| Tab | 值 | Badge |
|-----|-----|-------|
| 待审批 | `pending_approval` | 数量 Badge(红) |
| 已处理 | `processed` | — |

#### 数据表格

| 列名 | 字段 | 宽度 | 对齐 | 渲染 | 排序 |
|------|------|------|------|------|------|
| 提交时间 | `createdAt` | 150px | left | 日期 YYYY-MM-DD HH:mm | ✅ |
| 提交人 | `adjustedBy.name` | 90px | left | 文本 | — |
| 站点 | `stationName` | 120px | left | 文本 | — |
| 燃料类型 | `fuelTypeName` | 100px | left | 文本 | — |
| 变更幅度 | `changePct` | 100px | center | 涨红降绿 ±X.XX%，超阈值加粗 | ✅ |
| 价格变更 | `oldPrice`→`newPrice` | 160px | center | "¥3.50 → ¥3.80" | — |
| 生效方式 | `adjustmentType` | 80px | center | Tag | — |
| 操作 | — | 180px | center | [通过] [驳回] 或 状态标签 | — |

**操作列详情（待审批 Tab）：**

| 操作 | 类型 | 样式 | 行为 |
|------|------|------|------|
| 通过 | Button | type="primary", `#52c41a` | PATCH approve → Toast "已通过，调价将{立即执行/按计划执行}" → 刷新 |
| 驳回 | Button | type="primary", danger | 打开驳回 Modal（输入原因必填） → PATCH reject → Toast "已驳回，已通知提交人" → 刷新 |

**操作列（已处理 Tab）：** 显示处理结果 Tag（已通过/已驳回）+ 处理时间

**行展开详情区域：**

点击行可展开查看更多信息：
- 调价原因
- 当前防御配置（审批阈值）
- 影响枪列表（枪号 + 调前价格 + 调后价格）

**列表排序：** 默认按提交时间倒序
**分页：** 默认 20 条/页

#### 驳回原因 Modal

| 字段 | 标签 | 组件 | 必填 | 校验规则 |
|------|------|------|------|---------|
| `rejectReason` | 驳回原因 | Input.TextArea | 是 | 最少 5 字符，最大 200 字符 |

#### 空状态

```
当前没有待审批的调价
```

#### 交互行为

| 触发 | 行为 | 说明 |
|------|------|------|
| 点击行 | 展开详情区域 | 查看完整调价信息 |
| 点击 [通过] | PATCH approve → Toast → 刷新 | 刷新待审批 Badge |
| 点击 [驳回] | 打开驳回 Modal → 输入原因 → PATCH reject → Toast → 刷新 | 刷新待审批 Badge |
| 切换 Tab | 刷新列表 | 待审批/已处理 |

---

### P05: 会员专享价页 (MemberPriceList) [MVP+]

**路由：** `/energy-trade/price-management/member-prices`
**对应 Story：** US-014
**权限：** `price:member:read`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 价格管理 / 会员专享价
- **标题：** 会员专享价
- **操作按钮：**
  - `[+ 新增会员价规则]` (Primary) — 权限: `price:member:write`，打开 D05

#### 顶部依赖提示 (Alert)

```
⚠ 当前使用预设会员等级（普通会员/VIP/SVIP），正式会员等级将在会员模块上线后对接
```
类型: `warning`，可关闭（本次会话内不再显示）

#### 数据表格

| 列名 | 字段 | 宽度 | 对齐 | 渲染 | 排序 |
|------|------|------|------|------|------|
| 燃料类型 | `fuelTypeName` | 140px | left | 文本 | — |
| 基准价 | `basePrice` | 100px | right | 金额 ¥X.XX (灰色) | — |
| 会员等级 | `memberTier` | 100px | center | Tag: 普通(default)/VIP(gold)/SVIP(magenta) | — |
| 优惠方式 | `discountType` | 100px | center | Tag: 固定减免(blue) / 百分比折扣(cyan) | — |
| 优惠值 | `discountValue` | 100px | right | 固定: ¥X.XX/单位；百分比: X% | — |
| 专享价 | computed | 100px | right | 金额 ¥X.XX (加粗，`#4ecdc4` 青色) | — |
| 状态 | `status` | 80px | center | Switch(active/inactive) | — |
| 操作 | — | 120px | center | [编辑] [删除] | — |

**操作列详情：**

| 操作 | 权限 | 行为 |
|------|------|------|
| 编辑 | `price:member:write` | 打开 D05 编辑 Drawer |
| 删除 | `price:member:write` | Popconfirm → DELETE → Toast → 刷新 |

**列表排序：** 默认按燃料类型 + 会员等级排序
**分页：** 默认 20 条/页

#### 空状态

```
暂未配置会员专享价
[配置会员价]
```

---

### D05: 会员价编辑抽屉 (MemberPriceEditDrawer) [MVP+]

**组件：** Drawer，宽度 440px
**对应 Story：** US-014

#### 表单字段

| 字段 | 标签 | 组件 | 必填 | 校验规则 | 默认值 |
|------|------|------|------|---------|--------|
| `fuelTypeId` | 燃料类型 | Select | 是 | — | — (编辑时只读) |
| `memberTier` | 会员等级 | Select | 是 | 选项: 普通会员/VIP/SVIP | — (编辑时只读) |
| `discountType` | 优惠方式 | Radio.Group | 是 | — | `fixed_amount` |
| `discountValue` | 优惠值 | InputNumber | 是 | > 0；固定: precision 2；百分比: 1-99 | — |
| `previewPrice` | 专享价预览 | 文本展示(实时) | — | — | 基准价 - 优惠值 |

#### 表单行为

| 触发 | 行为 |
|------|------|
| 提交 | 校验唯一性 → POST/PUT → Toast "会员价规则已保存" → 关闭 → 刷新 P05 |
| 取消 | 关闭 Drawer |

---

### P06: 价格协议列表页 (AgreementList) [MVP+]

**路由：** `/energy-trade/price-management/agreements`
**对应 Story：** US-015, US-016, US-017
**权限：** `price:agreement:read`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 价格管理 / 价格协议
- **标题：** 价格协议
- **操作按钮：**
  - `[+ 新建协议]` (Primary) — 权限: `price:agreement:write`，打开 D06

#### 筛选区域

| 字段 | 组件 | 数据源 | 默认值 | 宽度 |
|------|------|--------|--------|------|
| 关键词 | Input.Search | — | — | 200px |
| 状态 | Select | `active`/`expired`/`terminated` | 全部 | 120px |
| 燃料类型 | Select | 当前站点燃料类型 | 全部 | 150px |

**搜索框：** placeholder="搜索企业名称..."

#### 数据表格

| 列名 | 字段 | 宽度 | 对齐 | 渲染 | 排序 |
|------|------|------|------|------|------|
| 企业名称 | `enterpriseName` | 160px | left | 文本(加粗) | — |
| 燃料类型 | `fuelTypeName` | 120px | left | 文本 | — |
| 协议价 | `agreedPrice` | 100px | right | 金额 ¥X.XX | ✅ |
| 基准价 | `basePrice` | 100px | right | 金额 ¥X.XX (灰色) | — |
| 优惠幅度 | computed | 80px | center | 绿色↓-X.XX%（协议价 < 基准价）或 红色↑+X.XX% | — |
| 有效期 | `validFrom`~`validTo` | 200px | center | "YYYY-MM-DD ~ YYYY-MM-DD" | ✅ |
| 状态 | `status` | 100px | center | AgreementStatusTag | — |
| 操作 | — | 150px | center | [编辑] [终止] | — |

**协议状态 Tag 映射：**

| 状态值 | 显示文本 | Tag 颜色 | 特殊规则 |
|--------|---------|---------|---------|
| `active` | 生效中 | `green` | — |
| `active` (≤30天到期) | 即将到期 | `orange` | 行背景浅橙 `#fff7e6` |
| `expired` | 已过期 | `default` (灰) | — |
| `terminated` | 已终止 | `red` | — |

**操作列详情：**

| 操作 | 权限 | 行为 | 条件显示 |
|------|------|------|---------|
| 编辑 | `price:agreement:write` | 打开 D06 编辑 Drawer | 仅 `active` 状态 |
| 终止 | `price:agreement:write` | Popconfirm("终止后不可恢复，请确认") → 打开终止 Modal(输入原因) → PATCH terminate → Toast "协议已终止" → 刷新 | 仅 `active` 状态 |

**列表排序：** 默认按状态优先(生效中→即将到期→已过期→已终止) + 有效期结束日期升序
**分页：** 默认 20 条/页

#### 空状态

```
暂无价格协议，为大客户创建专属价格
[新建协议]
```

---

### D06: 协议表单抽屉 (AgreementFormDrawer) [MVP+]

**组件：** Drawer，宽度 480px
**对应 Story：** US-016, US-017

#### 表单字段

| 字段 | 标签 | 组件 | 必填 | 校验规则 | 默认值 |
|------|------|------|------|---------|--------|
| `enterpriseId` | 企业 | Select(带搜索) | 是 | — | — (编辑时只读) |
| `stationId` | 适用站点 | Select | 是 | — | 当前站点 (编辑时只读) |
| `fuelTypeId` | 燃料类型 | Select | 是 | — | — (编辑时只读) |
| `agreedPrice` | 协议价 | InputNumber | 是 | > 0, precision: 2 | — |
| `basePriceCompare` | 基准价对比 | 文本展示(实时) | — | — | "当前基准价 ¥X.XX，差额 ¥Y.YY" |
| `validFrom` | 生效日期 | DatePicker | 是 | — | 今天 |
| `validTo` | 失效日期 | DatePicker | 是 | > validFrom | 今天 + 1 年 |

**企业选择器下方提示：**
```
⚠ 当前使用预设企业数据，正式企业信息将在大客户模块上线后对接
```

**协议价校验：**
- 协议价 > 基准价时：输入框下方橙色提示 "协议价高于基准价，请确认"（不阻止提交）
- 唯一性校验：同一企业+站点+燃料类型已有 `active` 协议 → 红色错误 "已有生效协议，请先终止现有协议"

#### 表单行为

| 触发 | 行为 |
|------|------|
| 提交(新建) | 校验 → POST → Toast "价格协议已创建" → 关闭 → 刷新 P06 |
| 提交(编辑) | 校验 → PUT → Toast "协议已更新" → 关闭 → 刷新 P06 |
| 取消 | 关闭 Drawer |

---

### P07: 调价设置页 (PriceSettings)

**路由：** `/energy-trade/price-management/settings`
**对应 Story：** US-007
**权限：** `price:defense:read`

#### 页面头部

- **面包屑：** 首页 / 能源交易 / 价格管理 / 调价设置
- **标题：** 调价设置
- **操作按钮：**
  - `[+ 新增配置]` (Primary) — 权限: `price:defense:write`，打开 D04

#### 首次使用提示

```
💡 调价防御配置用于限制单次调价的最大幅度，全局配置对所有站点生效，也可针对特定站点覆盖
```

#### 配置列表

**组件：** Table

| 列名 | 字段 | 宽度 | 对齐 | 渲染 | 排序 |
|------|------|------|------|------|------|
| 适用范围 | computed | 200px | left | 全局: "全局默认"(加粗)；站点级: "{站点名}"；站点+类型: "{站点名} > {燃料类型}" | — |
| 优先级 | computed | 80px | center | 全局: Tag "全局"(default)；站点: Tag "站点"(blue)；站点+类型: Tag "专项"(purple) | — |
| 最大涨幅 | `maxIncreasePct` | 100px | center | `+X%` 红色 | — |
| 最大降幅 | `maxDecreasePct` | 100px | center | `-X%` 绿色 | — |
| 审批开关 | `requireApproval` | 80px | center | Switch(开启/关闭) | — |
| 审批阈值 | `approvalThresholdPct` | 100px | center | `±X%`（requireApproval=false 时灰色"—"） | — |
| 最后修改 | `updatedAt` | 140px | center | 日期 YYYY-MM-DD | — |
| 操作 | — | 120px | center | [编辑] [删除] | — |

**操作列详情：**

| 操作 | 权限 | 行为 | 条件显示 |
|------|------|------|---------|
| 编辑 | `price:defense:write` | 打开 D04 编辑 Drawer | 始终显示 |
| 删除 | `price:defense:write` | Popconfirm → DELETE → Toast → 刷新 | 全局默认配置不可删除 |

**列表排序：** 优先级升序（全局 → 站点 → 站点+类型）

#### 交互行为

| 触发 | 行为 | 说明 |
|------|------|------|
| 点击 [新增配置] | 打开 D04 Drawer | 空表单 |
| 点击 [编辑] | 打开 D04 Drawer | 预填现有配置 |
| 点击 [删除] | Popconfirm → DELETE | 全局配置不允许删除 |
| 切换审批 Switch | 即时保存 → Toast | 快捷开关 |

---

### D04: 防御配置编辑抽屉 (DefenseConfigDrawer)

**组件：** Drawer，宽度 440px
**对应 Story：** US-007
**权限：** `price:defense:write`

#### 表单字段

| 字段 | 标签 | 组件 | 必填 | 校验规则 | 默认值 |
|------|------|------|------|---------|--------|
| `stationId` | 适用站点 | Select(allowClear) | 否 | — | 空(全局) |
| `fuelTypeId` | 适用燃料类型 | Select(allowClear) | 否 | 需先选站点 | 空(所有类型) |
| `maxIncreasePct` | 最大涨价幅度 (%) | InputNumber | 是 | 1-100 | 20 |
| `maxDecreasePct` | 最大降价幅度 (%) | InputNumber | 是 | 1-100 | 20 |
| `requireApproval` | 是否需要审批 | Switch | 是 | — | false |
| `approvalThresholdPct` | 审批阈值 (%) | InputNumber | 条件必填 | requireApproval=true 时必填，1-100 | 10 |

**审批阈值字段说明 (Tooltip)：**
```
调价幅度超过此百分比时，需运营经理审批后才能生效
```

**极端值提醒：**
- `maxIncreasePct` 或 `maxDecreasePct` > 50 时：保存前提示 "调价幅度限制设置为 {X}%，这意味着价格变动空间较大，确认吗？"

#### 表单行为

| 触发 | 行为 |
|------|------|
| 提交 | 校验 → POST/PUT → Toast "调价防御配置已保存" → 关闭 → 刷新 P07 |
| 取消 | 关闭 Drawer |

---

## 4. 页面导航关系

```text
P01 (价格总览)
├── [调价] → D01 (燃料类型调价 Drawer)
│     └── [提交] → M01 (确认弹窗)
├── [单独调价] → D02 (枪调价 Drawer)
│     └── [提交] → M01 (确认弹窗)
├── [批量调价] → M02 (批量调价 Modal)
├── [⚙ 调价设置] → P07 (调价设置)
├── [价格公示卡片] → P03 (价格公示看板)
│
P02 (调价历史) ←── 侧边栏直达
├── [详情] → D03 (调价详情 Drawer)
├── [导出] → 下载文件
│
P03 (价格公示看板) ←── 侧边栏直达 / P01 卡片快捷入口
├── [全屏] → 浏览器全屏
│
P04 (调价审批) ←── 侧边栏直达 / 顶栏通知铃铛
├── [通过/驳回] → API 操作
│
P05 (会员专享价) ←── 侧边栏直达 [MVP+]
├── [新增/编辑] → D05 (会员价编辑 Drawer)
│
P06 (价格协议) ←── 侧边栏直达 [MVP+]
├── [新建/编辑] → D06 (协议表单 Drawer)
│
P07 (调价设置) ←── 侧边栏直达 / P01 齿轮按钮
├── [新增/编辑] → D04 (防御配置 Drawer)
```

---

## 5. 检查清单

- [x] 所有 [MVP] Story (US-001~US-004, US-006~US-009, US-011, US-012) 都有对应的页面设计
- [x] 所有 [MVP+] Story (US-005, US-010, US-013~US-017) 都有对应的页面设计
- [x] 所有页面都有明确的路由定义
- [x] **路由一致性：所有交互跳转的路径与页面清单中的路由完全一致**
- [x] **无硬编码路径：交互行为中无自行发明的路径**
- [x] 列表页包含筛选/搜索功能（P02, P04, P06）
- [x] 表格列定义完整（列名、字段、宽度、渲染方式）
- [x] 表单字段包含校验规则（D01~D06, M01, M02）
- [x] 交互行为明确（每个按钮点击后发生什么）
- [x] 页面间导航关系清晰（§4）
- [x] 组件选择优先使用 Ant Design 标准组件
- [x] 字段命名与 architecture.md 和 STANDARDS.md 术语表一致
- [x] 侧边栏菜单结构已定义（§2）
- [x] 空状态设计已覆盖（P01~P07）
- [x] 权限控制标注完整（每个页面和操作标注所需权限代码）
- [x] 状态 Tag 颜色映射定义完整
- [x] 响应式适配方案已标注

---

*文档生成时间：2026-02-24*
*基于：user-stories.md v1.0 + ux-design.md v1.0 + architecture.md v1.0 + STANDARDS.md §4*
