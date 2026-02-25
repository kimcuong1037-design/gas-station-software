// 价格管理模块 — 用户故事映射

export interface UserStoryMapping {
  us: string[];
  desc: string;
  priority: 'MVP' | 'MVP+' | 'PROD' | 'FUTURE';
  status: 'implemented' | 'partial' | 'planned' | 'not-planned';
}

export const priceManagementUserStories: Record<string, UserStoryMapping> = {
  // ============================================================
  // Epic 1: 基准价管理
  // ============================================================
  'price-overview': {
    us: ['US-001'],
    desc: '价格总览，统计卡片+油品价格表+可展开枪明细',
    priority: 'MVP',
    status: 'implemented',
  },
  'fuel-type-adjust': {
    us: ['US-002'],
    desc: '品类基准价调价（Drawer 表单）',
    priority: 'MVP',
    status: 'partial',
  },
  'nozzle-override': {
    us: ['US-003'],
    desc: '枪独立定价（Drawer 表单）',
    priority: 'MVP',
    status: 'partial',
  },
  'nozzle-restore': {
    us: ['US-004'],
    desc: '枪恢复基准价（Popconfirm）',
    priority: 'MVP',
    status: 'partial',
  },

  // ============================================================
  // Epic 2: 调价审批与历史
  // ============================================================
  'adjustment-history': {
    us: ['US-005'],
    desc: '调价历史列表，多条件筛选+Drawer 详情+受影响枪',
    priority: 'MVP',
    status: 'implemented',
  },
  'adjustment-detail': {
    us: ['US-006'],
    desc: '调价详情 Drawer，含影响枪列表',
    priority: 'MVP',
    status: 'implemented',
  },
  'approval-list': {
    us: ['US-007'],
    desc: '审批列表，通过/驳回 Modal，Badge 提醒',
    priority: 'MVP',
    status: 'implemented',
  },

  // ============================================================
  // Epic 3: 价格公示
  // ============================================================
  'price-board': {
    us: ['US-008'],
    desc: '价格公示看板，LED 风格显示 + 会员价',
    priority: 'MVP',
    status: 'implemented',
  },

  // ============================================================
  // Epic 4: 调价防御
  // ============================================================
  'defense-config-view': {
    us: ['US-009'],
    desc: '调价防御配置查看（全局/站级/品类级）',
    priority: 'MVP',
    status: 'implemented',
  },
  'defense-config-edit': {
    us: ['US-010'],
    desc: '调价防御配置编辑 Drawer',
    priority: 'MVP',
    status: 'planned',
  },

  // ============================================================
  // Epic 5: 批量调价
  // ============================================================
  'batch-adjust': {
    us: ['US-011'],
    desc: '批量调价 Modal（多品类同步调整）',
    priority: 'MVP',
    status: 'planned',
  },

  // ============================================================
  // Epic 6: 定时调价
  // ============================================================
  'scheduled-adjust': {
    us: ['US-012'],
    desc: '定时调价（调价表单中设置生效时间）',
    priority: 'MVP',
    status: 'partial',
  },

  // ============================================================
  // Epic 7: 会员专享价（MVP+）
  // ============================================================
  'member-price-list': {
    us: ['US-013'],
    desc: '会员专享价列表，按油品/等级筛选',
    priority: 'MVP+',
    status: 'implemented',
  },
  'member-price-edit': {
    us: ['US-014'],
    desc: '会员专享价规则编辑 Drawer',
    priority: 'MVP+',
    status: 'planned',
  },

  // ============================================================
  // Epic 8: 价格协议（MVP+）
  // ============================================================
  'agreement-list': {
    us: ['US-015'],
    desc: '价格协议列表，到期预警+Drawer 详情',
    priority: 'MVP+',
    status: 'implemented',
  },
  'agreement-form': {
    us: ['US-016'],
    desc: '新增/编辑协议 Drawer',
    priority: 'MVP+',
    status: 'planned',
  },

  // ============================================================
  // Epic 9: 导出
  // ============================================================
  'adjustment-export': {
    us: ['US-017'],
    desc: '调价历史 Excel 导出',
    priority: 'MVP',
    status: 'planned',
  },
};
