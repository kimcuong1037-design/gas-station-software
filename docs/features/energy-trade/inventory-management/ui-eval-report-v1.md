# 库存管理 — UI 评估报告 v1

**模块：** 能源交易 > 库存管理 (2.3)
**评估日期：** 2026-03-01
**评估范围：** 6 页面 + 5 组件（前端代码 vs ui-schema.md + ux-design.md）
**基准模块：** 2.1 价格管理、2.2 订单交易

---

## 评分总览

| 维度 | 权重 | 得分 | 加权 |
|------|------|------|------|
| 1. 视觉保真度与设计一致性 | 20% | 3.5 | 0.70 |
| 2. 功能正确性 | 25% | 4.0 | 1.00 |
| 3. 无障碍性 | 20% | 2.5 | 0.50 |
| 4. 代码质量与可维护性 | 15% | 4.0 | 0.60 |
| 5. 性能 | 10% | 4.0 | 0.40 |
| 6. 用户体验与交互设计 | 10% | 3.5 | 0.35 |
| **总分** | **100%** | — | **3.55** |

**评级：修复后重新发布（3.0 – 3.9）**

---

## 维度 1：视觉保真度与设计一致性（3.5 / 5）

### 1.1 跨模块一致性检查

| 检查项 | 结果 | 详情 |
|--------|------|------|
| 侧边栏菜单层级深度 | ✅ 一致 | 3 层模式：能源交易→库存管理→6 叶子页面，与 2.1/2.2 一致 |
| 面包屑层级命名模式 | ✅ 一致 | AppLayout 已配置 6 个页面的面包屑，中间层使用"库存管理" |
| Table scroll.x | ✅ 一致 | 6 个 Table 均配置 scroll.x，值与 ui-schema 完全匹配 |
| Badge/Tag 样式 | ✅ 一致 | 预警管理菜单 Badge 使用 Ant Design Badge，与预期一致 |
| 页面 Header 区域布局 | ⚠️ 不一致 | 详见 F-1.1 |

### 发现

**F-1.1 [重要] Header marginBottom 不一致**

P01 InventoryOverview 使用 `marginBottom: 24`，但 P02~P06 使用 `marginBottom: 16`。基准模块 2.2 OrderList 使用 16px，2.1 PriceOverview 使用 24px。模块内部应统一，建议统一为 16px（与 P02-P06 及 2.2 一致）。

- 位置：`InventoryOverview.tsx:43` (`marginBottom: 24`)
- 修复建议：改为 `marginBottom: 16`

**F-1.2 [轻微] P05 TankComparison Header 缺少 flex space-between 布局**

P05 页面 Header 使用纯 `<div style={{ marginBottom: 16 }}>` 包裹 Title + RequirementTag，未使用与 P02/P03/P04 一致的 flex + space-between 模式。虽然该页面无操作按钮不需要右侧空间，但 P06 同样无操作按钮却使用了相同的简单包裹，二者之间是一致的。不过与有按钮的页面视觉风格略有差异。

- 位置：`TankComparison.tsx:315-324`、`AlertManagement.tsx:273-283`
- 修复建议：无需修改（无操作按钮时无需 space-between），但记录为备注

**F-1.3 [轻微] 硬编码颜色值散布全模块**

全模块使用 `#ff4d4f`（红）、`#52c41a`（绿）、`#faad14`（橙）、`#1890ff`（蓝）、`#722ed1`（紫）、`#999`（灰）等硬编码色值。虽然与 Ant Design 语义色一致，但未抽取为常量。与 2.1/2.2 模块行为相同（均硬编码），跨模块一致。

- 修复建议：后续迭代可统一抽取为 design tokens，当前不影响一致性

---

## 维度 2：功能正确性（4.0 / 5）

### 2.1 路由专项检查

| 检查项 | 结果 |
|--------|------|
| 路由定义一致性：router.tsx 6 条路由与 ui-schema 页面清单完全一致 | ✅ |
| index 重定向：`<Navigate to="/energy-trade/inventory/overview" replace />` | ✅ |
| 导航链接有效性：OutboundRecords `navigate('/energy-trade/order')` 跳转订单管理 | ✅ |
| 无硬编码路径错误 | ✅ |
| 404 处理：全局已配置 | ✅ |

