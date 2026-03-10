# 报表中心 — 架构设计

**模块：** 数据分析与报表 > 报表中心 (7.2)
**版本：** 草案 v1
**日期：** 2026-03-10
**状态：** 待确认

---

## 0. 模块特性声明

本模块兼具**数据消费**和**自有实体管理**两种特性：

| 特性 | 说明 |
|------|------|
| 自有 DB 表 | **有** — ReportTemplate（报表模板）、ReportInstance（报表实例） |
| 写操作 API | **有** — 模板 CRUD、实例生成、收藏标记 |
| 实体所有权 | **有** — 报表模板和报表实例归本模块管理 |
| 数据消费 | 标准报表数据来源为 Phase 1-2 已有模块的聚合查询（与 7.1 共享） |
| Mock 数据形式 | 自有实体用标准 mock；报表内容数据用预计算聚合 JSON |
| 图表依赖 | 复用 7.1 已建立的 ECharts 基础设施（BarChart、PieChart、LineChart） |

---

## 1. 核心实体设计

### 1.1 实体总览

```typescript
// ====================================================
// 报表模板（ReportTemplate）
// ====================================================

type ReportDataSource = 'operations' | 'inventory' | 'inspection';
type ReportDimension = 'time' | 'station' | 'fuelType' | 'shift';
type ReportMetric = 'revenue' | 'orders' | 'fuelVolume' | 'avgOrderValue' | 'inboundVolume' | 'outboundVolume' | 'lossVolume' | 'tankLevelRatio' | 'inspectionCompletionRate' | 'issueCount' | 'rectificationRate';
type TimeGranularity = 'day' | 'week' | 'month';
type ReportTemplateTag = 'daily' | 'monthly' | 'special';

interface ReportTemplate {
  id: string;                       // 模板ID: RPT-TPL-XXXX
  name: string;                     // 模板名称
  description: string;              // 模板描述
  dataSource: ReportDataSource;     // 数据源类型
  dimensions: ReportDimension[];    // 维度配置（可多选）
  metrics: ReportMetric[];          // 指标配置（可多选）
  timeGranularity: TimeGranularity; // 时间粒度
  defaultFilters: {                 // 默认筛选条件
    stationIds?: string[];          // 默认站点范围
    defaultPeriodDays?: number;     // 默认时间范围（天数）
  };
  tag: ReportTemplateTag;           // 模板标签
  isSystem: boolean;                // 是否系统预置模板（不可删除）
  createdBy: string;                // 创建人ID
  createdAt: string;                // 创建时间 ISO
  updatedAt: string;                // 更新时间 ISO
}

// ====================================================
// 报表实例（ReportInstance）
// ====================================================

type ReportType = 'daily_operations' | 'monthly_operations' | 'shift_handover' | 'inspection' | 'inventory' | 'custom';
type ReportStatus = 'generated' | 'exported';

interface ReportInstance {
  id: string;                       // 实例ID: RPT-XXXX
  templateId: string | null;        // 关联模板ID（标准报表为 null）
  type: ReportType;                 // 报表类型
  title: string;                    // 报表标题（自动生成或用户自定义）
  period: {                         // 报表时间范围
    startDate: string;              // ISO 日期
    endDate: string;                // ISO 日期
  };
  stationIds: string[];             // 涉及站点
  status: ReportStatus;             // 报表状态
  isFavorite: boolean;              // 是否收藏
  generatedAt: string;              // 生成时间 ISO
  generatedBy: string;              // 生成人ID
  data: ReportData;                 // 报表内容数据（聚合结果）
}

// ====================================================
// 报表内容数据（ReportData）— 聚合结果容器
// ====================================================

interface ReportData {
  summary: ReportSummaryRow;        // 汇总行
  rows: ReportDataRow[];            // 明细行
  charts?: ReportChartData[];       // 图表数据（可选）
}

interface ReportSummaryRow {
  [metricKey: string]: number;      // 动态指标值
}

interface ReportDataRow {
  dimensionKey: string;             // 维度值
  dimensionLabel: string;           // 维度展示名
  [metricKey: string]: string | number; // 动态指标值
}

interface ReportChartData {
  chartType: 'line' | 'bar' | 'pie';
  title: string;
  data: Array<{ label: string; value: number; [key: string]: string | number }>;
}

// ====================================================
// 标准报表专用数据结构
// ====================================================

// 经营日报/月报内容
interface OperationsReportData {
  kpiSummary: {
    totalRevenue: number;
    totalOrders: number;
    totalFuelVolume: number;
    avgOrderValue: number;
    revenueGrowth: number | null;    // 同比/环比
    ordersGrowth: number | null;
  };
  stationBreakdown: Array<{
    stationId: string;
    stationName: string;
    revenue: number;
    orders: number;
    fuelVolume: number;
    avgOrderValue: number;
  }>;
  fuelTypeBreakdown: Array<{
    fuelTypeName: string;
    revenue: number;
    revenueRatio: number;
    volume: number;
  }>;
  dailyTrend?: Array<{             // 月报专用：日均趋势
    date: string;
    revenue: number;
    orders: number;
  }>;
}

// 交接班报表内容
interface ShiftReportData {
  shifts: Array<{
    shiftName: string;
    date: string;
    operatorName: string;
    revenue: number;
    orders: number;
    fuelVolume: number;
    cashAmount: number;
    onlineAmount: number;
    cardAmount: number;
  }>;
  paymentDistribution: Array<{
    method: string;
    amount: number;
    ratio: number;
  }>;
}

// 巡检报表内容
interface InspectionReportData {
  summary: {
    totalPlanned: number;
    totalCompleted: number;
    completionRate: number;
    totalIssues: number;
    rectifiedIssues: number;
    rectificationRate: number;
  };
  areaBreakdown: Array<{
    area: string;
    areaLabel: string;
    issueCount: number;
    criticalCount: number;
    rectifiedCount: number;
  }>;
  unresolvedCritical: Array<{
    inspectionId: string;
    area: string;
    description: string;
    severity: 'high' | 'urgent';
    discoveredDate: string;
    daysPending: number;
  }>;
}

// 库存报表内容
interface InventoryReportData {
  summary: {
    totalInbound: number;
    totalOutbound: number;
    totalLoss: number;
    endingInventory: number;
  };
  stationFuelBreakdown: Array<{
    stationId: string;
    stationName: string;
    fuelTypeName: string;
    inboundVolume: number;
    outboundVolume: number;
    lossVolume: number;
    endingVolume: number;
    tankLevelRatio: number;
    abnormalLoss: boolean;
  }>;
  tankLevelTrend?: Array<{
    date: string;
    stationId: string;
    tankLevelRatio: number;
  }>;
}
```

