# 设备设施管理 — UI Schema

**模块：** 基础运营 > 设备设施管理 (1.3)
**基于：** user-stories.md v1.0 + ux-design.md v1.0
**设计日期：** 2026-02-18
**状态：** ✅ 已确认 (2026-02-18)

### 确认记录

| # | 确认项 | 结论 |
|---|--------|------|
| Q1 | 页面规划(17页)与优先级划分 | ✅ 同意 |
| Q2 | 侧边栏4项菜单+维保工单Badge | ✅ 同意 |
| Q3 | "保存并创建下一条"保留字段策略 | ✅ 同意 |
| Q4 | 工单5状态流转+步骤条+必填规则 | ✅ 同意 |
| Q5 | 故障报修Drawer的4个触发入口+自动预选 | ✅ 同意 |

---

## 1. 页面清单

| # | 页面名称 | 类型 | 路由 | 对应 Story | 响应式支持 |
|---|---------|------|------|-----------|-----------|
| P01 | 设施监控看板 | 看板页 | /operations/device-ledger/monitoring | US-001, US-002, US-003 | ✅ 纵向堆叠 |
| P02 | 储罐监控详情 | 看板页 | /operations/device-ledger/monitoring/tanks | US-002 | ✅ 卡片+全宽图 |
| P03 | 加气机状态看板 | 看板页 | /operations/device-ledger/monitoring/dispensers | US-003 | ✅ 纵向列表 |
| P04 | 传感器数据页 | 看板页 | /operations/device-ledger/monitoring/sensors | US-004 [MVP+] | ✅ |
| P05 | 设备健康度概览 | 看板页 | /operations/device-ledger/monitoring/health | US-005 [MVP+] | ✅ |
| P06 | 告警配置页 | 表单列表 | /operations/device-ledger/monitoring/alarms/config | US-006-A [MVP+] | ✅ |
| P07 | 告警记录页 | 列表页 | /operations/device-ledger/monitoring/alarms/records | US-006-B [MVP+] | ✅ |
| P08 | 设备台账列表页 | 列表页 | /operations/device-ledger/equipment | US-007 | ✅ 卡片/表格 |
| P09 | 新增设备表单页 | 表单页 | /operations/device-ledger/equipment/create | US-008 | ✅ 单列堆叠 |
| P10 | 设备详情页 | 详情页 | /operations/device-ledger/equipment/:id | US-010 | ✅ Tab切换 |
| P11 | 编辑设备表单页 | 表单页 | /operations/device-ledger/equipment/:id/edit | US-009 | ✅ 单列堆叠 |
| P12 | 维保工单列表页 | 列表页 | /operations/device-ledger/maintenance | US-014 | ✅ 卡片/表格 |
| P13 | 新建维保工单页 | 表单页 | /operations/device-ledger/maintenance/create | US-015 | ✅ 单列堆叠 |
| P14 | 工单详情页 | 详情页 | /operations/device-ledger/maintenance/:id | US-016, US-019 | ✅ 左右分栏→堆叠 |
| P15 | 故障报修抽屉 | 抽屉(Drawer) | - (Drawer) | US-017 | ✅ 全屏 |
| P16 | 保养计划页 | 列表页 | /operations/device-ledger/maintenance/plans | US-020 [MVP+] | ✅ |
| P17 | 设备连接状态页 | 列表页 | /operations/device-ledger/connectivity | US-023 | ✅ |

---

## 2. 侧边栏菜单结构

```text
基础运营 (operations)
├── 站点管理 (station)                         # 已有
├── 交接班管理 (shift-handover)                 # 已有
├── 设备设施管理 (device-ledger)                # 本模块
│   ├── 设施监控 → P01 (默认页)
│   ├── 设备台账 → P08
│   ├── 维保工单 → P12  (Badge: 待处理数)
│   └── 设备连接 → P17
└── 巡检管理 (inspection)                      # 未开发
```

**侧边栏 Badge：**
- "维保工单" 菜单项旁显示待处理工单数量 Badge（红色圆点+数字）

---

## 3. 页面详细设计

### P01: 设施监控看板 (FacilityMonitoringDashboard)

**路由：** `/operations/device-ledger/monitoring`
**对应 Story：** US-001, US-002, US-003
**权限：** `station_master`, `equipment_admin`, `safety_officer`, `ops_manager`

#### 页面头部

- **面包屑：** 首页 / 基础运营 / 设备设施管理
- **标题：** 设施监控
- **右侧信息：** 最后更新时间 + [刷新] 按钮

#### 顶部统计卡片区 (StatCards)

**布局：** 4列等宽卡片（Row + Col span=6）

| 卡片 | 字段 | 图标 | 颜色 | 说明 |
|------|------|------|------|------|
| 设备总数 | `totalDevices` | ToolOutlined | `#1890ff` | 总数 |
| 在线率 | `onlineRate` | CheckCircleOutlined | `#52c41a` | 百分比 |
| 告警 | `alarmCount` | WarningOutlined | `#ff4d4f` | 当前活跃告警数，0时绿色 |
| 待维保 | `pendingMaintenance` | ToolOutlined | `#faad14` | 即将到期维保设备数 |

**卡片结构：**
```
┌──────────────────────────────────┐
│  🔧 设备总数                     │
│                                  │
│        24                        │
│     在线 23 / 离线 1             │
└──────────────────────────────────┘
```

#### 储罐区域 (TankSection)

**布局：** Card 标题区域带"储罐区"标签 + [查看详情→P02] 链接

```
┌─────────────────────────────────────────────────────────────────┐
│ ▎储罐区                                           [查看详情 →] │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│ │ LNG储罐#1    │ │ LNG储罐#2    │ │ LNG储罐#3 ⚠  │            │
│ │ [液位条 78%] │ │ [液位条 45%] │ │ [液位条 18%] │            │
│ │ 156m³        │ │ 90m³         │ │ 36m³         │            │
│ │ 0.65 MPa     │ │ 0.62 MPa     │ │ 0.68 MPa     │            │
│ │ -162℃  ✅    │ │ -161℃  ✅    │ │ -160℃  ⚠    │            │
│ └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

**储罐卡片字段：**

| 字段 | 渲染 | 说明 |
|------|------|------|
| `name` | Card标题 | 储罐名称/编号 |
| `levelPercent` | Progress条(竖向) | 液位百分比，<20%警告色 |
| `levelVolume` | 文本 | 液位体积 (m³) |
| `pressure` | 文本 | 压力 (MPa)，超限红色 |
| `temperature` | 文本 | 温度 (℃) |
| `status` | Badge | ✅正常 / ⚠异常 |

**点击交互：** 点击卡片→跳转 `/operations/device-ledger/monitoring/tanks`

#### 加气机区域 (DispenserSection)

**布局：** Card 标题区域带"加气机区"标签 + [查看详情→P03] 链接

```
┌─────────────────────────────────────────────────────────────────┐
│ ▎加气机区                                         [查看详情 →] │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │ 加气机#01 │ │ 加气机#02 │ │ 加气机#03 │ │ 加气机#04 │          │
│ │ 🟢 空闲  │ │ 🔵 加注中 │ │ 🔴 故障  │ │ ⚫ 离线  │          │
│ │ 枪1:空闲 │ │ 枪1:加注  │ │ 枪1:故障 │ │ 枪1:离线 │          │
│ │ 枪2:空闲 │ │ 枪2:空闲 │ │          │ │ 枪2:离线 │          │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

**加气机卡片字段：**

| 字段 | 渲染 | 说明 |
|------|------|------|
| `name` | Card标题 | 加气机名称/编号 |
| `status` | Badge色圆点+文字 | 空闲=绿/加注中=蓝/故障=红/离线=灰 |
| `nozzles` | 列表 | 各枪位状态简列 |

**故障卡片特殊样式：** 红色边框 + CSS动画脉冲(1s周期)

**点击交互：** 点击卡片→跳转 `/operations/device-ledger/monitoring/dispensers`

#### 待处理事项区 (PendingActions)

**布局：** Card 列表，最多显示5条

