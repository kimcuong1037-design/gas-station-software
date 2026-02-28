# UI 评估报告 — Module 2.2 订单与交易 (v1)

**模块：** 能源交易 / 订单与交易 (order-transaction)
**评估日期：** 2026-02-28
**评估版本：** v1
**基线对比模块：** 2.1 价格管理 (price-management, 3.94/5.0)
**构建验证：** ✅ `tsc --noEmit` 零错误

---

## 总分：3.51 / 5.0 — 🟡 修复后可发布

| 维度 | 权重 | 分数 | 加权 |
|------|------|------|------|
| 视觉保真度与设计一致性 | 20% | 3.8 | 0.76 |
| 功能正确性 | 25% | 3.5 | 0.875 |
| 无障碍 | 20% | 2.5 | 0.50 |
| 代码质量与可维护性 | 15% | 3.8 | 0.57 |
| 性能 | 10% | 4.0 | 0.40 |
| UX 交互设计 | 10% | 4.0 | 0.40 |
| **合计** | **100%** | | **3.51** |

---

## 评审范围

| 类型 | 组件 | 文件数 |
|------|------|--------|
| 页面 | OrderList, ExceptionOrderList, RefundManagement, OrderSettings | 4 |
| 抽屉 | OrderDetailDrawer, CreateOrderDrawer, SupplementDrawer | 3 |
| 弹窗 | PaymentModal, RefundModal, ReceiptPreviewModal | 3 |
| 支撑 | types.ts, constants.ts, userStoryMapping.ts, pages/index.ts | 4 |
| Mock | mock/orderTransaction.ts | 1 |
| 集成 | router.tsx, AppLayout.tsx, RequirementTag.tsx, i18n ×2, mock/index.ts | 6 |

---

## P1 问题（2 项）

### P1-1: RefundManagement 未按站点过滤（业务影响）

**文件：** `pages/RefundManagement.tsx`
**现象：** 退款管理页面直接导入全量退款记录，未使用 `useOutletContext<LayoutContext>()` 获取 stationId 进行过滤。切换站点选择器时，退款数据不变。
**对比：** OrderList.tsx (line 34) 和 ExceptionOrderList.tsx (line 23) 均使用 `useOutletContext` 并按 stationId 过滤。
**影响：** 业务影响 — 多站点场景下显示错误数据，与同模块其他页面行为不一致。
**修复方案：**
1. 添加 `const { selectedStationId: stationId } = useOutletContext<LayoutContext>();`
2. `recordList` useMemo 中增加 stationId 过滤（通过 orderId → fuelingOrders 关联）
3. `approvalList` useMemo 同样增加 stationId 过滤
4. 添加 `stationId` 到两个 useMemo 的依赖数组

### P1-2: RefundManagement 驳回弹窗未关联目标记录（体验影响）

**文件：** `pages/RefundManagement.tsx` lines 24, 115
**现象：** 点击审批列表中的"驳回"按钮时，仅设置 `setRejectModalOpen(true)`，未记录当前操作的 RefundRecord。驳回弹窗无法显示"正在驳回 {orderNo} 的退款申请"，`handleReject` 也无法知道驳回的是哪条记录。
**对比：** `handleApprove(record)` 正确接收了 record 参数并在消息中显示 orderNo。
**影响：** 体验影响 — 用户在驳回弹窗中看不到目标订单信息，容易误操作。
**修复方案：**
1. 新增 state: `const [rejectingRecord, setRejectingRecord] = useState<RefundRecord | null>(null);`
2. 按钮 onClick: `() => { setRejectingRecord(record); setRejectModalOpen(true); }`
3. Modal title: `驳回退款申请 — ${rejectingRecord?.orderNo}`
4. handleReject 中使用 rejectingRecord 展示具体消息

---

## P2 问题（16 项）

### P2-1: 硬编码颜色 — Statistic 图标（OrderList）

**文件：** `pages/OrderList.tsx` lines 182-198
**代码：** `<FileTextOutlined style={{ color: '#1890ff' }} />` 等 4 处
**建议：** 使用 Ant Design token 或 constants 中的颜色映射

