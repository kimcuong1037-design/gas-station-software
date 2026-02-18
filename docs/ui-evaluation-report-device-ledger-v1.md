# 设备设施管理模块 UI 评估报告 v1 (First Round)

**项目**: LNG 加气站管理系统  
**模块**: 设备设施管理 (Device Ledger) — 模块 1.3  
**技术栈**: React 19 + TypeScript 5.9 + Ant Design 6 + Vite 7  
**设计系统**: Fluent-inspired 极简专业风（绿色主题 #22A06B）  
**评估日期**: 2026-02-18  
**评估框架**: ui-eval v1.1（含路由专项检查 + 用户流程完整性检查）  
**评估轮次**: 第一轮  
**评估范围**: 11 个页面组件、6 个共享组件、2 个 Mock 数据文件、路由配置、i18n

---

## 1. 执行摘要

| 指标 | 结果 |
|------|------|
| **总分** | **3.05 / 5.0** |
| **评定** | 🟡 **修复后可发布**（3.0-3.9 区间） |
| **路由一致性** | ❌ 2 处路径不一致（P02/P03 singular vs plural） |
| **用户流程完整性** | ⚠️ 维保工单列表缺少"新建工单"入口 |
| **P1 问题** | **4 项** |
| **P2 问题** | **21 项** |
| **已实现页面** | 11/17（6 个 MVP+ 页面按计划未实现） |
| **主要优势** | TypeScript 类型完备、组件拆分合理、懒加载到位、Mock 数据充分、user story 可追溯 |
| **主要不足** | 路由路径不一致导致导航断裂、大量 i18n 缺失、主题色硬编码、无障碍属性缺位 |

---

## 2. 维度评分表

| # | 维度 | 权重 | 评分 | 加权分 | 说明 |
|---|------|------|------|--------|------|
| D1 | 视觉保真度与设计一致性 | 20% | 3.0 | 0.60 | 硬编码 #1890ff 未跟随主题色 #22A06B；布局/组件模式基本一致 |
| D2 | 功能正确性 | 25% | 2.8 | 0.70 | 2处路由404 + 1处数据绑定错误 + 1处关键入口缺失 |
| D3 | 无障碍性 | 20% | 2.5 | 0.50 | Ant Design 基线存在；缺 ARIA labels / aria-live / 键盘交互 |
| D4 | 代码质量与可维护性 | 15% | 3.8 | 0.57 | 类型完备、组件清晰、常量集中、轻微重复 |
| D5 | 性能 | 10% | 3.5 | 0.35 | 懒加载+代码分割、useMemo/useCallback 到位；vendor chunk 偏大 |
| D6 | 用户体验与交互设计 | 10% | 3.3 | 0.33 | 监控看板体验好、紧急卡片设计佳；部分导航入口缺失 |
| | **总计** | **100%** | | **3.05** | |

**评定基准：**
- ≥ 4.0 可发布
- 3.0 – 3.9 修复后可发布
- < 3.0 需重做

---

## 3. 路由一致性专项检查

### 3.1 路由定义表 (router.tsx)

| # | 路由路径 | 页面组件 | 类型 |
|---|---------|---------|------|
| R1 | `/operations/device-ledger` (index) | FacilityMonitoringDashboard | index |
| R2 | `/operations/device-ledger/monitoring` | FacilityMonitoringDashboard | static |
| R3 | `/operations/device-ledger/monitoring/tank` | TankMonitoring | static |
| R4 | `/operations/device-ledger/monitoring/dispenser` | DispenserStatusBoard | static |
| R5 | `/operations/device-ledger/equipment` (index) | EquipmentList | index |
| R6 | `/operations/device-ledger/equipment/create` | EquipmentForm | static |
| R7 | `/operations/device-ledger/equipment/:id` | EquipmentDetail | dynamic |
| R8 | `/operations/device-ledger/equipment/:id/edit` | EquipmentForm | dynamic |
| R9 | `/operations/device-ledger/maintenance` (index) | MaintenanceOrderList | index |
| R10 | `/operations/device-ledger/maintenance/create` | MaintenanceOrderForm | static |
| R11 | `/operations/device-ledger/maintenance/:id` | MaintenanceOrderDetail | dynamic |
| R12 | `/operations/device-ledger/connectivity` | DeviceConnectivity | static |

### 3.2 Navigate() 调用验证

