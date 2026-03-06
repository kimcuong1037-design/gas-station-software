import type { RFMSegment, AnalyticsDimension, TimePeriod, RankingMetric, CompareType } from './types';

// ===== 时间粒度 =====

export const PERIOD_OPTIONS: { value: TimePeriod; labelKey: string }[] = [
  { value: 'day', labelKey: 'analytics.period.day' },
  { value: 'week', labelKey: 'analytics.period.week' },
  { value: 'month', labelKey: 'analytics.period.month' },
  { value: 'year', labelKey: 'analytics.period.year' },
];

// ===== 分析维度 =====

export const DIMENSION_OPTIONS: { value: AnalyticsDimension; labelKey: string }[] = [
  { value: 'time', labelKey: 'analytics.sales.dimension.time' },
  { value: 'station', labelKey: 'analytics.sales.dimension.station' },
  { value: 'fuel', labelKey: 'analytics.sales.dimension.fuel' },
  { value: 'segment', labelKey: 'analytics.sales.dimension.segment' },
];

// ===== 排行指标 =====

export const RANKING_METRIC_OPTIONS: { value: RankingMetric; labelKey: string }[] = [
  { value: 'revenue', labelKey: 'analytics.dashboard.kpi.revenue' },
  { value: 'orders', labelKey: 'analytics.dashboard.kpi.orders' },
  { value: 'fuelVolume', labelKey: 'analytics.dashboard.kpi.fuelVolume' },
  { value: 'avgOrderValue', labelKey: 'analytics.dashboard.kpi.avgOrderValue' },
];

// ===== 对比方式 =====

export const COMPARE_TYPE_OPTIONS: { value: CompareType; labelKey: string }[] = [
  { value: 'yoy', labelKey: 'analytics.compare.yoy' },
  { value: 'mom', labelKey: 'analytics.compare.mom' },
  { value: 'none', labelKey: 'analytics.compare.none' },
];

// ===== RFM 分层 =====

export const RFM_SEGMENT_CONFIG: Record<RFMSegment, { color: string; labelKey: string }> = {
  high_value: { color: '#faad14', labelKey: 'analytics.customers.segment.high_value' },
  growing: { color: '#1890ff', labelKey: 'analytics.customers.segment.growing' },
  regular: { color: '#d9d9d9', labelKey: 'analytics.customers.segment.regular' },
  churn_risk: { color: '#ff4d4f', labelKey: 'analytics.customers.segment.churn_risk' },
};

// ===== 客户生命周期颜色 =====

export const LIFECYCLE_COLORS: Record<string, string> = {
  new: '#52c41a',
  active: '#1890ff',
  dormant: '#faad14',
  churned: '#ff4d4f',
};

// ===== 流失风险等级 =====

export const CHURN_PROBABILITY_CONFIG: Record<string, { color: string; labelKey: string }> = {
  high: { color: 'red', labelKey: 'analytics.customers.churnLevel.high' },
  medium: { color: 'orange', labelKey: 'analytics.customers.churnLevel.medium' },
  low: { color: 'gold', labelKey: 'analytics.customers.churnLevel.low' },
};

// ===== KPI 卡片配置 =====

export const KPI_CARDS = [
  { key: 'totalRevenue', growthKey: 'revenueGrowth', labelKey: 'analytics.dashboard.kpi.revenue', format: 'currency' as const },
  { key: 'totalOrders', growthKey: 'ordersGrowth', labelKey: 'analytics.dashboard.kpi.orders', format: 'integer' as const },
  { key: 'totalFuelVolume', growthKey: 'fuelVolumeGrowth', labelKey: 'analytics.dashboard.kpi.fuelVolume', format: 'volume' as const },
  { key: 'avgOrderValue', growthKey: 'avgOrderValueGrowth', labelKey: 'analytics.dashboard.kpi.avgOrderValue', format: 'currency' as const },
];

// ===== 异常高亮阈值 =====

export const GROWTH_HIGHLIGHT_THRESHOLD = 10; // ±10% 加粗
export const GROWTH_BG_THRESHOLD = 20;        // ±20% 背景色

// ===== 路由常量 =====

export const ANALYTICS_ROUTES = {
  DASHBOARD: '/analytics/data-analytics/dashboard',
  SALES: '/analytics/data-analytics/sales',
  CUSTOMERS: '/analytics/data-analytics/customers',
} as const;

// ===== 站点选项（Mock） =====

export const STATION_OPTIONS = [
  { value: 'station-001', label: '天府大道站' },
  { value: 'station-002', label: '高新西区站' },
  { value: 'station-003', label: '龙泉驿站' },
  { value: 'station-004', label: '双流机场站' },
  { value: 'station-005', label: '温江永宁站' },
];

// ===== 燃料类型选项（Mock） =====

export const FUEL_TYPE_OPTIONS = [
  { value: 'CNG', label: 'CNG' },
  { value: '92#', label: '92#汽油' },
  { value: '95#', label: '95#汽油' },
  { value: 'LNG', label: 'LNG' },
  { value: '0#柴油', label: '0#柴油' },
];
