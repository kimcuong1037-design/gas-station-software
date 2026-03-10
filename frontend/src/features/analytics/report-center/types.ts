// 报表中心模块类型定义 — 基于 architecture.md 数据模型

// ===== 报表模板 (ReportTemplate) =====

export type ReportDataSource = 'operations' | 'inventory' | 'inspection';
export type ReportDimension = 'time' | 'station' | 'fuelType' | 'shift';
export type ReportMetric =
  | 'revenue' | 'orders' | 'fuelVolume' | 'avgOrderValue'
  | 'inboundVolume' | 'outboundVolume' | 'lossVolume' | 'tankLevelRatio'
  | 'inspectionCompletionRate' | 'issueCount' | 'rectificationRate';
export type TimeGranularity = 'day' | 'week' | 'month';
export type ReportTemplateTag = 'daily' | 'monthly' | 'special';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  dataSource: ReportDataSource;
  dimensions: ReportDimension[];
  metrics: ReportMetric[];
  timeGranularity: TimeGranularity;
  defaultFilters: {
    stationIds?: string[];
    defaultPeriodDays?: number;
  };
  tag: ReportTemplateTag;
  isSystem: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ===== 报表实例 (ReportInstance) =====

export type ReportType = 'daily_operations' | 'monthly_operations' | 'shift_handover' | 'inspection' | 'inventory' | 'custom';
export type ReportStatus = 'generated' | 'exported';

export interface ReportInstance {
  id: string;
  templateId: string | null;
  type: ReportType;
  title: string;
  period: {
    startDate: string;
    endDate: string;
  };
  stationIds: string[];
  status: ReportStatus;
  isFavorite: boolean;
  generatedAt: string;
  generatedBy: string;
}

// ===== 标准报表专用数据结构 =====

export interface OperationsReportData {
  kpiSummary: {
    totalRevenue: number;
    totalOrders: number;
    totalFuelVolume: number;
    avgOrderValue: number;
    revenueGrowth: number | null;
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
  dailyTrend?: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export interface ShiftReportData {
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

export interface InspectionReportData {
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

export interface InventoryReportData {
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

// ===== 自定义报表数据 =====

export interface CustomReportRow {
  dimensionKey: string;
  dimensionLabel: string;
  [metricKey: string]: string | number;
}

export interface CustomReportData {
  summary: Record<string, number>;
  rows: CustomReportRow[];
}

// ===== 日历视图 =====

export interface CalendarDayData {
  date: string;
  reports: Array<{
    type: ReportType;
    count: number;
  }>;
}
