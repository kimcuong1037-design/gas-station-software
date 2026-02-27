export interface UserStoryMapping {
  us: string[];
  desc: string;
  priority: 'MVP' | 'MVP+' | 'PROD' | 'FUTURE';
  status: 'implemented' | 'partial' | 'planned' | 'not-planned';
}

export const orderTransactionUserStories: Record<string, UserStoryMapping> = {
  'order-list':           { us: ['US-001'], desc: '订单列表页，展示站点全部订单记录',           priority: 'MVP',  status: 'implemented' },
  'order-filter':         { us: ['US-002'], desc: '多维度筛选（时间/枪号/燃料/状态/方式）',     priority: 'MVP',  status: 'implemented' },
  'order-search':         { us: ['US-003'], desc: '按订单号/车牌/手机号搜索',                   priority: 'MVP',  status: 'implemented' },
  'order-detail':         { us: ['US-004'], desc: '订单详情抽屉（基本+加注+支付+退款信息）',    priority: 'MVP',  status: 'implemented' },
  'order-statistics':     { us: ['US-005'], desc: '顶部统计卡片（当日/当班维度切换）',          priority: 'MVP',  status: 'implemented' },
  'order-status-display': { us: ['US-006'], desc: '订单状态流转展示（Steps 时间线）',           priority: 'MVP',  status: 'implemented' },
  'order-create':         { us: ['US-007'], desc: '手动创建订单抽屉（选枪→自动获取价格）',      priority: 'MVP',  status: 'implemented' },
  'order-cancel':         { us: ['US-008'], desc: '取消订单（filling/pending_payment 可取消）', priority: 'MVP',  status: 'implemented' },
  'order-payment':        { us: ['US-009'], desc: '支付面板（现金/微信/支付宝/银联）',          priority: 'MVP',  status: 'implemented' },
  'order-mixed-payment':  { us: ['US-010'], desc: '混合支付模式',                               priority: 'MVP+', status: 'planned' },
  'order-receipt':        { us: ['US-011'], desc: '小票预览与打印',                             priority: 'MVP+', status: 'implemented' },
  'exception-list':       { us: ['US-012'], desc: '异常订单列表（统计+筛选+操作）',             priority: 'MVP',  status: 'implemented' },
  'exception-suspend':    { us: ['US-013'], desc: '挂起/取消挂起异常订单',                      priority: 'MVP',  status: 'implemented' },
  'exception-supplement': { us: ['US-014'], desc: '异常订单补单抽屉',                           priority: 'MVP',  status: 'implemented' },
  'exception-review':     { us: ['US-015'], desc: '补单审核（通过/驳回）',                      priority: 'MVP+', status: 'planned' },
  'refund-apply':         { us: ['US-016'], desc: '退款申请弹窗（全额/部分）',                  priority: 'MVP',  status: 'implemented' },
  'refund-approve':       { us: ['US-017'], desc: '退款审批（通过/驳回）',                      priority: 'MVP',  status: 'implemented' },
  'refund-records':       { us: ['US-018'], desc: '退款记录列表与状态追踪',                     priority: 'MVP',  status: 'implemented' },
  'order-tag-note':       { us: ['US-019'], desc: '订单标签和备注',                             priority: 'MVP',  status: 'partial' },
  'tag-management':       { us: ['US-020'], desc: '标签配置管理页',                             priority: 'MVP+', status: 'implemented' },
  'order-export':         { us: ['US-021'], desc: '订单数据导出 Excel',                         priority: 'MVP+', status: 'planned' },
};
