import type { OperationsReportData, ShiftReportData, InspectionReportData, InventoryReportData, CustomReportData } from '../types';

// ===== 经营日报 Mock =====
export const mockDailyOperationsData: OperationsReportData = {
  kpiSummary: {
    totalRevenue: 156280.50,
    totalOrders: 1234,
    totalFuelVolume: 28430.5,
    avgOrderValue: 126.65,
    revenueGrowth: 5.2,
    ordersGrowth: 3.8,
  },
  stationBreakdown: [
    { stationId: 'ST001', stationName: '天府大道站', revenue: 62512.20, orders: 485, fuelVolume: 11210.3, avgOrderValue: 128.89 },
    { stationId: 'ST002', stationName: '高新西区站', revenue: 48930.10, orders: 392, fuelVolume: 9130.5, avgOrderValue: 124.82 },
    { stationId: 'ST003', stationName: '龙泉驿站', revenue: 44838.20, orders: 357, fuelVolume: 8089.7, avgOrderValue: 125.60 },
  ],
  fuelTypeBreakdown: [
    { fuelTypeName: 'CNG', revenue: 70326.23, revenueRatio: 0.45, volume: 17058.3 },
    { fuelTypeName: '92#汽油', revenue: 43758.54, revenueRatio: 0.28, volume: 5700.1 },
    { fuelTypeName: '95#汽油', revenue: 25006.48, revenueRatio: 0.16, volume: 2843.1 },
    { fuelTypeName: '0#柴油', revenue: 12502.93, revenueRatio: 0.08, volume: 2272.5 },
    { fuelTypeName: 'LNG', revenue: 4686.32, revenueRatio: 0.03, volume: 556.5 },
  ],
};

// ===== 经营月报 Mock =====
export const mockMonthlyOperationsData: OperationsReportData = {
  kpiSummary: {
    totalRevenue: 4873920.50,
    totalOrders: 38210,
    totalFuelVolume: 854302.0,
    avgOrderValue: 127.56,
    revenueGrowth: 8.3,
    ordersGrowth: 5.1,
  },
  stationBreakdown: [
    { stationId: 'ST001', stationName: '天府大道站', revenue: 1984300.00, orders: 15400, fuelVolume: 352100.0, avgOrderValue: 128.85 },
    { stationId: 'ST002', stationName: '高新西区站', revenue: 1289000.00, orders: 10100, fuelVolume: 233400.0, avgOrderValue: 127.62 },
    { stationId: 'ST003', stationName: '龙泉驿站', revenue: 876120.50, orders: 6820, fuelVolume: 152300.0, avgOrderValue: 128.46 },
    { stationId: 'ST004', stationName: '双流机场站', revenue: 438000.00, orders: 3510, fuelVolume: 72800.0, avgOrderValue: 124.79 },
    { stationId: 'ST005', stationName: '温江永宁站', revenue: 286500.00, orders: 2380, fuelVolume: 43702.0, avgOrderValue: 120.38 },
  ],
  fuelTypeBreakdown: [
    { fuelTypeName: 'CNG', revenue: 2193264.23, revenueRatio: 0.45, volume: 512580.0 },
    { fuelTypeName: '92#汽油', revenue: 1364697.74, revenueRatio: 0.28, volume: 171200.0 },
    { fuelTypeName: '95#汽油', revenue: 779827.28, revenueRatio: 0.16, volume: 85430.0 },
    { fuelTypeName: '0#柴油', revenue: 389913.64, revenueRatio: 0.08, volume: 68344.0 },
    { fuelTypeName: 'LNG', revenue: 146217.62, revenueRatio: 0.03, volume: 16748.0 },
  ],
  dailyTrend: Array.from({ length: 28 }, (_, i) => ({
    date: `2026-02-${String(i + 1).padStart(2, '0')}`,
    revenue: 150000 + Math.round(Math.random() * 50000),
    orders: 1200 + Math.round(Math.random() * 400),
  })),
};

// ===== 交接班报表 Mock =====
export const mockShiftReportData: ShiftReportData = {
  shifts: [
    { shiftName: '早班', date: '2026-03-09', operatorName: '张三', revenue: 52430.20, orders: 412, fuelVolume: 9540.3, cashAmount: 5243.00, onlineAmount: 36701.14, cardAmount: 10486.06 },
    { shiftName: '中班', date: '2026-03-09', operatorName: '李四', revenue: 58210.80, orders: 458, fuelVolume: 10620.5, cashAmount: 8731.62, onlineAmount: 37837.02, cardAmount: 11642.16 },
    { shiftName: '晚班', date: '2026-03-09', operatorName: '王五', revenue: 45639.50, orders: 364, fuelVolume: 8269.7, cashAmount: 4563.95, onlineAmount: 32947.68, cardAmount: 8127.87 },
  ],
  paymentDistribution: [
    { method: '在线支付', amount: 107485.84, ratio: 0.688 },
    { method: '刷卡', amount: 30256.09, ratio: 0.194 },
    { method: '现金', amount: 18538.57, ratio: 0.119 },
  ],
};