```
┌─────────────────────────────────────────────────────────────────┐
│ ▎待处理事项                                                     │
├─────────────────────────────────────────────────────────────────┤
│ ⚠ 储罐#3 液位过低(18%)，建议安排补液           [查看详情]       │
│ 🔴 加气机#03 故障，已持续 2h15min               [快速报修]       │
│ 🔧 加气机#01 月检保养将于3天后到期              [查看工单]       │
│ 🔧 泵#02 季检保养将于5天后到期                  [查看工单]       │
└─────────────────────────────────────────────────────────────────┘
```

**待处理事项字段：**

| 字段 | 渲染 | 说明 |
|------|------|------|
| `icon` | 图标 | ⚠/🔴/🔧 |
| `message` | 文本 | 事项描述 |
| `actionLabel` | Button(link) | 快捷操作按钮 |
| `actionTarget` | 路由 | 跳转目标 |

**快速报修按钮：** 点击→打开 P15 故障报修抽屉

#### 数据刷新

- **自动刷新：** 每15秒静默刷新（模拟数据+随机波动）
- **手动刷新：** 右上角[刷新]按钮
- **刷新时机：** 页面可见时生效，切到后台停止刷新

#### 空状态

```
暂无设备数据，请先录入设备台账
[前往新增设备]
```
按钮跳转 `/operations/device-ledger/equipment/create`

#### 响应式适配

| 断点 | 布局调整 |
|------|---------|
| ≥1200px | 统计卡4列，储罐/加气机卡片横排 |
| 768-1199px | 统计卡2列，储罐/加气机简化卡片 |
| <768px | 统计卡2列堆叠，下方区域纵向堆叠卡片列表 |

---

### P02: 储罐监控详情 (TankMonitoring)

**路由：** `/operations/device-ledger/monitoring/tanks`
**对应 Story：** US-002
**权限：** `station_master`, `equipment_admin`, `safety_officer`

#### 页面头部

- **面包屑：** 首页 / 基础运营 / 设备设施管理 / 设施监控 / 储罐监控
- **标题：** 储罐监控
- **操作按钮：** [← 返回看板] → 跳转 `/operations/device-ledger/monitoring`

#### 储罐卡片列表

**布局：** Row + Col，每个储罐一张详细卡片

```
┌─── LNG储罐#1 ─────────────────────────────────────────────────┐
│  [液位仪表盘]     液位: 78% | 156m³                            │
│                   压力: 0.65 MPa    ✅                         │
│                   温度: -162℃       ✅                         │
│                   状态: 正常                                    │
└───────────────────────────────────────────────────────────────┘
```

**单个储罐详细字段：**

| 字段 | 标签 | 渲染 | 说明 |
|------|------|------|------|
| `name` | 储罐名称 | Card标题 | - |
| `deviceCode` | 设备编号 | 副标题文本 | - |
| `levelPercent` | 液位 | Progress(仪表盘样式) + 数字 | <20%红色 |
| `levelVolume` | 液位体积 | 文本 (m³) | - |
| `pressure` | 压力 | 文本 (MPa) + Badge | 超限红色 |
| `temperature` | 温度 | 文本 (℃) + Badge | - |
| `status` | 状态 | Tag | 正常=绿/异常=红 |

#### 液位变化趋势图

**组件：** ECharts 折线图

```
┌─────────────────────────────────────────────────────────────────┐
│ ▎液位变化趋势                        [24小时] [7天] [30天]      │
├─────────────────────────────────────────────────────────────────┤
│  100% ┤                                                         │
│   80% ┤ ────── 储罐#1                                           │
│   60% ┤                                                         │
│   40% ┤ ─ ─ ─ 储罐#2                                           │
│   20% ┤ ════ ⚠阈值线 ════════════════                          │
│        └─────────────────────────────── → 时间                  │
└─────────────────────────────────────────────────────────────────┘
```

**图表配置：**
| 属性 | 值 |
|------|-----|
| 类型 | line (多系列) |
| X轴 | 时间轴 |
| Y轴 | 百分比 (0-100%) |
| 时间范围 | 默认24小时，可切换7天/30天 |
| 参考线 | 20%阈值线 (虚线+红色) |
| 系列 | 每个储罐一条线，不同颜色 |
| Tooltip | 悬浮显示具体时间+液位值 |

#### 响应式适配

| 断点 | 布局调整 |
|------|---------|
| ≥1200px | 储罐卡片横排，趋势图完整 |
| <768px | 储罐卡片纵向堆叠，趋势图全宽 |

---

### P03: 加气机状态看板 (DispenserStatusBoard)

**路由：** `/operations/device-ledger/monitoring/dispensers`
**对应 Story：** US-003
**权限：** `station_master`, `equipment_admin`

#### 页面头部

- **面包屑：** 首页 / 基础运营 / 设备设施管理 / 设施监控 / 加气机状态
- **标题：** 加气机状态
- **操作按钮：** [← 返回看板]

#### 状态汇总条

```
🟢 空闲: 2  |  🔵 加注中: 1  |  🔴 故障: 1  |  ⚫ 离线: 0
```

**组件：** Tag 行内排列

#### 加气机卡片网格

**布局：** Row + Col span=6（每行4台），故障卡片置顶

**单台加气机卡片：**
```
┌─────────────────────────────────┐
│ 加气机#03                  🔴   │
│ DEV-DISP-003  |  DQ-500        │
├─────────────────────────────────┤
│ 枪位状态：                      │
│  枪1  CNG  🔴故障  ¥4.50/m³   │
│  枪2  LNG  ⚫离线  ¥5.20/kg   │
├─────────────────────────────────┤
│ 故障时间: 2026-02-18 08:30      │
│              [快速报修] [详情]   │
└─────────────────────────────────┘
```

**卡片字段：**

| 字段 | 渲染 | 说明 |
|------|------|------|
| `name` | Card标题 | 加气机名称 |
| `deviceCode` | 副标题 | 设备编号 |
| `model` | 副标题 | 型号 |
| `status` | Badge大圆点 | 空闲=绿/加注中=蓝/故障=红/离线=灰 |
| `nozzles[].nozzleNo` | 列表-枪号 | 枪号 |
| `nozzles[].fuelType` | 列表-Tag | 燃料类型 |
| `nozzles[].status` | 列表-Badge | 枪状态 |
| `nozzles[].unitPrice` | 列表-文本 | 单价 |
| `faultTime` | 文本 | 仅故障时显示 |

**交互行为：**

| 触发 | 行为 | 说明 |
|------|------|------|
| 点击 [快速报修] | 打开 P15 (Drawer) | 预选当前加气机设备 |
| 点击 [详情] | 跳转 P10 | `/operations/device-ledger/equipment/:id` |

#### 响应式适配

| 断点 | 布局调整 |
|------|---------|
| ≥1200px | 每行4台，网格布局 |
| 768-1199px | 每行2台 |
| <768px | 每行1台，纵向列表 |

---

### P08: 设备台账列表页 (EquipmentList)

**路由：** `/operations/device-ledger/equipment`
**对应 Story：** US-007, US-011, US-013
**权限：** `equipment_admin`, `station_master`, `tech_lead`, `ops_manager`

#### 页面头部

- **面包屑：** 首页 / 基础运营 / 设备设施管理 / 设备台账
- **标题：** 设备台账
- **操作按钮：**
  - `[+ 新增设备]` (Primary) → 跳转 `/operations/device-ledger/equipment/create`
  - `[导出]` (Default) → 导出当前筛选结果为 Excel

#### 类型Tab切换

**组件：** Tabs

| Tab | 值 | 说明 |
|-----|-----|------|
| 全部 | `all` | 默认，显示所有设备 |
| 储罐 | `tank` | 筛选设备类型=储罐 |
| 加气机 | `dispenser` | 筛选设备类型=加气机 |
| 泵 | `pump` | 筛选设备类型=泵 |
| 阀门 | `valve` | 筛选设备类型=阀门 |
| 传感器 | `sensor` | 筛选设备类型=传感器 |
| 消防设备 | `fire_equipment` | 筛选设备类型=消防设备 |
| 电气设备 | `electrical` | 筛选设备类型=电气设备 |

切换Tab = 设置设备类型筛选条件，刷新列表。

#### 筛选区域

| 字段 | 组件 | 数据源 | 默认值 | 宽度 |
|------|------|--------|--------|------|
| 关键词 | Input.Search | - | - | 240px |
| 状态 | Select | `active`/`inactive`/`fault`/`pending_maintenance`/`all` | `active` | 150px |
| 安装日期 | DatePicker.RangePicker | - | - | 280px |

