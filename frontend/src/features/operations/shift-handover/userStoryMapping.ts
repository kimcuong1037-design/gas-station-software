/**
 * User Story 追踪映射 - 交接班管理模块
 * 
 * 此文件将 UI 组件/功能映射到对应的 User Story，
 * 用于需求追溯和覆盖度分析。
 * 
 * 基于: docs/features/operations/shift-handover/user-stories.md
 * 参考: docs/features/operations/shift-handover/ui-schema.md
 */

export interface ShiftHandoverUserStoryMapping {
  us: string[];
  desc: string;
  priority: 'MVP' | 'MVP+' | 'PROD' | 'FUTURE';
  status: 'implemented' | 'partial' | 'planned' | 'not-planned';
}

/** 
 * 交接班管理模块 User Story 覆盖映射
 */
export const shiftHandoverUserStories: Record<string, ShiftHandoverUserStoryMapping> = {
  // ==================== 页面级别映射 ====================
  
  // P01: 班次汇总页
  'shift-summary': {
    us: ['US-001', 'US-002', 'US-003'],
    desc: '班次汇总页面：实时数据、金额脱敏、手动刷新',
    priority: 'MVP',
    status: 'implemented',
  },
  
  // P02: 交接班向导
  'shift-handover-wizard': {
    us: ['US-004', 'US-005', 'US-006', 'US-007', 'US-008', 'US-009'],
    desc: '交接班向导：预检、汇总、解缴、确认、异常标注、打印',
    priority: 'MVP',
    status: 'implemented',
  },
  
  // P03: 现金解缴页（集成在向导中）
  'cash-settlement': {
    us: ['US-010', 'US-011', 'US-012', 'US-013'],
    desc: '现金解缴：登记、盘点对比、长短款、凭证上传',
    priority: 'MVP',
    status: 'partial',
  },
  
  // P04: 交接班历史页
  'handover-history': {
    us: ['US-016', 'US-018'],
    desc: '交接班历史列表：查看记录、筛选、导出',
    priority: 'MVP',
    status: 'implemented',
  },
  
  // P05: 交接班详情页
  'handover-detail': {
    us: ['US-017', 'US-019'],
    desc: '交接班详情：基本信息、销售汇总、异常记录、打印',
    priority: 'MVP',
    status: 'implemented',
  },
  
  // P06: 解缴审核页
  'settlement-review': {
    us: ['US-014'],
    desc: '解缴审核列表：审核通过/驳回',
    priority: 'MVP+',
    status: 'implemented',
  },
  
  // ==================== Epic 1: 班次累计统计 ====================
  
  'shift-summary-stats': {
    us: ['US-001'],
    desc: '班次汇总统计：营业额、交易笔数、充装量',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'shift-summary-payment': {
    us: ['US-001'],
    desc: '支付方式明细：各支付方式金额、笔数',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'shift-summary-fuel': {
    us: ['US-001'],
    desc: '燃料类型明细：按燃料分组的充装量和金额',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'amount-mask-toggle': {
    us: ['US-002'],
    desc: '金额脱敏切换：隐藏/显示敏感金额',
    priority: 'MVP+',
    status: 'implemented',
  },
  
  'data-refresh-button': {
    us: ['US-003'],
    desc: '手动刷新按钮：立即获取最新数据',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'auto-refresh': {
    us: ['US-001', 'US-003'],
    desc: '自动刷新：每20秒自动更新数据',
    priority: 'MVP',
    status: 'implemented',
  },
  
  // ==================== Epic 2: 交接班操作 ====================
  
  'start-handover-button': {
    us: ['US-004'],
    desc: '发起交接班按钮：进入向导流程',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'handover-precheck': {
    us: ['US-005'],
    desc: '交接班预检：待处理事项清单',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'handover-remarks': {
    us: ['US-006'],
    desc: '交接备注：文本输入、常用模板',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'select-receiver': {
    us: ['US-007'],
    desc: '选择接班人：确认交接',
    priority: 'MVP',
    status: 'planned',
  },
  
  'issue-annotation': {
    us: ['US-008'],
    desc: '异常标注：设备故障、库存异常等',
    priority: 'MVP',
    status: 'partial',
  },
  
  'print-handover-slip': {
    us: ['US-009'],
    desc: '打印交接单：热敏/A4格式',
    priority: 'MVP+',
    status: 'planned',
  },
  
  // ==================== Epic 3: 现金解缴 ====================
  
  'settlement-form': {
    us: ['US-010'],
    desc: '现金解缴表单：应收/实收金额输入',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'cash-comparison': {
    us: ['US-011'],
    desc: '现金盘点对比：自动计算差额',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'difference-handling': {
    us: ['US-012'],
    desc: '长短款处理：原因说明',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'upload-voucher': {
    us: ['US-013'],
    desc: '解缴凭证上传：照片证据',
    priority: 'MVP+',
    status: 'planned',
  },
  
  'settlement-review-list': {
    us: ['US-014'],
    desc: '解缴审核列表：待审核记录',
    priority: 'MVP+',
    status: 'implemented',
  },
  
  'settlement-approve-reject': {
    us: ['US-014'],
    desc: '审核通过/驳回：审核操作',
    priority: 'MVP+',
    status: 'implemented',
  },
  
  // ==================== Epic 4: 异常处理 ====================
  
  'force-handover': {
    us: ['US-015'],
    desc: '强制交接班：绕过预检',
    priority: 'MVP+',
    status: 'implemented',
  },
  
  // ==================== Epic 5: 交接班报表 ====================
  
  'history-list': {
    us: ['US-016'],
    desc: '交接班历史列表：时间范围筛选',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'history-filter': {
    us: ['US-016'],
    desc: '历史筛选：站点、日期、班次、状态',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'history-statistics': {
    us: ['US-016'],
    desc: '历史统计概览：今日汇总',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'detail-basic-info': {
    us: ['US-017'],
    desc: '详情基本信息：站点、班次、交接人',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'detail-sales-summary': {
    us: ['US-017'],
    desc: '详情销售汇总：营业额、支付明细',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'detail-settlement-info': {
    us: ['US-017'],
    desc: '详情解缴信息：应收/实收/差额',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'detail-issue-records': {
    us: ['US-017'],
    desc: '详情异常记录：类型、严重程度',
    priority: 'MVP',
    status: 'implemented',
  },
  
  'export-report': {
    us: ['US-018'],
    desc: '导出报表：Excel/PDF',
    priority: 'MVP+',
    status: 'planned',
  },
  
  'print-history-slip': {
    us: ['US-019'],
    desc: '打印历史交接单：补打存档',
    priority: 'MVP+',
    status: 'partial',
  },
};
