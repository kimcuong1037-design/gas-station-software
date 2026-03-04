# 数据分析 — 架构设计

**模块：** 数据分析与报表 > 数据分析 (7.1)
**版本：** 草案 v1
**日期：** 2026-03-03
**状态：** ✅ 已确认（2026-03-04）

---

## 0. 模块特性声明

本模块为**纯数据消费型分析模块**，与其他模块有根本性区别：

| 特性 | 说明 |
|------|------|
| 自有 DB 表 | **无**（不创建新实体表） |
| 写操作 API | **无**（所有 API 均为 GET 聚合查询） |
| 实体所有权 | **无**（数据来源为 Phase 1-2 已有模块） |
| Mock 数据形式 | 预计算的聚合 JSON 文件（非原始业务记录） |
| 图表依赖 | ECharts（已有基础设施 + 本模块新增 3 种图表类型） |

> **实体三问适用性说明：** 本模块无自有实体，因此不执行传统"实体三问"。取而代之，本文档在 §1 中对每个"分析数据类型（Analytics Type）"进行等价的"类型三问"分析（数据来源？聚合逻辑？生命周期？）。

---

## 1. 分析数据类型设计

### 1.1 核心分析数据类型总览

本模块定义的均为**视图数据类型**（View Types），对应 API 响应结构，不映射到数据库表。