### P2-2: 硬编码颜色 — 异常统计卡片（ExceptionOrderList）

**文件：** `pages/ExceptionOrderList.tsx` lines 116-119
**代码：** `{ title: '待处理', value: stats.pendingCount, color: '#ff4d4f' }` 等 4 处
**建议：** 从 `HANDLE_STATUS_CONFIG` 中提取颜色

### P2-3: 硬编码颜色 — 审批按钮（RefundManagement）

**文件：** `pages/RefundManagement.tsx` line 113
**代码：** `<Button size="small" style={{ color: '#52c41a', borderColor: '#52c41a' }}>通过</Button>`
**建议：** 使用 `type="primary"` 或 token 变量

### P2-4: 硬编码颜色 — 支付弹窗（PaymentModal）

**文件：** `components/PaymentModal.tsx` 多处
**代码：** `#1677ff`, `#e6f4ff`, `#52c41a`, `#ff4d4f`, `#595959` 等内联样式
**建议：** 提取为 constants 或使用 theme token

### P2-5: i18n 缺失 — 维度切换（OrderList）

**文件：** `pages/OrderList.tsx` lines 205-206
**代码：** `<Radio.Button value="today">当日</Radio.Button>` / `当班`
**建议：** 使用 `t('order.dimension.today')` / `t('order.dimension.shift')`

### P2-6: i18n 缺失 — 分页总数

**文件：** `pages/OrderList.tsx` line 237, ExceptionOrderList line 167, RefundManagement lines 162/169
**代码：** `` showTotal: total => `共 ${total} 条` ``
**建议：** 使用 `t('common.total', { count: total })`

### P2-7: i18n 缺失 — Tab 标签（RefundManagement）

**文件：** `pages/RefundManagement.tsx` lines 135-148
**代码：** `'退款记录'` / `'退款审批'` 硬编码
**建议：** `t('order.refund.records')` / `t('order.refund.approvals')`

### P2-8: i18n 缺失 — 筛选器 placeholder

**文件：** `pages/ExceptionOrderList.tsx` lines 149-157
**代码：** `placeholder="异常类型"` / `placeholder="处理状态"` 硬编码
**建议：** 使用 `t('order.filter.exceptionType')` 等

### P2-9: i18n 缺失 — Steps 流程标签（OrderDetailDrawer）

**文件：** `components/OrderDetailDrawer.tsx` lines 48-52
**代码：** `STEPS_CONFIG = [{ title: '创建' }, { title: '加注完成' }, ...]` 硬编码
**建议：** 使用 `t('order.step.created')` 等

### P2-10: ReceiptPreviewModal STATION_NAME 硬编码

**文件：** `components/ReceiptPreviewModal.tsx` line 14
**代码：** `const STATION_NAME = '北京朝阳加气站';`
**建议：** 从 order 数据中读取 `order.stationName`（已有字段）

### P2-11: LayoutContext 接口重复定义

**文件：** `pages/OrderList.tsx:28`, `pages/ExceptionOrderList.tsx:17`, `pages/OrderSettings.tsx:14`
**现象：** 三个文件各自定义了相同的 `interface LayoutContext { selectedStationId: string; }`
**建议：** 提取到 `types.ts` 或项目共享 types 中统一导入

### P2-12: i18n namespace 不完整

**文件：** `locales/zh-CN/index.ts`, `locales/en-US/index.ts`
**现象：** `order.*` 命名空间仅覆盖 ~23 个 key，缺少 `order.status.*`, `order.payment.*`, `order.exception.*`, `order.refund.*`, `order.field.*` 等子空间
**对比：** price-management 的 `price.*` 命名空间有 10+ 子空间，覆盖完整
**建议：** 对齐 UI Schema §7 定义的 key 列表

### P2-13: 表格空态文案硬编码

**文件：** 多个页面
**代码：** `locale={{ emptyText: '暂无订单记录' }}` / `'暂无异常订单'` / `'暂无退款记录'`
**建议：** 使用 `t('order.empty.orders')` 等

### P2-14: OrderSettings 标签表无 scroll.x