**搜索框：** placeholder="搜索设备编号/名称..."

#### 数据表格

| 列名 | 字段 | 宽度 | 对齐 | 渲染 | 排序 |
|------|------|------|------|------|------|
| 设备编号 | `deviceCode` | 140px | left | 链接→P10，加粗 | ✅ |
| 名称 | `name` | 150px | left | 文本 | ✅ |
| 类型 | `deviceType` | 100px | center | 图标+Tag | - |
| 型号 | `model` | 120px | left | 文本 | - |
| 状态 | `status` | 100px | center | Tag(颜色映射) | ✅ |
| 安装日期 | `installDate` | 110px | center | 日期 YYYY-MM-DD | ✅ |
| 下次维保 | `nextMaintenanceDate` | 110px | center | 日期，<7天黄色，已过期红色 | ✅ |
| 操作 | - | 180px | center | [查看] [编辑] [更多▼] | - |

**操作列详情：**
| 操作 | 类型 | 权限 | 行为 |
|------|------|------|------|
| 查看 | Link | all | 跳转 `/operations/device-ledger/equipment/:id` |
| 编辑 | Link | `equipment:update` | 跳转 `/operations/device-ledger/equipment/:id/edit` |
| 更多-创建工单 | Dropdown | `equipment:update` | 跳转 `/operations/device-ledger/maintenance/create?deviceId=:id` |
| 更多-停用 | Dropdown | `equipment:delete` | Popconfirm → 软删除 |
| 更多-恢复 | Dropdown | `equipment:delete` | 仅停用设备显示 |

**设备类型图标映射：**
| 类型 | 图标 | Tag颜色 |
|------|------|---------|
| 储罐 | 🛢️ | `blue` |
| 加气机 | ⛽ | `cyan` |
| 泵 | ⚙️ | `purple` |
| 阀门 | 🔧 | `orange` |
| 传感器 | 📡 | `green` |
| 消防设备 | 🧯 | `red` |
| 电气设备 | ⚡ | `gold` |

**设备状态Tag颜色：**
| 状态值 | 显示文本 | Tag颜色 |
|--------|---------|---------|
| `active` | 正常 | `green` |
| `fault` | 故障 | `red` |
| `pending_maintenance` | 待维保 | `orange` |
| `inactive` | 已停用 | `default` (灰) |

**列表排序：** 默认按"异常/故障优先 + 安装日期倒序"
**分页：** 默认 20 条/页，可选 10/20/50/100

#### 交互行为

| 触发 | 行为 | 路由路径 | 说明 |
|------|------|----------|------|
| 点击 [新增设备] | 跳转新增页 | `/operations/device-ledger/equipment/create` | 空表单 |
| 点击设备编号 | 跳转详情页 | `/operations/device-ledger/equipment/:id` | id来自当前行 |
| 点击 [编辑] | 跳转编辑页 | `/operations/device-ledger/equipment/:id/edit` | id来自当前行 |
| 点击 [停用] | Popconfirm | - | 有未完成工单时禁止，提示原因 |
| 点击 [导出] | 导出Excel | - | 导出当前筛选结果 |
| 切换Tab | 刷新列表 | - | 设置设备类型筛选 |
| 搜索/筛选 | 即时刷新 | - | 重置分页到第1页 |

#### 空状态

```
还没有设备信息，添加第一台设备开始管理
[+ 新增设备]
```

#### 响应式适配

| 断点 | 布局调整 |
|------|---------|
| ≥1200px | 完整表格视图 |
| 768-1199px | 隐藏次要列(型号、安装日期) |
| <768px | 卡片列表视图，每卡片显示编号+名称+类型+状态 |

---

### P09: 新增设备表单页 (EquipmentCreateForm)

**路由：** `/operations/device-ledger/equipment/create`
**对应 Story：** US-008
**权限：** `equipment_admin`, `station_master`

#### 页面头部

- **面包屑：** 首页 / 基础运营 / 设备设施管理 / 设备台账 / 新增设备
- **标题：** 新增设备
- **操作按钮：**
  - `[保存]` (Primary)
  - `[保存并创建下一条]` (Default) → 保存后复制当前数据进入新表单
  - `[取消]` → 返回列表

#### 表单布局: 分组表单

| 分组 | 标题 | 包含字段 |
|------|------|---------|
| 1 | 基础信息 | 设备类型、编码方式、设备编号、名称、型号、制造商、所属站点 |
| 2 | 技术参数 | 根据设备类型动态展示 |
| 3 | 维保设置 | 维保周期、最近维保日期 |
| 4 | 备注 | 备注信息 |

#### 分组1: 基础信息

| 字段 | 标签 | 组件 | 必填 | 校验规则 | 默认值 | 说明 |
|------|------|------|------|---------|--------|------|
| `deviceType` | 设备类型 | Select | 是 | - | - | 选项带图标：储罐/加气机/泵/阀门/传感器/消防设备/电气设备 |
| `codeMode` | 编码方式 | Radio.Group | 是 | - | `auto` | auto=自动生成, manual=手工输入 |
| `deviceCode` | 设备编号 | Input | 条件 | 全局唯一, 2-32字符 | (自动生成) | `codeMode=manual`时可编辑；实时唯一性校验 |
| `name` | 设备名称 | Input | 是 | 2-100字符 | - | - |
| `model` | 型号 | Input | 否 | 最大100字符 | - | - |
| `manufacturer` | 制造商 | Input | 否 | 最大100字符 | - | - |
| `stationId` | 所属站点 | Select(disabled) | 是 | - | 当前站点 | 默认当前站点，不可修改 |
| `installDate` | 安装日期 | DatePicker | 否 | 不晚于今天 | - | - |

**编码自动生成逻辑：**
- 格式: `DEV-{TYPE_ABBR}-{SEQ}`
- 示例: `DEV-TANK-001`, `DEV-DISP-002`, `DEV-PUMP-003`
- `TYPE_ABBR` 映射: tank=TANK, dispenser=DISP, pump=PUMP, valve=VALVE, sensor=SENS, fire_equipment=FIRE, electrical=ELEC

**字段联动：**
- 选择设备类型后，自动生成编码预览（auto模式）
- 选择设备类型后，动态显示分组2的类型特有字段

#### 分组2: 技术参数 (动态字段)

**储罐特有字段：**
| 字段 | 标签 | 组件 | 必填 | 校验规则 |
|------|------|------|------|---------|
| `capacity` | 容量 | InputNumber | 否 | >0, 单位m³ |
| `maxPressure` | 最大工作压力 | InputNumber | 否 | >0, 单位MPa |
| `medium` | 存储介质 | Select | 否 | LNG/CNG/LPG/其他 |

**加气机特有字段：**
| 字段 | 标签 | 组件 | 必填 | 校验规则 |
|------|------|------|------|---------|
| `nozzleCount` | 枪位数量 | InputNumber | 否 | 1-8 |
| `fuelTypes` | 适用燃料 | Select(多选) | 否 | - |

**泵/阀门/传感器/消防/电气：**
| 字段 | 标签 | 组件 | 必填 | 校验规则 |
|------|------|------|------|---------|
| `specification` | 规格参数 | Input.TextArea | 否 | 最大500字符 |

#### 分组3: 维保设置

| 字段 | 标签 | 组件 | 必填 | 校验规则 | 默认值 | 说明 |
|------|------|------|------|---------|--------|------|
| `maintenanceCycle` | 维保频率 | Select | 否 | - | - | 日检/周检/月检/季检/半年检/年检 |
| `lastMaintenanceDate` | 上次维保日期 | DatePicker | 否 | 不晚于今天 | - | - |
| `nextMaintenanceDate` | 下次维保日期 | DatePicker(只读) | - | - | (自动计算) | 根据频率+上次日期自动计算 |

**维保频率计算逻辑：**
| 频率 | 周期 |
|------|------|
| 日检 | +1天 |
| 周检 | +7天 |
| 月检 | +30天 |
| 季检 | +90天 |
| 半年检 | +180天 |
| 年检 | +365天 |

#### 分组4: 备注

| 字段 | 标签 | 组件 | 必填 | 校验规则 |
|------|------|------|------|---------|
| `remark` | 备注 | Input.TextArea | 否 | 最大500字符 |