| # | 来源文件 | navigate 目标 | 匹配路由 | 状态 |
|---|---------|---------------|---------|------|
| N1 | FacilityMonitoringDashboard | `/operations/device-ledger/monitoring/tanks` | **无匹配**（R3 是 `/tank`） | ❌ **P1** |
| N2 | FacilityMonitoringDashboard | `/operations/device-ledger/monitoring/dispensers` | **无匹配**（R4 是 `/dispenser`） | ❌ **P1** |
| N3 | FacilityMonitoringDashboard | `/operations/device-ledger/equipment/create` | R6 | ✅ |
| N4 | TankMonitoring | `/operations/device-ledger/monitoring` | R2 | ✅ |
| N5 | DispenserStatusBoard | `/operations/device-ledger/monitoring` | R2 | ✅ |
| N6 | DispenserStatusBoard | `/operations/device-ledger/equipment/${id}` | R7 | ✅ |
| N7 | EquipmentList | `/operations/device-ledger/equipment/create` | R6 | ✅ |
| N8 | EquipmentList | `/operations/device-ledger/equipment/${id}` | R7 | ✅ |
| N9 | EquipmentList | `/operations/device-ledger/equipment/${id}/edit` | R8 | ✅ |
| N10 | EquipmentList | `/operations/device-ledger/maintenance/create?deviceId=...` | R10 | ✅ |
| N11 | EquipmentDetail | `/operations/device-ledger/maintenance/${id}` | R11 | ✅ |
| N12 | EquipmentDetail | `/operations/device-ledger/maintenance/create?deviceId=...` | R10 | ✅ |
| N13 | EquipmentDetail | `/operations/device-ledger/equipment/${id}/edit` | R8 | ✅ |
| N14 | EquipmentDetail | `/operations/device-ledger/equipment` | R5 | ✅ |
| N15 | MaintenanceOrderList | `/operations/device-ledger/maintenance/${id}` | R11 | ✅ |
| N16 | MaintenanceOrderForm | `/operations/device-ledger/maintenance` | R9 | ✅ |
| N17 | MaintenanceOrderDetail | `/operations/device-ledger/equipment/${id}` | R7 | ✅ |
| N18 | MaintenanceOrderDetail | `/operations/device-ledger/maintenance` | R9 | ✅ |

**Result: 16/18 通过, 2 处路由断裂 ❌**

### 3.3 Route vs. UI Schema 路径偏差

| UI Schema 路由 | 实际路由（router.tsx） | 偏差 | 影响 |
|---------------|---------------------|------|------|
| `/monitoring/tanks` (P02) | `/monitoring/tank` | 复数 → 单数 | **P1**: navigate 用复数，实际路由用单数，导致 404 |
| `/monitoring/dispensers` (P03) | `/monitoring/dispenser` | 复数 → 单数 | **P1**: navigate 用复数，实际路由用单数，导致 404 |
| P04-P07 | 未实现 | MVP+ 跳过 | ✅ 符合计划 |
| P16 | 未实现 | MVP+ 跳过 | ✅ 符合计划 |

### 3.4 Menu ↔ Route 一致性 (AppLayout.tsx)

| 菜单项 | Menu Key | 匹配路由 | 状态 |
|--------|---------|---------|------|
| 设施监控 | `/operations/device-ledger` | R1 (index) | ⚠️ 与父菜单同 key |
| 设备台账 | `/operations/device-ledger/equipment` | R5 | ✅ |
| 维保工单 | `/operations/device-ledger/maintenance` | R9 | ✅ |
| 设备连接 | `/operations/device-ledger/connectivity` | R12 | ✅ |

> ⚠️ 父菜单"设备设施"与子菜单"设施监控"使用相同 key `/operations/device-ledger`，可能导致 Ant Design Menu 选中状态异常。

---

## 4. 用户流程完整性检查

### 4.1 端到端流程

| 流程 | 路径 | 状态 |
|------|------|------|
| 站长查看设施概况 | P01(看板) → P02(储罐) / P03(加气机) | ❌ 导航链接 404 |
| 录入新设备 | P08(列表) → P09(表单) → 保存 → P08 | ✅ |
| 查看设备详情 | P08(列表) → P10(详情) → 编辑 → P11(表单) | ✅ |
| 设备关联创建工单 | P10(详情) → P13(工单表单) 预填设备 | ✅ |
| 故障快速报修 | P01/P03/P12 → P15(Drawer) → 提交 | ✅ |
| 从工单列表创建计划工单 | P12(列表) → ❌ 无"新建工单"按钮 | ❌ **P1** |
| 工单状态流转 | P14(详情) → 状态操作按钮 | ✅ |
| 查看设备连接 | P17(连接页) → 查看表格 | ✅ |