**文件：** `pages/OrderSettings.tsx` line 132
**现象：** 标签管理表格未设置 `scroll={{ x }}`
**评估：** 4 列总宽 580px，小屏幕下可能挤压。低优先级。

### P2-15: 无 ARIA labels / 键盘导航增强

**文件：** 所有组件
**现象：** 未添加自定义 ARIA labels、role 属性、键盘导航提示。依赖 Ant Design 基线无障碍支持。
**评估：** 与 Phase 1 + Module 2.1 一致，全项目统一处理。

### P2-16: message.success 中文硬编码

**文件：** OrderList:86, ExceptionOrderList:49/53, OrderSettings:47/51/63
**代码：** `message.success('订单 ${order.orderNo} 已取消')` 等
**建议：** 使用 `t()` 包裹

---

## 维度详细评分

### 1. 视觉保真度与设计一致性 — 3.8/5.0

**跨模块一致性检查（vs Module 2.1 price-management）：**

| 检查项 | 结果 | 说明 |
|--------|------|------|
| 侧边栏 3 层层级 | ✅ | Domain → 订单管理 → 4 leaf pages |
| 面包屑命名模式 | ✅ | 中间层"订单交易"，叶子层正确 |
| Table scroll.x | ✅ | OrderList 1100, Exception 1000, Refund 1000 |
| Badge/Tag 一致性 | ✅ | 异常订单(红) + 退款审批(橙) 动态 Badge |
| 页面 Header 布局 | ✅ | Title + RequirementTag + Action Buttons 一致 |

**扣分项：**
- 多处硬编码颜色（P2-1~P2-4），未使用 design token
- PaymentModal 大量内联样式，但视觉效果良好

### 2. 功能正确性 — 3.5/5.0

**路由一致性检查：**

| 路由 | UI Schema 定义 | 实现 | 结果 |
|------|---------------|------|------|
| `/energy-trade/order` | P01 OrderList | ✅ lazy-loaded | PASS |
| `/energy-trade/order/exceptions` | P02 ExceptionOrderList | ✅ lazy-loaded | PASS |
| `/energy-trade/order/refunds` | P03 RefundManagement | ✅ lazy-loaded | PASS |
| `/energy-trade/order/settings` | P04 OrderSettings | ✅ lazy-loaded | PASS |

**用户流程完整性检查：**

| 流程 | 步骤 | 结果 |
|------|------|------|
| 订单查看 | 列表 → 点击订单号 → 详情 Drawer | ✅ |
| 手动下单 | 列表 → 创建订单 → 选枪 → 自动填充 → 提交 | ✅ |
| 收银支付 | 列表 → 收银 → 选方式 → 现金/电子 → 确认 → 小票 | ✅ |
| 退款申请 | 列表 → 退款 → 全额/部分 → 提交 | ✅ |
| 退款审批 | 退款管理 → 审批 Tab → 通过/驳回 | ⚠️ 驳回无目标记录 (P1-2) |
| 异常处理 | 异常列表 → 挂起/补单 | ✅ |
| 站点切换 | 切换站点 → 数据刷新 | ⚠️ 退款页不响应 (P1-1) |

**扣分项：** 2 个 P1 问题（退款页站点过滤缺失、驳回弹窗无目标记录）

### 3. 无障碍 — 2.5/5.0

- Ant Design 提供基线 ARIA 支持（表格、按钮、表单、抽屉均有默认 role）
- 无自定义 ARIA labels、skip navigation、焦点管理
- PaymentModal 自定义 `<button>` 有基本 focus 行为但缺 aria-label
- 与 Phase 1 + Module 2.1 水平一致，全项目统一处理

### 4. 代码质量与可维护性 — 3.8/5.0

**正面：**
- TypeScript 类型定义完整（types.ts 161 行，0 个 `any`）
- 清晰的文件组织（types/constants/pages/components/mock）
- `useMemo` 正确使用于过滤逻辑
- `useEffect` 清理模式（PaymentModal countdown timer）
- 表单校验完整（CreateOrderDrawer, SupplementDrawer, RefundModal）
- 无死代码，barrel export 规范