#### 表单行为

| 触发 | 行为 |
|------|------|
| 选择设备类型 | 动态展示技术参数分组 + 更新自动编码预览 |
| 编码方式选auto | 编码字段只读+预览值 |
| 编码方式选manual | 编码字段可编辑，实时校验唯一性(防抖300ms) |
| 点击 [保存] | 全量校验 → 提交 → Toast"设备信息已保存" → 跳转详情页 P10 |
| 点击 [保存并创建下一条] | 全量校验 → 提交 → Toast"已保存，继续录入" → 清空表单但保留设备类型+制造商+维保周期等通用字段 |
| 点击 [取消] | 有修改时 Popconfirm → 返回列表 `/operations/device-ledger/equipment` |
| 离开页面 | 有修改时 beforeunload 提示 |
| 自动保存 | 每30秒保存到 localStorage 草稿 |

**"保存并创建下一条"保留字段：**
- 设备类型、制造商、所属站点、维保频率（高频录入同类设备时这些通常相同）
- 清空字段：设备编号(重新生成)、名称、型号、安装日期、备注

#### 响应式适配

| 断点 | 布局调整 |
|------|---------|
| ≥1200px | 表单双列布局 |
| <768px | 表单单列堆叠，底部固定保存按钮 |

---

### P10: 设备详情页 (EquipmentDetail)

**路由：** `/operations/device-ledger/equipment/:id`
**对应 Story：** US-010, US-012, US-022
**权限：** `equipment_admin`, `station_master`, `tech_lead`, `ops_manager`

#### 页面头部

- **面包屑：** 首页 / 基础运营 / 设备设施管理 / 设备台账 / 设备详情
- **标题：** {设备名称} + 状态Tag + 设备类型Tag
- **操作按钮：**
  - `[编辑]` (Primary) → 跳转 `/operations/device-ledger/equipment/:id/edit`
  - `[创建维保工单]` (Default) → 跳转 `/operations/device-ledger/maintenance/create?deviceId=:id`
  - `[停用]` (Danger, 需确认) → 软删除
  - `[返回列表]` → 跳转 `/operations/device-ledger/equipment`

#### 维保到期提醒条 (条件显示)

当设备即将到期维保（≤7天）时显示：
```
🔧 该设备将于 3 天后到期维保  [创建维保工单]
```

#### Tab结构

| Tab | 标题 | 对应Story | 说明 |
|-----|------|----------|------|
| 基本信息 | 基本信息 | US-010 | 设备台账信息 (默认Tab) |
| 运行状态 | 运行状态 | US-010 | 实时监控数据（仅储罐/加气机类型显示） |
| 维保记录 | 维保记录 | US-022 [MVP+] | 历史维保工单时间线 |
| 设备照片 | 设备照片 | US-012 [MVP+] | 照片画廊 |

#### Tab: 基本信息

**组件：** Descriptions，2列布局

| 字段 | 标签 | 渲染 |
|------|------|------|
| `deviceCode` | 设备编号 | 文本（加粗） |
| `name` | 设备名称 | 文本 |
| `deviceType` | 设备类型 | 图标+Tag |
| `model` | 型号 | 文本 |
| `manufacturer` | 制造商 | 文本 |
| `stationName` | 所属站点 | 文本 |
| `installDate` | 安装日期 | 日期 YYYY-MM-DD |
| `status` | 状态 | Tag(颜色映射) |
| `maintenanceCycle` | 维保频率 | 文本 |
| `lastMaintenanceDate` | 上次维保 | 日期 |
| `nextMaintenanceDate` | 下次维保 | 日期，<7天黄色，已过期红色 |
| `remark` | 备注 | 文本(可展开) |
| `createdAt` | 创建时间 | 日期时间 |
| `updatedAt` | 最后更新 | 日期时间 |

**技术参数区块（条件显示）：**

储罐额外显示：容量、最大工作压力、存储介质
加气机额外显示：枪位数量、适用燃料

#### Tab: 运行状态 (仅储罐/加气机)

**储罐运行状态：**
- 液位/压力/温度实时数据（复用P02的展示样式）
- 近24小时趋势图

**加气机运行状态：**
- 枪位状态列表（复用P03的卡片样式）

**其他设备类型：**
- 该Tab不显示或显示"该类型设备暂不支持实时监控"

#### Tab: 维保记录 [MVP+]

**组件：** Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│ ▎维保记录                                    [查看全部工单 →]  │
├─────────────────────────────────────────────────────────────────┤
│ ● 2026-02-10  月检保养  WO-2026-0038  [已完成]                 │
│   处理人: 张工程师                                               │
│   摘要: 更换密封垫片，检测各项指标正常                           │
│                                                                 │
│ ● 2026-01-12  月检保养  WO-2026-0025  [已完成]                 │
│   处理人: 张工程师                                               │
│   摘要: 常规检查，一切正常                                       │
│                                                                 │
│ ● 2025-12-15  年检      WO-2025-0180  [已完成]                 │
│   处理人: 李技术主管                                             │
│   摘要: 年度检测，更换压力表                                     │
└─────────────────────────────────────────────────────────────────┘
```

**时间线条目字段：**
| 字段 | 渲染 |
|------|------|
| `completedAt` | 时间节点 |
| `orderType` | Tag(保养/维修/报修) |
| `orderNo` | 链接→P14 |
| `status` | Tag |
| `assignee` | 文本 |
| `summary` | 文本 |

**"查看全部工单"按钮：** 跳转 `/operations/device-ledger/maintenance?deviceId=:id`

#### Tab: 设备照片 [MVP+]

**组件：** Upload + Image.PreviewGroup

```
┌─────────────────────────────────────────────────────────────────┐
│ ▎设备照片 (3/10)                              [+ 上传照片]     │
├─────────────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│ │ [图片1] │ │ [图片2] │ │ [图片3] │ │ + 上传  │                  │
│ │  删除   │ │  删除   │ │  删除   │ │        │                  │
│ └────────┘ └────────┘ └────────┘ └────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

**上传限制：**
| 属性 | 值 |
|------|-----|
| 格式 | jpg, jpeg, png |
| 大小限制 | 单文件 5MB |
| 数量限制 | 最多 10 张 |

**交互行为：**
| 触发 | 行为 |
|------|------|
| 点击图片 | 大图预览（Image.PreviewGroup） |
| 点击 [删除] | Popconfirm → 删除照片 → Toast"已删除" + 5秒内撤销 |
| 上传完成 | 缩略图显示在画廊中 |

#### 响应式适配

| 断点 | 布局调整 |
|------|---------|
| ≥1200px | Tab横向，Descriptions双列 |
| <768px | Tab下拉切换，Descriptions单列 |

---

### P11: 编辑设备表单页 (EquipmentEditForm)

**路由：** `/operations/device-ledger/equipment/:id/edit`
**对应 Story：** US-009
**权限：** `equipment_admin`, `station_master`

#### 页面头部

- **面包屑：** 首页 / 基础运营 / 设备设施管理 / 设备台账 / 编辑设备
- **标题：** 编辑设备 - {设备名称}
- **操作按钮：**
  - `[保存]` (Primary)
  - `[取消]` → 返回详情页

#### 表单字段

与 P09 相同，但有以下差异：

| 字段 | 差异 |
|------|------|
| `deviceCode` | **不可编辑**，只读显示 + Tooltip"创建后不可修改" |
| `deviceType` | **不可编辑**，只读显示（类型变更会影响关联数据） |
| `stationId` | **不可编辑**，只读显示 |
| 其他字段 | 预填当前值 |

**操作按钮差异：**
- 无"保存并创建下一条"按钮（编辑模式不需要）

#### 表单行为

| 触发 | 行为 |
|------|------|
| 保存 | 全量校验 → 提交 → Toast"设备信息已保存" → 返回详情页 P10 |
| 取消 | 有修改时 Popconfirm → 返回详情页 |
| 离开页面 | 有修改时 beforeunload 提示 |
| 自动保存 | 每30秒保存到 localStorage 草稿 |

---

### P12: 维保工单列表页 (MaintenanceOrderList)

**路由：** `/operations/device-ledger/maintenance`
**对应 Story：** US-014
**权限：** `equipment_admin`, `station_master`, `tech_lead`