### 4.2 前置条件与上下文

| 条件 | 页面 | 状态 |
|------|------|------|
| 当前站点上下文 | AppLayout → 设备管理页面显示站点选择器 | ✅ |
| 当前用户身份 | AppLayout Header 显示用户名 + 角色 | ✅ |
| 设备数据依赖 | Mock 提供 17 台设备，覆盖 7 种类型 | ✅ |
| 工单数据依赖 | Mock 提供 7 张工单，覆盖 5 种状态 | ✅ |

### 4.3 默认视图合理性

- 模块默认页面为 P01 设施监控看板 → ✅ 优先展示"当前状态概况"
- 设备台账默认按故障优先排序 → ✅ 合理
- 工单列表默认按紧急程度排序 → ✅ 合理

---

## 5. 问题清单

### 5.1 P1 问题（必须修复）

| # | 维度 | 问题描述 | 位置 | 影响 |
|---|------|---------|------|------|
| P1-01 | D2 功能 | **路由路径不一致(P02)**：router.tsx 定义 `monitoring/tank`（单数），但 navigate 调用使用 `monitoring/tanks`（复数），导致点击"查看详情→储罐"跳转 404 | router.tsx:128 + FacilityMonitoringDashboard.tsx | 业务影响：核心监控流程断裂 |
| P1-02 | D2 功能 | **路由路径不一致(P03)**：router.tsx 定义 `monitoring/dispenser`（单数），但 navigate 调用使用 `monitoring/dispensers`（复数），导致点击"查看详情→加气机"跳转 404 | router.tsx:132 + FacilityMonitoringDashboard.tsx | 业务影响：核心监控流程断裂 |
| P1-03 | D2 功能 | **数据绑定字段名错误**：EquipmentDetail 维保记录表格 `dataIndex: 'orderNumber'`，实际类型字段为 `orderNo`，导致工单号列为空 | EquipmentDetail.tsx:83 | 业务影响：设备详情页维保记录不显示工单号 |
| P1-04 | D2 功能 | **缺少"新建工单"按钮**：UI Schema P12 规定维保工单列表页应有 `[+ 新建工单]` 按钮（跳转 P13），实际只有"故障报修"（Drawer）。用户无法从工单列表直接创建计划维保工单 | MaintenanceOrderList.tsx 头部按钮区 | 业务影响：计划工单创建流程断裂 |

### 5.2 P2 问题（建议修复）

