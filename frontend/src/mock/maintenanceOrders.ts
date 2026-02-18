// 维保工单模拟数据

import type { MaintenanceOrder, MaintenancePlan } from '../features/operations/device-ledger/types';

// ============================================================
// 维保工单数据
// ============================================================

export const maintenanceOrders: MaintenanceOrder[] = [
  {
    id: 'order-001',
    orderNo: 'WO-2026-0042',
    deviceId: 'equip-006',
    device: {
      id: 'equip-006',
      deviceCode: 'DEV-DISP-003',
      name: '加气机#03',
      deviceType: 'dispenser',
      model: 'DQ-500',
    },
    orderType: 'report',
    urgency: 'urgent',
    status: 'processing',
    description: '加气机#03枪1无法正常出液，客户报告加注过程中突然停止，疑似密封件损坏。已暂停该加气机使用。',
    assignee: { id: 'emp-003', name: '张工程师' },
    plannedStartDate: '2026-02-18',
    plannedEndDate: '2026-02-18',
    actualStartTime: '2026-02-18T10:30:00Z',
    records: [
      {
        id: 'rec-001',
        timestamp: '2026-02-18T09:00:00Z',
        operator: { id: 'emp-005', name: '王安全员' },
        action: 'created',
        content: '加气枪无法正常出液，客户投诉加注过程中突然停止',
        attachments: [
          { id: 'att-001', url: 'https://placehold.co/400x300/ffebee/c62828?text=Fault+Photo+1' },
          { id: 'att-002', url: 'https://placehold.co/400x300/ffebee/c62828?text=Fault+Photo+2' },
        ],
      },
      {
        id: 'rec-002',
        timestamp: '2026-02-18T10:30:00Z',
        operator: { id: 'emp-003', name: '张工程师' },
        action: 'started',
        content: '已到现场检查，初步判断为加气枪密封件老化导致泄漏',
      },
    ],
    createdBy: { id: 'emp-005', name: '王安全员' },
    createdAt: '2026-02-18T09:00:00Z',
    updatedAt: '2026-02-18T10:30:00Z',
  },
  {
    id: 'order-002',
    orderNo: 'WO-2026-0041',
    deviceId: 'equip-004',
    device: {
      id: 'equip-004',
      deviceCode: 'DEV-DISP-001',
      name: '加气机#01',
      deviceType: 'dispenser',
      model: 'DQ-500',
    },
    orderType: 'maintenance',
    urgency: 'medium',
    status: 'pending',
    description: '加气机#01月检保养，检查各部件运行状态，更换易损件。',
    assignee: { id: 'emp-003', name: '张工程师' },
    plannedStartDate: '2026-02-20',
    plannedEndDate: '2026-02-20',
    records: [
      {
        id: 'rec-003',
        timestamp: '2026-02-17T14:00:00Z',
        operator: { id: 'emp-002', name: '李站长' },
        action: 'created',
        content: '按月度保养计划创建工单',
      },
    ],
    createdBy: { id: 'emp-002', name: '李站长' },
    createdAt: '2026-02-17T14:00:00Z',
    updatedAt: '2026-02-17T14:00:00Z',
  },
  {
    id: 'order-003',
    orderNo: 'WO-2026-0040',
    deviceId: 'equip-008',
    device: {
      id: 'equip-008',
      deviceCode: 'DEV-PUMP-001',
      name: 'LNG低温泵#1',
      deviceType: 'pump',
      model: 'CP-80',
    },
    orderType: 'maintenance',
    urgency: 'low',
    status: 'pending_review',
    description: '低温泵季度检查，包括密封性测试、振动检测、电机绝缘测试等。',
    assignee: { id: 'emp-003', name: '张工程师' },
    plannedStartDate: '2026-02-15',
    plannedEndDate: '2026-02-16',
    actualStartTime: '2026-02-15T09:00:00Z',
    records: [
      {
        id: 'rec-004',
        timestamp: '2026-02-14T10:00:00Z',
        operator: { id: 'emp-002', name: '李站长' },
        action: 'created',
        content: '季度检查保养工单',
      },
      {
        id: 'rec-005',
        timestamp: '2026-02-15T09:00:00Z',
        operator: { id: 'emp-003', name: '张工程师' },
        action: 'started',
        content: '开始季度检查',
      },
      {
        id: 'rec-006',
        timestamp: '2026-02-16T15:00:00Z',
        operator: { id: 'emp-003', name: '张工程师' },
        action: 'submitted_review',
        content: '检查完成，密封件正常，振动值在标准范围内，电机绝缘正常。已更换润滑油。',
        parts: '润滑油 5L',
        cost: 280,
        duration: 8,
      },
    ],
    createdBy: { id: 'emp-002', name: '李站长' },
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-02-16T15:00:00Z',
  },
  {
    id: 'order-004',
    orderNo: 'WO-2026-0038',
    deviceId: 'equip-001',
    device: {
      id: 'equip-001',
      deviceCode: 'DEV-TANK-001',
      name: 'LNG储罐#1',
      deviceType: 'tank',
      model: 'VCT-200',
    },
    orderType: 'maintenance',
    urgency: 'medium',
    status: 'completed',
    description: '储罐月检保养，检查液位计、压力表、温度传感器等仪表工作状态。',
    assignee: { id: 'emp-003', name: '张工程师' },
    plannedStartDate: '2026-02-10',
    plannedEndDate: '2026-02-10',
    actualStartTime: '2026-02-10T08:30:00Z',
    actualEndTime: '2026-02-10T12:00:00Z',
    records: [
      {
        id: 'rec-007',
        timestamp: '2026-02-09T16:00:00Z',
        operator: { id: 'emp-002', name: '李站长' },
        action: 'created',
        content: '月度保养工单',
      },
      {
        id: 'rec-008',
        timestamp: '2026-02-10T08:30:00Z',
        operator: { id: 'emp-003', name: '张工程师' },
        action: 'started',
        content: '开始月检保养',
      },
      {
        id: 'rec-009',
        timestamp: '2026-02-10T11:30:00Z',
        operator: { id: 'emp-003', name: '张工程师' },
        action: 'submitted_review',
        content: '已更换密封垫片，检测各项指标正常。液位计读数准确，压力表校验合格。',
        parts: '密封垫片×2',
        cost: 350,
        duration: 3,
      },
      {
        id: 'rec-010',
        timestamp: '2026-02-10T14:00:00Z',
        operator: { id: 'emp-004', name: '赵技术主管' },
        action: 'approved',
        content: '验收通过，各项指标符合要求',
      },
    ],
    createdBy: { id: 'emp-002', name: '李站长' },
    createdAt: '2026-02-09T16:00:00Z',
    updatedAt: '2026-02-10T14:00:00Z',
  },
  {
    id: 'order-005',
    orderNo: 'WO-2026-0025',
    deviceId: 'equip-001',
    device: {
      id: 'equip-001',
      deviceCode: 'DEV-TANK-001',
      name: 'LNG储罐#1',
      deviceType: 'tank',
      model: 'VCT-200',
    },
    orderType: 'maintenance',
    urgency: 'medium',
    status: 'completed',
    description: '储罐月度常规检查',
    assignee: { id: 'emp-003', name: '张工程师' },
    plannedStartDate: '2026-01-12',
    plannedEndDate: '2026-01-12',
    actualStartTime: '2026-01-12T09:00:00Z',
    actualEndTime: '2026-01-12T11:00:00Z',
    records: [
      {
        id: 'rec-011',
        timestamp: '2026-01-11T10:00:00Z',
        operator: { id: 'emp-002', name: '李站长' },
        action: 'created',
        content: '月度保养工单',
      },
      {
        id: 'rec-012',
        timestamp: '2026-01-12T09:00:00Z',
        operator: { id: 'emp-003', name: '张工程师' },
        action: 'started',
        content: '开始月检',
      },
      {
        id: 'rec-013',
        timestamp: '2026-01-12T10:30:00Z',
        operator: { id: 'emp-003', name: '张工程师' },
        action: 'submitted_review',
        content: '常规检查，一切正常',
        duration: 1.5,
      },
      {
        id: 'rec-014',
        timestamp: '2026-01-12T14:00:00Z',
        operator: { id: 'emp-004', name: '赵技术主管' },
        action: 'approved',
        content: '验收通过',
      },
    ],
    createdBy: { id: 'emp-002', name: '李站长' },
    createdAt: '2026-01-11T10:00:00Z',
    updatedAt: '2026-01-12T14:00:00Z',
  },
  {
    id: 'order-006',
    orderNo: 'WO-2026-0035',
    deviceId: 'equip-010',
    device: {
      id: 'equip-010',
      deviceCode: 'DEV-VALVE-001',
      name: '主切断阀',
      deviceType: 'valve',
      model: 'QV-100',
    },
    orderType: 'repair',
    urgency: 'high',
    status: 'completed',
    description: '主切断阀操作手柄松动，需要紧固并检查阀体密封性。',
    assignee: { id: 'emp-003', name: '张工程师' },
    plannedStartDate: '2026-02-05',
    plannedEndDate: '2026-02-05',
    actualStartTime: '2026-02-05T08:00:00Z',
    actualEndTime: '2026-02-05T10:30:00Z',
    records: [
      {
        id: 'rec-015',
        timestamp: '2026-02-04T16:00:00Z',
        operator: { id: 'emp-005', name: '王安全员' },
        action: 'created',
        content: '巡检发现主切断阀手柄松动，需维修',
      },
      {
        id: 'rec-016',
        timestamp: '2026-02-05T08:00:00Z',
        operator: { id: 'emp-003', name: '张工程师' },
        action: 'started',
        content: '开始维修',
      },
      {
        id: 'rec-017',
        timestamp: '2026-02-05T10:00:00Z',
        operator: { id: 'emp-003', name: '张工程师' },
        action: 'submitted_review',
        content: '已紧固手柄螺栓，更换O型密封圈，阀体密封性测试合格',
        parts: 'O型密封圈×1, 螺栓×4',
        cost: 120,
        duration: 2,
      },
      {
        id: 'rec-018',
        timestamp: '2026-02-05T14:00:00Z',
        operator: { id: 'emp-004', name: '赵技术主管' },
        action: 'approved',
        content: '验收通过，密封性合格',
      },
    ],
    createdBy: { id: 'emp-005', name: '王安全员' },
    createdAt: '2026-02-04T16:00:00Z',
    updatedAt: '2026-02-05T14:00:00Z',
  },
  {
    id: 'order-007',
    orderNo: 'WO-2026-0030',
    deviceId: 'equip-014',
    device: {
      id: 'equip-014',
      deviceCode: 'DEV-FIRE-001',
      name: '干粉灭火系统',
      deviceType: 'fire_equipment',
      model: 'FX-500',
    },
    orderType: 'maintenance',
    urgency: 'medium',
    status: 'closed',
    description: '消防设备半年检：检查干粉压力、喷头状态、管道完整性。',
    assignee: { id: 'emp-003', name: '张工程师' },
    plannedStartDate: '2026-01-25',
    plannedEndDate: '2026-01-26',
    actualStartTime: '2026-01-25T09:00:00Z',
    actualEndTime: '2026-01-26T11:00:00Z',
    records: [
      {
        id: 'rec-019',
        timestamp: '2026-01-24T10:00:00Z',
        operator: { id: 'emp-002', name: '李站长' },
        action: 'created',
        content: '半年检工单',
      },
      {
        id: 'rec-020',
        timestamp: '2026-01-25T09:00:00Z',
        operator: { id: 'emp-003', name: '张工程师' },
        action: 'started',
        content: '开始检查',
      },
      {
        id: 'rec-021',
        timestamp: '2026-01-26T10:30:00Z',
        operator: { id: 'emp-003', name: '张工程师' },
        action: 'submitted_review',
        content: '压力正常，喷头清洁，管道无泄漏。已补充干粉2kg。',
        parts: '干粉 2kg',
        cost: 150,
        duration: 6,
      },
      {
        id: 'rec-022',
        timestamp: '2026-01-26T14:00:00Z',
        operator: { id: 'emp-004', name: '赵技术主管' },
        action: 'approved',
        content: '验收通过',
      },
      {
        id: 'rec-023',
        timestamp: '2026-01-28T10:00:00Z',
        operator: { id: 'emp-002', name: '李站长' },
        action: 'closed',
        content: '工单关闭',
      },
    ],
    createdBy: { id: 'emp-002', name: '李站长' },
    createdAt: '2026-01-24T10:00:00Z',
    updatedAt: '2026-01-28T10:00:00Z',
  },
];