### 1.2 实体三问分析

#### 三问一：ReportTemplate（报表模板）

| 三问项 | 答案 |
|--------|------|
| **携带数据** | 模板名称、数据源类型、维度列表、指标列表、时间粒度、默认筛选条件、标签、系统/自定义标识 |
| **父子关系** | 无父实体。一个 Template → 多个 ReportInstance（一对多） |
| **创建时副作用** | 无。模板仅为配置定义，不触发数据计算 |

#### 三问二：ReportInstance（报表实例）

| 三问项 | 答案 |
|--------|------|
| **携带数据** | 报表标题、类型、时间范围、站点列表、状态、收藏标记、报表内容数据（聚合结果 JSON） |
| **父子关系** | 可选关联 ReportTemplate（自定义报表）；标准报表 templateId 为 null |
| **创建时副作用** | 触发聚合查询计算（Mock 阶段从 mock 数据中取预计算结果） |

---

## 2. API 端点设计

### 2.1 报表模板 API

---

**GET** `/api/v1/reports/templates`

- **描述：** 获取报表模板列表（含系统预置 + 用户自定义）
- **查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `dataSource` | ReportDataSource | 否 | 按数据源筛选 |
| `tag` | ReportTemplateTag | 否 | 按标签筛选 |
| `isSystem` | boolean | 否 | 筛选系统/自定义模板 |

- **响应 200：**
```json
{
  "items": [
    {
      "id": "RPT-TPL-0001",
      "name": "经营日报模板",
      "description": "按日生成的经营汇总报表",
      "dataSource": "operations",
      "dimensions": ["time", "station"],
      "metrics": ["revenue", "orders", "fuelVolume", "avgOrderValue"],
      "timeGranularity": "day",
      "defaultFilters": { "defaultPeriodDays": 1 },
      "tag": "daily",
      "isSystem": true,
      "createdBy": "system",
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ],
  "total": 8
}
```

---

**POST** `/api/v1/reports/templates`

- **描述：** 创建自定义报表模板
- **请求体：**
```json
{
  "name": "月度站点对比",
  "description": "按月对比各站点经营指标",
  "dataSource": "operations",
  "dimensions": ["station", "time"],
  "metrics": ["revenue", "orders", "fuelVolume"],
  "timeGranularity": "month",
  "defaultFilters": { "defaultPeriodDays": 30 },
  "tag": "monthly"
}
```

---

**PUT** `/api/v1/reports/templates/:id`