#### 页面头部

- **面包屑：** 首页 / 基础运营 / 设备设施管理 / 维保工单
- **标题：** 维保工单
- **操作按钮：**
  - `[+ 新建工单]` (Primary) → 跳转 `/operations/device-ledger/maintenance/create`
  - `[故障报修]` (Default, 红色图标) → 打开 P15 故障报修抽屉

#### 工单统计汇总条

```
┌──────────────────────────────────────────────────────────────────┐
│  待处理: 5  |  处理中: 3  |  待验收: 2  |  已完成: 48  |  已关闭: 12 │
└──────────────────────────────────────────────────────────────────┘
```

**组件：** Tag 行内排列，点击可快速筛选

#### 状态Tab切换

| Tab | 值 | Badge |
|-----|-----|-------|
| 全部 | `all` | - |
| 待处理 | `pending` | 数量Badge |
| 处理中 | `processing` | 数量Badge |
| 待验收 | `pending_review` | 数量Badge |
| 已完成 | `completed` | - |
| 已关闭 | `closed` | - |

#### 筛选区域

| 字段 | 组件 | 数据源 | 默认值 | 宽度 |
|------|------|--------|--------|------|
| 关键词 | Input.Search | - | - | 240px |
| 工单类型 | Select | maintenance/repair/report | 全部 | 120px |
| 设备 | Select(带搜索) | 设备台账 | 全部 | 200px |
| 负责人 | Select | 员工列表 | 全部 | 150px |
| 时间范围 | DatePicker.RangePicker | - | - | 280px |

#### 数据表格

| 列名 | 字段 | 宽度 | 对齐 | 渲染 | 排序 |
|------|------|------|------|------|------|
| 工单编号 | `orderNo` | 160px | left | 链接→P14 | - |
| 设备名称 | `device.name` | 140px | left | 链接→P10 | - |
| 工单类型 | `orderType` | 80px | center | Tag | - |
| 紧急程度 | `urgency` | 90px | center | UrgencyTag | ✅ |
| 状态 | `status` | 90px | center | StatusTag | - |
| 负责人 | `assignee.name` | 100px | left | 文本 | - |
| 计划时间 | `plannedDate` | 110px | center | 日期 | ✅ |
| 创建时间 | `createdAt` | 150px | left | 日期时间 | ✅ |
| 操作 | - | 120px | center | [查看] [编辑] | - |

**工单类型Tag映射：**
| 类型值 | 显示文本 | Tag颜色 |
|--------|---------|---------|
| `maintenance` | 保养 | `blue` |
| `repair` | 维修 | `orange` |
| `report` | 报修 | `red` |

**紧急程度Tag映射：**
| 程度值 | 显示文本 | Tag颜色 |
|--------|---------|---------|
| `low` | 低 | `default` |
| `medium` | 中 | `blue` |
| `high` | 高 | `orange` |
| `urgent` | 紧急 | `red` |

**工单状态Tag映射：**
| 状态值 | 显示文本 | Tag颜色 |
|--------|---------|---------|
| `pending` | 待处理 | `blue` |
| `processing` | 处理中 | `orange` |
| `pending_review` | 待验收 | `purple` |
| `completed` | 已完成 | `green` |
| `closed` | 已关闭 | `default` (灰) |

**特殊行样式：**
- 紧急程度为"紧急"的工单：行背景浅红色 `#fff1f0`
- 紧急工单自动置顶

**列表排序：** 默认按"紧急程度倒序 + 创建时间倒序"
**分页：** 默认 20 条/页，可选 10/20/50/100

#### 交互行为

| 触发 | 行为 | 路由路径 | 说明 |
|------|------|----------|------|
| 点击 [新建工单] | 跳转新建页 | `/operations/device-ledger/maintenance/create` | 空表单 |
| 点击 [故障报修] | 打开抽屉 | - (Drawer P15) | 报修表单 |
| 点击工单编号 | 跳转详情 | `/operations/device-ledger/maintenance/:id` | id来自当前行 |
| 点击设备名称 | 跳转设备详情 | `/operations/device-ledger/equipment/:deviceId` | 联动跳转 |
| 点击 [编辑] | 跳转工单详情(编辑模式) | `/operations/device-ledger/maintenance/:id` | 状态为待处理/处理中时可用 |
| 切换状态Tab | 刷新列表 | - | 按状态筛选 |

#### 空状态

```
暂无维保工单
[+ 新建工单]
```

#### 响应式适配

| 断点 | 布局调整 |
|------|---------|
| ≥1200px | 完整表格 |
| 768-1199px | 隐藏次要列(计划时间、创建时间) |
| <768px | 卡片列表，状态/紧急程度标签突出 |

---

### P13: 新建维保工单页 (MaintenanceOrderCreateForm)

**路由：** `/operations/device-ledger/maintenance/create`
**对应 Story：** US-015
**权限：** `equipment_admin`, `station_master`

#### 页面头部

- **面包屑：** 首页 / 基础运营 / 设备设施管理 / 维保工单 / 新建工单
- **标题：** 新建维保工单
- **操作按钮：**
  - `[保存]` (Primary)
  - `[取消]` → 返回工单列表

#### 表单字段

| 字段 | 标签 | 组件 | 必填 | 校验规则 | 默认值 | 说明 |
|------|------|------|------|---------|--------|------|
| `deviceId` | 关联设备 | Select(带搜索) | 是 | - | URL参数deviceId | 搜索设备编号/名称，选中后自动填入设备信息 |
| `orderType` | 工单类型 | Radio.Group | 是 | - | `maintenance` | 保养/维修 |
| `urgency` | 紧急程度 | Radio.Group | 是 | - | `medium` | 低/中/高/紧急，大按钮卡片样式 |
| `description` | 问题描述 | Input.TextArea | 是 | 10-2000字符 | - | 支持详细描述 |
| `assigneeId` | 负责人 | Select(带搜索) | 是 | - | 站点默认设备管理员 | 从当前站点员工中选择 |
| `plannedStartDate` | 计划开始日期 | DatePicker | 是 | ≥今天 | 今天 | - |
| `plannedEndDate` | 计划结束日期 | DatePicker | 是 | ≥计划开始日期 | - | - |

**设备信息预览（选择设备后显示）：**
```
┌──────────────────────────────────────────────────┐
│ 📋 已选设备信息                                   │
│ 设备编号: DEV-DISP-003  |  类型: 加气机           │
│ 型号: DQ-500  |  上次维保: 2026-01-12             │
└──────────────────────────────────────────────────┘
```

**URL参数联动：**
- 若URL带 `?deviceId=xxx`，自动预选设备并展示设备信息（从设备详情页创建工单场景）

#### 表单行为

| 触发 | 行为 |
|------|------|
| 选择设备 | 自动展示设备信息预览 |
| 保存 | 全量校验 → 提交 → Toast"维保工单已创建" → 跳转工单详情页 P14 |
| 取消 | 有修改时 Popconfirm → 返回工单列表 |

---

### P14: 工单详情页 (MaintenanceOrderDetail)

**路由：** `/operations/device-ledger/maintenance/:id`
**对应 Story：** US-016, US-018, US-019
**权限：** `equipment_admin`, `station_master`, `tech_lead`

#### 页面头部

- **面包屑：** 首页 / 基础运营 / 设备设施管理 / 维保工单 / 工单详情
- **标题：** 工单详情 - {orderNo}
- **操作按钮（根据状态和角色动态显示）：**
  - 待处理: `[开始处理]` (Primary) → 状态→处理中
  - 处理中: `[提交验收]` (Primary) → 状态→待验收
  - 待验收: `[验收通过]` (Primary) + `[退回处理]` (Danger) → 状态→已完成/处理中
  - 已完成: `[关闭工单]` (Default)
  - 通用: `[编辑]` (仅待处理/处理中) → 编辑模式; `[返回列表]`

#### 状态步骤条

**组件：** Steps

```
● 待处理 ──── ◉ 处理中 ──── ○ 待验收 ──── ○ 已完成
02-15 09:00   02-15 10:30
```

| 步骤 | 状态值 | 图标 |
|------|--------|------|
| 待处理 | `pending` | ClockCircleOutlined |
| 处理中 | `processing` | LoadingOutlined |
| 待验收 | `pending_review` | AuditOutlined |
| 已完成 | `completed` | CheckCircleOutlined |