// ============================================================
// 保养计划数据 [MVP+]
// ============================================================

export const maintenancePlans: MaintenancePlan[] = [
  {
    id: 'plan-001',
    name: 'LNG储罐月检',
    deviceId: 'equip-001',
    device: { id: 'equip-001', deviceCode: 'DEV-TANK-001', name: 'LNG储罐#1', deviceType: 'tank' },
    frequency: 'monthly',
    startDate: '2025-01-01',
    nextDate: '2026-03-12',
    reminderDays: 7,
    enabled: true,
    createdAt: '2025-01-01T08:00:00Z',
    updatedAt: '2026-02-10T14:00:00Z',
  },
  {
    id: 'plan-002',
    name: '加气机月检',
    deviceId: 'equip-004',
    device: { id: 'equip-004', deviceCode: 'DEV-DISP-001', name: '加气机#01', deviceType: 'dispenser' },
    frequency: 'monthly',
    startDate: '2025-01-01',
    nextDate: '2026-03-07',
    reminderDays: 7,
    enabled: true,
    createdAt: '2025-01-01T08:00:00Z',
    updatedAt: '2026-02-05T16:00:00Z',
  },
  {
    id: 'plan-003',
    name: '低温泵季检',
    deviceId: 'equip-008',
    device: { id: 'equip-008', deviceCode: 'DEV-PUMP-001', name: 'LNG低温泵#1', deviceType: 'pump' },
    frequency: 'quarterly',
    startDate: '2025-01-15',
    nextDate: '2026-04-15',
    reminderDays: 14,
    enabled: true,
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'plan-004',
    name: '消防设备半年检',
    deviceId: 'equip-014',
    device: { id: 'equip-014', deviceCode: 'DEV-FIRE-001', name: '干粉灭火系统', deviceType: 'fire_equipment' },
    frequency: 'semi_annual',
    startDate: '2025-06-01',
    nextDate: '2026-05-30',
    reminderDays: 14,
    enabled: true,
    createdAt: '2025-06-01T08:00:00Z',
    updatedAt: '2025-12-01T14:00:00Z',
  },
];

// ============================================================
// 辅助函数
// ============================================================

/** 按设备获取工单 */
export const getOrdersByDevice = (deviceId: string) =>
  maintenanceOrders.filter((o) => o.deviceId === deviceId);

/** 按状态获取工单 */
export const getOrdersByStatus = (status: string) =>
  maintenanceOrders.filter((o) => o.status === status);

/** 获取工单统计 */
export const getOrderStats = () => {
  const stats = {
    pending: 0,
    processing: 0,
    pending_review: 0,
    completed: 0,
    closed: 0,
  };
  maintenanceOrders.forEach((o) => {
    stats[o.status]++;
  });
  return stats;
};

/** 获取员工列表 (简化模拟) */
export const mockEmployees = [
  { id: 'emp-001', name: '陈运营经理' },
  { id: 'emp-002', name: '李站长' },
  { id: 'emp-003', name: '张工程师' },
  { id: 'emp-004', name: '赵技术主管' },
  { id: 'emp-005', name: '王安全员' },
];

export default maintenanceOrders;