| # | 维度 | 问题描述 | 位置 | 严重度 |
|---|------|---------|------|--------|
| P2-01 | D1 视觉 | **主题色硬编码**：多处使用 `#1890ff`（Ant Design 默认蓝）而非项目主题色 `#22A06B`（绿）。涉及统计图标、card 左边框、section 标记 | Dashboard, TankMonitoring, OrderList 等 | 重要 |
| P2-02 | D1 视觉 | **section 标记硬编码样式**：`borderLeft: '3px solid #1890ff'` 多处重复，应改用 theme token | FacilityMonitoringDashboard, TankMonitoring | 轻微 |
| P2-03 | D2 功能 | **P12 筛选区域不完整**：UI Schema 规定 5 个筛选字段（关键词/工单类型/设备/负责人/时间范围），实际仅实现 2 个（关键词/紧急程度） | MaintenanceOrderList.tsx | 重要 |
| P2-04 | D2 功能 | **P12 操作列不完整**：UI Schema 规定 [查看][编辑] 两个操作，实际仅实现 [查看] | MaintenanceOrderList.tsx columns | 轻微 |
| P2-05 | D2 功能 | **P12 设备列缺少链接**：UI Schema 规定设备名称列为链接至 P10，实际仅显示文本 | MaintenanceOrderList.tsx columns | 轻微 |
| P2-06 | D2 功能 | **P12 统计缺少"已关闭"**：Schema 规定 5 个状态统计，实际仅展示 4 个（缺"已关闭"） | MaintenanceOrderList.tsx 统计卡片 | 备注 |
| P2-07 | D2 功能 | **FaultReportDrawer X关闭按钮未触发脏检查**：表单已修改时点击 Drawer 右上角 X 按钮直接关闭，不弹出确认。仅"取消"按钮有 Popconfirm | FaultReportDrawer.tsx handleClose | 轻微 |
| P2-08 | D2 功能 | **Menu key 冲突**：父菜单"设备设施"与子菜单"设施监控"共用 key `/operations/device-ledger`，Ant Design Menu 选中高亮可能异常 | AppLayout.tsx menuItems | 轻微 |
| P2-09 | D3 无障碍 | **可点击卡片缺少 ARIA 支持**：P01/P03 中多个 Card 使用 onClick 但无 `role="button"` / `tabIndex` / `onKeyDown` | FacilityMonitoringDashboard, DispenserStatusBoard | 重要 |
| P2-10 | D3 无障碍 | **自动刷新缺少 aria-live**：P01 监控看板 15s 自动刷新数据，但无 `aria-live` 区域通知屏幕阅读器 | FacilityMonitoringDashboard | 重要 |
| P2-11 | D3 无障碍 | **颜色作为唯一信息载体**：储罐液位条、信号强度条仅靠颜色区分正常/警告/危险，对色盲用户不友好 | TankMonitoring, DeviceConnectivity | 重要 |
| P2-12 | D3 无障碍 | **装饰性图标缺少 aria-hidden**：DeviceTypeTag emoji 图标未标记 `aria-hidden="true"` | DeviceTypeTag.tsx | 轻微 |
| P2-13 | D6 UX | **i18n 覆盖不足**：约 80+ 处中文字符串直接硬编码，未使用 `t()` 函数。涉及表单标签、Card 标题、面包屑、按钮文本、空状态提示、验证消息 | 全部 11 个页面 + AppLayout 面包屑 | 重要 |
| P2-14 | D6 UX | **面包屑硬编码**：AppLayout 中 device-ledger 面包屑（"新增设备"/"编辑设备"/"设备详情"/"创建工单"/"工单详情"/"储罐监控"/"加气机状态"）均为硬编码中文，未走 `t()` | AppLayout.tsx getBreadcrumbItems | 轻微 |
| P2-15 | D4 代码 | **OrderStatusSteps 硬编码 locale**：`toLocaleString('zh-CN')` 应跟随 i18n 当前语言 | OrderStatusSteps.tsx | 轻微 |
| P2-16 | D4 代码 | **紧急程度选项重复定义**：MaintenanceOrderForm 和 FaultReportDrawer 各自定义了 urgencyOptions 数组，应提取至 constants | MaintenanceOrderForm.tsx, FaultReportDrawer.tsx | 轻微 |
| P2-17 | D4 代码 | **Mock 员工数据重复**：maintenanceOrders.ts 定义了 mockEmployees，与 mock/employees.ts 功能重叠 | mock/maintenanceOrders.ts | 备注 |
| P2-18 | D4 代码 | **EquipmentForm mode 检测依赖 URL params**：`isEdit = propMode === 'edit' || !!id`，propMode 从未被传入（router 未传 prop），完全依赖 URL 中是否有 :id 参数 | EquipmentForm.tsx | 备注 |
| P2-19 | D5 性能 | **Vendor chunk 过大**：主 chunk 871KB（gzip 285KB），超过 500KB 警告阈值。可配置 manualChunks 拆分 antd/icons | vite.config.ts | 轻微 |
| P2-20 | D4 代码 | **主题色应使用 token**：所有 `#1890ff` / `#52c41a` / `#ff4d4f` / `#faad14` 应通过 `theme.useToken()` 获取，确保主题切换时自动跟随 | 多文件 constants + pages | 重要 |
| P2-21 | D6 UX | **MaintenanceOrderForm assignee 使用 name 而非 ID**：Select value 设为 `e.name` 而非 `e.id`，后续对接 API 时需改为 ID | MaintenanceOrderForm.tsx:190 | 备注 |

---

## 6. 各维度详细评估

### 6.1 视觉保真度与设计一致性 — 3.0/5

**优点：**
- 布局遵循 STANDARDS.md §4 的 侧边栏+顶栏+内容区 结构
- Card-based 布局模式统一，所有列表页/详情页使用一致的 Card 包裹
- 统计卡片设计一致（4列等宽，图标+数字+辅助文本）
- StatusTag 系列组件颜色语义统一（green=正常, orange=警告, red=故障, default=停用）
- 储罐液位条、加气机状态 Badge 视觉区分明确