### 2.2 用户流程完整性检查

| 检查项 | 结果 |
|--------|------|
| 端到端流程（入库创建→审核→入账） | ✅ |
| 端到端流程（损耗登记→审批） | ✅ |
| 默认视图合理性（index→overview 概况页） | ✅ |
| 前置条件可达（selectedStationId via useOutletContext） | ✅ |
| 跨模块数据入口（出库→订单跳转） | ✅ |

### 2.3 表格与筛选

| 页面 | 列数匹配 | scroll.x 匹配 | 分页配置 | 筛选功能 |
|------|---------|--------------|---------|---------|
| P02 InboundManagement | ✅ 12列 | ✅ 1480 | ✅ | ✅ 4个筛选项 |
| P03 OutboundRecords | ✅ 11列 | ✅ 1430 | ✅ | ✅ 4个筛选项 |
| P04 TransactionLedger | ✅ 8列 | ✅ 1010 | ✅ | ✅ 3个筛选项(含多选) |
| P05 History Tab | ✅ 7列 | ✅ 830 | ✅ | ✅ 2个筛选项 |
| P06 Active Alerts | ✅ 8列 | ✅ 950 | ⚠️ | — |
| P06 History Alerts | ✅ 7列 | ✅ 820 | ✅ | — |
| P06 Config | ✅ 7列 | ✅ 840 | ✅ (pagination=false) | — |

### 发现

**F-2.1 [重要] P06 活跃预警表格缺少分页配置**

ui-schema 未为活跃预警指定分页（预警通常数量少），代码中 `pagination={false}`。但如果活跃预警数量增多，可能需要分页。当前实现合理（活跃预警不分页，历史预警分页），与 ui-schema 的设计意图匹配。

- 位置：`AlertManagement.tsx:236`
- 结论：合理设计，降级为备注

**F-2.2 [轻微] P04 TransactionLedger 关联单号未实现点击跳转**

ui-schema §P04 定义 `relatedNo` 列应支持点击跳转："入库→打开 D03 / 销售→订单详情"。当前代码中 `relatedNo` 列仅为纯文本显示，未实现任何跳转逻辑。

- 位置：`TransactionLedger.tsx:94-97`
- 修复建议：为 relatedNo 添加 render 函数，根据 transactionType 添加跳转逻辑

**F-2.3 [轻微] P01 InventoryOverview 缺少空状态处理**

ui-schema §P01 定义了空状态："暂无库存数据，请先完成入库操作" + [新增入库] 按钮。当前代码未实现空状态处理——如果 cards 为空数组，页面将显示空白区域。

- 位置：`InventoryOverview.tsx:51-95`
- 修复建议：添加 cards 为空时的 Empty 组件 + 按钮

**F-2.4 [轻微] P05 TankComparison 实时比对缺少空状态处理**

ui-schema 定义空状态："暂无储罐数据，请在设备设施中配置储罐" + 链接跳转。当前代码未实现。

- 位置：`TankComparison.tsx:53-241`
- 修复建议：添加 tanks 为空时的 Empty 组件

**F-2.5 [备注] D01 CreateInboundDrawer 入库时间未设置默认值**

ui-schema §D01 指定入库时间"默认当前时间"，当前 DatePicker 未设置 defaultValue 或 initialValues。

- 位置：`CreateInboundDrawer.tsx:106-108`
- 修复建议：在 Form initialValues 中设置 `inboundTime: dayjs()`

---

## 维度 3：无障碍性（2.5 / 5）

### 发现

**F-3.1 [重要] 全模块缺少 ARIA 标签**

所有表格、表单、抽屉、弹窗均未添加 aria-label 或 aria-describedby。Ant Design 组件自身提供了部分基础无障碍支持（如 Button、Input 等），但自定义交互元素（如使用 `<a>` 标签的操作按钮、Popconfirm 触发器）缺少语义化标注。

- 影响范围：全部 6 页面 + 5 组件
- 修复建议：为关键交互元素添加 aria-label，如操作列的 `<a>` 标签

