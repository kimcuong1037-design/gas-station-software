# Skill: React 组件开发 (React Component Development)

## 元信息

- **Skill ID:** `react-component-development`
- **所属 Agent:** 前端工程 Agent (Frontend Engineer)
- **输入：**
  - UI Schema（`docs/features/<domain>/<module>/ui-schema.md`）— 页面结构与交互定义
  - Architecture（`docs/features/<domain>/<module>/architecture.md`）— 数据模型与 API 定义
  - UX Design（`docs/features/<domain>/<module>/ux-design.md`）— 交互流程参考
  - 术语规范（`docs/STANDARDS.md` §1）
  - 已有模块代码参考（推荐：`frontend/src/features/energy-trade/price-management/`）
- **输出：**
  - 模块目录结构（`frontend/src/features/<domain>/<module>/`）
  - 页面组件（`pages/*.tsx` + `pages/index.ts`）
  - 子组件（`components/*.tsx`，如有需要）
  - 类型定义（`types.ts`）
  - 常量配置（`constants.ts`）
  - 用户故事映射（`userStoryMapping.ts`）
  - Mock 数据（`frontend/src/mock/<moduleName>.ts`）— 由 `mock-data-creation` Skill 定义
  - i18n 翻译（`frontend/src/locales/`）— 由 `i18n-integration` Skill 定义
- **依赖：** architecture.md + ui-schema.md 已存在且用户已确认

---

## 流程定义

### 步骤 1: 模块目录搭建

创建标准目录结构：

```
frontend/src/features/{domain}/{module}/
├── pages/
│   ├── Page1.tsx
│   ├── Page2.tsx
│   └── index.ts        # Barrel export（必须）
├── components/          # 可复用子组件（Drawer、Modal、Tag 等）
│   └── ...
├── types.ts             # 所有 TypeScript 类型定义
├── constants.ts         # 状态配置、颜色、数值常量
└── userStoryMapping.ts  # 用户故事追踪映射
```

**注意：** Mock 数据文件位于 `frontend/src/mock/` 目录下（非模块内部）。

### 步骤 2: 编写 types.ts

以 `architecture.md` 为唯一真相来源，逐字段转换。

**命名规范：**

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 状态/枚举联合类型 | 小写蛇形字面量联合 | `type OrderStatus = 'filling' \| 'pending_payment' \| 'paid'` |
| 核心实体接口 | PascalCase | `interface FuelingOrder { ... }` |
| 表单数据接口 | `{Action}{Entity}Form` | `interface CreateOrderForm { ... }` |
| 查询参数接口 | `{Entity}Params` 或 `{Entity}Query` | `interface OrderListParams { ... }` |
| 统计/聚合接口 | `{Entity}Statistics` 或 `{Entity}Data` | `interface OrderStatistics { ... }` |
| 时间线条目 | `{Entity}TimelineEntry` | `interface IssueTimelineEntry { ... }` |
| Props 接口 | `{ComponentName}Props` | `interface OrderDetailDrawerProps { ... }` |

**必须包含的字段：**
- 每个核心实体必须有 `id: string`、`createdAt: string`、`updatedAt: string`
- 关联实体使用嵌套对象或 `null`：`assignee: { id: string; name: string } | null`
- 状态字段类型必须引用已定义的联合类型

### 步骤 3: 编写 constants.ts

**必须包含的结构：**

```typescript
import i18n from '../../../locales/i18n';

// 1. i18n 标签获取辅助函数（每个模块必须有）
export const getLabel = (config: { label: string; labelEn: string }): string => {
  return i18n.language?.startsWith('en') ? config.labelEn : config.label;
};

// 2. 状态配置映射（每种状态/枚举类型一个 Record）
export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string;      // 中文标签
  labelEn: string;    // 英文标签
  color: string;      // Ant Design 颜色关键字或 hex
}> = {
  filling:         { label: '加注中',  labelEn: 'Filling',  color: 'processing' },
  pending_payment: { label: '待支付',  labelEn: 'Pending',  color: 'orange' },
  // ... 所有状态必须覆盖
};

// 3. 数值常量
export const DEFAULT_PAGE_SIZE = 20;

// 4. 辅助函数（如有）
export const isOverdue = (dueDate: string, status: string): boolean => { ... };
```