// ===== 巡检报表 Mock =====
export const mockInspectionReportData: InspectionReportData = {
  summary: {
    totalPlanned: 42,
    totalCompleted: 38,
    completionRate: 90.5,
    totalIssues: 15,
    rectifiedIssues: 11,
    rectificationRate: 73.3,
  },
  areaBreakdown: [
    { area: 'tank_area', areaLabel: '储罐区', issueCount: 5, criticalCount: 2, rectifiedCount: 3 },
    { area: 'dispenser', areaLabel: '加注机区', issueCount: 4, criticalCount: 1, rectifiedCount: 3 },
    { area: 'power_room', areaLabel: '配电室', issueCount: 2, criticalCount: 0, rectifiedCount: 2 },
    { area: 'fueling_area', areaLabel: '充装区', issueCount: 3, criticalCount: 1, rectifiedCount: 2 },
    { area: 'equipment', areaLabel: '设备设施', issueCount: 1, criticalCount: 0, rectifiedCount: 1 },
  ],
  unresolvedCritical: [
    { inspectionId: 'INS-0089', area: '储罐区', description: '1号储罐压力表读数偏高，需校准', severity: 'high', discoveredDate: '2026-03-05', daysPending: 5 },
    { inspectionId: 'INS-0092', area: '储罐区', description: '2号储罐安全阀泄漏检测异常', severity: 'urgent', discoveredDate: '2026-03-07', daysPending: 3 },
    { inspectionId: 'INS-0094', area: '加注机区', description: '3号加注机接地电阻超标', severity: 'high', discoveredDate: '2026-03-08', daysPending: 2 },
    { inspectionId: 'INS-0096', area: '充装区', description: '充装区消防栓水压不足', severity: 'high', discoveredDate: '2026-03-09', daysPending: 1 },
  ],
};

// ===== 库存报表 Mock =====
export const mockInventoryReportData: InventoryReportData = {
  summary: {
    totalInbound: 45320.0,
    totalOutbound: 42180.0,
    totalLoss: 285.5,
    endingInventory: 128540.0,
  },
  stationFuelBreakdown: [
    { stationId: 'ST001', stationName: '天府大道站', fuelTypeName: 'CNG', inboundVolume: 12500.0, outboundVolume: 11800.0, lossVolume: 45.0, endingVolume: 35200.0, tankLevelRatio: 0.72, abnormalLoss: false },
    { stationId: 'ST001', stationName: '天府大道站', fuelTypeName: '92#汽油', inboundVolume: 5000.0, outboundVolume: 4600.0, lossVolume: 12.0, endingVolume: 12800.0, tankLevelRatio: 0.64, abnormalLoss: false },
    { stationId: 'ST002', stationName: '高新西区站', fuelTypeName: 'CNG', inboundVolume: 10000.0, outboundVolume: 9500.0, lossVolume: 38.0, endingVolume: 28900.0, tankLevelRatio: 0.68, abnormalLoss: false },
    { stationId: 'ST002', stationName: '高新西区站', fuelTypeName: '92#汽油', inboundVolume: 4200.0, outboundVolume: 3800.0, lossVolume: 85.0, endingVolume: 10400.0, tankLevelRatio: 0.52, abnormalLoss: true },
    { stationId: 'ST003', stationName: '龙泉驿站', fuelTypeName: 'CNG', inboundVolume: 8000.0, outboundVolume: 7200.0, lossVolume: 32.0, endingVolume: 22500.0, tankLevelRatio: 0.75, abnormalLoss: false },
    { stationId: 'ST003', stationName: '龙泉驿站', fuelTypeName: 'LNG', inboundVolume: 3200.0, outboundVolume: 3080.0, lossVolume: 58.5, endingVolume: 8200.0, tankLevelRatio: 0.41, abnormalLoss: true },
    { stationId: 'ST003', stationName: '龙泉驿站', fuelTypeName: '0#柴油', inboundVolume: 2420.0, outboundVolume: 2200.0, lossVolume: 15.0, endingVolume: 10540.0, tankLevelRatio: 0.58, abnormalLoss: false },
  ],
  tankLevelTrend: Array.from({ length: 7 }, (_, i) => ({
    date: `2026-03-${String(i + 3).padStart(2, '0')}`,
    stationId: 'ST001',
    tankLevelRatio: 0.65 + Math.random() * 0.15,
  })),
};

// ===== 自定义报表 Mock =====
export const mockCustomReportData: CustomReportData = {
  summary: { revenue: 4873920.50, orders: 38210, fuelVolume: 854302.0 },
  rows: [
    { dimensionKey: 'ST001', dimensionLabel: '天府大道站', revenue: 1984300.00, orders: 15400, fuelVolume: 352100.0 },
    { dimensionKey: 'ST002', dimensionLabel: '高新西区站', revenue: 1289000.00, orders: 10100, fuelVolume: 233400.0 },
    { dimensionKey: 'ST003', dimensionLabel: '龙泉驿站', revenue: 876120.50, orders: 6820, fuelVolume: 152300.0 },
    { dimensionKey: 'ST004', dimensionLabel: '双流机场站', revenue: 438000.00, orders: 3510, fuelVolume: 72800.0 },
    { dimensionKey: 'ST005', dimensionLabel: '温江永宁站', revenue: 286500.00, orders: 2380, fuelVolume: 43702.0 },
  ],
};