**F-3.2 [重要] 颜色作为唯一信息载体**

多处仅通过颜色传达信息，无辅助文字或图标：
- P02 入库偏差列：正负值仅靠红绿色区分（`InboundManagement.tsx:101`）
- P04 数量列：正负值仅靠红绿色区分（`TransactionLedger.tsx:70`）
- P05 偏差值：仅靠颜色区分盈亏（`TankComparison.tsx:104-105`）

但注意：这些值本身有 +/- 符号辅助，部分缓解了纯色依赖问题。

- 修复建议：偏差值已有 +/- 前缀可缓解。对于关键偏差可增加 ↑/↓ 图标辅助

**F-3.3 [轻微] 操作列使用 `<a>` 标签但无 href**

P02/P03 操作列中使用 `<a>` 标签触发 onClick，无 `href`、`role="button"` 或键盘事件处理。

- 位置：`InboundManagement.tsx:75, 135-137`、`OutboundRecords.tsx:93, 155`
- 修复建议：使用 `<Button type="link">` 替代 `<a>` 标签

**F-3.4 [备注] 缺少跳过导航链接（Skip to main content）**

这是全局问题（AppLayout 层面），非本模块独有。

---

## 维度 4：代码质量与可维护性（4.0 / 5）

### 发现

**F-4.1 [轻微] LayoutContext 接口重复定义**

每个页面文件顶部都重复定义了 `interface LayoutContext { selectedStationId: string; }`（6 处重复）。虽然这是项目级约定（AppLayout 不导出该接口），但增加了维护成本。

- 位置：6 个页面文件的顶部
- 修复建议：后续迭代可在共享 types 中定义并导出。当前遵循项目约定，降级为备注

**F-4.2 [轻微] `void selectedStationId` 模式**

CreateInboundDrawer 和 LossOutboundDrawer 中使用 `void selectedStationId;` 抑制 unused variable 警告。这是 mock 阶段的临时做法，接入真实 API 后自然消失。

- 位置：`CreateInboundDrawer.tsx:31`、`LossOutboundDrawer.tsx:31`
- 修复建议：当前阶段可接受，接入 API 后移除

**F-4.3 [备注] TypeScript 类型使用规范**

- 全部组件正确使用 `React.FC<Props>` 泛型
- 表格列定义使用 `ColumnsType<T>` 泛型
- 表单使用 `Form.useForm<FormType>()` 泛型
- useMemo 依赖数组完整

总体代码质量良好，组件拆分合理（页面/组件分离），命名一致，TypeScript 使用规范。

---

## 维度 5：性能（4.0 / 5）

### 发现

**F-5.1 [备注] 路由懒加载已配置**

6 个页面均使用 `lazy()` + `Suspense` 加载，与项目模式一致。

**F-5.2 [备注] 数据过滤使用 useMemo**

所有列表页的筛选逻辑均通过 `useMemo` 缓存，避免不必要的重计算。依赖数组正确。

**F-5.3 [轻微] TankComparison 组件体积较大**

`TankComparison.tsx` 有 344 行，包含实时比对和历史比对两个子视图。可考虑拆分为子组件，但当前不影响运行性能。

- 修复建议：后续迭代可拆分 RealtimeTab / HistoryTab 为独立组件

---

## 维度 6：用户体验与交互设计（3.5 / 5）

### 发现

**F-6.1 [重要] ECharts 图表未实际渲染**

P01 库存趋势图、P05 偏差趋势迷你图、P05 Sparkline 均为占位符 `<div>` 显示文字"ECharts"。虽然这是 mock 阶段的已知限制，但图表是核心信息展示元素。

- 位置：`InventoryOverview.tsx:107-120`、`TankComparison.tsx:174-178`、`TankComparison.tsx:230-233`
- 修复建议：当前 mock 阶段可接受。降级为备注（后续引入 ECharts 时实现）

**F-6.2 [轻微] D01 CreateInboundDrawer Tooltip 缺失**

ui-schema §P01 定义罐容比进度条应有 Tooltip "罐容比 = 实际罐存 ÷ 储罐额定容量 × 100%"。P05 TankComparison 正确实现了理论库存和偏差率的 Tooltip（含 InfoCircleOutlined），但 P01 Overview 的进度条缺少此 Tooltip。