```typescript
// ====================================================
// Epic 1: 经营看板数据类型
// ====================================================

// KPI 汇总卡片数据
interface DashboardKPI {
  period: 'day' | 'week' | 'month' | 'year';
  totalRevenue: number;          // 营业额（元，NUMERIC 精度）
  totalOrders: number;           // 订单总数
  totalFuelVolume: number;       // 总充装量（标准立方米）
  avgOrderValue: number;         // 客单价（元）
  revenueGrowth: number;         // 营业额同比增长率（%，正负）
  ordersGrowth: number;          // 订单数同比增长率（%）
  fuelVolumeGrowth: number;      // 充装量同比增长率（%）
  avgOrderValueGrowth: number;   // 客单价同比增长率（%）
}

// 销售趋势折线图数据点
interface SalesTrendPoint {
  date: string;           // ISO 日期（精度由 granularity 决定：日/周/月）
  revenue: number;        // 营业额（元）
  orders: number;         // 订单数
  fuelVolume: number;     // 充装量
  avgOrderValue: number;  // 客单价
}

// 燃料类型销售占比（环形图数据）
interface FuelTypeBreakdown {
  fuelTypeId: string;
  fuelTypeName: string;   // CNG / LNG / 92# / 95# / 0#柴油 等
  fuelTypeCode: string;   // 代码（与 STANDARDS.md 术语对齐）
  revenue: number;        // 销售额（元）
  revenueRatio: number;   // 占总销售额比例（0~1）
  volume: number;         // 充装量
  volumeRatio: number;    // 充装量占比
}

// 站点 KPI 排行榜数据
interface StationRankingItem {
  stationId: string;
  stationName: string;
  rank: number;
  revenue: number;
  orders: number;
  fuelVolume: number;
  avgOrderValue: number;
}

// 会员统计概览
interface MemberStats {
  totalMembers: number;           // 会员总数
  newMembersThisPeriod: number;   // 本期新增
  activeMembers: number;          // 活跃会员数（期内有消费）
  memberRevenueRatio: number;     // 会员消费占总营业额比例
}

// ====================================================
// Epic 2: 多维分析数据类型
// ====================================================

// 多维分析结果行（通用）
interface DimensionAnalysisRow {
  dimensionKey: string;    // 维度值（日期字符串/站点ID/燃料类型代码/时段标签）
  dimensionLabel: string;  // 展示名称
  revenue: number;
  orders: number;
  fuelVolume: number;
  avgOrderValue: number;
  yoyGrowth: number | null;   // 同比增长率（%），首期无数据时为 null
  momGrowth: number | null;   // 环比增长率（%）
}

// 时段热力图数据点
interface TimeSegmentDataPoint {
  hour: number;            // 0-23
  dayType: 'weekday' | 'weekend';
  avgRevenue: number;      // 该时段平均营业额
  avgOrders: number;       // 该时段平均订单数
  peakFlag: boolean;       // 是否为高峰时段（基于百分位阈值）
}

// 多站对比雷达图数据（MVP+）
interface StationRadarData {
  stationId: string;
  stationName: string;
  metrics: {
    revenueScore: number;       // 归一化到 0-100
    ordersScore: number;
    fuelVolumeScore: number;
    avgOrderValueScore: number;
    growthScore: number;
  };
}

// ====================================================
// Epic 3: 客户分析数据类型
// ====================================================

// 客户概览统计卡片
interface CustomerOverview {
  totalCustomers: number;
  newCustomersThisPeriod: number;
  activeCustomers: number;         // 期内有消费
  churnRiskCustomers: number;      // 流失风险（60天以上未消费）
  memberRatio: number;             // 会员化率（会员/总客户）
}

// RFM 客户分层数据点（散点图）
interface RFMCustomerPoint {
  customerId: string;
  customerName: string;    // 脱敏（MVP 阶段）
  recencyDays: number;     // 距上次消费天数（R，越小越好）
  frequency: number;       // 期内消费次数（F）
  monetary: number;        // 期内消费金额（M，元）
  rfmScore: number;        // 综合评分 0-100
  segment: RFMSegment;     // 客户分层
}

type RFMSegment = 'high_value' | 'growing' | 'regular' | 'churn_risk';

// 客户分层汇总（饼图）
interface CustomerSegmentSummary {
  segment: RFMSegment;
  segmentLabel: string;    // 高价值 / 成长型 / 一般 / 流失风险
  count: number;
  ratio: number;           // 占比 0-1
  avgMonetary: number;     // 该分层客均消费
}

// 客户生命周期分布（漏斗图）
interface CustomerLifecycleData {
  stage: 'new' | 'active' | 'dormant' | 'churned';
  stageLabel: string;  // 新客户 / 活跃 / 沉睡 / 流失
  count: number;
  ratio: number;
  avgDaysSinceLastPurchase: number;
}

// 会员增长趋势（双轴折线图）
interface MemberGrowthPoint {
  date: string;            // 月度 ISO 日期
  totalCount: number;      // 累计会员数
  newCount: number;        // 当月新增
  growthRate: number;      // 月环比增长率（%）
}

// 流失预警名单（MVP+）
interface ChurnRiskCustomer {
  customerId: string;
  customerName: string;    // 脱敏
  lastPurchaseDate: string;
  purchaseFrequency: number;  // 历史月均消费次数
  totalMonetary: number;      // 历史总消费金额
  daysSinceLastPurchase: number;
  churnProbability: 'high' | 'medium' | 'low';  // 流失概率评级
}

// 客户标签分布（MVP+）
interface CustomerTagDistribution {
  tagCategory: string;   // 燃料偏好 / 消费水平 / 消费频次
  tagLabel: string;
  count: number;
  ratio: number;
}
```

### 1.2 类型三问分析

#### 类型一问：DashboardKPI（经营 KPI 汇总）

| 三问项 | 答案 |
|--------|------|
| **数据来源** | FuelingOrder（营业额/订单数/客单价） + OutboundRecord（充装量，销售出库） + 上期同比数据（同 API 上一周期查询） |
| **聚合逻辑** | SUM(amount) / COUNT(id) / AVG(amount)，按 station_id 和时间范围 GROUP BY |
| **生命周期** | 无状态，每次 API 请求实时计算（Mock 阶段为预计算 JSON） |

#### 类型二问：SalesTrendPoint（销售趋势数据点）

| 三问项 | 答案 |
|--------|------|
| **数据来源** | FuelingOrder，按 `granularity`（日/周/月）GROUP BY created_at |
| **聚合逻辑** | 按时间粒度 DATE_TRUNC + SUM/AVG，返回时间序列数组 |
| **生命周期** | 无状态，`period` + `stationIds` + `granularity` 参数驱动；Mock 数据预置 30 天/12 月两套 |