#### 主内容：左右分栏

##### 左侧：工单信息

**组件：** Descriptions

| 字段 | 标签 | 渲染 |
|------|------|------|
| `orderNo` | 工单编号 | 文本(加粗) |
| `orderType` | 工单类型 | Tag |
| `urgency` | 紧急程度 | UrgencyTag |
| `device.name` | 关联设备 | 链接→P10 |
| `device.deviceCode` | 设备编号 | 文本 |
| `device.deviceType` | 设备类型 | 图标+Tag |
| `description` | 问题描述 | 多行文本 |
| `assignee.name` | 负责人 | 文本 |
| `plannedStartDate` | 计划开始 | 日期 |
| `plannedEndDate` | 计划结束 | 日期 |
| `createdBy.name` | 创建人 | 文本 |
| `createdAt` | 创建时间 | 日期时间 |

##### 右侧：处理记录时间线

**组件：** Timeline

```
┌─────────────────────────────────────────┐
│ ▎处理记录                [+ 添加记录]   │
├─────────────────────────────────────────┤
│ ● 02-15 12:00                           │
│   张工程师 提交验收                      │
│   "已更换加气枪密封件，测试正常"        │
│   配件: 密封垫片×2                       │
│   费用: ¥350                             │
│                                         │
│ ● 02-15 10:30                           │
│   张工程师 开始处理                      │
│   "已到现场检查，初步判断为密封件老化"  │
│                                         │
│ ● 02-15 09:00                           │
│   王安全员 创建报修                      │
│   "加气枪无法正常出液"                   │
│   附件: [图片1] [图片2]                  │
└─────────────────────────────────────────┘
```

**时间线条目字段：**
| 字段 | 渲染 |
|------|------|
| `timestamp` | 时间节点 |
| `operator.name` | 操作人 |
| `action` | 操作描述(开始处理/提交验收/退回等) |
| `content` | 文本内容 |
| `parts` | 使用配件(可选) |
| `cost` | 费用(可选, ¥格式) |
| `attachments` | 附件图片(可选) |

#### 添加记录弹窗 (Modal)

| 字段 | 标签 | 组件 | 必填 | 校验规则 |
|------|------|------|------|---------|
| `content` | 处理内容 | Input.TextArea | 是 | 10-2000字符 |
| `parts` | 使用配件 | Input | 否 | 最大255字符 |
| `cost` | 费用 | InputNumber | 否 | ≥0，精度2位小数 |
| `duration` | 耗时(小时) | InputNumber | 否 | >0 |
| `attachments` | 附件 | Upload | 否 | 最多5张, JPG/PNG, ≤5MB |

#### 状态变更确认弹窗

| 操作 | 弹窗标题 | 是否必填说明 |
|------|---------|-------------|
| 开始处理 | 确认开始处理 | 可选填备注 |
| 提交验收 | 提交验收 | 必填处理结果摘要 |
| 验收通过 | 确认验收通过 | 可选填验收意见 |
| 退回处理 | 退回处理 | 必填退回原因 |
| 关闭工单 | 确认关闭工单 | 可选填关闭原因 |

#### 交互行为

| 触发 | 行为 | 说明 |
|------|------|------|
| 点击状态操作按钮 | 弹出确认Modal | 填写说明后变更状态 |
| 点击 [添加记录] | 弹出记录Modal | 填写并保存 |
| 点击 [编辑] | 工单信息可编辑 | 仅待处理/处理中状态 |
| 点击设备名称链接 | 跳转设备详情 | `/operations/device-ledger/equipment/:deviceId` |
| 状态变更成功 | 刷新页面 + Toast | 步骤条和按钮更新 |

#### 响应式适配

| 断点 | 布局调整 |
|------|---------|
| ≥1200px | 左右分栏（6:6） |
| <768px | 纵向堆叠，工单信息在上、处理记录在下 |

---

### P15: 故障报修抽屉 (FaultReportDrawer)

**组件类型：** Drawer (从右侧滑入)
**对应 Story：** US-017
**权限：** `equipment_admin`, `safety_officer`, `station_master`

#### Drawer 配置

| 属性 | 值 |
|------|-----|
| 标题 | 故障报修 |
| 宽度 | 480px (桌面端) / 100vw (移动端) |
| 关闭 | 点击遮罩不关闭 |
| 位置 | 右侧弹出 |

#### 表单字段

| 字段 | 标签 | 组件 | 必填 | 校验规则 | 默认值 | 说明 |
|------|------|------|------|---------|--------|------|
| `deviceId` | 故障设备 | Select(带搜索) | 是 | - | 预选值(若从设备卡片触发) | 搜索设备编号/名称 |
| `urgency` | 紧急程度 | 4个大按钮卡片 | 是 | - | `medium` | 低(灰)/中(蓝)/高(橙)/紧急(红) |
| `description` | 故障描述 | Input.TextArea | 是 | 5-2000字符 | - | - |
| `photos` | 现场照片 | Upload | 否 | 最多5张, JPG/PNG, ≤5MB | - | 支持拍照+相册 |

**紧急程度大按钮组件：**
```
┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│  低     │ │  中     │ │  高     │ │ 🔴 紧急  │
│  不影响  │ │ 影响部分│ │ 影响运行│ │ 安全隐患 │
│  运营   │ │  功能   │ │        │ │ 立即处理 │
└────────┘ └────────┘ └────────┘ └──────────┘
```

#### 表单行为

| 触发 | 行为 |
|------|------|
| 提交报修 | 校验 → 创建"报修"类型工单(状态=待处理) → Toast"报修单已提交，工单编号: WO-XXXX" → 关闭Drawer |
| 取消 | 有修改时Popconfirm → 关闭Drawer |
| 选择紧急=紧急 | 按钮红色高亮，提交后工单列表置顶 |

---

### P16: 保养计划页 (MaintenancePlanList) [MVP+]

**路由：** `/operations/device-ledger/maintenance/plans`
**对应 Story：** US-020, US-021
**权限：** `equipment_admin`, `tech_lead`

#### 页面头部

- **面包屑：** 首页 / 基础运营 / 设备设施管理 / 维保工单 / 保养计划
- **标题：** 保养计划
- **操作按钮：** `[+ 新建计划]`

#### 数据表格

| 列名 | 字段 | 宽度 | 对齐 | 渲染 |
|------|------|------|------|------|
| 计划名称 | `name` | 150px | left | 文本 |
| 关联设备 | `device.name` | 140px | left | 链接→P10 |
| 保养频率 | `frequency` | 100px | center | Tag |
| 下次保养日期 | `nextDate` | 110px | center | 日期，<7天高亮 |
| 启用状态 | `enabled` | 80px | center | Switch |
| 操作 | - | 120px | center | [编辑] [删除] |

#### 新建/编辑计划 (Modal)

| 字段 | 标签 | 组件 | 必填 | 校验规则 |
|------|------|------|------|---------|
| `name` | 计划名称 | Input | 是 | 2-100字符 |
| `deviceId` | 关联设备 | Select(带搜索) | 是 | - |
| `frequency` | 保养频率 | Select | 是 | 日检/周检/月检/季检/半年检/年检 |
| `startDate` | 开始日期 | DatePicker | 是 | ≥今天 |
| `reminderDays` | 提前提醒天数 | InputNumber | 否 | 1-30, 默认7 |

---

### P17: 设备连接状态页 (DeviceConnectivity)

**路由：** `/operations/device-ledger/connectivity`
**对应 Story：** US-023
**权限：** `equipment_admin`, `station_master`

#### 页面头部

- **面包屑：** 首页 / 基础运营 / 设备设施管理 / 设备连接
- **标题：** 设备连接状态
- **说明：** 页面底部提示"数据采集配置等高级功能将在后续版本提供"

#### 状态Tab切换

| Tab | 值 |
|-----|-----|
| 全部 | `all` |
| 在线 | `online` |
| 离线 | `offline` |
| 异常 | `error` |

#### 数据表格

