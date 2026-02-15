/**
 * User Story 追踪映射
 * 
 * 此文件将 UI 组件/功能映射到对应的 User Story，
 * 用于需求追溯和覆盖度分析。
 * 
 * 格式: { 组件/功能 ID: { us: User Story 编号[], desc: 功能描述 } }
 */

export interface UserStoryMapping {
  us: string[];
  desc: string;
  priority: 'MVP' | 'MVP+' | 'PROD' | 'FUTURE';
  status: 'implemented' | 'partial' | 'planned' | 'not-planned';
}

/** 
 * 站点管理模块 User Story 覆盖映射
 * 基于: docs/features/operations/station/user-stories.md
 */
export const stationUserStories: Record<string, UserStoryMapping> = {
  // ==================== 页面级别映射（支持短 ID）====================
  
  // 站点列表页 - 聚合该页面上所有功能
  'station-list': {
    us: ['US-001', 'US-002', 'US-006'],
    desc: '站点列表页面：查看列表、筛选搜索、新增入口',
    priority: 'MVP',
    status: 'implemented',
  },
  
  // 站点详情页 - 聚合详情页所有功能
  'station-detail': {
    us: ['US-004', 'US-005', 'US-010', 'US-014', 'US-017', 'US-021', 'US-027'],
    desc: '站点详情页面：基本信息、枪配置、照片、班次、员工',
    priority: 'MVP',
    status: 'implemented',
  },
  
  // 站点表单页 - 新增/编辑
  'station-form': {
    us: ['US-002', 'US-003'],
    desc: '站点表单页面：新增站点、编辑站点',
    priority: 'MVP',
    status: 'implemented',
  },
  
  // ==================== Epic 1: 站点基础信息 ====================
  
  'station-list-page': {
    us: ['US-001'],
    desc: '查看站点列表（表格/卡片视图、分页、搜索、筛选）',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'station-list-search': {
    us: ['US-001'],
    desc: '站点列表搜索（按名称、编码）',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'station-list-filter-status': {
    us: ['US-001'],
    desc: '按状态筛选站点',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'station-list-filter-region': {
    us: ['US-001', 'US-009'],
    desc: '按区域筛选站点',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'station-list-filter-group': {
    us: ['US-001', 'US-008'],
    desc: '按分组筛选站点',
    priority: 'MVP+',
    status: 'implemented',
  },
  
  'station-add-button': {
    us: ['US-002'],
    desc: '新增站点入口按钮',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'station-form-page': {
    us: ['US-002', 'US-003'],
    desc: '新增/编辑站点表单（4步向导）',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'station-form-code-auto': {
    us: ['US-002'],
    desc: '站点编码自动生成',
    priority: 'MVP',
    status: 'partial', // UI 有，但后端逻辑待实现
  },
  
  'station-form-address-map': {
    us: ['US-002'],
    desc: '地址经纬度选择（地图标注）',
    priority: 'MVP',
    status: 'planned', // 地图组件待集成
  },
  
  'station-detail-page': {
    us: ['US-004'],
    desc: '站点详情页（5个Tab）',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'station-detail-basic-tab': {
    us: ['US-004'],
    desc: '站点详情 - 基本信息Tab',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'station-delete-soft': {
    us: ['US-005'],
    desc: '软删除站点（标记停用）',
    priority: 'MVP+',
    status: 'partial', // 按钮有，但确认流程待完善
  },
  
  'station-switcher-global': {
    us: ['US-006'],
    desc: '全局站点切换器',
    priority: 'MVP',
    status: 'planned', // 待实现全局组件
  },
  
  'station-group-management': {
    us: ['US-007', 'US-008'],
    desc: '站点分组管理',
    priority: 'MVP+',
    status: 'partial', // 数据结构有，管理 UI 待实现
  },
  
  'station-region-management': {
    us: ['US-009'],
    desc: '区域层级管理',
    priority: 'MVP+',
    status: 'partial', // 数据结构有，管理 UI 待实现
  },
  
  // ==================== Epic 2: 加注机/枪配置 ====================
  
  'nozzle-list-tab': {
    us: ['US-010'],
    desc: '枪配置列表Tab',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'nozzle-add': {
    us: ['US-011'],
    desc: '新增枪配置',
    priority: 'MVP',
    status: 'partial', // 模态框结构有，表单待完善
  },
  
  'nozzle-edit': {
    us: ['US-012'],
    desc: '编辑枪配置',
    priority: 'MVP',
    status: 'partial',
  },
  
  'nozzle-set-price': {
    us: ['US-013'],
    desc: '设置枪单价',
    priority: 'MVP',
    status: 'partial',
  },
  
  'nozzle-realtime-status': {
    us: ['US-014'],
    desc: '枪实时状态显示',
    priority: 'MVP',
    status: 'implemented', // 状态 Tag 已实现
  },
  
  'nozzle-station-bindind': {
    us: ['US-015'],
    desc: '枪与站点关联',
    priority: 'MVP',
    status: 'implemented', // 通过详情页 Tab 实现
  },
  
  'nozzle-enable-disable': {
    us: ['US-016'],
    desc: '枪启用/停用',
    priority: 'MVP+',
    status: 'partial',
  },
  
  // ==================== Epic 3: 站点照片 ====================
  
  'photo-tab': {
    us: ['US-017', 'US-018', 'US-019', 'US-020'],
    desc: '站点照片Tab（上传、查看、删除、设主图）',
    priority: 'MVP+',
    status: 'implemented', // 基础 UI 有
  },
  
  // ==================== Epic 4: 员工与排班 ====================
  
  'shift-tab': {
    us: ['US-021', 'US-022', 'US-023', 'US-024'],
    desc: '班次管理Tab',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'schedule-calendar': {
    us: ['US-025', 'US-026', 'US-028'],
    desc: '排班日历（查看、创建、编辑）',
    priority: 'MVP',
    status: 'partial', // 基础日历有，高级功能待完善
  },
  
  'employee-tab': {
    us: ['US-027'],
    desc: '员工列表Tab',
    priority: 'MVP',
    status: 'implemented',
  },
  
  // ==================== Epic 5: 责任站点 ====================
  
  'responsibility-station': {
    us: ['US-029', 'US-030', 'US-031'],
    desc: '责任站点/维护站点管理',
    priority: 'MVP+',
    status: 'not-planned', // MVP 阶段不实现
  },
};

/**
 * 获取 US 覆盖度统计
 */
export function getCoverageStats() {
  const allUS = new Set<string>();
  const implementedUS = new Set<string>();
  const partialUS = new Set<string>();
  const plannedUS = new Set<string>();
  
  Object.values(stationUserStories).forEach(mapping => {
    mapping.us.forEach(us => {
      allUS.add(us);
      if (mapping.status === 'implemented') {
        implementedUS.add(us);
      } else if (mapping.status === 'partial') {
        partialUS.add(us);
      } else if (mapping.status === 'planned') {
        plannedUS.add(us);
      }
    });
  });
  
  return {
    total: allUS.size,
    implemented: implementedUS.size,
    partial: partialUS.size,
    planned: plannedUS.size,
    coverage: Math.round((implementedUS.size / allUS.size) * 100),
  };
}

/**
 * 根据组件 ID 获取关联的 User Story
 */
export function getUSByComponentId(componentId: string): UserStoryMapping | null {
  return stationUserStories[componentId] || null;
}

/**
 * 根据 User Story 编号获取关联的组件
 */
export function getComponentsByUS(usId: string): string[] {
  return Object.entries(stationUserStories)
    .filter(([_, mapping]) => mapping.us.includes(usId))
    .map(([componentId]) => componentId);
}