#### 类型三问：RFMCustomerPoint（RFM 客户分析数据）

| 三问项 | 答案 |
|--------|------|
| **数据来源** | ⚠️ Phase 4 依赖：Member（客户档案） + FuelingOrder（消费记录）。Mock 阶段用独立 mock 客户数据集 |
| **聚合逻辑** | R = CURRENT_DATE - MAX(order_date)；F = COUNT(orders)；M = SUM(amount)；segment 由规则引擎计算 |
| **生命周期** | 分析结果定期重算（生产环境建议每日批处理）；Mock 阶段静态数据 |

#### 类型四问：DimensionAnalysisRow（多维分析行）

| 三问项 | 答案 |
|--------|------|
| **数据来源** | FuelingOrder（主数据源）+ 维度参照表（Station/FuelType/Shift） |
| **聚合逻辑** | 通用聚合框架：按 dimension 参数动态 GROUP BY；同比数据同时查询上一同等周期 |
| **生命周期** | 无状态，筛选参数驱动；yoyGrowth 在首年数据（无上期对比）时返回 null |

---

## 2. API 端点设计

### 2.1 聚合接口前置分析

#### 页面 P01：经营看板（BusinessDashboard）

| 需要的数据 | 来源 |
|-----------|------|
| KPI 卡片（营业额/订单/充装量/客单价 + 同比） | FuelingOrder 聚合 |
| 销售趋势折线图数据 | FuelingOrder 时序聚合 |
| 燃料类型销售占比 | FuelingOrder + FuelType 聚合 |
| 站点排行 | FuelingOrder 按 station_id GROUP BY |
| 会员统计概览 | Member + FuelingOrder 聚合（⚠️ Phase 4） |

**判断：** 数据来自多个实体且计算复杂 → **需要 3 个聚合端点**

#### 页面 P02：多维分析（SalesAnalysis）

| 需要的数据 | 来源 |
|-----------|------|
| 维度分析结果行 | FuelingOrder 按维度 GROUP BY |
| 时段热力图数据 | FuelingOrder 按小时+工作日/周末 GROUP BY |
| 多站雷达图数据（MVP+） | FuelingOrder 按站点聚合 + 归一化 |

**判断：** 通用分析接口，参数驱动 → **需要 2 个聚合端点**

#### 页面 P03：客户分析（CustomerAnalysis）

| 需要的数据 | 来源 |
|-----------|------|
| 客户概览卡片 | Member（mock）+ FuelingOrder 聚合 |
| RFM 散点图数据 | Member（mock）+ FuelingOrder 聚合 |
| 客户分层汇总饼图 | RFM 计算结果聚合 |
| 客户生命周期分布 | Member（mock）按活跃时间 GROUP BY |
| 会员增长趋势 | Member（mock）按月累计 |
| 流失预警名单（MVP+） | RFM 结果筛选（churn_risk 分层） |

**判断：** Phase 4 依赖，全部通过 mock 数据 → **需要 4 个聚合端点**

---

### 2.2 API 端点清单

> 所有端点均为 **GET 只读**。分析模块无写操作。

#### 经营看板 API

---

**GET** `/api/v1/analytics/dashboard`

- **描述：** 经营看板核心数据（KPI + 销售趋势 + 燃料占比 + 站点排行 + 会员统计）
- **查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `stationIds` | string (逗号分隔) | 否 | 默认全部站点 |
| `period` | `day\|week\|month\|year` | 是 | KPI 时间粒度 |
| `startDate` | string (ISO) | 否 | 自定义时间范围起始 |
| `endDate` | string (ISO) | 否 | 自定义时间范围结束 |
| `trendGranularity` | `day\|week\|month` | 否 | 趋势图粒度，默认 `day` |

