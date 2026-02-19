// 巡检/安检管理模块 — Mock 数据

import type {
  InspectionPlan,
  InspectionTask,
  CheckItem,
  InspectionTag,
  InspectionLog,
  IssueRecord,
  TaskStats,
  DailyReportData,
  StationReportData,
  InspectionReport,
} from '../features/operations/inspection/types';

// ============================================================
// 巡检标签
// ============================================================

export const inspectionTags: InspectionTag[] = [
  { id: 'tag-001', name: '安全', stationId: 'station-001', sortOrder: 1, usageCount: 12, createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'tag-002', name: '日检', stationId: 'station-001', sortOrder: 2, usageCount: 18, createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'tag-003', name: '设备', stationId: 'station-001', sortOrder: 3, usageCount: 8, createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'tag-004', name: '环保', stationId: 'station-001', sortOrder: 4, usageCount: 6, createdAt: '2026-01-20T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'tag-005', name: '消防', stationId: 'station-001', sortOrder: 5, usageCount: 5, createdAt: '2026-01-20T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'tag-006', name: '月检', stationId: 'station-001', sortOrder: 6, usageCount: 3, createdAt: '2026-02-01T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
];

// ============================================================
// 检查项目
// ============================================================

export const checkItems: CheckItem[] = [
  // 罐区环保
  { id: 'ci-001', name: 'LNG储罐#1外观检查', category: 'tank_area', description: '检查储罐外壁有无凹陷、腐蚀、结霜异常、阀门泄漏', stationId: 'station-001', equipment: { id: 'equip-001', name: 'LNG储罐#1', deviceCode: 'DEV-TANK-001' }, tags: [{ id: 'tag-001', name: '安全' }, { id: 'tag-002', name: '日检' }], sortOrder: 1, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'ci-002', name: 'LNG储罐#2外观检查', category: 'tank_area', description: '检查储罐外壁有无凹陷、腐蚀、结霜异常、阀门泄漏', stationId: 'station-001', equipment: { id: 'equip-002', name: 'LNG储罐#2', deviceCode: 'DEV-TANK-002' }, tags: [{ id: 'tag-001', name: '安全' }, { id: 'tag-002', name: '日检' }], sortOrder: 2, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'ci-003', name: '罐区防泄漏设施检查', category: 'tank_area', description: '检查泄漏报警器、围堰完好性、排水沟畅通', stationId: 'station-001', equipment: null, tags: [{ id: 'tag-001', name: '安全' }, { id: 'tag-004', name: '环保' }], sortOrder: 3, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'ci-004', name: '罐区通风设施检查', category: 'tank_area', description: '检查罐区通风扇运行正常、排风口无堵塞', stationId: 'station-001', equipment: null, tags: [{ id: 'tag-001', name: '安全' }], sortOrder: 4, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'ci-005', name: '罐区消防器材检查', category: 'tank_area', description: '检查灭火器压力、干粉有效期、消防水带完好', stationId: 'station-001', equipment: null, tags: [{ id: 'tag-005', name: '消防' }], sortOrder: 5, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  // 加气机
  { id: 'ci-006', name: '加气机#01运行检查', category: 'dispenser', description: '检查加气枪连接件密封、软管无裂纹、流量计显示正常', stationId: 'station-001', equipment: { id: 'equip-004', name: '加气机#01', deviceCode: 'DEV-DISP-001' }, tags: [{ id: 'tag-002', name: '日检' }, { id: 'tag-003', name: '设备' }], sortOrder: 6, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'ci-007', name: '加气机#02运行检查', category: 'dispenser', description: '检查加气枪连接件密封、软管无裂纹、流量计显示正常', stationId: 'station-001', equipment: { id: 'equip-005', name: '加气机#02', deviceCode: 'DEV-DISP-002' }, tags: [{ id: 'tag-002', name: '日检' }, { id: 'tag-003', name: '设备' }], sortOrder: 7, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'ci-008', name: '加气机#03运行检查', category: 'dispenser', description: '检查加气枪连接件密封、软管无裂纹、流量计显示正常', stationId: 'station-001', equipment: { id: 'equip-006', name: '加气机#03', deviceCode: 'DEV-DISP-003' }, tags: [{ id: 'tag-002', name: '日检' }, { id: 'tag-003', name: '设备' }], sortOrder: 8, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'ci-009', name: '加气机安全截止阀检查', category: 'dispenser', description: '检查紧急切断阀功能是否正常、手动开关灵活', stationId: 'station-001', equipment: null, tags: [{ id: 'tag-001', name: '安全' }], sortOrder: 9, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  // 配电室
  { id: 'ci-010', name: '配电柜温度检查', category: 'power_room', description: '检查配电柜内温度是否在正常范围（≤40℃）', stationId: 'station-001', equipment: null, tags: [{ id: 'tag-002', name: '日检' }], sortOrder: 10, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'ci-011', name: '应急电源测试', category: 'power_room', description: '切换测试UPS电源、应急灯是否正常启动', stationId: 'station-001', equipment: null, tags: [{ id: 'tag-001', name: '安全' }, { id: 'tag-006', name: '月检' }], sortOrder: 11, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'ci-012', name: '接地电阻检测', category: 'power_room', description: '检测接地电阻值是否符合标准（≤4Ω）', stationId: 'station-001', equipment: null, tags: [{ id: 'tag-001', name: '安全' }, { id: 'tag-006', name: '月检' }], sortOrder: 12, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  // 加油区域
  { id: 'ci-013', name: '加气岛地面检查', category: 'fueling_area', description: '检查地面无积油、无裂缝、排水通畅', stationId: 'station-001', equipment: null, tags: [{ id: 'tag-004', name: '环保' }], sortOrder: 13, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'ci-014', name: '安全标识标牌检查', category: 'fueling_area', description: '检查禁烟标识、防护距离标线、操作规程公示完好', stationId: 'station-001', equipment: null, tags: [{ id: 'tag-001', name: '安全' }], sortOrder: 14, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'ci-015', name: '车辆引导设施检查', category: 'fueling_area', description: '检查导向标识、护栏、减速带完好', stationId: 'station-001', equipment: null, tags: [], sortOrder: 15, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  // 非油管理
  { id: 'ci-016', name: '便利店卫生检查', category: 'non_fuel', description: '检查货架整洁、食品保质期、冷柜温度', stationId: 'station-001', equipment: null, tags: [], sortOrder: 16, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'ci-017', name: '卫生间清洁检查', category: 'non_fuel', description: '检查卫生间清洁状况、用品补充、设施完好', stationId: 'station-001', equipment: null, tags: [], sortOrder: 17, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  // 设备管理
  { id: 'ci-018', name: '压缩机运行检查', category: 'equipment', description: '检查压缩机运行声音、振动、油位、温度', stationId: 'station-001', equipment: { id: 'equip-007', name: '高压压缩机', deviceCode: 'DEV-PUMP-001' }, tags: [{ id: 'tag-003', name: '设备' }], sortOrder: 18, status: 'active', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-18T10:00:00Z' },
  { id: 'ci-019', name: '阀门状态检查（已停用）', category: 'equipment', description: '检查各类阀门开闭状态标识', stationId: 'station-001', equipment: null, tags: [{ id: 'tag-003', name: '设备' }], sortOrder: 19, status: 'inactive', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-02-15T10:00:00Z' },
];

// ============================================================
// 安检计划
// ============================================================

export const inspectionPlans: InspectionPlan[] = [
  {
    id: 'plan-001',
    planNo: 'IP-HZXH-202602-001',
    name: '2026年2月日常巡检计划',
    stationId: 'station-001',
    stationName: '杭州西湖加气站',
    cycleType: 'daily',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    status: 'in_progress',
    description: '每日对站点关键设施进行安全巡检，涵盖罐区、加气机、配电室等区域',
    checkItemIds: ['ci-001', 'ci-002', 'ci-003', 'ci-006', 'ci-007', 'ci-008', 'ci-010', 'ci-013', 'ci-014'],
    checkItemCount: 9,
    createdBy: { id: 'user-002', name: '王安全主管' },
    createdAt: '2026-01-28T10:00:00Z',
    updatedAt: '2026-02-19T08:00:00Z',
  },
  {
    id: 'plan-002',
    planNo: 'IP-HZXH-202602-002',
    name: '2026年2月设备月检计划',
    stationId: 'station-001',
    stationName: '杭州西湖加气站',
    cycleType: 'monthly',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    status: 'in_progress',
    description: '每月对配电室、消防设施、特种设备等进行深度检查',
    checkItemIds: ['ci-004', 'ci-005', 'ci-009', 'ci-011', 'ci-012', 'ci-018'],
    checkItemCount: 6,
    createdBy: { id: 'user-002', name: '王安全主管' },
    createdAt: '2026-01-28T10:00:00Z',
    updatedAt: '2026-02-10T14:00:00Z',
  },
  {
    id: 'plan-003',
    planNo: 'IP-HZXH-202603-001',
    name: '2026年3月日常巡检计划',
    stationId: 'station-001',
    stationName: '杭州西湖加气站',
    cycleType: 'daily',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    status: 'pending',
    description: null,
    checkItemIds: ['ci-001', 'ci-002', 'ci-003', 'ci-006', 'ci-007', 'ci-008', 'ci-010', 'ci-013', 'ci-014', 'ci-015'],
    checkItemCount: 10,
    createdBy: { id: 'user-002', name: '王安全主管' },
    createdAt: '2026-02-18T16:00:00Z',
    updatedAt: '2026-02-18T16:00:00Z',
  },
  {
    id: 'plan-004',
    planNo: 'IP-HZXH-202601-001',
    name: '2026年1月日常巡检计划',
    stationId: 'station-001',
    stationName: '杭州西湖加气站',
    cycleType: 'daily',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    status: 'completed',
    description: '1月份日常巡检',
    checkItemIds: ['ci-001', 'ci-002', 'ci-006', 'ci-007', 'ci-010', 'ci-013', 'ci-014'],
    checkItemCount: 7,
    createdBy: { id: 'user-002', name: '王安全主管' },
    createdAt: '2025-12-28T10:00:00Z',
    updatedAt: '2026-01-31T18:00:00Z',
  },
];

// ============================================================
// 安检任务
// ============================================================

const todayStr = '2026-02-19';

const plan001CheckItemIds = ['ci-001', 'ci-002', 'ci-003', 'ci-006', 'ci-007', 'ci-008', 'ci-010', 'ci-013', 'ci-014'];
const plan002CheckItemIds = ['ci-004', 'ci-005', 'ci-009', 'ci-011', 'ci-012', 'ci-018'];

export const inspectionTasks: InspectionTask[] = [
  {
    id: 'task-001',
    taskNo: 'IT-HZXH-0219-001',
    planId: 'plan-001',
    plan: { id: 'plan-001', planNo: 'IP-HZXH-202602-001', name: '2026年2月日常巡检计划' },
    stationId: 'station-001',
    assignee: { id: 'user-003', name: '张三' },
    checkItemIds: plan001CheckItemIds,
    status: 'in_progress',
    dueDate: todayStr,
    startedAt: '2026-02-19T08:30:00Z',
    completedAt: null,
    totalItems: 9,
    checkedItems: 5,
    normalItems: 4,
    abnormalItems: 1,
    remark: null,
    createdBy: { id: 'user-002', name: '王安全主管' },
    createdAt: '2026-02-19T06:00:00Z',
    updatedAt: '2026-02-19T09:00:00Z',
    logs: [],
  },
  {
    id: 'task-002',
    taskNo: 'IT-HZXH-0219-002',
    planId: 'plan-001',
    plan: { id: 'plan-001', planNo: 'IP-HZXH-202602-001', name: '2026年2月日常巡检计划' },
    stationId: 'station-001',
    assignee: { id: 'user-004', name: '李巡检' },
    checkItemIds: plan001CheckItemIds,
    status: 'pending',
    dueDate: todayStr,
    startedAt: null,
    completedAt: null,
    totalItems: 9,
    checkedItems: 0,
    normalItems: 0,
    abnormalItems: 0,
    remark: null,
    createdBy: { id: 'user-002', name: '王安全主管' },
    createdAt: '2026-02-19T06:00:00Z',
    updatedAt: '2026-02-19T06:00:00Z',
    logs: [],
  },
  {
    id: 'task-003',
    taskNo: 'IT-HZXH-0218-001',
    planId: 'plan-001',
    plan: { id: 'plan-001', planNo: 'IP-HZXH-202602-001', name: '2026年2月日常巡检计划' },
    stationId: 'station-001',
    assignee: { id: 'user-003', name: '张三' },
    checkItemIds: plan001CheckItemIds,
    status: 'completed',
    dueDate: '2026-02-18',
    startedAt: '2026-02-18T08:15:00Z',
    completedAt: '2026-02-18T10:30:00Z',
    totalItems: 9,
    checkedItems: 9,
    normalItems: 8,
    abnormalItems: 1,
    remark: null,
    createdBy: { id: 'user-002', name: '王安全主管' },
    createdAt: '2026-02-18T06:00:00Z',
    updatedAt: '2026-02-18T10:30:00Z',
    logs: [],
  },
  {
    id: 'task-004',
    taskNo: 'IT-HZXH-0217-001',
    planId: 'plan-001',
    plan: { id: 'plan-001', planNo: 'IP-HZXH-202602-001', name: '2026年2月日常巡检计划' },
    stationId: 'station-001',
    assignee: null,
    checkItemIds: plan001CheckItemIds,
    status: 'pending',
    dueDate: '2026-02-17',
    startedAt: null,
    completedAt: null,
    totalItems: 9,
    checkedItems: 0,
    normalItems: 0,
    abnormalItems: 0,
    remark: null,
    createdBy: { id: 'user-002', name: '王安全主管' },
    createdAt: '2026-02-17T06:00:00Z',
    updatedAt: '2026-02-17T06:00:00Z',
    logs: [],
  },
  {
    id: 'task-005',
    taskNo: 'IT-HZXH-0219-003',
    planId: 'plan-002',
    plan: { id: 'plan-002', planNo: 'IP-HZXH-202602-002', name: '2026年2月设备月检计划' },
    stationId: 'station-001',
    assignee: { id: 'user-004', name: '李巡检' },
    checkItemIds: plan002CheckItemIds,
    status: 'pending',
    dueDate: '2026-02-20',
    startedAt: null,
    completedAt: null,
    totalItems: 6,
    checkedItems: 0,
    normalItems: 0,
    abnormalItems: 0,
    remark: null,
    createdBy: { id: 'user-002', name: '王安全主管' },
    createdAt: '2026-02-19T06:00:00Z',
    updatedAt: '2026-02-19T06:00:00Z',
    logs: [],
  },
  {
    id: 'task-006',
    taskNo: 'IT-HZXH-0218-002',
    planId: 'plan-001',
    plan: { id: 'plan-001', planNo: 'IP-HZXH-202602-001', name: '2026年2月日常巡检计划' },
    stationId: 'station-001',
    assignee: { id: 'user-004', name: '李巡检' },
    checkItemIds: plan001CheckItemIds,
    status: 'completed',
    dueDate: '2026-02-18',
    startedAt: '2026-02-18T08:00:00Z',
    completedAt: '2026-02-18T09:45:00Z',
    totalItems: 9,
    checkedItems: 9,
    normalItems: 9,
    abnormalItems: 0,
    remark: null,
    createdBy: { id: 'user-002', name: '王安全主管' },
    createdAt: '2026-02-18T06:00:00Z',
    updatedAt: '2026-02-18T09:45:00Z',
    logs: [],
  },
];

// 为任务 task-001 填充巡检日志（执行页面使用）
const task001Logs: InspectionLog[] = [
  { id: 'log-001', taskId: 'task-001', task: { id: 'task-001', taskNo: 'IT-HZXH-0219-001' }, checkItemId: 'ci-001', checkItem: { id: 'ci-001', name: 'LNG储罐#1外观检查', category: 'tank_area', description: '检查储罐外壁有无凹陷、腐蚀、结霜异常、阀门泄漏' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'normal', remark: null, executedAt: '2026-02-19T08:30:00Z', createdAt: '2026-02-19T08:30:00Z', updatedAt: '2026-02-19T08:30:00Z' },
  { id: 'log-002', taskId: 'task-001', task: { id: 'task-001', taskNo: 'IT-HZXH-0219-001' }, checkItemId: 'ci-002', checkItem: { id: 'ci-002', name: 'LNG储罐#2外观检查', category: 'tank_area', description: '检查储罐外壁有无凹陷、腐蚀、结霜异常、阀门泄漏' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'normal', remark: null, executedAt: '2026-02-19T08:35:00Z', createdAt: '2026-02-19T08:35:00Z', updatedAt: '2026-02-19T08:35:00Z' },
  { id: 'log-003', taskId: 'task-001', task: { id: 'task-001', taskNo: 'IT-HZXH-0219-001' }, checkItemId: 'ci-003', checkItem: { id: 'ci-003', name: '罐区防泄漏设施检查', category: 'tank_area', description: '检查泄漏报警器、围堰完好性、排水沟畅通' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'normal', remark: null, executedAt: '2026-02-19T08:40:00Z', createdAt: '2026-02-19T08:40:00Z', updatedAt: '2026-02-19T08:40:00Z' },
  { id: 'log-004', taskId: 'task-001', task: { id: 'task-001', taskNo: 'IT-HZXH-0219-001' }, checkItemId: 'ci-006', checkItem: { id: 'ci-006', name: '加气机#01运行检查', category: 'dispenser', description: '检查加气枪连接件密封、软管无裂纹、流量计显示正常' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'normal', remark: null, executedAt: '2026-02-19T08:45:00Z', createdAt: '2026-02-19T08:45:00Z', updatedAt: '2026-02-19T08:45:00Z' },
  { id: 'log-005', taskId: 'task-001', task: { id: 'task-001', taskNo: 'IT-HZXH-0219-001' }, checkItemId: 'ci-007', checkItem: { id: 'ci-007', name: '加气机#02运行检查', category: 'dispenser', description: '检查加气枪连接件密封、软管无裂纹、流量计显示正常' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'abnormal', remark: '加气枪#2有微量泄漏，需要更换密封圈', executedAt: '2026-02-19T08:50:00Z', createdAt: '2026-02-19T08:50:00Z', updatedAt: '2026-02-19T08:50:00Z' },
  // 以下为待检查项
  { id: 'log-006', taskId: 'task-001', task: { id: 'task-001', taskNo: 'IT-HZXH-0219-001' }, checkItemId: 'ci-008', checkItem: { id: 'ci-008', name: '加气机#03运行检查', category: 'dispenser', description: '检查加气枪连接件密封、软管无裂纹、流量计显示正常' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'pending', remark: null, executedAt: null, createdAt: '2026-02-19T06:00:00Z', updatedAt: '2026-02-19T06:00:00Z' },
  { id: 'log-007', taskId: 'task-001', task: { id: 'task-001', taskNo: 'IT-HZXH-0219-001' }, checkItemId: 'ci-010', checkItem: { id: 'ci-010', name: '配电柜温度检查', category: 'power_room', description: '检查配电柜内温度是否在正常范围（≤40℃）' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'pending', remark: null, executedAt: null, createdAt: '2026-02-19T06:00:00Z', updatedAt: '2026-02-19T06:00:00Z' },
  { id: 'log-008', taskId: 'task-001', task: { id: 'task-001', taskNo: 'IT-HZXH-0219-001' }, checkItemId: 'ci-013', checkItem: { id: 'ci-013', name: '加气岛地面检查', category: 'fueling_area', description: '检查地面无积油、无裂缝、排水通畅' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'pending', remark: null, executedAt: null, createdAt: '2026-02-19T06:00:00Z', updatedAt: '2026-02-19T06:00:00Z' },
  { id: 'log-009', taskId: 'task-001', task: { id: 'task-001', taskNo: 'IT-HZXH-0219-001' }, checkItemId: 'ci-014', checkItem: { id: 'ci-014', name: '安全标识标牌检查', category: 'fueling_area', description: '检查禁烟标识、防护距离标线、操作规程公示完好' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'pending', remark: null, executedAt: null, createdAt: '2026-02-19T06:00:00Z', updatedAt: '2026-02-19T06:00:00Z' },
];
inspectionTasks[0].logs = task001Logs;

// 为 task-003 填充完整巡检日志（已完成：8正常 + 1异常）
const task003Logs: InspectionLog[] = [
  { id: 'log-101', taskId: 'task-003', task: { id: 'task-003', taskNo: 'IT-HZXH-0218-001' }, checkItemId: 'ci-001', checkItem: { id: 'ci-001', name: 'LNG储罐#1外观检查', category: 'tank_area', description: '检查储罐外壁有无凹陷、腐蚀' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'normal', remark: null, executedAt: '2026-02-18T08:20:00Z', createdAt: '2026-02-18T08:20:00Z', updatedAt: '2026-02-18T08:20:00Z' },
  { id: 'log-102', taskId: 'task-003', task: { id: 'task-003', taskNo: 'IT-HZXH-0218-001' }, checkItemId: 'ci-002', checkItem: { id: 'ci-002', name: 'LNG储罐#2外观检查', category: 'tank_area', description: '检查储罐外壁有无凹陷、腐蚀' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'normal', remark: null, executedAt: '2026-02-18T08:25:00Z', createdAt: '2026-02-18T08:25:00Z', updatedAt: '2026-02-18T08:25:00Z' },
  { id: 'log-103', taskId: 'task-003', task: { id: 'task-003', taskNo: 'IT-HZXH-0218-001' }, checkItemId: 'ci-003', checkItem: { id: 'ci-003', name: '罐区防泄漏设施检查', category: 'tank_area', description: '检查泄漏报警器、围堰完好性' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'normal', remark: null, executedAt: '2026-02-18T08:30:00Z', createdAt: '2026-02-18T08:30:00Z', updatedAt: '2026-02-18T08:30:00Z' },
  { id: 'log-104', taskId: 'task-003', task: { id: 'task-003', taskNo: 'IT-HZXH-0218-001' }, checkItemId: 'ci-006', checkItem: { id: 'ci-006', name: '加气机#01运行检查', category: 'dispenser', description: '检查加气枪连接件密封' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'normal', remark: null, executedAt: '2026-02-18T08:40:00Z', createdAt: '2026-02-18T08:40:00Z', updatedAt: '2026-02-18T08:40:00Z' },
  { id: 'log-105', taskId: 'task-003', task: { id: 'task-003', taskNo: 'IT-HZXH-0218-001' }, checkItemId: 'ci-007', checkItem: { id: 'ci-007', name: '加气机#02运行检查', category: 'dispenser', description: '检查加气枪连接件密封' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'abnormal', remark: '加气枪#2软管有轻微裂纹', executedAt: '2026-02-18T08:45:00Z', createdAt: '2026-02-18T08:45:00Z', updatedAt: '2026-02-18T08:45:00Z' },
  { id: 'log-106', taskId: 'task-003', task: { id: 'task-003', taskNo: 'IT-HZXH-0218-001' }, checkItemId: 'ci-008', checkItem: { id: 'ci-008', name: '加气机#03运行检查', category: 'dispenser', description: '检查加气枪连接件密封' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'normal', remark: null, executedAt: '2026-02-18T09:00:00Z', createdAt: '2026-02-18T09:00:00Z', updatedAt: '2026-02-18T09:00:00Z' },
  { id: 'log-107', taskId: 'task-003', task: { id: 'task-003', taskNo: 'IT-HZXH-0218-001' }, checkItemId: 'ci-010', checkItem: { id: 'ci-010', name: '配电柜温度检查', category: 'power_room', description: '检查配电柜内温度' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'normal', remark: null, executedAt: '2026-02-18T09:10:00Z', createdAt: '2026-02-18T09:10:00Z', updatedAt: '2026-02-18T09:10:00Z' },
  { id: 'log-108', taskId: 'task-003', task: { id: 'task-003', taskNo: 'IT-HZXH-0218-001' }, checkItemId: 'ci-013', checkItem: { id: 'ci-013', name: '加气岛地面检查', category: 'fueling_area', description: '检查地面无积油、无裂缝' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'normal', remark: null, executedAt: '2026-02-18T09:20:00Z', createdAt: '2026-02-18T09:20:00Z', updatedAt: '2026-02-18T09:20:00Z' },
  { id: 'log-109', taskId: 'task-003', task: { id: 'task-003', taskNo: 'IT-HZXH-0218-001' }, checkItemId: 'ci-014', checkItem: { id: 'ci-014', name: '安全标识标牌检查', category: 'fueling_area', description: '检查禁烟标识、防护距离标线' }, stationId: 'station-001', executor: { id: 'user-003', name: '张三' }, result: 'normal', remark: null, executedAt: '2026-02-18T09:30:00Z', createdAt: '2026-02-18T09:30:00Z', updatedAt: '2026-02-18T09:30:00Z' },
];
inspectionTasks[2].logs = task003Logs;

// 为 task-006 填充完整巡检日志（已完成：9正常 + 0异常）
const task006Logs: InspectionLog[] = [
  { id: 'log-201', taskId: 'task-006', task: { id: 'task-006', taskNo: 'IT-HZXH-0218-002' }, checkItemId: 'ci-001', checkItem: { id: 'ci-001', name: 'LNG储罐#1外观检查', category: 'tank_area', description: '检查储罐外壁有无凹陷、腐蚀' }, stationId: 'station-001', executor: { id: 'user-004', name: '李巡检' }, result: 'normal', remark: null, executedAt: '2026-02-18T08:05:00Z', createdAt: '2026-02-18T08:05:00Z', updatedAt: '2026-02-18T08:05:00Z' },
  { id: 'log-202', taskId: 'task-006', task: { id: 'task-006', taskNo: 'IT-HZXH-0218-002' }, checkItemId: 'ci-002', checkItem: { id: 'ci-002', name: 'LNG储罐#2外观检查', category: 'tank_area', description: '检查储罐外壁有无凹陷、腐蚀' }, stationId: 'station-001', executor: { id: 'user-004', name: '李巡检' }, result: 'normal', remark: null, executedAt: '2026-02-18T08:10:00Z', createdAt: '2026-02-18T08:10:00Z', updatedAt: '2026-02-18T08:10:00Z' },
  { id: 'log-203', taskId: 'task-006', task: { id: 'task-006', taskNo: 'IT-HZXH-0218-002' }, checkItemId: 'ci-003', checkItem: { id: 'ci-003', name: '罐区防泄漏设施检查', category: 'tank_area', description: '检查泄漏报警器、围堰完好性' }, stationId: 'station-001', executor: { id: 'user-004', name: '李巡检' }, result: 'normal', remark: null, executedAt: '2026-02-18T08:15:00Z', createdAt: '2026-02-18T08:15:00Z', updatedAt: '2026-02-18T08:15:00Z' },
  { id: 'log-204', taskId: 'task-006', task: { id: 'task-006', taskNo: 'IT-HZXH-0218-002' }, checkItemId: 'ci-006', checkItem: { id: 'ci-006', name: '加气机#01运行检查', category: 'dispenser', description: '检查加气枪连接件密封' }, stationId: 'station-001', executor: { id: 'user-004', name: '李巡检' }, result: 'normal', remark: null, executedAt: '2026-02-18T08:25:00Z', createdAt: '2026-02-18T08:25:00Z', updatedAt: '2026-02-18T08:25:00Z' },
  { id: 'log-205', taskId: 'task-006', task: { id: 'task-006', taskNo: 'IT-HZXH-0218-002' }, checkItemId: 'ci-007', checkItem: { id: 'ci-007', name: '加气机#02运行检查', category: 'dispenser', description: '检查加气枪连接件密封' }, stationId: 'station-001', executor: { id: 'user-004', name: '李巡检' }, result: 'normal', remark: null, executedAt: '2026-02-18T08:35:00Z', createdAt: '2026-02-18T08:35:00Z', updatedAt: '2026-02-18T08:35:00Z' },
  { id: 'log-206', taskId: 'task-006', task: { id: 'task-006', taskNo: 'IT-HZXH-0218-002' }, checkItemId: 'ci-008', checkItem: { id: 'ci-008', name: '加气机#03运行检查', category: 'dispenser', description: '检查加气枪连接件密封' }, stationId: 'station-001', executor: { id: 'user-004', name: '李巡检' }, result: 'normal', remark: null, executedAt: '2026-02-18T08:45:00Z', createdAt: '2026-02-18T08:45:00Z', updatedAt: '2026-02-18T08:45:00Z' },
  { id: 'log-207', taskId: 'task-006', task: { id: 'task-006', taskNo: 'IT-HZXH-0218-002' }, checkItemId: 'ci-010', checkItem: { id: 'ci-010', name: '配电柜温度检查', category: 'power_room', description: '检查配电柜内温度' }, stationId: 'station-001', executor: { id: 'user-004', name: '李巡检' }, result: 'normal', remark: null, executedAt: '2026-02-18T09:00:00Z', createdAt: '2026-02-18T09:00:00Z', updatedAt: '2026-02-18T09:00:00Z' },
  { id: 'log-208', taskId: 'task-006', task: { id: 'task-006', taskNo: 'IT-HZXH-0218-002' }, checkItemId: 'ci-013', checkItem: { id: 'ci-013', name: '加气岛地面检查', category: 'fueling_area', description: '检查地面无积油、无裂缝' }, stationId: 'station-001', executor: { id: 'user-004', name: '李巡检' }, result: 'normal', remark: null, executedAt: '2026-02-18T09:15:00Z', createdAt: '2026-02-18T09:15:00Z', updatedAt: '2026-02-18T09:15:00Z' },
  { id: 'log-209', taskId: 'task-006', task: { id: 'task-006', taskNo: 'IT-HZXH-0218-002' }, checkItemId: 'ci-014', checkItem: { id: 'ci-014', name: '安全标识标牌检查', category: 'fueling_area', description: '检查禁烟标识、防护距离标线' }, stationId: 'station-001', executor: { id: 'user-004', name: '李巡检' }, result: 'normal', remark: null, executedAt: '2026-02-18T09:30:00Z', createdAt: '2026-02-18T09:30:00Z', updatedAt: '2026-02-18T09:30:00Z' },
];
inspectionTasks[5].logs = task006Logs;

// 为 task-002 填充待检查日志（pending 状态，所有项待检查）
const task002Logs: InspectionLog[] = plan001CheckItemIds.map((ciId, index) => {
  const ci = checkItems.find(c => c.id === ciId)!;
  return {
    id: `log-300-${index + 1}`,
    taskId: 'task-002',
    task: { id: 'task-002', taskNo: 'IT-HZXH-0219-002' },
    checkItemId: ciId,
    checkItem: { id: ci.id, name: ci.name, category: ci.category, description: ci.description || '' },
    stationId: 'station-001',
    executor: { id: 'user-004', name: '李巡检' },
    result: 'pending' as const,
    remark: null,
    executedAt: null,
    createdAt: '2026-02-19T06:00:00Z',
    updatedAt: '2026-02-19T06:00:00Z',
  };
});
inspectionTasks[1].logs = task002Logs;

// ============================================================
// 巡检日志（独立列表用）
// ============================================================

export const inspectionLogs: InspectionLog[] = [
  ...task001Logs,
  ...task003Logs,
  ...task006Logs,
  ...task002Logs,
];

// ============================================================
// 问题记录
// ============================================================

export const issueRecords: IssueRecord[] = [
  {
    id: 'issue-001',
    issueNo: 'IS-HZXH-0219-001',
    stationId: 'station-001',
    task: { id: 'task-001', taskNo: 'IT-HZXH-0219-001' },
    checkItem: { id: 'ci-007', name: '加气机#02运行检查' },
    equipment: { id: 'equip-005', name: '加气机#02', deviceCode: 'DEV-DISP-002' },
    description: '加气枪#2有微量泄漏，密封圈老化需更换',
    severity: 'high',
    status: 'processing',
    reporter: { id: 'user-003', name: '张三' },
    assignee: { id: 'user-004', name: '李巡检' },
    assignedAt: '2026-02-19T09:30:00Z',
    assignedBy: { id: 'user-002', name: '王安全主管' },
    rectification: null,
    rectificationResult: null,
    rectifiedAt: null,
    reviewer: null,
    reviewedAt: null,
    reviewComment: null,
    dueDate: '2026-02-19',
    timeline: [
      { id: 'tl-001', timestamp: '2026-02-19T08:50:00Z', operator: { id: 'user-003', name: '张三' }, action: 'created', content: '巡检执行中发现加气枪#2微量泄漏' },
      { id: 'tl-002', timestamp: '2026-02-19T09:30:00Z', operator: { id: 'user-002', name: '王安全主管' }, action: 'assigned', content: '分配给李巡检处理' },
    ],
    createdAt: '2026-02-19T08:50:00Z',
    updatedAt: '2026-02-19T09:30:00Z',
  },
  {
    id: 'issue-002',
    issueNo: 'IS-HZXH-0218-001',
    stationId: 'station-001',
    task: { id: 'task-003', taskNo: 'IT-HZXH-0218-001' },
    checkItem: { id: 'ci-007', name: '加气机#02运行检查' },
    equipment: { id: 'equip-005', name: '加气机#02', deviceCode: 'DEV-DISP-002' },
    description: '加气枪#2软管有轻微裂纹，需要更换',
    severity: 'medium',
    status: 'closed',
    reporter: { id: 'user-003', name: '张三' },
    assignee: { id: 'user-004', name: '李巡检' },
    assignedAt: '2026-02-18T09:30:00Z',
    assignedBy: { id: 'user-002', name: '王安全主管' },
    rectification: '更换加气枪#2软管，使用型号HG-200替换',
    rectificationResult: '已更换完毕，经测试无泄漏',
    rectifiedAt: '2026-02-18T14:00:00Z',
    reviewer: { id: 'user-002', name: '王安全主管' },
    reviewedAt: '2026-02-18T16:00:00Z',
    reviewComment: '确认整改完成',
    dueDate: '2026-02-19',
    timeline: [
      { id: 'tl-003', timestamp: '2026-02-18T08:50:00Z', operator: { id: 'user-003', name: '张三' }, action: 'created', content: '巡检发现加气枪#2软管轻微裂纹' },
      { id: 'tl-004', timestamp: '2026-02-18T09:30:00Z', operator: { id: 'user-002', name: '王安全主管' }, action: 'assigned', content: '分配给李巡检处理' },
      { id: 'tl-005', timestamp: '2026-02-18T14:00:00Z', operator: { id: 'user-004', name: '李巡检' }, action: 'rectified', content: '更换加气枪#2软管（型号HG-200），测试无泄漏' },
      { id: 'tl-006', timestamp: '2026-02-18T16:00:00Z', operator: { id: 'user-002', name: '王安全主管' }, action: 'approved', content: '确认整改完成' },
    ],
    createdAt: '2026-02-18T08:50:00Z',
    updatedAt: '2026-02-18T16:00:00Z',
  },
  {
    id: 'issue-003',
    issueNo: 'IS-HZXH-0217-001',
    stationId: 'station-001',
    task: null,
    checkItem: null,
    equipment: null,
    description: '站点入口处安全标识褪色严重，需重新制作',
    severity: 'low',
    status: 'pending',
    reporter: { id: 'user-002', name: '王安全主管' },
    assignee: null,
    assignedAt: null,
    assignedBy: null,
    rectification: null,
    rectificationResult: null,
    rectifiedAt: null,
    reviewer: null,
    reviewedAt: null,
    reviewComment: null,
    dueDate: '2026-02-22',
    timeline: [
      { id: 'tl-007', timestamp: '2026-02-17T10:00:00Z', operator: { id: 'user-002', name: '王安全主管' }, action: 'created', content: '日常巡视发现入口安全标识褪色' },
    ],
    createdAt: '2026-02-17T10:00:00Z',
    updatedAt: '2026-02-17T10:00:00Z',
  },
  {
    id: 'issue-004',
    issueNo: 'IS-HZXH-0216-001',
    stationId: 'station-001',
    task: null,
    checkItem: { id: 'ci-010', name: '配电柜温度检查' },
    equipment: null,
    description: '配电柜散热风扇异响，可能轴承磨损',
    severity: 'urgent',
    status: 'pending_review',
    reporter: { id: 'user-004', name: '李巡检' },
    assignee: { id: 'user-003', name: '张三' },
    assignedAt: '2026-02-16T11:00:00Z',
    assignedBy: { id: 'user-002', name: '王安全主管' },
    rectification: '更换配电柜主散热风扇及轴承',
    rectificationResult: '风扇运行正常，温度恢复正常范围',
    rectifiedAt: '2026-02-17T15:00:00Z',
    reviewer: null,
    reviewedAt: null,
    reviewComment: null,
    dueDate: '2026-02-16',
    timeline: [
      { id: 'tl-008', timestamp: '2026-02-16T10:00:00Z', operator: { id: 'user-004', name: '李巡检' }, action: 'created', content: '配电柜散热风扇异响' },
      { id: 'tl-009', timestamp: '2026-02-16T11:00:00Z', operator: { id: 'user-002', name: '王安全主管' }, action: 'assigned', content: '分配给张三处理，紧急' },
      { id: 'tl-010', timestamp: '2026-02-17T15:00:00Z', operator: { id: 'user-003', name: '张三' }, action: 'rectified', content: '已更换配电柜主散热风扇及轴承，温度恢复正常' },
    ],
    createdAt: '2026-02-16T10:00:00Z',
    updatedAt: '2026-02-17T15:00:00Z',
  },
];

// ============================================================
// 统计报表数据
// ============================================================

export const inspectionReports: InspectionReport[] = [
  {
    id: 'report-001',
    name: '2026年2月第3周巡检完成报表',
    reportType: 'completion',
    timeRange: '2026-02-17 ~ 2026-02-23',
    stationIds: ['station-001'],
    generatedAt: '2026-02-18T18:00:00Z',
    generatedBy: { id: 'user-002', name: '王安全主管' },
  },
  {
    id: 'report-002',
    name: '2026年2月异常统计报表',
    reportType: 'abnormal',
    timeRange: '2026-02-01 ~ 2026-02-15',
    stationIds: ['station-001'],
    generatedAt: '2026-02-15T17:00:00Z',
    generatedBy: { id: 'user-002', name: '王安全主管' },
  },
  {
    id: 'report-003',
    name: '2026年2月整改跟踪报表',
    reportType: 'rectification',
    timeRange: '2026-02-01 ~ 2026-02-17',
    stationIds: ['station-001'],
    generatedAt: '2026-02-17T16:00:00Z',
    generatedBy: { id: 'user-002', name: '王安全主管' },
  },
];

// ============================================================
// 辅助查询函数
// ============================================================

/** 获取任务统计 */
export const getTaskStats = (): TaskStats => {
  const todayTasks = inspectionTasks.filter(t => t.dueDate === todayStr);
  const completed = todayTasks.filter(t => t.status === 'completed');
  const abnormal = todayTasks.reduce((sum, t) => sum + t.abnormalItems, 0);
  const pendingIssues = issueRecords.filter(i => ['pending', 'processing', 'pending_review'].includes(i.status));
  return {
    todayTotal: todayTasks.length,
    todayCompleted: completed.length,
    completionRate: todayTasks.length > 0 ? Math.round((completed.length / todayTasks.length) * 100) : 0,
    abnormalCount: abnormal,
    pendingIssueCount: pendingIssues.length,
  };
};

/** 获取日报数据 */
export const getDailyReport = (date: string): DailyReportData => {
  const tasks = inspectionTasks.filter(t => t.dueDate === date);
  const completed = tasks.filter(t => t.status === 'completed');
  const logs = inspectionLogs.filter(l => l.executedAt && l.executedAt.startsWith(date));
  const abnormalLogs = logs.filter(l => l.result === 'abnormal');

  // Group by executor
  const executorMap = new Map<string, { executor: { id: string; name: string }; assignedTasks: number; completedTasks: number; normalItems: number; abnormalItems: number }>();
  tasks.forEach(t => {
    if (t.assignee) {
      const key = t.assignee.id;
      if (!executorMap.has(key)) {
        executorMap.set(key, { executor: t.assignee, assignedTasks: 0, completedTasks: 0, normalItems: 0, abnormalItems: 0 });
      }
      const entry = executorMap.get(key)!;
      entry.assignedTasks++;
      if (t.status === 'completed') entry.completedTasks++;
      entry.normalItems += t.normalItems;
      entry.abnormalItems += t.abnormalItems;
    }
  });

  return {
    date,
    plannedTasks: tasks.length,
    completedTasks: completed.length,
    completionRate: tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0,
    abnormalItems: abnormalLogs.length,
    executorDetails: Array.from(executorMap.values()).map(e => ({
      ...e,
      completionRate: e.assignedTasks > 0 ? Math.round((e.completedTasks / e.assignedTasks) * 100) : 0,
    })),
    abnormalDetails: abnormalLogs.map(l => ({
      checkItem: l.checkItem,
      executor: l.executor,
      result: l.result,
      remark: l.remark || '',
    })),
  };
};

/** 获取站点报表数据 */
export const getStationReports = (): StationReportData[] => {
  return [
    {
      station: { id: 'station-001', name: '杭州西湖加气站' },
      totalTasks: 42,
      completedTasks: 38,
      completionRate: 90,
      abnormalCount: 5,
      issueCount: 4,
      rectificationRate: 75,
    },
    {
      station: { id: 'station-002', name: '杭州萧山加气站' },
      totalTasks: 35,
      completedTasks: 35,
      completionRate: 100,
      abnormalCount: 2,
      issueCount: 1,
      rectificationRate: 100,
    },
    {
      station: { id: 'station-003', name: '杭州余杭加气站' },
      totalTasks: 28,
      completedTasks: 22,
      completionRate: 79,
      abnormalCount: 8,
      issueCount: 6,
      rectificationRate: 50,
    },
  ];
};

/** 获取按站点筛选的检查项 */
export const getCheckItemsByStation = (stationId: string): CheckItem[] => {
  return checkItems.filter(ci => ci.stationId === stationId && ci.status === 'active');
};

/** 获取按分类筛选的检查项 */
export const getCheckItemsByCategory = (category: string): CheckItem[] => {
  if (category === 'all') return checkItems.filter(ci => ci.status === 'active');
  return checkItems.filter(ci => ci.category === category && ci.status === 'active');
};

/** 获取分类统计 */
export const getCategoryStats = (): Record<string, number> => {
  const stats: Record<string, number> = { all: 0 };
  checkItems.filter(ci => ci.status === 'active').forEach(ci => {
    stats.all = (stats.all || 0) + 1;
    stats[ci.category] = (stats[ci.category] || 0) + 1;
  });
  return stats;
};

export default {
  inspectionTags,
  checkItems,
  inspectionPlans,
  inspectionTasks,
  inspectionLogs,
  issueRecords,
  inspectionReports,
};
