import type { ReportInstance, CalendarDayData } from '../types';

export const mockReportInstances: ReportInstance[] = [
  // 经营日报
  { id: 'RPT-0001', templateId: null, type: 'daily_operations', title: '2026-03-09 经营日报', period: { startDate: '2026-03-09', endDate: '2026-03-09' }, stationIds: ['ST001', 'ST002', 'ST003'], status: 'generated', isFavorite: true, generatedAt: '2026-03-10T08:00:00Z', generatedBy: 'U001' },
  { id: 'RPT-0002', templateId: null, type: 'daily_operations', title: '2026-03-08 经营日报', period: { startDate: '2026-03-08', endDate: '2026-03-08' }, stationIds: ['ST001', 'ST002', 'ST003'], status: 'generated', isFavorite: false, generatedAt: '2026-03-09T08:00:00Z', generatedBy: 'U001' },
  { id: 'RPT-0003', templateId: null, type: 'daily_operations', title: '2026-03-07 经营日报', period: { startDate: '2026-03-07', endDate: '2026-03-07' }, stationIds: ['ST001', 'ST002', 'ST003'], status: 'exported', isFavorite: false, generatedAt: '2026-03-08T08:00:00Z', generatedBy: 'U001' },
  // 经营月报
  { id: 'RPT-0004', templateId: null, type: 'monthly_operations', title: '2026年2月 经营月报', period: { startDate: '2026-02-01', endDate: '2026-02-28' }, stationIds: ['ST001', 'ST002', 'ST003', 'ST004', 'ST005'], status: 'generated', isFavorite: true, generatedAt: '2026-03-02T10:00:00Z', generatedBy: 'U001' },
  { id: 'RPT-0005', templateId: null, type: 'monthly_operations', title: '2026年1月 经营月报', period: { startDate: '2026-01-01', endDate: '2026-01-31' }, stationIds: ['ST001', 'ST002', 'ST003', 'ST004', 'ST005'], status: 'exported', isFavorite: false, generatedAt: '2026-02-02T10:00:00Z', generatedBy: 'U001' },
  // 交接班报表
  { id: 'RPT-0006', templateId: null, type: 'shift_handover', title: '2026-03-09 交接班报表', period: { startDate: '2026-03-09', endDate: '2026-03-09' }, stationIds: ['ST001'], status: 'generated', isFavorite: false, generatedAt: '2026-03-10T06:00:00Z', generatedBy: 'U002' },
  { id: 'RPT-0007', templateId: null, type: 'shift_handover', title: '2026-03-08 交接班报表', period: { startDate: '2026-03-08', endDate: '2026-03-08' }, stationIds: ['ST001'], status: 'generated', isFavorite: false, generatedAt: '2026-03-09T06:00:00Z', generatedBy: 'U002' },
  // 巡检报表
  { id: 'RPT-0008', templateId: null, type: 'inspection', title: '2026年3月第1周 巡检报表', period: { startDate: '2026-03-03', endDate: '2026-03-09' }, stationIds: ['ST001', 'ST002', 'ST003'], status: 'generated', isFavorite: true, generatedAt: '2026-03-10T09:00:00Z', generatedBy: 'U003' },
  { id: 'RPT-0009', templateId: null, type: 'inspection', title: '2026年2月 巡检报表', period: { startDate: '2026-02-01', endDate: '2026-02-28' }, stationIds: ['ST001', 'ST002', 'ST003'], status: 'exported', isFavorite: false, generatedAt: '2026-03-01T09:00:00Z', generatedBy: 'U003' },
  // 库存报表
  { id: 'RPT-0010', templateId: null, type: 'inventory', title: '2026-03-03~09 库存报表', period: { startDate: '2026-03-03', endDate: '2026-03-09' }, stationIds: ['ST001', 'ST002', 'ST003'], status: 'generated', isFavorite: false, generatedAt: '2026-03-10T07:00:00Z', generatedBy: 'U001' },
  // 自定义报表
  { id: 'RPT-0011', templateId: 'RPT-TPL-0001', type: 'custom', title: '2月站点对比分析', period: { startDate: '2026-02-01', endDate: '2026-02-28' }, stationIds: ['ST001', 'ST002', 'ST003'], status: 'generated', isFavorite: false, generatedAt: '2026-03-05T15:00:00Z', generatedBy: 'U001' },
  { id: 'RPT-0012', templateId: 'RPT-TPL-0002', type: 'custom', title: '3月第1周损耗分析', period: { startDate: '2026-03-03', endDate: '2026-03-09' }, stationIds: ['ST001', 'ST002'], status: 'generated', isFavorite: false, generatedAt: '2026-03-10T11:00:00Z', generatedBy: 'U001' },
];

// 日历视图 mock 数据
export const mockCalendarData: CalendarDayData[] = [
  { date: '2026-03-01', reports: [{ type: 'daily_operations', count: 1 }, { type: 'inspection', count: 1 }] },
  { date: '2026-03-02', reports: [{ type: 'daily_operations', count: 1 }, { type: 'monthly_operations', count: 1 }] },
  { date: '2026-03-03', reports: [{ type: 'daily_operations', count: 1 }] },
  { date: '2026-03-04', reports: [{ type: 'daily_operations', count: 1 }] },
  { date: '2026-03-05', reports: [{ type: 'daily_operations', count: 1 }, { type: 'custom', count: 1 }] },
  { date: '2026-03-06', reports: [{ type: 'daily_operations', count: 1 }, { type: 'shift_handover', count: 3 }] },
  { date: '2026-03-07', reports: [{ type: 'daily_operations', count: 1 }] },
  { date: '2026-03-08', reports: [{ type: 'daily_operations', count: 1 }, { type: 'shift_handover', count: 3 }] },
  { date: '2026-03-09', reports: [{ type: 'daily_operations', count: 1 }, { type: 'shift_handover', count: 3 }, { type: 'inventory', count: 1 }, { type: 'inspection', count: 1 }] },
  { date: '2026-03-10', reports: [{ type: 'daily_operations', count: 1 }, { type: 'inventory', count: 1 }, { type: 'custom', count: 1 }] },
];
