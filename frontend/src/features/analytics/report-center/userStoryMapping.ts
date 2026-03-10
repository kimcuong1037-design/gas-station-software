export interface UserStoryMapping {
  us: string[];
  desc: string;
  priority: 'MVP' | 'MVP+' | 'PROD' | 'FUTURE';
  status: 'implemented' | 'partial' | 'planned' | 'not-planned';
}

export const reportCenterUserStories: Record<string, UserStoryMapping> = {
  // Epic 1: 标准报表
  'report-daily-operations': {
    us: ['US-001'],
    desc: '查看经营日报，含 KPI 汇总、站点明细、燃料占比',
    priority: 'MVP',
    status: 'implemented',
  },
  'report-monthly-operations': {
    us: ['US-002'],
    desc: '查看经营月报，含日均趋势、站点排名',
    priority: 'MVP',
    status: 'implemented',
  },
  'report-shift-handover': {
    us: ['US-003'],
    desc: '查看交接班报表，含班次汇总和支付方式分布',
    priority: 'MVP',
    status: 'implemented',
  },
  'report-inspection': {
    us: ['US-004'],
    desc: '查看巡检报表，含执行率、问题分布、未整改高危',
    priority: 'MVP',
    status: 'implemented',
  },
  'report-inventory': {
    us: ['US-005'],
    desc: '查看库存报表，含进出库明细、异常损耗标识',
    priority: 'MVP',
    status: 'implemented',
  },
  'report-calendar': {
    us: ['US-006'],
    desc: '日历视图浏览已生成报表',
    priority: 'MVP',
    status: 'implemented',
  },
  // Epic 2: 自定义报表
  'report-template-create': {
    us: ['US-007'],
    desc: '创建自定义报表模板（4 步构建器）',
    priority: 'MVP',
    status: 'implemented',
  },
  'report-template-manage': {
    us: ['US-008'],
    desc: '管理报表模板（查看/编辑/删除）',
    priority: 'MVP',
    status: 'implemented',
  },
  'report-generate': {
    us: ['US-009'],
    desc: '基于模板生成报表并预览',
    priority: 'MVP',
    status: 'implemented',
  },
  'report-export': {
    us: ['US-010'],
    desc: '导出报表（MVP 阶段 mock 提示）',
    priority: 'MVP',
    status: 'implemented',
  },
  // Epic 3: 报表管理
  'report-favorite': {
    us: ['US-011'],
    desc: '收藏报表与快速访问',
    priority: 'MVP',
    status: 'implemented',
  },
  'report-search': {
    us: ['US-012'],
    desc: '搜索和筛选报表',
    priority: 'MVP',
    status: 'implemented',
  },
};
