// 数据分析模块类型定义 — 基于 architecture.md 数据模型
// 本模块为纯数据消费型，所有类型为视图数据类型（View Types），不映射到数据库表

// ===== Epic 1: 经营看板 =====

export interface DashboardKPI {
  period: 'day' | 'week' | 'month' | 'year';
  totalRevenue: number;
  totalOrders: number;
  totalFuelVolume: number;
  avgOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  fuelVolumeGrowth: number;
  avgOrderValueGrowth: number;
}

export interface SalesTrendPoint {
  date: string;
  revenue: number;
  orders: number;
  fuelVolume: number;
  avgOrderValue: number;
}

export interface FuelTypeBreakdown {
  fuelTypeId: string;
  fuelTypeName: string;
  fuelTypeCode: string;
  revenue: number;
  revenueRatio: number;
  volume: number;
  volumeRatio: number;
}

export interface StationRankingItem {
  stationId: string;
  stationName: string;
  rank: number;
  revenue: number;
  orders: number;
  fuelVolume: number;
  avgOrderValue: number;
}

export interface MemberStats {
  totalMembers: number;
  newMembersThisPeriod: number;
  activeMembers: number;
  memberRevenueRatio: number;
}

export interface DashboardData {
  kpi: DashboardKPI;
  salesTrend: SalesTrendPoint[];
  fuelBreakdown: FuelTypeBreakdown[];
  stationRanking: StationRankingItem[];
  memberStats: MemberStats;
}

// ===== Epic 2: 多维分析 =====

export interface DimensionAnalysisRow {
  dimensionKey: string;
  dimensionLabel: string;
  revenue: number;
  orders: number;
  fuelVolume: number;
  avgOrderValue: number;
  yoyGrowth: number | null;
  momGrowth: number | null;
}

export interface TimeSegmentDataPoint {
  hour: number;
  dayType: 'weekday' | 'weekend';
  avgRevenue: number;
  avgOrders: number;
  peakFlag: boolean;
}

export interface StationRadarData {
  stationId: string;
  stationName: string;
  metrics: {
    revenueScore: number;
    ordersScore: number;
    fuelVolumeScore: number;
    avgOrderValueScore: number;
    growthScore: number;
  };
}

export interface SalesAnalysisData {
  dimension: string;
  period?: string;
  rows: DimensionAnalysisRow[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgYoyGrowth: number | null;
  };
}

// ===== Epic 3: 客户分析 =====

export interface CustomerOverview {
  totalCustomers: number;
  newCustomersThisPeriod: number;
  activeCustomers: number;
  churnRiskCustomers: number;
  memberRatio: number;
}

export type RFMSegment = 'high_value' | 'growing' | 'regular' | 'churn_risk';

export interface RFMCustomerPoint {
  customerId: string;
  customerName: string;
  recencyDays: number;
  frequency: number;
  monetary: number;
  rfmScore: number;
  segment: RFMSegment;
}

export interface CustomerSegmentSummary {
  segment: RFMSegment;
  segmentLabel: string;
  count: number;
  ratio: number;
  avgMonetary: number;
}

export interface CustomerLifecycleData {
  stage: 'new' | 'active' | 'dormant' | 'churned';
  stageLabel: string;
  count: number;
  ratio: number;
  avgDaysSinceLastPurchase: number;
}

export interface MemberGrowthPoint {
  date: string;
  totalCount: number;
  newCount: number;
  growthRate: number;
}

export interface ChurnRiskCustomer {
  customerId: string;
  customerName: string;
  lastPurchaseDate: string;
  purchaseFrequency: number;
  totalMonetary: number;
  daysSinceLastPurchase: number;
  churnProbability: 'high' | 'medium' | 'low';
}

export type AnalyticsDimension = 'time' | 'station' | 'fuel' | 'segment';
export type TimePeriod = 'day' | 'week' | 'month' | 'year';
export type TimeGranularity = 'day' | 'week' | 'month';
export type CompareType = 'yoy' | 'mom' | 'none';
export type RankingMetric = 'revenue' | 'orders' | 'fuelVolume' | 'avgOrderValue';