- 位置：`InventoryOverview.tsx:65-70`
- 修复建议：为 Progress 添加 Tooltip

**F-6.3 [轻微] 表单提交后反馈一致性**

D01/D02 提交后正确显示 message.success 并关闭 Drawer。AuditModal 驳回时同时调用 `onConfirm` 回调和自身的 `message.success`，父组件也会再显示 `message.warning`，可能导致双重提示。

- 位置：`AuditModal.tsx:24` + `InboundManagement.tsx:63`
- 修复建议：移除 AuditModal 中的 `message.success`，由父组件统一处理反馈

---

## 问题汇总

### P1（严重/重要）— 必须修复

| ID | 维度 | 严重程度 | 问题 | 代价 |
|----|------|---------|------|------|
| F-1.1 | 视觉 | 重要 | Header marginBottom 不一致 (P01: 24 vs 其他: 16) | 低 |
| F-2.2 | 功能 | 重要→轻微 | P04 关联单号未实现点击跳转 | 中 |
| F-3.1 | 无障碍 | 重要 | 全模块缺少 ARIA 标签 | 中 |
| F-3.2 | 无障碍 | 重要 | 颜色作为唯一信息载体（但有 +/- 缓解） | 低 |
| F-3.3 | 无障碍 | 重要→轻微 | 操作列使用 `<a>` 无 href/role | 低 |
| F-6.3 | UX | 重要 | AuditModal 双重 message 提示 | 低 |

### P2（轻微/备注）— 建议修复

| ID | 维度 | 严重程度 | 问题 | 代价 |
|----|------|---------|------|------|
| F-1.2 | 视觉 | 备注 | P05/P06 Header 无 flex space-between | — |
| F-1.3 | 视觉 | 备注 | 硬编码颜色值（跨模块一致） | — |
| F-2.3 | 功能 | 轻微 | P01 Overview 缺少空状态 | 低 |
| F-2.4 | 功能 | 轻微 | P05 实时比对缺少空状态 | 低 |
| F-2.5 | 功能 | 备注 | D01 入库时间未设默认值 | 低 |
| F-3.4 | 无障碍 | 备注 | 缺少 Skip to content（全局问题） | — |
| F-4.1 | 代码 | 备注 | LayoutContext 重复定义（项目约定） | — |
| F-4.2 | 代码 | 备注 | void selectedStationId（mock 阶段） | — |
| F-5.3 | 性能 | 备注 | TankComparison 可拆分子组件 | — |
| F-6.1 | UX | 备注 | ECharts 图表占位符（mock 阶段已知） | — |
| F-6.2 | UX | 轻微 | P01 罐容比 Tooltip 缺失 | 低 |

---

## P1 优先级二次分类

### 业务影响（影响业务逻辑或用户旅程）

| ID | 问题 | 代价 | 建议 |
|----|------|------|------|
| F-2.2 | P04 关联单号未实现跳转 | 中 | 降级为 P2 — 流水是只读查看页，跳转为便利功能非核心 |

### 体验影响（样式/无障碍/反馈）

| ID | 问题 | 代价 | 建议 |
|----|------|------|------|
| F-1.1 | Header marginBottom 不一致 | 低 | 立即修复（改 1 行） |
| F-3.1 | 缺少 ARIA 标签 | 中 | 降级为 P2 — 批量修复，当前项目阶段无障碍非首要 |
| F-3.2 | 颜色依赖（有 +/- 缓解） | 低 | 降级为 P2 — 已有 +/- 符号缓解 |
| F-3.3 | `<a>` 无 href/role | 低 | 降级为 P2 — 体验影响 |
| F-6.3 | AuditModal 双重 message | 低 | 立即修复（删 1 行） |

### 建议保留为 P1 的修复项

仅保留低代价且影响跨模块一致性的问题：
1. **F-1.1** — marginBottom 改 24→16（1 行）
2. **F-6.3** — AuditModal 移除多余 message.success（1 行）

---

*评估人：AI Agent*
*下一步：用户确认 P1/P2 分类 → 执行修复 → 重新评估*