- **描述：** 更新自定义报表模板（系统模板不可编辑）

---

**DELETE** `/api/v1/reports/templates/:id`

- **描述：** 删除自定义报表模板（系统模板不可删除）

---

### 2.2 报表实例 API

---

**GET** `/api/v1/reports`

- **描述：** 获取报表实例列表
- **查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `type` | ReportType | 否 | 按报表类型筛选 |
| `startDate` | string (ISO) | 否 | 生成日期范围起始 |
| `endDate` | string (ISO) | 否 | 生成日期范围结束 |
| `stationIds` | string (逗号分隔) | 否 | 按站点筛选 |
| `isFavorite` | boolean | 否 | 仅收藏报表 |
| `keyword` | string | 否 | 标题关键词搜索 |
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页条数，默认 20 |

- **响应 200：**
```json
{
  "items": [
    {
      "id": "RPT-0001",
      "templateId": null,
      "type": "daily_operations",
      "title": "2026-03-09 经营日报",
      "period": { "startDate": "2026-03-09", "endDate": "2026-03-09" },
      "stationIds": ["ST001", "ST002", "ST003"],
      "status": "generated",
      "isFavorite": true,
      "generatedAt": "2026-03-10T08:00:00Z",
      "generatedBy": "U001"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20
}
```

---

**POST** `/api/v1/reports/generate`

- **描述：** 生成报表实例（标准报表或基于模板）
- **请求体：**
```json
{
  "type": "daily_operations",
  "templateId": null,
  "startDate": "2026-03-09",
  "endDate": "2026-03-09",
  "stationIds": ["ST001", "ST002"]
}
```

- **响应 201：** 返回完整的 ReportInstance（含 data 字段）

---

**GET** `/api/v1/reports/:id`

- **描述：** 获取报表实例详情（含完整数据）
- **响应 200：** 完整 ReportInstance 对象

---

**PATCH** `/api/v1/reports/:id/favorite`

- **描述：** 切换报表收藏状态
- **请求体：**
```json
{ "isFavorite": true }
```

---

**GET** `/api/v1/reports/calendar`

- **描述：** 获取日历视图数据（每日可用报表统计）
- **查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `year` | number | 是 | 年份 |
| `month` | number | 是 | 月份 (1-12) |

- **响应 200：**
```json
{
  "year": 2026,
  "month": 3,
  "days": [
    {
      "date": "2026-03-01",
      "reports": [
        { "type": "daily_operations", "count": 1 },
        { "type": "inventory", "count": 1 }
      ]
    },
    {
      "date": "2026-03-09",
      "reports": [
        { "type": "daily_operations", "count": 1 },
        { "type": "shift_handover", "count": 3 },
        { "type": "inventory", "count": 1 }
      ]
    }
  ]
}
```

---

**POST** `/api/v1/reports/:id/export`

- **描述：** 导出报表（MVP 阶段返回 mock 响应）
- **请求体：**
```json
{ "format": "xlsx" }
```
- **响应 200（MVP mock）：**
```json
{
  "message": "导出功能将在后端实现后启用",
  "format": "xlsx",
  "estimatedSize": "125KB"
}
```

---

### 2.3 系统预置标准报表模板

| 模板 ID | 名称 | 数据源 | 维度 | 指标 | 时间粒度 |
|---------|------|--------|------|------|---------|
| RPT-TPL-SYS-001 | 经营日报 | operations | time, station | revenue, orders, fuelVolume, avgOrderValue | day |
| RPT-TPL-SYS-002 | 经营月报 | operations | time, station, fuelType | revenue, orders, fuelVolume, avgOrderValue | month |
| RPT-TPL-SYS-003 | 交接班报表 | operations | shift, station | revenue, orders, fuelVolume | day |
| RPT-TPL-SYS-004 | 巡检报表 | inspection | time, station | inspectionCompletionRate, issueCount, rectificationRate | week |
| RPT-TPL-SYS-005 | 库存报表 | inventory | time, station, fuelType | inboundVolume, outboundVolume, lossVolume, tankLevelRatio | day |

---

## 3. 权限矩阵

| 权限代码 | 说明 | 管理员 | 运营经理 | 站长 | 安全主管 | 班组长 |
|----------|------|--------|---------|------|---------|--------|
| `reports:view` | 查看报表实例 | ✓ | ✓ | ✓（本站） | ✓（巡检） | ✓（本站） |
| `reports:generate` | 生成报表 | ✓ | ✓ | ✓（本站） | ✓（巡检） | ✗ |
| `reports:template_manage` | 管理自定义模板 | ✓ | ✓ | ✗ | ✗ | ✗ |
| `reports:export` | 导出报表 | ✓ | ✓ | ✓ | ✓ | ✗ |
| `reports:view_all_stations` | 查看全站报表 | ✓ | ✓ | ✗ | ✗ | ✗ |

