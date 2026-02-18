// 设备设施管理模块 — 用户故事映射

export interface UserStoryMapping {
  us: string[];
  desc: string;
  priority: 'MVP' | 'MVP+' | 'PROD' | 'FUTURE';
  status: 'implemented' | 'partial' | 'planned' | 'not-planned';
}

export const deviceLedgerUserStories: Record<string, UserStoryMapping> = {
  // ============================================================
  // Epic 1: 设施监控
  // ============================================================
  'monitoring-dashboard': {
    us: ['US-001'],
    desc: '设施监控看板，概览所有设备运行状态',
    priority: 'MVP',
    status: 'implemented',
  },
  'monitoring-tank': {
    us: ['US-002'],
    desc: '储罐液位/压力/温度监控详情',
    priority: 'MVP',
    status: 'implemented',
  },
  'monitoring-dispenser': {
    us: ['US-003'],
    desc: '加气机状态看板',
    priority: 'MVP',
    status: 'implemented',
  },
  'monitoring-sensor': {
    us: ['US-004'],
    desc: '传感器数据展示',
    priority: 'MVP+',
    status: 'planned',
  },
  'monitoring-health': {
    us: ['US-005'],
    desc: '设备健康度概览',
    priority: 'MVP+',
    status: 'planned',
  },
  'monitoring-alarm-config': {
    us: ['US-006-A'],
    desc: '告警阈值配置',
    priority: 'MVP+',
    status: 'planned',
  },
  'monitoring-alarm-records': {
    us: ['US-006-B'],
    desc: '告警记录查询',
    priority: 'MVP+',
    status: 'planned',
  },

  // ============================================================
  // Epic 2: 设备台账
  // ============================================================
  'equipment-list': {
    us: ['US-007'],
    desc: '设备台账列表，按类型Tab分组+筛选+搜索',
    priority: 'MVP',
    status: 'implemented',
  },
  'equipment-list-search': {
    us: ['US-007'],
    desc: '设备编号/名称关键词搜索',
    priority: 'MVP',
    status: 'implemented',
  },
  'equipment-create': {
    us: ['US-008'],
    desc: '新增设备表单，含动态技术参数+自动编码',
    priority: 'MVP',
    status: 'implemented',
  },
  'equipment-create-copy': {
    us: ['US-008'],
    desc: '"保存并创建下一条"复制通用字段快速录入',
    priority: 'MVP',
    status: 'implemented',
  },
  'equipment-edit': {
    us: ['US-009'],
    desc: '编辑设备信息（编号/类型不可修改）',
    priority: 'MVP',
    status: 'implemented',
  },
  'equipment-detail': {
    us: ['US-010'],
    desc: '设备详情页，含Tabs（基本信息/运行状态）',
    priority: 'MVP',
    status: 'implemented',
  },
  'equipment-deactivate': {
    us: ['US-011'],
    desc: '软删除设备（有未完成工单时阻止）',
    priority: 'MVP',
    status: 'implemented',
  },
  'equipment-photos': {
    us: ['US-012'],
    desc: '设备照片上传/画廊/预览',
    priority: 'MVP+',
    status: 'implemented',
  },
  'equipment-type-filter': {
    us: ['US-013'],
    desc: '按设备类型Tab快速筛选',
    priority: 'MVP',
    status: 'implemented',
  },

  // ============================================================
  // Epic 3: 维保与工单
  // ============================================================
  'maintenance-list': {
    us: ['US-014'],
    desc: '维保工单列表，含状态Tab+统计汇总',
    priority: 'MVP',
    status: 'implemented',
  },
  'maintenance-create': {
    us: ['US-015'],
    desc: '新建维保工单表单',
    priority: 'MVP',
    status: 'implemented',
  },
  'maintenance-detail': {
    us: ['US-016'],
    desc: '工单详情，含步骤条+处理记录时间线',
    priority: 'MVP',
    status: 'implemented',
  },
  'fault-report': {
    us: ['US-017'],
    desc: '故障报修抽屉，最少3个必填字段',
    priority: 'MVP',
    status: 'implemented',
  },
  'maintenance-status-flow': {
    us: ['US-018'],
    desc: '工单状态流转（待处理→处理中→待验收→已完成）',
    priority: 'MVP',
    status: 'implemented',
  },
  'maintenance-record': {
    us: ['US-019'],
    desc: '工单处理记录（配件/费用/附件）',
    priority: 'MVP',
    status: 'implemented',
  },
  'maintenance-plan': {
    us: ['US-020'],
    desc: '保养计划管理',
    priority: 'MVP+',
    status: 'planned',
  },
  'maintenance-reminder': {
    us: ['US-021'],
    desc: '保养到期提醒',
    priority: 'MVP+',
    status: 'planned',
  },
  'maintenance-history': {
    us: ['US-022'],
    desc: '设备维保记录时间线（设备详情Tab）',
    priority: 'MVP+',
    status: 'implemented',
  },

  // ============================================================
  // Epic 4: 设备联网
  // ============================================================
  'device-connectivity': {
    us: ['US-023'],
    desc: '设备连接状态列表（预留接口标记）',
    priority: 'MVP',
    status: 'implemented',
  },
};

// ============================================================
// 辅助函数
// ============================================================

/** 获取 User Story 覆盖统计 */
export function getCoverageStats() {
  const entries = Object.values(deviceLedgerUserStories);
  const total = entries.length;
  const implemented = entries.filter((e) => e.status === 'implemented').length;
  const partial = entries.filter((e) => e.status === 'partial').length;
  const planned = entries.filter((e) => e.status === 'planned').length;

  return { total, implemented, partial, planned, coverage: Math.round(((implemented + partial * 0.5) / total) * 100) };
}

/** 根据组件ID获取关联的 User Story */
export function getUSByComponentId(componentId: string): UserStoryMapping | undefined {
  return deviceLedgerUserStories[componentId];
}

/** 根据 US ID 获取关联的组件列表 */
export function getComponentsByUS(usId: string): string[] {
  return Object.entries(deviceLedgerUserStories)
    .filter(([, mapping]) => mapping.us.includes(usId))
    .map(([key]) => key);
}