**颜色值规范：** 优先使用 Ant Design 语义色关键字（`'green'`、`'red'`、`'orange'`、`'blue'`、`'processing'`、`'default'`）。

### 步骤 4: 编写页面组件

#### 4.1 Import 顺序（严格遵循）

```typescript
// 1. React 核心
import React, { useState, useMemo, useCallback } from 'react';

// 2. Router & Navigation
import { useNavigate, useOutletContext } from 'react-router-dom';

// 3. i18n
import { useTranslation } from 'react-i18next';

// 4. Ant Design 组件（单 import，字母序）
import { Button, Card, Col, Row, Space, Table, Tag, Typography } from 'antd';

// 5. Ant Design 图标（单独 import）
import { EditOutlined, PlusOutlined } from '@ant-design/icons';

// 6. Ant Design 类型
import type { ColumnsType } from 'antd/es/table';

// 7. 外部库（dayjs 等）
import dayjs from 'dayjs';

// 8. Mock 数据
import { getOrders } from '../../../../mock/orderTransaction';

// 9. 模块类型
import type { FuelingOrder, OrderStatus } from '../types';

// 10. 模块常量
import { ORDER_STATUS_CONFIG, getLabel } from '../constants';

// 11. 共享组件
import { RequirementTag } from '../../../../components/RequirementTag';

// 12. 本地子组件
import OrderDetailDrawer from '../components/OrderDetailDrawer';
```

#### 4.2 状态管理模式

```typescript
// 筛选状态 — useState
const [keyword, setKeyword] = useState('');
const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

// 弹窗/抽屉状态 — useState（ID 或 boolean）
const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
const [createDrawerOpen, setCreateDrawerOpen] = useState(false);

// 派生状态 — useMemo（列表筛选、统计计算）
const filteredOrders = useMemo(() => {
  let list = allOrders.filter(o => o.stationId === stationId);
  if (keyword) list = list.filter(/* ... */);
  if (statusFilter) list = list.filter(o => o.orderStatus === statusFilter);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}, [allOrders, stationId, keyword, statusFilter]);

// 上下文 — useOutletContext（获取父布局的 selectedStationId）
const { selectedStationId: stationId } = useOutletContext<LayoutContext>();
```

#### 4.3 页面 Header 区域（统一布局）

```tsx
<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
  <Space align="center">
    <Typography.Title level={4} style={{ margin: 0 }}>
      {t('order.list.title', '订单列表')}
    </Typography.Title>
    <RequirementTag
      componentIds={['order-list', 'order-filter']}
      module="order-transaction"
      showDetail
    />
  </Space>
  <Space>
    <Button type="primary" icon={<PlusOutlined />}>
      {t('order.action.create', '新建订单')}
    </Button>
  </Space>
</div>
```

#### 4.4 Table 定义

```tsx
const columns: ColumnsType<FuelingOrder> = [
  {
    title: t('order.field.orderNo', '订单号'),
    dataIndex: 'orderNo',
    width: 180,              // 必须指定 width
    fixed: 'left',           // 关键列固定
  },
  {
    title: t('order.field.status', '状态'),
    dataIndex: 'orderStatus',
    width: 100,
    render: (status: OrderStatus) => {
      const cfg = ORDER_STATUS_CONFIG[status];
      return <Tag color={cfg.color}>{getLabel(cfg)}</Tag>;
    },
  },
  // ... 更多列
];

// ⚠️ 所有带显式 width 的 Table 必须设置 scroll.x = 列宽之和
<Table
  columns={columns}
  dataSource={filteredOrders}
  rowKey="id"
  scroll={{ x: 1200 }}
  pagination={{ pageSize: DEFAULT_PAGE_SIZE, total: filteredOrders.length }}
/>
```

#### 4.5 交互完整性规则

- `hoverable` / `cursor: pointer` 的元素**必须**有对应 `onClick` 处理
- 统计卡片与列表筛选**双向联动**、共享状态变量
- 主列表包含**全量数据**，专用视图是筛选子集而非互斥分区
- Drawer/Modal 通过 ID state 控制：`open={id !== null}`，`onClose={() => setId(null)}`

