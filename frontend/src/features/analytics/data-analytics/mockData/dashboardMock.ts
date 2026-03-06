import type { DashboardData, SalesTrendPoint, FuelTypeBreakdown, StationRankingItem, MemberStats } from '../types';

// 生成近 30 天日期
function generateDates(days: number): string[] {
  const dates: string[] = [];
  const now = new Date('2026-03-05');
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// 近 30 天销售趋势
const salesTrend30d: SalesTrendPoint[] = generateDates(30).map((date, i) => {
  const base = 14000 + Math.sin(i / 7 * Math.PI) * 3000;
  const revenue = Math.round((base + Math.random() * 2000) * 100) / 100;
  const orders = Math.round(100 + Math.random() * 40 + Math.sin(i / 7 * Math.PI) * 20);
  const fuelVolume = Math.round((revenue / 4.5 + Math.random() * 200) * 10) / 10;
  return {
    date,
    revenue,
    orders,
    fuelVolume,
    avgOrderValue: Math.round(revenue / orders * 100) / 100,
  };
});

// 近 12 个月趋势
const salesTrend12m: SalesTrendPoint[] = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  const date = `2025-${String(month).padStart(2, '0')}-01`;
  const base = 380000 + Math.sin(month / 12 * Math.PI * 2) * 50000;
  const revenue = Math.round(base + Math.random() * 30000);
  const orders = Math.round(2800 + Math.random() * 800);
  const fuelVolume = Math.round(revenue / 4.8);
  return {
    date,
    revenue,
    orders,
    fuelVolume,
    avgOrderValue: Math.round(revenue / orders * 100) / 100,
  };
});

const fuelBreakdown: FuelTypeBreakdown[] = [
  { fuelTypeId: 'ft-cng', fuelTypeName: 'CNG', fuelTypeCode: 'CNG', revenue: 218430, revenueRatio: 0.448, volume: 52140, volumeRatio: 0.610 },
  { fuelTypeId: 'ft-92', fuelTypeName: '92#汽油', fuelTypeCode: '92#', revenue: 142180, revenueRatio: 0.292, volume: 20430, volumeRatio: 0.239 },
  { fuelTypeId: 'ft-95', fuelTypeName: '95#汽油', fuelTypeCode: '95#', revenue: 63280, revenueRatio: 0.130, volume: 7820, volumeRatio: 0.092 },
  { fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelTypeCode: 'LNG', revenue: 41600, revenueRatio: 0.085, volume: 3640, volumeRatio: 0.043 },
  { fuelTypeId: 'ft-diesel', fuelTypeName: '0#柴油', fuelTypeCode: '0#柴油', revenue: 21902.5, revenueRatio: 0.045, volume: 1400, volumeRatio: 0.016 },
];

const stationRanking: StationRankingItem[] = [
  { stationId: 'station-001', stationName: '天府大道站', rank: 1, revenue: 198430, orders: 1540, fuelVolume: 35210, avgOrderValue: 128.9 },
  { stationId: 'station-002', stationName: '高新西区站', rank: 2, revenue: 165200, orders: 1280, fuelVolume: 29800, avgOrderValue: 129.1 },
  { stationId: 'station-003', stationName: '龙泉驿站', rank: 3, revenue: 132560, orders: 1020, fuelVolume: 24100, avgOrderValue: 129.9 },
  { stationId: 'station-004', stationName: '双流机场站', rank: 4, revenue: 98750, orders: 780, fuelVolume: 18200, avgOrderValue: 126.6 },
  { stationId: 'station-005', stationName: '温江永宁站', rank: 5, revenue: 72340, orders: 560, fuelVolume: 13100, avgOrderValue: 129.2 },
];

const memberStats: MemberStats = {
  totalMembers: 4821,
  newMembersThisPeriod: 143,
  activeMembers: 2143,
  memberRevenueRatio: 0.634,
};

// KPI 数据 - 日维度
const kpiDay = {
  period: 'day' as const,
  totalRevenue: 16230.5,
  totalOrders: 128,
  totalFuelVolume: 2940.3,
  avgOrderValue: 126.8,
  revenueGrowth: -3.2,
  ordersGrowth: 2.1,
  fuelVolumeGrowth: -1.5,
  avgOrderValueGrowth: -5.1,
};

// KPI 数据 - 月维度
const kpiMonth = {
  period: 'month' as const,
  totalRevenue: 487392.5,
  totalOrders: 3821,
  totalFuelVolume: 85430.2,
  avgOrderValue: 127.56,
  revenueGrowth: 8.3,
  ordersGrowth: 5.1,
  fuelVolumeGrowth: 6.7,
  avgOrderValueGrowth: 3.0,
};

export function getDashboardData(period: string): DashboardData {
  const kpi = period === 'day' ? kpiDay : kpiMonth;
  const trend = period === 'day' || period === 'week' ? salesTrend30d : salesTrend12m;
  return { kpi, salesTrend: trend, fuelBreakdown, stationRanking, memberStats };
}

// 近 7 天 sparkline 数据
export const sparklineData = {
  revenue: salesTrend30d.slice(-7).map(d => d.revenue),
  orders: salesTrend30d.slice(-7).map(d => d.orders),
  fuelVolume: salesTrend30d.slice(-7).map(d => d.fuelVolume),
  avgOrderValue: salesTrend30d.slice(-7).map(d => d.avgOrderValue),
};