> **⚠️ Phase 7 依赖（9.1 RBAC）：** MVP 阶段前端硬编码角色判断。

---

## 4. 业务规则

| 规则编号 | 规则描述 | 涉及 API |
|---------|---------|---------|
| BR-01 | 系统预置模板（isSystem=true）不可编辑或删除 | PUT/DELETE `/templates/:id` |
| BR-02 | 自定义模板仅创建者可编辑/删除 | PUT/DELETE `/templates/:id` |
| BR-03 | 报表生成时，站长角色自动限定为本站数据 | POST `/reports/generate` |
| BR-04 | 同比增长率在无上期数据时返回 null，前端渲染为"—" | POST `/reports/generate` |
| BR-05 | 金额精度 NUMERIC(12,2)；百分比保留 1 位小数 | 所有接口 |
| BR-06 | 巡检报表中未整改的高/紧急级别问题需高亮标识 | 巡检报表数据 |
| BR-07 | 库存报表中损耗率超过 2% 的行标记为异常损耗 | 库存报表数据 |
| BR-08 | 日历视图按自然月展示，空日期不展示报表标记 | GET `/reports/calendar` |

---

## 5. 跨模块依赖

### 5.1 依赖其他模块的接口

| 本模块 API | 依赖模块 | 依赖实体/接口 | 依赖类型 | 说明 |
|-----------|---------|-------------|---------|------|
| 经营日报/月报 | 1.1 站点管理 | Station, FuelType | 数据读取 | 站点列表和燃料类型 |
| 经营日报/月报 | 2.2 订单与交易 | FuelingOrder | 聚合查询 | 营业额/订单数/客单价 |
| 经营日报/月报 | 2.3 库存管理 | OutboundRecord | 聚合查询 | 充装量 |
| 交接班报表 | 1.2 交接班管理 | ShiftHandover, ShiftSummary | 聚合查询 | 班次营收汇总 |
| 巡检报表 | 1.4 巡检安检 | InspectionTask, InspectionLog | 聚合查询 | 巡检执行率/问题统计 |
| 库存报表 | 2.3 库存管理 | InboundRecord, OutboundRecord, TankLevel | 聚合查询 | 进出库/罐存数据 |

### 5.2 被其他模块依赖的接口

本模块可为 7.3 数据大屏提供报表数据源（⚠️ Phase 3 后续模块）。

---

## 6. 前端技术规格

### 6.1 图表复用

全部复用 7.1 已建立的 ECharts 基础设施：

| 图表类型 | 组件 | 用途 |
|---------|------|------|
| 折线图 | `LineChart` | 日均趋势（月报）、罐容比趋势 |
| 柱状图 | `BarChart` | 站点对比、班次对比、区域问题分布 |
| 饼图 | `PieChart` | 燃料类型占比、支付方式分布 |

### 6.2 页面与组件规划

| 页面 | 组件文件 | 对应 User Stories | 路由 |
|------|---------|------------------|------|
| 报表总览 | `ReportOverview.tsx` | US-006, US-011, US-012 | `/analytics/report-center/overview` |
| 标准报表 | `StandardReport.tsx` | US-001~005, US-010 | `/analytics/report-center/standard` |
| 自定义报表 | `CustomReport.tsx` | US-007~010 | `/analytics/report-center/custom` |

**组件层：**
- `components/ReportCalendar.tsx` — 日历视图组件（US-006）
- `components/ReportPreview.tsx` — 报表预览组件（表格+图表模式切换）
- `components/TemplateBuilder.tsx` — 模板构建器（步骤式表单：数据源→维度→指标→筛选）
- `components/ReportCard.tsx` — 报表卡片（列表项/收藏入口）

### 6.3 Mock 数据规格

| Mock 文件 | 数据规模 | 覆盖场景 |
|---------|---------|---------|
| `templateMock.ts` | 5 个系统模板 + 3 个自定义模板 | 全部数据源类型 |
| `reportInstanceMock.ts` | 20 个报表实例（覆盖全部 6 种类型） | 近 30 天数据 |
| `reportDataMock.ts` | 各类型报表的预计算内容数据 | 经营/交接班/巡检/库存/自定义 |
| `calendarMock.ts` | 一个月的日历视图数据 | 报表分布 |