#### 4.6 消息反馈

```typescript
message.success(t('common.operationSuccess', '操作成功'));
message.error(t('common.operationFailed', '操作失败'));
message.info(t('common.comingSoon', '功能即将上线'));
```

### 步骤 5: 编写 userStoryMapping.ts

详见 `docs/AGENT-PLAN.md` §7 RequirementTag 协议。

```typescript
export interface UserStoryMapping {
  us: string[];
  desc: string;
  priority: 'MVP' | 'MVP+' | 'PROD' | 'FUTURE';
  status: 'implemented' | 'partial' | 'planned' | 'not-planned';
}

export const moduleNameUserStories: Record<string, UserStoryMapping> = {
  'component-id': {
    us: ['US-001'],
    desc: '功能描述',
    priority: 'MVP',
    status: 'implemented',
  },
};
```

### 步骤 6: 路由与导航注册

1. **`router.tsx`** — 添加所有页面路由（路径定义为常量，禁止硬编码）
2. **`AppLayout.tsx`** — 添加侧边栏菜单（3 层模式：Domain → Sub-group → Leaf）
3. **面包屑** — 中间层使用子菜单分组名称
4. **RequirementTag.tsx** — Import 并注册新模块的 userStoryMapping

### 步骤 7: 编译验证

```bash
npm run build
```

零错误后进入 UI 评审阶段。

---

## Prompt 模板

```
你是前端工程 Agent，负责将 UI Schema 转化为 React + TypeScript + Ant Design 组件。

## 任务
为模块【{{MODULE_NAME}}】实现前端 UI。

## 输入文件
- UI Schema：docs/features/{{DOMAIN}}/{{MODULE}}/ui-schema.md
- 数据模型：docs/features/{{DOMAIN}}/{{MODULE}}/architecture.md
- UX 设计：docs/features/{{DOMAIN}}/{{MODULE}}/ux-design.md
- 术语规范：docs/STANDARDS.md §1
- 参考模块：frontend/src/features/energy-trade/price-management/（代码风格参考）

## 执行步骤
请严格按照 docs/skills/frontend/react-component-development.md 中的步骤 1-7 执行。

## 关键要求
1. types.ts 以 architecture.md 为唯一真相来源，逐字段转换
2. 遵循 Import 顺序规范（12 层）
3. 每个页面必须有 RequirementTag + useTranslation
4. 所有带 column width 的 Table 必须有 scroll.x
5. hoverable 元素必须有 onClick
6. 统计卡片与列表双向联动
7. 主列表包含全量数据
8. 路由路径使用常量，禁止硬编码
9. 侧边栏遵循 3 层模式

## 输出
- 模块目录结构及所有文件
- router.tsx 更新
- AppLayout.tsx 菜单更新
- RequirementTag.tsx 注册
- npm run build 通过
```

---

## 检查清单

- [ ] types.ts 与 architecture.md 逐字段对应
- [ ] constants.ts 包含所有状态类型的 CONFIG 映射
- [ ] constants.ts 包含 getLabel 辅助函数
- [ ] 每个页面组件 Import 顺序正确（12 层）
- [ ] 每个页面有 RequirementTag + 正确的 componentIds
- [ ] 每个页面有 useTranslation 且标签使用 t() 包裹
- [ ] 所有 Table 有 scroll.x（列宽之和）
- [ ] 所有 hoverable 元素有 onClick
- [ ] 统计卡片与列表联动
- [ ] 主列表包含全量数据（非互斥分区）
- [ ] Drawer/Modal 使用 ID state 控制
- [ ] userStoryMapping.ts 覆盖所有 User Story
- [ ] RequirementTag.tsx 已注册新模块
- [ ] 路由注册使用常量（router.tsx）
- [ ] 侧边栏 3 层模式（AppLayout.tsx）
- [ ] 面包屑中间层使用分组名
- [ ] i18n zh-CN + en-US 翻译完整
- [ ] npm run build 无错误
