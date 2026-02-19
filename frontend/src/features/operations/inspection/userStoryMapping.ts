// 巡检/安检管理模块 — 用户故事映射

export interface UserStoryMapping {
  us: string[];
  desc: string;
  priority: 'MVP' | 'MVP+' | 'PROD' | 'FUTURE';
  status: 'implemented' | 'partial' | 'planned' | 'not-planned';
}

export const inspectionUserStories: Record<string, UserStoryMapping> = {
  // ============================================================
  // Epic 1: 安检计划管理
  // ============================================================
  'plan-list': {
    us: ['US-001'],
    desc: '安检计划列表，状态筛选+搜索+分页',
    priority: 'MVP',
    status: 'implemented',
  },
  'plan-create': {
    us: ['US-002'],
    desc: '新建安检计划，含双栏检查项选择器',
    priority: 'MVP',
    status: 'implemented',
  },
  'plan-edit': {
    us: ['US-003'],
    desc: '编辑安检计划（仅待执行状态可编辑）',
    priority: 'MVP',
    status: 'implemented',
  },
  'plan-detail': {
    us: ['US-004'],
    desc: '安检计划详情，含关联任务列表',
    priority: 'MVP',
    status: 'implemented',
  },
  'plan-dispatch': {
    us: ['US-005'],
    desc: '下发任务，从计划生成安检任务',
    priority: 'MVP',
    status: 'implemented',
  },

  // ============================================================
  // Epic 2: 安检任务执行
  // ============================================================
  'task-list': {
    us: ['US-006'],
    desc: '安检任务列表，统计卡片+状态Tab+逾期高亮',
    priority: 'MVP',
    status: 'implemented',
  },
  'task-assign': {
    us: ['US-007'],
    desc: '分配执行人（安全主管权限）',
    priority: 'MVP',
    status: 'implemented',
  },
  'task-execution': {
    us: ['US-008'],
    desc: '执行巡检，逐项标记正常/异常+进度条',
    priority: 'MVP',
    status: 'implemented',
  },
  'task-batch-normal': {
    us: ['US-009-A'],
    desc: '批量"全部正常"标记检查项',
    priority: 'MVP+',
    status: 'implemented',
  },

  // ============================================================
  // Epic 3: 检查项管理
  // ============================================================
  'check-item-list': {
    us: ['US-009'],
    desc: '检查项目列表，分类Tab+筛选',
    priority: 'MVP',
    status: 'implemented',
  },
  'check-item-crud': {
    us: ['US-010'],
    desc: '检查项目增删改（Drawer表单）',
    priority: 'MVP',
    status: 'implemented',
  },
  'check-item-deactivate': {
    us: ['US-011'],
    desc: '检查项目停用/恢复',
    priority: 'MVP+',
    status: 'implemented',
  },
  'tag-management': {
    us: ['US-012'],
    desc: '标签管理（行内编辑CRUD）',
    priority: 'MVP',
    status: 'implemented',
  },
  'tag-sort': {
    us: ['US-012-A'],
    desc: '标签拖拽排序',
    priority: 'MVP+',
    status: 'planned',
  },

  // ============================================================
  // Epic 4: 巡检日志
  // ============================================================
  'log-list': {
    us: ['US-013'],
    desc: '巡检日志列表，结果筛选+执行人筛选',
    priority: 'MVP',
    status: 'implemented',
  },
  'log-detail': {
    us: ['US-014'],
    desc: '巡检日志详情页',
    priority: 'MVP',
    status: 'implemented',
  },
  'log-photo': {
    us: ['US-014-A'],
    desc: '日志现场照片查看',
    priority: 'MVP+',
    status: 'implemented',
  },

  // ============================================================
  // Epic 5: 统计报表
  // ============================================================
  'daily-report': {
    us: ['US-015'],
    desc: '巡检日报（执行人明细+异常明细）',
    priority: 'MVP',
    status: 'implemented',
  },
  'station-report': {
    us: ['US-016'],
    desc: '站点报表（跨站点对比）',
    priority: 'MVP',
    status: 'implemented',
  },
  'station-report-drill': {
    us: ['US-016-A'],
    desc: '站点报表数字钻取跳转',
    priority: 'MVP+',
    status: 'implemented',
  },
  'station-report-trend': {
    us: ['US-016-B'],
    desc: '站点趋势对比图',
    priority: 'MVP+',
    status: 'planned',
  },

  // ============================================================
  // Epic 6: 问题跟踪
  // ============================================================
  'issue-list': {
    us: ['US-017'],
    desc: '问题记录列表，等级/状态Tab+筛选',
    priority: 'MVP',
    status: 'implemented',
  },
  'issue-report': {
    us: ['US-018'],
    desc: '登记问题（Drawer表单，预填关联信息）',
    priority: 'MVP',
    status: 'implemented',
  },
  'issue-detail': {
    us: ['US-019'],
    desc: '问题详情，步骤条+时间线+状态变更',
    priority: 'MVP',
    status: 'implemented',
  },
  'issue-workflow': {
    us: ['US-020'],
    desc: '问题闭环流程（分配→整改→验收/驳回）',
    priority: 'MVP',
    status: 'implemented',
  },
  'issue-photos': {
    us: ['US-020-A'],
    desc: '整改照片上传/查看',
    priority: 'MVP+',
    status: 'implemented',
  },

  // ============================================================
  // Epic 7: 安检统计与报表
  // ============================================================
  'statistics': {
    us: ['US-021'],
    desc: '安检统计（按时间/站点/检查项多维分析）',
    priority: 'MVP',
    status: 'implemented',
  },
  'statistics-chart': {
    us: ['US-021-A'],
    desc: '统计趋势图表',
    priority: 'MVP+',
    status: 'planned',
  },
  'report-generate': {
    us: ['US-022'],
    desc: '检查报表生成与查看',
    priority: 'MVP',
    status: 'implemented',
  },
  'report-export': {
    us: ['US-022-A'],
    desc: '报表导出（Excel/PDF）',
    priority: 'MVP+',
    status: 'planned',
  },
  'report-scheduled': {
    us: ['US-022-B'],
    desc: '定期自动生成报表',
    priority: 'MVP+',
    status: 'planned',
  },
};

// ============================================================
// 辅助函数
// ============================================================

/** 获取 User Story 覆盖统计 */
export function getCoverageStats() {
  const entries = Object.values(inspectionUserStories);
  const total = entries.length;
  const implemented = entries.filter((e) => e.status === 'implemented').length;
  const partial = entries.filter((e) => e.status === 'partial').length;
  const planned = entries.filter((e) => e.status === 'planned').length;

  return { total, implemented, partial, planned, coverage: Math.round(((implemented + partial * 0.5) / total) * 100) };
}

/** 根据组件ID获取关联的 User Story */
export function getUSByComponentId(componentId: string): UserStoryMapping | undefined {
  return inspectionUserStories[componentId];
}

/** 根据 US ID 获取关联的组件列表 */
export function getComponentsByUS(usId: string): string[] {
  return Object.entries(inspectionUserStories)
    .filter(([, mapping]) => mapping.us.includes(usId))
    .map(([key]) => key);
}
