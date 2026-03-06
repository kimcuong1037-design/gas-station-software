export interface UserStoryMapping {
  us: string[];
  desc: string;
  priority: 'MVP' | 'MVP+' | 'PROD' | 'FUTURE';
  status: 'implemented' | 'partial' | 'planned' | 'not-planned';
}

export const analyticsUserStories: Record<string, UserStoryMapping> = {
  // Epic 1: 经营看板
  'analytics-kpi': {
    us: ['US-001'],
    desc: '经营概览 KPI 卡片（营业额/订单数/充装量/客单价 + 同比变化）',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-sales-trend': {
    us: ['US-002'],
    desc: '销售趋势折线图，支持日/周/月粒度切换',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-fuel-breakdown': {
    us: ['US-003'],
    desc: '油品销售占比环形图',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-station-ranking': {
    us: ['US-004'],
    desc: '站点 KPI 排行榜，支持指标切换，可点击跳转',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-station-filter': {
    us: ['US-005'],
    desc: '站点筛选过滤器，支持多站选择',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-member-stats': {
    us: ['US-006'],
    desc: '会员统计概览（MVP+，Phase 4 依赖）',
    priority: 'MVP+',
    status: 'implemented',
  },
  // Epic 2: 多维分析
  'analytics-time-analysis': {
    us: ['US-007'],
    desc: '按时间维度分析销售数据，含同比/环比',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-station-compare': {
    us: ['US-008'],
    desc: '按站点维度对比分析，多站折线图/柱状图',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-fuel-analysis': {
    us: ['US-009'],
    desc: '按品类维度分析各燃料类型销售占比和趋势',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-time-segment': {
    us: ['US-010'],
    desc: '按时段维度分析（24小时分布），标识高峰时段',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-data-table': {
    us: ['US-011'],
    desc: '分析结果数据明细表格，支持排序',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-station-radar': {
    us: ['US-012'],
    desc: '多站对比雷达图（MVP+）',
    priority: 'MVP+',
    status: 'planned',
  },
  'analytics-drilldown': {
    us: ['US-013'],
    desc: '数据下钻（月→日，MVP+）',
    priority: 'MVP+',
    status: 'planned',
  },
  // Epic 3: 客户分析
  'analytics-customer-overview': {
    us: ['US-014'],
    desc: '客户概览统计卡片（总数/新增/活跃/流失风险）',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-rfm': {
    us: ['US-015'],
    desc: 'RFM 模型散点图可视化，按分层颜色区分',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-customer-segment': {
    us: ['US-016'],
    desc: '客户分层饼图 + 生命周期分布',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-member-growth': {
    us: ['US-017'],
    desc: '会员增长趋势（双轴：累计 + 新增）',
    priority: 'MVP',
    status: 'implemented',
  },
  'analytics-churn-risk': {
    us: ['US-018'],
    desc: '流失预警名单表格（MVP+）',
    priority: 'MVP+',
    status: 'implemented',
  },
  'analytics-customer-tags': {
    us: ['US-019'],
    desc: '客户标签分布图（MVP+）',
    priority: 'MVP+',
    status: 'planned',
  },
};
