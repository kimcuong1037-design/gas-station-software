import type { DimensionAnalysisRow, TimeSegmentDataPoint, StationRadarData } from '../types';

// ===== 时间维度（12个月） =====

export const timeAnalysisRows: DimensionAnalysisRow[] = [
  { dimensionKey: '2025-04', dimensionLabel: '2025年4月', revenue: 368200, orders: 2920, fuelVolume: 65800, avgOrderValue: 126.1, yoyGrowth: null, momGrowth: null },
  { dimensionKey: '2025-05', dimensionLabel: '2025年5月', revenue: 395400, orders: 3100, fuelVolume: 71200, avgOrderValue: 127.5, yoyGrowth: null, momGrowth: 7.4 },
  { dimensionKey: '2025-06', dimensionLabel: '2025年6月', revenue: 412300, orders: 3250, fuelVolume: 73200, avgOrderValue: 126.9, yoyGrowth: null, momGrowth: 4.3 },
  { dimensionKey: '2025-07', dimensionLabel: '2025年7月', revenue: 438600, orders: 3480, fuelVolume: 78400, avgOrderValue: 126.0, yoyGrowth: null, momGrowth: 6.4 },
  { dimensionKey: '2025-08', dimensionLabel: '2025年8月', revenue: 421500, orders: 3320, fuelVolume: 75600, avgOrderValue: 126.9, yoyGrowth: null, momGrowth: -3.9 },
  { dimensionKey: '2025-09', dimensionLabel: '2025年9月', revenue: 402800, orders: 3180, fuelVolume: 72400, avgOrderValue: 126.7, yoyGrowth: null, momGrowth: -4.4 },
  { dimensionKey: '2025-10', dimensionLabel: '2025年10月', revenue: 418900, orders: 3300, fuelVolume: 74800, avgOrderValue: 126.9, yoyGrowth: null, momGrowth: 4.0 },
  { dimensionKey: '2025-11', dimensionLabel: '2025年11月', revenue: 445200, orders: 3520, fuelVolume: 79200, avgOrderValue: 126.5, yoyGrowth: null, momGrowth: 6.3 },
  { dimensionKey: '2025-12', dimensionLabel: '2025年12月', revenue: 462800, orders: 3620, fuelVolume: 82400, avgOrderValue: 127.8, yoyGrowth: null, momGrowth: 4.0 },
  { dimensionKey: '2026-01', dimensionLabel: '2026年1月', revenue: 412300, orders: 3250, fuelVolume: 73200, avgOrderValue: 126.9, yoyGrowth: 12.4, momGrowth: -10.9 },
  { dimensionKey: '2026-02', dimensionLabel: '2026年2月', revenue: 487392.5, orders: 3821, fuelVolume: 85430.2, avgOrderValue: 127.6, yoyGrowth: 8.3, momGrowth: 18.2 },
  { dimensionKey: '2026-03', dimensionLabel: '2026年3月', revenue: 325800, orders: 2580, fuelVolume: 58200, avgOrderValue: 126.3, yoyGrowth: 5.1, momGrowth: -33.1 },
];

// ===== 站点维度 =====

export const stationAnalysisRows: DimensionAnalysisRow[] = [
  { dimensionKey: 'station-001', dimensionLabel: '天府大道站', revenue: 198430, orders: 1540, fuelVolume: 35210, avgOrderValue: 128.9, yoyGrowth: 12.5, momGrowth: 5.3 },
  { dimensionKey: 'station-002', dimensionLabel: '高新西区站', revenue: 165200, orders: 1280, fuelVolume: 29800, avgOrderValue: 129.1, yoyGrowth: 8.1, momGrowth: 3.2 },
  { dimensionKey: 'station-003', dimensionLabel: '龙泉驿站', revenue: 132560, orders: 1020, fuelVolume: 24100, avgOrderValue: 129.9, yoyGrowth: -2.3, momGrowth: -1.5 },
  { dimensionKey: 'station-004', dimensionLabel: '双流机场站', revenue: 98750, orders: 780, fuelVolume: 18200, avgOrderValue: 126.6, yoyGrowth: 15.2, momGrowth: 8.7 },
  { dimensionKey: 'station-005', dimensionLabel: '温江永宁站', revenue: 72340, orders: 560, fuelVolume: 13100, avgOrderValue: 129.2, yoyGrowth: 6.8, momGrowth: 2.1 },
];

// ===== 品类维度 =====

export const fuelAnalysisRows: DimensionAnalysisRow[] = [
  { dimensionKey: 'CNG', dimensionLabel: 'CNG', revenue: 218430, orders: 1720, fuelVolume: 52140, avgOrderValue: 126.9, yoyGrowth: 10.2, momGrowth: 4.5 },
  { dimensionKey: '92#', dimensionLabel: '92#汽油', revenue: 142180, orders: 1120, fuelVolume: 20430, avgOrderValue: 126.9, yoyGrowth: 5.8, momGrowth: 2.1 },
  { dimensionKey: '95#', dimensionLabel: '95#汽油', revenue: 63280, orders: 480, fuelVolume: 7820, avgOrderValue: 131.8, yoyGrowth: 8.3, momGrowth: 3.7 },
  { dimensionKey: 'LNG', dimensionLabel: 'LNG', revenue: 41600, orders: 310, fuelVolume: 3640, avgOrderValue: 134.2, yoyGrowth: 18.5, momGrowth: 7.2 },
  { dimensionKey: '0#柴油', dimensionLabel: '0#柴油', revenue: 21902.5, orders: 191, fuelVolume: 1400, avgOrderValue: 114.7, yoyGrowth: -3.1, momGrowth: -1.8 },
];

// ===== 时段热力图（48条：24小时 × 工作日/周末） =====

export const timeSegmentData: TimeSegmentDataPoint[] = Array.from({ length: 24 }, (_, hour) => {
  const weekdayBase = hour >= 7 && hour <= 9 ? 2800 : hour >= 11 && hour <= 13 ? 3200 : hour >= 17 && hour <= 19 ? 3500 : hour >= 22 || hour <= 5 ? 400 : 1500;
  const weekendBase = hour >= 9 && hour <= 11 ? 2200 : hour >= 14 && hour <= 16 ? 2500 : hour >= 22 || hour <= 6 ? 300 : 1200;
  return [
    {
      hour,
      dayType: 'weekday' as const,
      avgRevenue: Math.round(weekdayBase + Math.random() * 500),
      avgOrders: Math.round(weekdayBase / 130 + Math.random() * 3),
      peakFlag: weekdayBase >= 2800,
    },
    {
      hour,
      dayType: 'weekend' as const,
      avgRevenue: Math.round(weekendBase + Math.random() * 400),
      avgOrders: Math.round(weekendBase / 140 + Math.random() * 2),
      peakFlag: weekendBase >= 2200,
    },
  ];
}).flat();

// ===== 多站雷达（MVP+） =====

export const stationRadarData: StationRadarData[] = [
  { stationId: 'station-001', stationName: '天府大道站', metrics: { revenueScore: 100, ordersScore: 100, fuelVolumeScore: 100, avgOrderValueScore: 85, growthScore: 72 } },
  { stationId: 'station-002', stationName: '高新西区站', metrics: { revenueScore: 83, ordersScore: 83, fuelVolumeScore: 85, avgOrderValueScore: 88, growthScore: 65 } },
  { stationId: 'station-003', stationName: '龙泉驿站', metrics: { revenueScore: 67, ordersScore: 66, fuelVolumeScore: 68, avgOrderValueScore: 100, growthScore: 40 } },
];