- **响应 200：**
```json
{
  "kpi": {
    "period": "month",
    "totalRevenue": 487392.50,
    "totalOrders": 3821,
    "totalFuelVolume": 85430.2,
    "avgOrderValue": 127.56,
    "revenueGrowth": 8.3,
    "ordersGrowth": 5.1,
    "fuelVolumeGrowth": 6.7,
    "avgOrderValueGrowth": 3.0
  },
  "salesTrend": [
    { "date": "2026-02-01", "revenue": 15230.0, "orders": 118, "fuelVolume": 2740.5, "avgOrderValue": 129.1 },
    { "date": "2026-02-02", "revenue": 16850.0, "orders": 132, "fuelVolume": 3010.8, "avgOrderValue": 127.7 }
  ],
  "fuelBreakdown": [
    { "fuelTypeId": "ft-cng", "fuelTypeName": "CNG", "fuelTypeCode": "CNG", "revenue": 218430.0, "revenueRatio": 0.448, "volume": 52140.0, "volumeRatio": 0.610 },
    { "fuelTypeId": "ft-92", "fuelTypeName": "92#汽油", "fuelTypeCode": "92#", "revenue": 142180.0, "revenueRatio": 0.292, "volume": 20430.0, "volumeRatio": 0.239 }
  ],
  "stationRanking": [
    { "stationId": "ST001", "stationName": "天府大道站", "rank": 1, "revenue": 198430.0, "orders": 1540, "fuelVolume": 35210.0, "avgOrderValue": 128.9 }
  ],
  "memberStats": {
    "totalMembers": 4821,
    "newMembersThisPeriod": 143,
    "activeMembers": 2143,
    "memberRevenueRatio": 0.634
  }
}
```

---

**GET** `/api/v1/analytics/dashboard/station-ranking`

- **描述：** 站点 KPI 排行（按指定指标排序，支持指标切换）
- **查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `metric` | `revenue\|orders\|fuelVolume\|avgOrderValue` | 是 | 排行指标 |
| `period` | `day\|week\|month\|year` | 是 | 时间粒度 |
| `limit` | number | 否 | 默认 10 |

- **响应 200：**
```json
{
  "metric": "revenue",
  "period": "month",
  "ranking": [
    { "stationId": "ST001", "stationName": "天府大道站", "rank": 1, "revenue": 198430.0, "orders": 1540, "fuelVolume": 35210.0, "avgOrderValue": 128.9 },
    { "stationId": "ST002", "stationName": "高新区站", "rank": 2, "revenue": 165200.0, "orders": 1280, "fuelVolume": 29800.0, "avgOrderValue": 129.1 }
  ]
}
```

---

#### 多维分析 API

**GET** `/api/v1/analytics/sales`

- **描述：** 通用多维销售分析（按时间/站点/品类/时段维度）
- **查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `dimension` | `time\|station\|fuel\|segment` | 是 | 分析维度 |
| `period` | `day\|week\|month\|year` | 是 | 时间粒度（time 维度有效） |
| `stationIds` | string (逗号分隔) | 否 | 站点筛选，默认全部 |
| `fuelTypeIds` | string (逗号分隔) | 否 | 燃料类型筛选，默认全部 |
| `startDate` | string (ISO) | 是 | 分析起始日期 |
| `endDate` | string (ISO) | 是 | 分析结束日期 |
| `compareType` | `yoy\|mom\|none` | 否 | 同比(yoy)/环比(mom)/不对比，默认 `yoy` |

- **响应 200：**
```json
{
  "dimension": "time",
  "period": "month",
  "rows": [
    {
      "dimensionKey": "2026-01",
      "dimensionLabel": "2026年1月",
      "revenue": 412300.0,
      "orders": 3250,
      "fuelVolume": 73200.0,
      "avgOrderValue": 126.9,
      "yoyGrowth": 12.4,
      "momGrowth": -2.1
    },
    {
      "dimensionKey": "2026-02",
      "dimensionLabel": "2026年2月",
      "revenue": 487392.5,
      "orders": 3821,
      "fuelVolume": 85430.2,
      "avgOrderValue": 127.6,
      "yoyGrowth": 8.3,
      "momGrowth": 18.2
    }
  ],
  "summary": {
    "totalRevenue": 899692.5,
    "totalOrders": 7071,
    "avgYoyGrowth": 10.3
  }
}
```