| 列名 | 字段 | 宽度 | 对齐 | 渲染 | 排序 |
|------|------|------|------|------|------|
| 设备名称 | `name` | 150px | left | 文本 | ✅ |
| 设备编号 | `deviceCode` | 140px | left | 文本 | - |
| 设备类型 | `deviceType` | 100px | center | 图标+Tag | - |
| 连接状态 | `connectionStatus` | 100px | center | Badge+文字 | ✅ |
| 最后通信时间 | `lastCommunicationAt` | 160px | left | 相对时间("5分钟前") | ✅ |
| 离线时长 | `offlineDuration` | 120px | left | 文本(仅离线/异常显示) | ✅ |

**连接状态Badge颜色：**
| 状态值 | 显示文本 | Badge颜色 |
|--------|---------|-----------|
| `online` | 在线 | `green` |
| `offline` | 离线 | `default` (灰)，>1h红色 |
| `error` | 异常 | `orange` |

**列表排序：** 默认离线/异常设备置顶

#### 空状态

```
该站点暂无配置联网设备
数据采集配置将在后续版本提供
```

---

## 4. 页面导航关系

```text
设施监控看板(P01) ← 模块默认页
  │
  ├──[储罐卡片/查看详情]──→ 储罐监控详情(P02)
  │                          └──[返回]──→ P01
  │
  ├──[加气机卡片/查看详情]──→ 加气机状态看板(P03)
  │                          ├──[快速报修]──→ 故障报修抽屉(P15, Drawer)
  │                          ├──[设备详情]──→ 设备详情页(P10)
  │                          └──[返回]──→ P01
  │
  └──[待处理事项-快速报修]──→ 故障报修抽屉(P15, Drawer)

设备台账列表(P08)
  │
  ├──[新增设备]──→ 新增设备表单(P09)
  │                ├──[保存]──→ 设备详情页(P10)
  │                └──[保存并创建下一条]──→ 新增设备表单(P09, 部分预填)
  │
  ├──[点击设备编号/查看]──→ 设备详情页(P10)
  │                          ├──[编辑]──→ 编辑设备表单(P11) ──[保存]──→ P10
  │                          ├──[创建维保工单]──→ 新建工单(P13, 预填设备)
  │                          └──[维保记录-查看全部]──→ 工单列表(P12, 预筛设备)
  │
  └──[编辑]──→ 编辑设备表单(P11) ──[保存]──→ P10

维保工单列表(P12)
  │
  ├──[新建工单]──→ 新建工单(P13) ──[保存]──→ 工单详情(P14)
  │
  ├──[故障报修]──→ 故障报修抽屉(P15, Drawer) ──[提交]──→ 刷新P12
  │
  ├──[点击工单编号]──→ 工单详情(P14)
  │                     ├──[状态操作]──→ 状态变更(刷新P14)
  │                     ├──[添加记录]──→ 记录Modal(刷新P14)
  │                     └──[设备名称链接]──→ 设备详情(P10)
  │
  └──[点击设备名称]──→ 设备详情(P10)

设备连接(P17) ← 独立页面，无子页面跳转

全局: 故障报修抽屉(P15) 可从 P01, P03, P08, P12 触发
```

---

## 5. 组件映射

### 5.1 页面组件

| 页面 | 组件文件 | 说明 |
|------|----------|------|
| P01 | `FacilityMonitoringDashboard.tsx` | 设施监控看板 |
| P02 | `TankMonitoring.tsx` | 储罐监控详情 |
| P03 | `DispenserStatusBoard.tsx` | 加气机状态看板 |
| P08 | `EquipmentList.tsx` | 设备台账列表 |
| P09 | `EquipmentForm.tsx` (mode=create) | 新增设备表单 |
| P10 | `EquipmentDetail.tsx` | 设备详情页 |
| P11 | `EquipmentForm.tsx` (mode=edit) | 编辑设备表单 |
| P12 | `MaintenanceOrderList.tsx` | 维保工单列表 |
| P13 | `MaintenanceOrderForm.tsx` | 新建维保工单 |
| P14 | `MaintenanceOrderDetail.tsx` | 工单详情页 |
| P15 | `FaultReportDrawer.tsx` | 故障报修抽屉 |
| P16 | `MaintenancePlanList.tsx` | 保养计划 [MVP+] |
| P17 | `DeviceConnectivity.tsx` | 设备连接状态 |

### 5.2 共享组件

| 组件 | 文件 | 用途 |
|------|------|------|
| TankCard | `components/TankCard.tsx` | 储罐状态卡片 |
| DispenserCard | `components/DispenserCard.tsx` | 加气机状态卡片 |
| DeviceStatusTag | `components/DeviceStatusTag.tsx` | 设备状态Tag |
| UrgencyTag | `components/UrgencyTag.tsx` | 紧急程度Tag |
| OrderStatusTag | `components/OrderStatusTag.tsx` | 工单状态Tag |
| OrderStatusSteps | `components/OrderStatusSteps.tsx` | 工单状态步骤条 |
| MaintenanceTimeline | `components/MaintenanceTimeline.tsx` | 维保记录时间线 |
| DeviceSelector | `components/DeviceSelector.tsx` | 设备选择器(带搜索+预览) |
| PendingActionList | `components/PendingActionList.tsx` | 待处理事项列表 |

---

## 6. 路由配置

```typescript
// router.tsx — device-ledger 部分
{
  path: 'operations',
  children: [
    {
      path: 'device-ledger',
      children: [
        // 设施监控
        { 
          path: 'monitoring',
          children: [
            { index: true, element: <FacilityMonitoringDashboard /> },  // P01
            { path: 'tanks', element: <TankMonitoring /> },             // P02
            { path: 'dispensers', element: <DispenserStatusBoard /> },   // P03
            { path: 'sensors', element: <SensorData /> },               // P04 [MVP+]
            { path: 'health', element: <DeviceHealth /> },              // P05 [MVP+]
            { path: 'alarms/config', element: <AlarmConfig /> },        // P06 [MVP+]
            { path: 'alarms/records', element: <AlarmRecords /> },      // P07 [MVP+]
          ],
        },
        // 设备台账
        {
          path: 'equipment',
          children: [
            { index: true, element: <EquipmentList /> },                // P08
            { path: 'create', element: <EquipmentForm mode="create" /> }, // P09
            { path: ':id', element: <EquipmentDetail /> },              // P10
            { path: ':id/edit', element: <EquipmentForm mode="edit" /> }, // P11
          ],
        },
        // 维保工单
        {
          path: 'maintenance',
          children: [
            { index: true, element: <MaintenanceOrderList /> },          // P12
            { path: 'create', element: <MaintenanceOrderForm /> },       // P13
            { path: ':id', element: <MaintenanceOrderDetail /> },        // P14
            { path: 'plans', element: <MaintenancePlanList /> },         // P16 [MVP+]
          ],
        },
        // 设备连接
        { path: 'connectivity', element: <DeviceConnectivity /> },       // P17
        // 默认重定向到监控看板
        { index: true, element: <Navigate to="monitoring" replace /> },
      ],
    },
  ],
}
```

---

## 7. 状态与颜色映射汇总

### 设备状态

| 状态值 | 显示文本 | Tag颜色 | 场景 |
|--------|---------|---------|------|
| `active` | 正常 | `green` | 设备正常运行 |
| `fault` | 故障 | `red` | 设备故障 |
| `pending_maintenance` | 待维保 | `orange` | 维保即将到期 |
| `inactive` | 已停用 | `default` | 软删除/报废 |

### 工单状态

| 状态值 | 显示文本 | Tag颜色 | Steps状态 |
|--------|---------|---------|----------|
| `pending` | 待处理 | `blue` | `wait` |
| `processing` | 处理中 | `orange` | `process` |
| `pending_review` | 待验收 | `purple` | `process` |
| `completed` | 已完成 | `green` | `finish` |
| `closed` | 已关闭 | `default` | `finish` |

### 工单类型

| 类型值 | 显示文本 | Tag颜色 |
|--------|---------|---------|
| `maintenance` | 保养 | `blue` |
| `repair` | 维修 | `orange` |
| `report` | 报修 | `red` |

### 紧急程度

| 程度值 | 显示文本 | Tag颜色 | 行背景色 |
|--------|---------|---------|---------|
| `low` | 低 | `default` | - |
| `medium` | 中 | `blue` | - |
| `high` | 高 | `orange` | - |
| `urgent` | 紧急 | `red` | `#fff1f0` |