**问题：**
- 大量使用 `#1890ff`（Ant Design 默认蓝）而非项目定义的主题色 `#22A06B`（绿）[P2-01]
- Section 标记 `borderLeft: '3px solid #1890ff'` 在多个页面硬编码重复 [P2-02]
- 语义色（`#52c41a`, `#ff4d4f`, `#faad14`）直接使用色值而非 theme token [P2-20]
- 部分 Tag 颜色（如 OrderTypeTag 的 `report: red`）与 urgency 的 `urgent: red` 色值重叠，易混淆

### 6.2 功能正确性 — 2.8/5

**优点：**
- 核心 CRUD 流程完整：设备新增/编辑/查看/停用、工单创建/查看/状态流转
- 故障报修 Drawer 从 4 个入口触发（P01 看板/P03 加气机/P12 列表/单独打开）
- 表单验证规则到位：必填、最小长度、设备类型联动字段
- "保存并创建下一条"正确保留 deviceType/manufacturer/stationId/maintenanceCycle
- 工单详情状态流转按钮按当前状态动态切换，含 Popconfirm 确认
- 空状态处理充分（设备不存在/工单不存在/无维保记录时）
- P01 监控看板 15s 自动刷新 + 模拟数据随机波动

**问题：**
- [P1-01/02] 路由路径 singular vs plural 不一致导致 P02/P03 导航 404
- [P1-03] EquipmentDetail 维保记录 dataIndex 字段名错误
- [P1-04] 工单列表缺少"新建工单"按钮
- [P2-03] 工单列表筛选区域仅实现 2/5 个筛选字段
- [P2-07] FaultReportDrawer X 关闭按钮未触发脏检查

### 6.3 无障碍性 — 2.5/5

**优点：**
- Ant Design 组件提供基础无障碍支持（Table, Form, Modal, Steps 等内建 ARIA）
- 表格列有语义 title
- 按钮均有文本内容
- Alert 使用 `showIcon` 增强视觉+图标双重提示

**问题：**
- [P2-09] 可点击 Card 无 ARIA role/tabIndex/keyboard handler
- [P2-10] 自动刷新数据无 aria-live 通知
- [P2-11] 颜色作为唯一信息载体（储罐液位、信号强度）
- [P2-12] 装饰性 emoji 缺少 aria-hidden
- 无 skip navigation 链接
- 无 focus management（页面切换后未管理焦点）

### 6.4 代码质量与可维护性 — 3.8/5

**优点：**
- TypeScript 类型定义全面（20+ types），覆盖所有实体和表单数据
- 常量集中管理（8 组 CONFIG + 辅助函数），支持双语 label
- 6 个共享 Tag 组件遵循统一模式，可复用
- 所有页面懒加载，路由定义结构清晰
- userStoryMapping 提供 28 条映射，支持需求追溯
- Mock 数据: 17 台设备 + 7 张工单 + helper functions，数据结构与类型一致
- Form 组件正确使用 useForm + validateFields + setFieldsValue 模式

**问题：**
- [P2-15] OrderStatusSteps 硬编码 locale
- [P2-16] urgencyOptions 在两个文件重复定义
- [P2-17] mockEmployees 与 mock/employees.ts 功能重叠
- [P2-18] EquipmentForm mode 检测间接依赖 URL params

### 6.5 性能 — 3.5/5

**优点：**
- 所有 11 个页面使用 `React.lazy()` + `Suspense` 代码分割
- `useMemo` 用于列表过滤/排序计算
- `useCallback` 用于刷新函数避免不必要重渲染
- 自动刷新 `setInterval` 正确在 `useEffect` cleanup 中清除
- Mock 数据同步访问，无瀑布请求

**问题：**
- [P2-19] Vendor chunk 871KB，超过 500KB 警告阈值
- 部分内联函数在 render 中创建（如 `onClick={() => navigate(...)`），可优化但影响极小
- 未使用 `React.memo` 包装列表项子组件

### 6.6 用户体验与交互设计 — 3.3/5

**优点：**
- 监控看板作为默认入口，提供状态概览 + 待处理事项 → 符合 UX 设计"概况优先"原则
- 故障卡片在 P03 加气机看板中置顶排序，配合红色边框高亮 + "快速报修"按钮
- 工单列表紧急行高亮（`backgroundColor: '#fff1f0'`）
- 维保到期提醒 Alert + 直接创建工单按钮
- 设备表单"保存并创建下一条"减少批量录入操作步骤
- MaintenanceOrderForm 设备选择后展示设备预览卡片