---

**GET** `/api/v1/analytics/sales/time-segments`

- **描述：** 时段销售分布分析（24 小时热力图数据）
- **查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `stationIds` | string | 否 | 站点筛选 |
| `startDate` | string (ISO) | 是 | 起始日期 |
| `endDate` | string (ISO) | 是 | 结束日期 |

- **响应 200：**
```json
{
  "segments": [
    { "hour": 7, "dayType": "weekday", "avgRevenue": 2430.5, "avgOrders": 18, "peakFlag": true },
    { "hour": 7, "dayType": "weekend", "avgRevenue": 1820.0, "avgOrders": 14, "peakFlag": false },
    { "hour": 12, "dayType": "weekday", "avgRevenue": 3120.0, "avgOrders": 25, "peakFlag": true }
  ]
}
```

---

**GET** `/api/v1/analytics/stations/comparison`

- **描述：** 多站对比（含雷达图归一化数据，MVP+）
- **查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `stationIds` | string | 是 | 需对比的站点（2~5 个） |
| `period` | `week\|month\|quarter\|year` | 是 | 对比周期 |

- **响应 200：**
```json
{
  "period": "month",
  "stations": [
    {
      "stationId": "ST001",
      "stationName": "天府大道站",
      "revenue": 198430.0,
      "orders": 1540,
      "fuelVolume": 35210.0,
      "avgOrderValue": 128.9,
      "radarScores": {
        "revenueScore": 100,
        "ordersScore": 100,
        "fuelVolumeScore": 100,
        "avgOrderValueScore": 85,
        "growthScore": 72
      }
    }
  ]
}
```

---

#### 客户分析 API

**GET** `/api/v1/analytics/customers/overview`

- **描述：** 客户概览统计卡片
- **⚠️ Phase 4 依赖**（Mock 阶段使用预置 mock 客户数据）
- **查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `stationIds` | string | 否 | 站点筛选 |
| `period` | `month\|quarter\|year` | 是 | 统计周期 |

- **响应 200：**
```json
{
  "period": "month",
  "totalCustomers": 4821,
  "newCustomersThisPeriod": 143,
  "activeCustomers": 2143,
  "churnRiskCustomers": 312,
  "memberRatio": 0.782
}
```

---

**GET** `/api/v1/analytics/customers/rfm`

- **描述：** RFM 客户分层数据（散点图 + 分层饼图）
- **⚠️ Phase 4 依赖**
- **查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `stationIds` | string | 否 | 站点筛选 |
| `period` | `3m\|6m\|12m` | 是 | RFM 计算周期（近 N 个月） |

- **响应 200：**
```json
{
  "period": "12m",
  "customers": [
    {
      "customerId": "C001",
      "customerName": "张**",
      "recencyDays": 3,
      "frequency": 28,
      "monetary": 4320.0,
      "rfmScore": 92,
      "segment": "high_value"
    }
  ],
  "segmentSummary": [
    { "segment": "high_value", "segmentLabel": "高价值", "count": 483, "ratio": 0.10, "avgMonetary": 4150.0 },
    { "segment": "growing", "segmentLabel": "成长型", "count": 962, "ratio": 0.20, "avgMonetary": 1820.0 },
    { "segment": "regular", "segmentLabel": "一般", "count": 2414, "ratio": 0.50, "avgMonetary": 680.0 },
    { "segment": "churn_risk", "segmentLabel": "流失风险", "count": 962, "ratio": 0.20, "avgMonetary": 240.0 }
  ]
}
```

---

**GET** `/api/v1/analytics/customers/lifecycle`

- **描述：** 客户生命周期阶段分布 + 会员增长趋势
- **⚠️ Phase 4 依赖**

