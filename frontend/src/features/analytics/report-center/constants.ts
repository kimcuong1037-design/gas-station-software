import type { ReportType, ReportDataSource, ReportDimension, ReportMetric, ReportTemplateTag } from './types';

// ===== 报表类型配置 =====

export const REPORT_TYPE_CONFIG: Record<ReportType, { color: string; icon: string; labelKey: string }> = {
  daily_operations: { color: 'blue', icon: 'BarChartOutlined', labelKey: 'reportCenter.types.dailyOperations' },
  monthly_operations: { color: 'geekblue', icon: 'LineChartOutlined', labelKey: 'reportCenter.types.monthlyOperations' },
  shift_handover: { color: 'purple', icon: 'SwapOutlined', labelKey: 'reportCenter.types.shiftHandover' },
  inspection: { color: 'orange', icon: 'SafetyCertificateOutlined', labelKey: 'reportCenter.types.inspection' },
  inventory: { color: 'green', icon: 'DatabaseOutlined', labelKey: 'reportCenter.types.inventory' },
  custom: { color: 'default', icon: 'SettingOutlined', labelKey: 'reportCenter.types.custom' },
};

// ===== 数据源配置 =====

export const DATA_SOURCE_CONFIG: Record<ReportDataSource, { color: string; labelKey: string }> = {
  operations: { color: 'blue', labelKey: 'reportCenter.dataSource.operations' },
  inventory: { color: 'green', labelKey: 'reportCenter.dataSource.inventory' },
  inspection: { color: 'orange', labelKey: 'reportCenter.dataSource.inspection' },
};

// ===== 维度选项 (按数据源分组) =====

export const DIMENSION_OPTIONS_BY_SOURCE: Record<ReportDataSource, { value: ReportDimension; labelKey: string }[]> = {
  operations: [
    { value: 'time', labelKey: 'reportCenter.dimension.time' },
    { value: 'station', labelKey: 'reportCenter.dimension.station' },
    { value: 'fuelType', labelKey: 'reportCenter.dimension.fuelType' },
    { value: 'shift', labelKey: 'reportCenter.dimension.shift' },
  ],
  inventory: [
    { value: 'time', labelKey: 'reportCenter.dimension.time' },
    { value: 'station', labelKey: 'reportCenter.dimension.station' },
    { value: 'fuelType', labelKey: 'reportCenter.dimension.fuelType' },
  ],
  inspection: [
    { value: 'time', labelKey: 'reportCenter.dimension.time' },
    { value: 'station', labelKey: 'reportCenter.dimension.station' },
  ],
};

// ===== 指标选项 (按数据源分组) =====

export const METRIC_OPTIONS_BY_SOURCE: Record<ReportDataSource, { value: ReportMetric; labelKey: string }[]> = {
  operations: [
    { value: 'revenue', labelKey: 'reportCenter.kpi.revenue' },
    { value: 'orders', labelKey: 'reportCenter.kpi.orders' },
    { value: 'fuelVolume', labelKey: 'reportCenter.kpi.fuelVolume' },
    { value: 'avgOrderValue', labelKey: 'reportCenter.kpi.avgOrderValue' },
  ],
  inventory: [
    { value: 'inboundVolume', labelKey: 'reportCenter.inventory.inbound' },
    { value: 'outboundVolume', labelKey: 'reportCenter.inventory.outbound' },
    { value: 'lossVolume', labelKey: 'reportCenter.inventory.loss' },
    { value: 'tankLevelRatio', labelKey: 'reportCenter.inventory.tankRatio' },
  ],
  inspection: [
    { value: 'inspectionCompletionRate', labelKey: 'reportCenter.inspection.completionRate' },
    { value: 'issueCount', labelKey: 'reportCenter.inspection.issueCount' },
    { value: 'rectificationRate', labelKey: 'reportCenter.inspection.rectificationRate' },
  ],
};

// ===== 模板标签 =====

export const TEMPLATE_TAG_OPTIONS: { value: ReportTemplateTag; labelKey: string }[] = [
  { value: 'daily', labelKey: 'reportCenter.tag.daily' },
  { value: 'monthly', labelKey: 'reportCenter.tag.monthly' },
  { value: 'special', labelKey: 'reportCenter.tag.special' },
];

// ===== 路由常量 =====

export const REPORT_CENTER_ROUTES = {
  OVERVIEW: '/analytics/report-center/overview',
  STANDARD: '/analytics/report-center/standard',
  CUSTOM: '/analytics/report-center/custom',
} as const;

// ===== 站点选项（Mock，与 7.1 一致） =====

export const STATION_OPTIONS = [
  { value: 'ST001', label: '天府大道站' },
  { value: 'ST002', label: '高新西区站' },
  { value: 'ST003', label: '龙泉驿站' },
  { value: 'ST004', label: '双流机场站' },
  { value: 'ST005', label: '温江永宁站' },
];

// ===== 标准报表 Tab 配置 =====

export const STANDARD_REPORT_TABS: { key: string; labelKey: string }[] = [
  { key: 'daily_operations', labelKey: 'reportCenter.types.dailyOperations' },
  { key: 'monthly_operations', labelKey: 'reportCenter.types.monthlyOperations' },
  { key: 'shift_handover', labelKey: 'reportCenter.types.shiftHandover' },
  { key: 'inspection', labelKey: 'reportCenter.types.inspection' },
  { key: 'inventory', labelKey: 'reportCenter.types.inventory' },
];