**扣分项：** LayoutContext 重复定义 (P2-11)

### 5. 性能 — 4.0/5.0

- 所有页面 lazy loading（router.tsx）
- 筛选逻辑用 `useMemo` 包裹，依赖数组正确
- PaymentModal countdown timer 有 cleanup
- 无不必要的 re-render

### 6. UX 交互设计 — 4.0/5.0

**亮点：**
- PaymentModal：2×2 支付方式网格，选中态蓝色边框+背景，体验清晰
- 现金支付：实时找零计算
- 电子支付：5 分钟倒计时 + 超时红色警告
- ReceiptPreviewModal：仿真小票样式（monospace + 虚线分隔）
- Popconfirm：所有破坏性操作（取消订单、审批、删除标签）有确认
- ExceptionOrderList：统计卡片可点击筛选

---

## User Story 覆盖率

| 状态 | 数量 | US |
|------|------|----|
| implemented | 15 | US-001~009, US-011~014, US-016~018, US-020 |
| partial | 1 | US-019 (订单标签/备注 — 标签管理有，详情中显示有，但编辑有限) |
| planned | 3 | US-010 (混合支付), US-015 (补单审核), US-021 (导出) |

**MVP 覆盖率：** 13/14 MVP stories implemented = **92.9%**
**总覆盖率：** 16/21 at least partial = **76.2%**

---

## 修复优先级建议

### 必须修复（P1，本轮完成）

| # | 问题 | 修复代价 | 影响 |
|---|------|---------|------|
| P1-1 | RefundManagement 站点过滤 | Low (~15行) | 业务 |
| P1-2 | 驳回弹窗关联记录 | Low (~10行) | 体验 |

### 建议修复（P2-高，本轮可选）

| # | 问题 | 修复代价 |
|---|------|---------|
| P2-10 | ReceiptPreviewModal 站名硬编码 | Low (1行) |
| P2-11 | LayoutContext 重复定义 | Low (4行) |
| P2-12 | i18n namespace 补全 | Medium (~50行) |

### 延迟修复（P2-中/低，全项目统一处理）

| # | 问题 | 说明 |
|---|------|------|
| P2-1~4 | 硬编码颜色 | 全项目 design token 迁移 |
| P2-5~9,13,16 | i18n 硬编码中文 | 全项目 i18n 扫描 |
| P2-15 | ARIA 无障碍 | 全项目统一 a11y 增强 |

---

## 交付 Checklist 验证

| # | 检查项 | 结果 |
|---|--------|------|
| 1 | 文件结构（4 pages + 3 drawers + 3 modals + types/constants/mapping/mock） | ✅ |
| 2 | 路由集成（4 routes + withSuspense + lazy loading） | ✅ |
| 3 | 菜单集成（4 项 + 2 动态 Badge + 面包屑） | ✅ |
| 4 | i18n 覆盖（zh-CN + en-US `order.*` 命名空间） | ⚠️ 部分 |
| 5 | Mock 数据导出（10 exports from orderTransaction） | ✅ |
| 6 | User Story 映射（21 条，15 implemented） | ✅ |
| 7 | useOutletContext 集成（3/4 页面，RefundManagement 缺失） | ⚠️ P1-1 |
| 8 | 跨模块一致性（vs Module 2.1 对比 5/5 PASS） | ✅ |
| 9 | TypeScript 编译 | ✅ 零错误 |

---

## 评估结论

Module 2.2 订单与交易前端 UI 整体质量 **3.51/5.0**，与 Module 2.1 价格管理（3.94）接近但略低。

**强项：**
- 完整的订单生命周期 UI（下单→支付→退款→异常处理）
- PaymentModal 交互设计优秀（现金找零 + 电子支付倒计时）
- 跨模块视觉一致性达标
- 代码结构清晰，TypeScript 类型完整

**待改进：**
- 2 个 P1 问题需立即修复（退款页站点过滤 + 驳回关联）
- i18n 覆盖度不如 Module 2.1
- 硬编码颜色较多（全项目通病）

**建议：** 修复 2 个 P1 后执行 v2 评审，目标 P1=0 + 总分 ≥ 3.6。