- **响应 200：**
```json
{
  "lifecycle": [
    { "stage": "new", "stageLabel": "新客户", "count": 143, "ratio": 0.03, "avgDaysSinceLastPurchase": 5 },
    { "stage": "active", "stageLabel": "活跃", "count": 2143, "ratio": 0.44, "avgDaysSinceLastPurchase": 12 },
    { "stage": "dormant", "stageLabel": "沉睡", "count": 1823, "ratio": 0.38, "avgDaysSinceLastPurchase": 48 },
    { "stage": "churned", "stageLabel": "流失", "count": 712, "ratio": 0.15, "avgDaysSinceLastPurchase": 95 }
  ],
  "memberGrowth": [
    { "date": "2026-01-01", "totalCount": 4678, "newCount": 98, "growthRate": 2.1 },
    { "date": "2026-02-01", "totalCount": 4821, "newCount": 143, "growthRate": 3.1 }
  ]
}
```

---

**GET** `/api/v1/analytics/customers/churn-risk`

- **描述：** 流失风险客户列表（MVP+）
- **⚠️ Phase 4 依赖**
- **查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `stationIds` | string | 否 | 站点筛选 |
| `riskLevel` | `high\|medium\|all` | 否 | 风险等级筛选，默认 `all` |
| `page` | number | 否 | 分页，默认 1 |
| `pageSize` | number | 否 | 每页条数，默认 20 |

- **响应 200：**
```json
{
  "total": 312,
  "page": 1,
  "pageSize": 20,
  "items": [
    {
      "customerId": "C042",
      "customerName": "李**",
      "lastPurchaseDate": "2025-12-03",
      "purchaseFrequency": 8.5,
      "totalMonetary": 1840.0,
      "daysSinceLastPurchase": 90,
      "churnProbability": "high"
    }
  ]
}
```

---

### 2.3 权限矩阵

> 本模块全为只读操作，无写权限场景。

| 权限代码 | 说明 | 管理员 | 运营经理 | 站长 | 财务 |
|----------|------|--------|---------|------|------|
| `analytics:view_dashboard` | 查看经营看板 | ✓ | ✓ | ✓（仅本站） | ✓ |
| `analytics:view_sales` | 查看多维销售分析 | ✓ | ✓ | ✓（仅本站） | ✓ |
| `analytics:view_customers` | 查看客户分析 | ✓ | ✓ | ✗ | ✗ |
| `analytics:view_all_stations` | 查看全站点数据 | ✓ | ✓ | ✗（只看本站） | ✓ |

> **⚠️ Phase 7 依赖（9.1 RBAC）：** MVP 阶段前端硬编码角色判断，Phase 7 对接权限系统。

---

## 3. 业务规则

### 3.1 核心业务规则

| 规则编号 | 规则描述 | 涉及 API |
|---------|---------|---------|
| BR-01 | 站长仅可查看其负责站点的数据；运营经理可查看所有站点 | 所有接口 |
| BR-02 | 同比增长率（yoyGrowth）在数据首年无法计算，返回 `null`，前端渲染为 `—` | `/analytics/sales` |
| BR-03 | 客单价（avgOrderValue）= 总营业额 / 总订单数，订单数为 0 时返回 0 | `/analytics/dashboard` |
| BR-04 | 时段分析（TimeSegment）的高峰标识：当时段营业额 > 75th 百分位时为 `peakFlag=true` | `/analytics/sales/time-segments` |
| BR-05 | RFM 分层规则：R<7天 且 F>10次 且 M>1000 → high_value；R>60天 且 F<2次 → churn_risk | `/analytics/customers/rfm` |
| BR-06 | 流失风险定义：距上次消费超过 60 天，且历史月均消费≥2次的客户 | `/analytics/customers/churn-risk` |
| BR-07 | 雷达图归一化：将各站点各指标值映射到 0-100，以最大值站点为 100 | `/analytics/stations/comparison` |

### 3.2 数据时效说明

| 数据类型 | 生产环境刷新策略 | Mock 阶段 |
|---------|---------------|---------|
| KPI 卡片 | 每 5 分钟增量计算 | 静态 JSON |
| 销售趋势 | 每小时批量聚合 | 静态 JSON |
| RFM 分析 | 每日凌晨批处理 | 静态 JSON |
| 流失预警 | 每日凌晨更新 | 静态 JSON |