### 连接状态

| 状态值 | 显示文本 | Badge颜色 |
|--------|---------|-----------|
| `online` | 在线 | `green` |
| `offline` | 离线 | `default` (>1h时`red`) |
| `error` | 异常 | `orange` |

### 储罐液位

| 条件 | 颜色 | 说明 |
|------|------|------|
| ≥50% | `#52c41a` (绿) | 正常 |
| 20%-49% | `#faad14` (黄) | 偏低 |
| <20% | `#ff4d4f` (红) | 告警 |

### 加气机/枪状态

| 状态值 | 显示文本 | 颜色 |
|--------|---------|------|
| `idle` | 空闲 | `green` |
| `fueling` | 加注中 | `blue` |
| `fault` | 故障 | `red` |
| `offline` | 离线 | `default` |

### 设备类型

| 类型值 | 显示文本 | 图标 | Tag颜色 |
|--------|---------|------|---------|
| `tank` | 储罐 | 🛢️ | `blue` |
| `dispenser` | 加气机 | ⛽ | `cyan` |
| `pump` | 泵 | ⚙️ | `purple` |
| `valve` | 阀门 | 🔧 | `orange` |
| `sensor` | 传感器 | 📡 | `green` |
| `fire_equipment` | 消防设备 | 🧯 | `red` |
| `electrical` | 电气设备 | ⚡ | `gold` |

---

## 8. 表单校验规则汇总

### 设备台账表单

| 字段 | 规则 |
|------|------|
| `deviceType` | 必填 |
| `deviceCode` | 必填(manual模式)；2-32字符；全局唯一校验(实时远程，防抖300ms) |
| `name` | 必填；2-100字符 |
| `model` | 选填；最大100字符 |
| `manufacturer` | 选填；最大100字符 |
| `installDate` | 选填；不晚于今天 |
| `capacity` | 选填(储罐)；>0 |
| `maxPressure` | 选填(储罐)；>0 |
| `nozzleCount` | 选填(加气机)；1-8 |
| `remark` | 选填；最大500字符 |

### 维保工单表单

| 字段 | 规则 |
|------|------|
| `deviceId` | 必填 |
| `orderType` | 必填 |
| `urgency` | 必填 |
| `description` | 必填；10-2000字符 |
| `assigneeId` | 必填 |
| `plannedStartDate` | 必填；≥今天 |
| `plannedEndDate` | 必填；≥计划开始日期 |

### 故障报修表单

| 字段 | 规则 |
|------|------|
| `deviceId` | 必填 |
| `urgency` | 必填 |
| `description` | 必填；5-2000字符 |
| `photos` | 选填；最多5张；JPG/PNG；单张≤5MB |

### 处理记录表单

| 字段 | 规则 |
|------|------|
| `content` | 必填；10-2000字符 |
| `parts` | 选填；最大255字符 |
| `cost` | 选填；≥0；精度2位小数 |
| `duration` | 选填；>0 |
| `attachments` | 选填；最多5张；JPG/PNG；≤5MB |

---

## 9. 键盘快捷键

| 快捷键 | 页面/范围 | 功能 |
|--------|----------|------|
| `Ctrl/Cmd + S` | 表单页 (P09/P11/P13) | 保存表单 |
| `Esc` | 弹窗/抽屉 | 关闭 |
| `N` | 列表页 (P08/P12) | 新增设备/新建工单 |
| `R` / `F5` | 所有页面 | 刷新数据 |
| `Backspace` | 详情页 (P10/P14) | 返回列表 |

---

## 10. 响应式断点定义

| 断点 | 宽度范围 | 目标设备 | 全局布局 |
|------|---------|---------|---------|
| 桌面端 | ≥1200px | PC显示器 | 侧边栏展开 + 完整表格/看板 |
| 平板端 | 768-1199px | iPad/平板 | 侧边栏折叠 + 简化表格/看板 |
| 移动端 | <768px | 手机 | 底部导航 + 卡片列表 + Drawer全屏 |

---

## 11. 检查清单

- [x] 所有 [MVP] Story (15个) 都有对应的页面设计
- [x] 所有 [MVP+] Story (8个) 都有对应的页面设计
- [x] 所有页面都有明确的路由定义
- [x] **路由一致性：所有交互跳转路径与页面清单中的路由完全一致**
- [x] **无硬编码路径：交互行为中均引用页面清单定义的路径**
- [x] 列表页包含筛选/搜索功能（P08, P12, P17）
- [x] 表格列定义完整（列名、字段、宽度、渲染方式）
- [x] 表单字段包含校验规则
- [x] 交互行为明确（每个按钮点击后发生什么）
- [x] 页面间导航关系清晰（含导航图）
- [x] 组件选择优先使用 Ant Design 标准组件
- [x] 字段命名与 STANDARDS.md 术语表一致
- [x] 侧边栏菜单结构已定义
- [x] 状态颜色映射已定义（设备/工单/紧急/连接/储罐/加气机/设备类型）
- [x] 响应式断点和布局调整已定义
- [x] UX设计决策已落实（看板默认页、报修抽屉、状态步骤条、"复制并创建下一条"）
- [x] 空状态设计已覆盖（所有列表页/看板区域）

---

## 附录 A: Mock 数据字段映射

### Equipment (设备台账) 模拟数据

```typescript
interface EquipmentMock {
  id: string;                        // UUID
  deviceCode: string;                // "DEV-TANK-001"
  name: string;                      // "LNG储罐#1"
  deviceType: 'tank' | 'dispenser' | 'pump' | 'valve' | 'sensor' | 'fire_equipment' | 'electrical';
  model: string;                     // "VCT-200"
  manufacturer: string;              // "某设备制造有限公司"
  stationId: string;                 // 所属站点
  stationName: string;               // "杭州西湖站"
  installDate: string;               // "2023-01-15"
  status: 'active' | 'fault' | 'pending_maintenance' | 'inactive';
  maintenanceCycle: string | null;   // "monthly" | "quarterly" | "yearly" | ...
  lastMaintenanceDate: string | null;// "2026-01-12"
  nextMaintenanceDate: string | null;// "2026-02-12"
  remark: string | null;
  // 储罐特有
  capacity?: number;                 // m³
  maxPressure?: number;              // MPa
  medium?: string;                   // "LNG"
  // 加气机特有
  nozzleCount?: number;
  fuelTypes?: string[];
  // 通用扩展
  specification?: string;
  // 监控数据 (实时)
  monitoring?: {
    levelPercent?: number;           // 液位百分比 (储罐)
    levelVolume?: number;            // 液位体积 (储罐)
    pressure?: number;               // 压力 MPa (储罐)
    temperature?: number;            // 温度 ℃ (储罐)
    dispenserStatus?: 'idle' | 'fueling' | 'fault' | 'offline'; // (加气机)
    nozzles?: Array<{
      nozzleNo: string;
      fuelType: string;
      status: string;
      unitPrice: number;
    }>;
    connectionStatus?: 'online' | 'offline' | 'error';
    lastCommunicationAt?: string;
  };
  // 照片
  photos?: Array<{
    id: string;
    url: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

### MaintenanceOrder (维保工单) 模拟数据

```typescript
interface MaintenanceOrderMock {
  id: string;                        // UUID
  orderNo: string;                   // "WO-2026-0042"
  deviceId: string;
  device: {
    id: string;
    deviceCode: string;
    name: string;
    deviceType: string;
    model: string;
  };
  orderType: 'maintenance' | 'repair' | 'report';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'processing' | 'pending_review' | 'completed' | 'closed';
  description: string;
  assignee: {
    id: string;
    name: string;
  };
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartTime?: string;
  actualEndTime?: string;
  records: Array<{
    id: string;
    timestamp: string;
    operator: { id: string; name: string };
    action: string;                  // "created" | "started" | "submitted_review" | "approved" | "rejected" | "closed" | "record_added"
    content: string;
    parts?: string;
    cost?: number;
    duration?: number;
    attachments?: Array<{ id: string; url: string }>;
  }>;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}
```

---

*文档生成时间：2026-02-18*
*基于：user-stories.md v1.0 + ux-design.md v1.0 + STANDARDS.md §4*
*遵循：docs/skills/ui/ui-schema-design.md 输出规范*
