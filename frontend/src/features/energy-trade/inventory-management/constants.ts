import i18n from '../../../locales/i18n';
import type {
  AuditStatus,
  OutboundType,
  OutboundSource,
  LossReason,
  TransactionType,
  AlertLevel,
  AlertType,
  HandleStatus,
  ApprovalStatus,
} from './types';

export const getLabel = (config: { label: string; labelEn: string }): string => {
  return i18n.language?.startsWith('en') ? config.labelEn : config.label;
};

// 审核状态
export const AUDIT_STATUS_CONFIG: Record<AuditStatus, { label: string; labelEn: string; color: string }> = {
  pending_review: { label: '待审核', labelEn: 'Pending Review', color: 'orange' },
  approved:       { label: '已通过', labelEn: 'Approved',       color: 'green' },
  rejected:       { label: '已驳回', labelEn: 'Rejected',       color: 'red' },
};

// 出库类型
export const OUTBOUND_TYPE_CONFIG: Record<OutboundType, { label: string; labelEn: string; color: string }> = {
  sales:    { label: '销售出库', labelEn: 'Sales',    color: 'blue' },
  loss:     { label: '损耗出库', labelEn: 'Loss',     color: 'orange' },
  reversal: { label: '冲红',     labelEn: 'Reversal', color: 'red' },
};

// 操作来源
export const OUTBOUND_SOURCE_CONFIG: Record<OutboundSource, { label: string; labelEn: string; color: string }> = {
  auto:   { label: '系统自动', labelEn: 'Auto',   color: 'default' },
  manual: { label: '手动',     labelEn: 'Manual', color: 'orange' },
};

// 损耗原因
export const LOSS_REASON_CONFIG: Record<LossReason, { label: string; labelEn: string }> = {
  evaporation: { label: '蒸发损耗', labelEn: 'Evaporation' },
  leakage:     { label: '泄漏',     labelEn: 'Leakage' },
  transfer:    { label: '站间调拨', labelEn: 'Transfer' },
  other:       { label: '其他',     labelEn: 'Other' },
};

// 流水类型
export const TRANSACTION_TYPE_CONFIG: Record<TransactionType, { label: string; labelEn: string; color: string }> = {
  inbound:          { label: '入库',     labelEn: 'Inbound',          color: 'green' },
  sales_outbound:   { label: '销售出库', labelEn: 'Sales Outbound',   color: 'blue' },
  loss_outbound:    { label: '损耗出库', labelEn: 'Loss Outbound',    color: 'orange' },
  stock_adjustment: { label: '盘点调整', labelEn: 'Stock Adjustment', color: 'default' },
  reversal:         { label: '冲红',     labelEn: 'Reversal',         color: 'red' },
};

// 预警级别
export const ALERT_LEVEL_CONFIG: Record<AlertLevel, { label: string; labelEn: string; color: string }> = {
  warning:      { label: '预警', labelEn: 'Warning',      color: 'orange' },
  critical:     { label: '紧急', labelEn: 'Critical',     color: 'red' },
  loss_anomaly: { label: '损耗异常', labelEn: 'Loss Anomaly', color: '#722ed1' },
};

// 预警类型
export const ALERT_TYPE_CONFIG: Record<AlertType, { label: string; labelEn: string }> = {
  low_stock:    { label: '低库存',   labelEn: 'Low Stock' },
  loss_anomaly: { label: '损耗异常', labelEn: 'Loss Anomaly' },
};

// 预警处理状态
export const HANDLE_STATUS_CONFIG: Record<HandleStatus, { label: string; labelEn: string; color: string }> = {
  active:       { label: '活跃',   labelEn: 'Active',       color: 'red' },
  acknowledged: { label: '已确认', labelEn: 'Acknowledged', color: 'blue' },
  dismissed:    { label: '已忽略', labelEn: 'Dismissed',    color: 'default' },
  recovered:    { label: '已恢复', labelEn: 'Recovered',    color: 'green' },
};

// 审批状态（损耗出库专用）
export const APPROVAL_STATUS_CONFIG: Record<ApprovalStatus, { label: string; labelEn: string; color: string }> = {
  pending_approval: { label: '待审批', labelEn: 'Pending Approval', color: 'orange' },
  approved:         { label: '已通过', labelEn: 'Approved',         color: 'green' },
  rejected:         { label: '已驳回', labelEn: 'Rejected',         color: 'red' },
};