---

## 4. 跨模块依赖

### 4.1 依赖其他模块的接口

| 本模块 API | 依赖模块 | 依赖实体/接口 | 依赖类型 | 说明 |
|-----------|---------|-------------|---------|------|
| `/analytics/dashboard` | 1.1 站点管理 | Station, FuelType | 数据读取 | 站点列表和燃料类型名称（筛选器） |
| `/analytics/dashboard` | 2.2 订单与交易 | FuelingOrder, PaymentRecord | 聚合查询 | 营业额/订单数/客单价数据源 |
| `/analytics/dashboard` | 2.3 库存管理 | OutboundRecord | 聚合查询 | 充装量数据源 |
| `/analytics/sales/time-segments` | 1.2 交接班管理 | ShiftSummary | 数据读取 | 时段分析辅助（班次维度） |
| `/analytics/customers/*` | ⚠️ 3.1 会员管理（Phase 4） | Member, MemberPurchaseHistory | 聚合查询 | 客户画像/RFM 数据源 |

### 4.2 被其他模块依赖的接口

本模块为终端消费模块，**不被其他模块依赖**。

---

## 5. 前端技术规格

### 5.1 图表类型需求

| 图表类型 | 对应组件 | 用途 | 状态 |
|---------|---------|------|------|
| 折线图 | `LineChart` | 销售趋势、会员增长 | ✅ 已有 |
| 迷你图 | `MiniChart` | KPI 卡片迷你趋势 | ✅ 已有 |
| 柱状图/横向柱 | `BarChart` | 站点排行、时段分布、多维对比 | ❌ **需新增** |
| 饼图/环形图 | `PieChart` | 燃料类型占比、客户分层 | ❌ **需新增** |
| 雷达图 | `RadarChart` | 多站对比（MVP+） | ❌ **需新增** |
| 散点图 | `ScatterChart` | RFM 客户分布 | ❌ **需新增** |
| 漏斗图 | `FunnelChart` | 客户生命周期（可用堆叠柱替代） | ❌ **可选** |

> **Step 10 实施策略：** 在前端工程阶段，新增 BarChart、PieChart 两种组件（必需）；RadarChart 和 ScatterChart 按 MVP+ 需求按需添加；FunnelChart 可用堆叠柱状图替代。

### 5.2 页面与组件规划

| 页面 | 组件文件 | 对应 User Stories | 路由 |
|------|---------|------------------|------|
| 经营看板 | `BusinessDashboard.tsx` | US-001~005, US-006 | `/analytics/data-analytics/dashboard` |
| 多维分析 | `SalesAnalysis.tsx` | US-007~011, US-012, 013 | `/analytics/data-analytics/sales` |
| 客户分析 | `CustomerAnalysis.tsx` | US-014~017, US-018, 019 | `/analytics/data-analytics/customers` |

**组件层：**
- `components/KPICard.tsx` — 带趋势迷你图和同比标识的统计卡片
- `components/DimensionFilter.tsx` — 多维分析的通用筛选面板
- `components/GrowthBadge.tsx` — 同比/环比增长标识组件（红绿箭头）

### 5.3 Mock 数据规格

| Mock 文件 | 数据规模 | 覆盖场景 |
|---------|---------|---------|
| `dashboardMock.ts` | 1 组 KPI + 30 天趋势 + 12 月趋势 + 燃料占比 + Top 5 站点 | 多站汇总视图 |
| `salesAnalysisMock.ts` | 12 月维度分析 + 时段热力图 + 站点对比数据（3 站） | 时间/站点/品类维度各一套 |
| `customerAnalysisMock.ts` | 50 个 RFM 客户点 + 分层汇总 + 12 月增长趋势 | 客户全貌 |