**问题：**
- [P1-04] 无法从工单列表创建计划工单（只有故障报修入口）
- [P2-13] i18n 覆盖率低，切换英文后大量文本仍为中文
- [P2-14] 面包屑硬编码
- 无确认成功后的动画/过渡反馈
- 无键盘快捷键支持

---

## 7. P1 优先级二次分类

按照 AGENT-PLAN Step 12，对 P1 问题进行影响分类和代价评估：

| # | 问题 | 影响分类 | 修复代价 | 建议 |
|---|------|---------|---------|------|
| P1-01 | 路由路径 P02 `tank` → `tanks` | **业务影响** — 核心监控流程断裂 | **低** — 改 router.tsx 1 行，`tank` → `tanks` | 立即修复 |
| P1-02 | 路由路径 P03 `dispenser` → `dispensers` | **业务影响** — 核心监控流程断裂 | **低** — 改 router.tsx 1 行，`dispenser` → `dispensers` | 立即修复 |
| P1-03 | EquipmentDetail `orderNumber` → `orderNo` | **业务影响** — 设备详情维保信息不可读 | **低** — 改 EquipmentDetail.tsx 1 行 | 立即修复 |
| P1-04 | MaintenanceOrderList 缺少"新建工单"按钮 | **业务影响** — 计划工单创建流程断裂 | **低** — 添加 1 个 Button + navigate，约 5 行代码 | 立即修复 |

**结论：全部 4 个 P1 均为"业务影响 + 低代价"，建议全部立即修复。**

### P2 二次分类摘要

| 分类 | 数量 | 代表问题 | 建议 |
|------|------|---------|------|
| 体验影响 + 低代价 | 8 | P2-02, P2-04, P2-05, P2-06, P2-12, P2-14, P2-15, P2-17 | 批量修复 |
| 体验影响 + 中代价 | 8 | P2-01, P2-03, P2-09, P2-10, P2-11, P2-13, P2-16, P2-20 | 用户确认后修复 |
| 体验影响 + 低优先 | 5 | P2-07, P2-08, P2-18, P2-19, P2-21 | 可延期 |

---

## 8. 修复建议

### 第一批：P1 立即修复（预计 15 分钟）

1. **P1-01 + P1-02**：修改 router.tsx 中 `monitoring/tank` → `monitoring/tanks`，`monitoring/dispenser` → `monitoring/dispensers`
2. **P1-03**：修改 EquipmentDetail.tsx 中 `dataIndex: 'orderNumber'` → `'orderNo'`
3. **P1-04**：在 MaintenanceOrderList.tsx 头部按钮区添加 `[+ 新建工单]` Button，onClick navigate 至 `/operations/device-ledger/maintenance/create`

### 第二批：高价值 P2 修复（预计 30 分钟）

- P2-01 + P2-02 + P2-20：统一使用 theme token 替换硬编码色值
- P2-03：补全工单列表筛选字段（工单类型/设备/负责人/时间范围）
- P2-08：修复 Menu key 冲突（子菜单"设施监控"改用 `/operations/device-ledger/monitoring`）

### 第三批：i18n + 无障碍（预计 45 分钟）

- P2-13 + P2-14：为所有硬编码中文字符串添加 i18n key
- P2-09 + P2-10 + P2-11 + P2-12：添加 ARIA 属性、aria-live 区域、非颜色状态指示器

---

## 9. 补充说明

### 已实现 vs 未实现页面（UI Schema 17 页）

| 状态 | 页面 | 说明 |
|------|------|------|
| ✅ 已实现 | P01, P02, P03, P08, P09, P10, P11, P12, P13, P14, P15, P17 | 12 个（含 P09/P11 合并为 1 个组件） |
| ⏭ MVP+ 跳过 | P04, P05, P06, P07, P16 | 5 个（标记为 MVP+ 的后续版本页面） |

### 命名一致性检查

| 检查项 | 状态 |
|--------|------|
| 类型名称 vs 常量 key 一致 | ✅ |
| Mock 数据字段名 vs 类型定义 | ✅ |
| 组件文件名 PascalCase | ✅ |
| 目录命名 kebab-case | ✅ |
| i18n key 前缀 `deviceLedger.*` | ✅ |

---

*评估完成时间：2026-02-18*  
*评估者：UI 评审 Agent*  
*下一步：用户确认 P1 分类 → 执行修复 → 二轮评估*