**Mock 数据约束（遵循 STANDARDS.md 术语约定）：**
- 站点 ID 格式：`ST001`~`ST005`（与已有模块一致）
- 燃料类型代码：`CNG`、`LNG`、`92#`、`95#`、`0#柴油`
- 模板 ID 前缀：`RPT-TPL-`（系统模板加 `SYS-`）
- 实例 ID 前缀：`RPT-`
- 金额精度：保留 2 位小数
- 日期格式：ISO 8601

---

## 7. 路由与导航规划

### 7.1 路由常量（router.tsx）

```typescript
export const ROUTES = {
  // ... 已有路由
  ANALYTICS: {
    ROOT: '/analytics',
    DATA_ANALYTICS: { /* 7.1 已有 */ },
    REPORT_CENTER: {
      OVERVIEW: '/analytics/report-center/overview',
      STANDARD: '/analytics/report-center/standard',
      CUSTOM: '/analytics/report-center/custom',
    },
  },
};
```

### 7.2 侧边栏菜单结构（3 层模式）

```
数据分析与报表（Domain，一级）
  ├── 数据分析（Sub-group，二级）     ← 7.1 已有
  │     ├── 经营看板
  │     ├── 多维分析
  │     └── 客户分析
  └── 报表中心（Sub-group，二级）     ← 7.2 新增
        ├── 报表总览（Leaf，三级）→ /analytics/report-center/overview
        ├── 标准报表（Leaf，三级）→ /analytics/report-center/standard
        └── 自定义报表（Leaf，三级）→ /analytics/report-center/custom
```

### 7.3 面包屑

```
数据分析与报表 > 报表中心 > 报表总览
数据分析与报表 > 报表中心 > 标准报表
数据分析与报表 > 报表中心 > 自定义报表
```

---

## 8. Database Schema

### 8.1 报表模板表

```sql
-- ============================================================
-- 7.2 报表中心 — 报表模板
-- ============================================================
CREATE TABLE report_template (
    id              VARCHAR(20) PRIMARY KEY,          -- RPT-TPL-XXXX
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    data_source     ENUM('operations','inventory','inspection') NOT NULL,
    dimensions      JSON NOT NULL,                     -- ["time","station"]
    metrics         JSON NOT NULL,                     -- ["revenue","orders"]
    time_granularity ENUM('day','week','month') NOT NULL DEFAULT 'day',
    default_filters JSON,                              -- {"stationIds":[],"defaultPeriodDays":30}
    tag             ENUM('daily','monthly','special') NOT NULL DEFAULT 'daily',
    is_system       BOOLEAN NOT NULL DEFAULT FALSE,
    created_by      VARCHAR(36) NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_template_datasource (data_source),
    INDEX idx_template_system (is_system),
    INDEX idx_template_creator (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 8.2 报表实例表

```sql
-- ============================================================
-- 7.2 报表中心 — 报表实例
-- ============================================================
CREATE TABLE report_instance (
    id              VARCHAR(20) PRIMARY KEY,          -- RPT-XXXX
    template_id     VARCHAR(20),                       -- NULL for standard reports
    type            ENUM('daily_operations','monthly_operations','shift_handover','inspection','inventory','custom') NOT NULL,
    title           VARCHAR(200) NOT NULL,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    station_ids     JSON NOT NULL,                     -- ["ST001","ST002"]
    status          ENUM('generated','exported') NOT NULL DEFAULT 'generated',
    is_favorite     BOOLEAN NOT NULL DEFAULT FALSE,
    generated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generated_by    VARCHAR(36) NOT NULL,
    data            JSON NOT NULL,                     -- 报表内容数据（聚合结果）

    FOREIGN KEY (template_id) REFERENCES report_template(id) ON DELETE SET NULL,
    INDEX idx_instance_type (type),
    INDEX idx_instance_period (period_start, period_end),
    INDEX idx_instance_favorite (is_favorite),
    INDEX idx_instance_generator (generated_by),
    INDEX idx_instance_generated (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 9. 跨模块 ERD 更新说明

本模块架构设计完成后，需更新 `docs/cross-module-erd.md`：

1. **§1 全局实体总览**：添加 "7.2 报表中心（Report Center）" 节，列出 ReportTemplate + ReportInstance
2. **§3 跨模块 FK 明细**：添加 §3.10（报表模块数据消费声明 — 聚合 1.1/1.2/1.4/2.2/2.3 数据）
3. **上游模块更新**：参见 Step 3.5 反向影响审查，5 个上游模块需补充 7.2 为下游消费者

---

*架构设计人：AI Agent*
*基于 requirements.md v1 + user-stories.md v1*
*版本：草案 v1*