**Mock 数据约束（遵循 STANDARDS.md 术语约定）：**
- 燃料类型代码使用 STANDARDS.md §1 定义：`CNG`、`LNG`、`92#`、`95#`、`0#柴油`
- 站点 ID 格式：`ST001`~`ST005`（与已有模块 mock 数据一致）
- 客户 ID 前缀：`CUST-` + 4 位数字（如 `CUST-0001`）
- 金额精度：NUMERIC(12,2)，mock 中保留 2 位小数
- 日期格式：ISO 8601（`YYYY-MM-DD`）

---

## 6. 路由与导航规划

### 6.1 路由常量（router.tsx）

```typescript
// 数据分析与报表 — 路由常量
export const ROUTES = {
  // ... 已有路由
  ANALYTICS: {
    ROOT: '/analytics',
    DATA_ANALYTICS: {
      DASHBOARD: '/analytics/data-analytics/dashboard',
      SALES: '/analytics/data-analytics/sales',
      CUSTOMERS: '/analytics/data-analytics/customers',
    },
  },
};
```

### 6.2 侧边栏菜单结构（3 层模式）

```
数据分析与报表（Domain，一级）
  └── 数据分析（Sub-group，二级分组）
        ├── 经营看板（Leaf，三级）→ /analytics/data-analytics/dashboard
        ├── 多维分析（Leaf，三级）→ /analytics/data-analytics/sales
        └── 客户分析（Leaf，三级）→ /analytics/data-analytics/customers
```

### 6.3 面包屑

```
数据分析与报表 > 数据分析 > 经营看板
数据分析与报表 > 数据分析 > 多维分析
数据分析与报表 > 数据分析 > 客户分析
```

---

## 7. Database Schema

> **本模块无自有数据库表。**
>
> 所有数据来源于上游模块的聚合查询。以下说明生产环境演进路径供参考。

### 7.1 当前状态（MVP Prototype）

- 无 CREATE TABLE 语句
- Mock 数据以静态 JSON/TypeScript 文件形式提供
- 所有聚合计算在 mock 函数中模拟

### 7.2 生产环境演进路径（供后端参考）

```sql
-- ============================================================
-- 数据分析 — 生产环境聚合层（非 MVP 阶段）
-- 建议：使用 PostgreSQL 物化视图 + 增量刷新
-- ============================================================

-- 方案 A：物化视图（推荐，基于 PostgreSQL）
-- CREATE MATERIALIZED VIEW mv_daily_station_sales AS
-- SELECT
--   DATE_TRUNC('day', fo.created_at) AS sale_date,
--   fo.station_id,
--   fo.fuel_type_id,
--   SUM(fo.amount) AS total_revenue,
--   COUNT(fo.id) AS total_orders,
--   SUM(fo.fuel_volume) AS total_fuel_volume,
--   AVG(fo.amount) AS avg_order_value
-- FROM fueling_order fo
-- WHERE fo.status = 'completed'
-- GROUP BY DATE_TRUNC('day', fo.created_at), fo.station_id, fo.fuel_type_id;
--
-- CREATE UNIQUE INDEX ON mv_daily_station_sales (sale_date, station_id, fuel_type_id);
--
-- -- 每小时刷新：REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_station_sales;

-- 方案 B：TimescaleDB hypertable（高并发实时场景）
-- ⚡ 若 FuelingOrder 表使用 TimescaleDB，可直接利用其连续聚合功能
```

---

## 8. 跨模块 ERD 更新说明

本模块架构设计完成后，需更新 `docs/cross-module-erd.md`：

### 8.1 新增章节（§5 数字化运营分析）

本模块（7.1 数据分析）为**纯消费实体**，不引入新的 DB 表。ERD 更新内容：

1. **§1 全局实体总览**：添加 "7.1 数据分析（Analytics）" 节，标注"无自有实体"
2. **§3 跨模块 FK 明细**：添加 §3.9（分析模块数据消费声明）
3. **§4 数据库迁移顺序**：添加第 10 层（analytics 聚合层，依赖 Phase 1-2 全部表）

---

*架构设计人：AI Agent*
*基于 user-stories.md v1 + cross-module-erd.md v1.4*
*版本：草案 v1*
