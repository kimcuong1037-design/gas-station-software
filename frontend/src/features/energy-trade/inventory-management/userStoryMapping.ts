export interface UserStoryMapping {
  us: string[];
  desc: string;
  priority: 'MVP' | 'MVP+' | 'PROD' | 'FUTURE';
  status: 'implemented' | 'partial' | 'planned' | 'not-planned';
}

export const inventoryUserStories: Record<string, UserStoryMapping> = {
  // Epic 1: 库存总览
  'inventory-overview': {
    us: ['US-001'],
    desc: '库存总览仪表盘，按燃料类型展示库存水位和当日变化',
    priority: 'MVP',
    status: 'implemented',
  },
  'inventory-trend': {
    us: ['US-002'],
    desc: '库存趋势图，按时间维度展示各类型库存变化曲线',
    priority: 'MVP',
    status: 'implemented',
  },
  // Epic 2: 入库管理
  'inbound-list': {
    us: ['US-003'],
    desc: '入库记录列表，支持多条件筛选和详情查看',
    priority: 'MVP',
    status: 'implemented',
  },
  'inbound-create': {
    us: ['US-004'],
    desc: '创建入库单，选择储罐自动关联燃料类型，计算偏差',
    priority: 'MVP',
    status: 'implemented',
  },
  'inbound-audit': {
    us: ['US-005'],
    desc: '审核入库单，通过后更新理论库存',
    priority: 'MVP+',
    status: 'implemented',
  },
  'supplier-management': {
    us: ['US-006'],
    desc: '供应商管理，入库时快速选择供应商',
    priority: 'MVP+',
    status: 'planned',
  },
  // Epic 3: 出库管理
  'outbound-list': {
    us: ['US-007'],
    desc: '出库记录列表，展示销售出库和损耗出库',
    priority: 'MVP',
    status: 'implemented',
  },
  'loss-registration': {
    us: ['US-008'],
    desc: '损耗出库登记，选择原因并提交审批',
    priority: 'MVP',
    status: 'implemented',
  },
  // Epic 4: 进销存流水
  'transaction-ledger': {
    us: ['US-009'],
    desc: '进销存流水明细，支持多条件筛选和导出',
    priority: 'MVP',
    status: 'implemented',
  },
  // Epic 5: 罐存比对
  'tank-realtime': {
    us: ['US-010'],
    desc: '罐存实时面板，对比实际罐存与理论库存',
    priority: 'MVP',
    status: 'implemented',
  },
  'deviation-analysis': {
    us: ['US-011'],
    desc: '偏差分析，展示偏差原因和建议操作',
    priority: 'MVP',
    status: 'implemented',
  },
  'comparison-history': {
    us: ['US-012'],
    desc: '罐存比对历史，按日期展示快照数据和趋势',
    priority: 'MVP',
    status: 'implemented',
  },
  'loss-classification': {
    us: ['US-013'],
    desc: '损耗分类分析，运输损耗和站内损耗分类汇总',
    priority: 'MVP',
    status: 'implemented',
  },
  'stock-adjustment': {
    us: ['US-014'],
    desc: '盘点调整，修正理论库存并提交审批',
    priority: 'MVP+',
    status: 'implemented',
  },
  // Epic 6: 库存预警
  'low-stock-alert': {
    us: ['US-015'],
    desc: '低库存预警，罐容比低于阈值时触发',
    priority: 'MVP',
    status: 'implemented',
  },
  'threshold-config': {
    us: ['US-016'],
    desc: '预警阈值配置，按燃料类型设置安全/预警/紧急阈值',
    priority: 'MVP',
    status: 'implemented',
  },
  'alert-notifications': {
    us: ['US-017'],
    desc: '预警通知列表，展示活跃预警和历史记录',
    priority: 'MVP',
    status: 'implemented',
  },
  'loss-anomaly-alert': {
    us: ['US-018'],
    desc: '损耗异常预警，偏差率超阈值时触发',
    priority: 'MVP',
    status: 'implemented',
  },
  'alert-dashboard': {
    us: ['US-019'],
    desc: '预警仪表盘概览，融入预警管理页面',
    priority: 'MVP+',
    status: 'implemented',
  },
};
