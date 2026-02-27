import i18n from '../../../locales/i18n';
import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  RefundStatus,
  ExceptionType,
  HandleStatus,
} from './types';

export const getLabel = (config: { label: string; labelEn: string }): string => {
  return i18n.language?.startsWith('en') ? config.labelEn : config.label;
};

// 订单状态
export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; labelEn: string; color: string }> = {
  filling:          { label: '加注中',   labelEn: 'Filling',          color: 'processing' },
  pending_payment:  { label: '待支付',   labelEn: 'Pending Payment',  color: 'orange' },
  paid:             { label: '已支付',   labelEn: 'Paid',             color: 'green' },
  completed:        { label: '已完成',   labelEn: 'Completed',        color: 'default' },
  cancelled:        { label: '已取消',   labelEn: 'Cancelled',        color: 'default' },
  exception:        { label: '异常',     labelEn: 'Exception',        color: 'red' },
  suspended:        { label: '已挂起',   labelEn: 'Suspended',        color: 'gold' },
  refunded:         { label: '已退款',   labelEn: 'Refunded',         color: 'purple' },
  closed:           { label: '已关闭',   labelEn: 'Closed',           color: 'default' },
};

// 支付方式
export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string; labelEn: string; color: string; icon: string }> = {
  cash:     { label: '现金',     labelEn: 'Cash',       color: 'green',   icon: '💵' },
  wechat:   { label: '微信支付', labelEn: 'WeChat Pay', color: 'lime',    icon: '💬' },
  alipay:   { label: '支付宝',   labelEn: 'Alipay',     color: 'blue',    icon: '📱' },
  unionpay: { label: '银联',     labelEn: 'UnionPay',   color: 'geekblue', icon: '💳' },
};

// 支付状态
export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; labelEn: string; color: string }> = {
  pending:   { label: '待支付', labelEn: 'Pending',   color: 'orange' },
  success:   { label: '成功',   labelEn: 'Success',   color: 'green' },
  failed:    { label: '失败',   labelEn: 'Failed',    color: 'red' },
  cancelled: { label: '已取消', labelEn: 'Cancelled', color: 'default' },
};

// 退款状态
export const REFUND_STATUS_CONFIG: Record<RefundStatus, { label: string; labelEn: string; color: string }> = {
  pending_approval: { label: '待审批', labelEn: 'Pending Approval', color: 'orange' },
  refunded:         { label: '已退款', labelEn: 'Refunded',         color: 'green' },
  rejected:         { label: '已驳回', labelEn: 'Rejected',         color: 'red' },
};

// 异常类型
export const EXCEPTION_TYPE_CONFIG: Record<ExceptionType, { label: string; labelEn: string; color: string }> = {
  power_loss:    { label: '掉电未付', labelEn: 'Power Loss',    color: 'red' },
  timeout:       { label: '超时未付', labelEn: 'Timeout',       color: 'orange' },
  amount_error:  { label: '金额异常', labelEn: 'Amount Error',  color: 'purple' },
  other:         { label: '其他',     labelEn: 'Other',         color: 'default' },
};

// 异常处理状态
export const HANDLE_STATUS_CONFIG: Record<HandleStatus, { label: string; labelEn: string; color: string }> = {
  pending:        { label: '待处理', labelEn: 'Pending',        color: 'red' },
  suspended:      { label: '已挂起', labelEn: 'Suspended',      color: 'gold' },
  supplemented:   { label: '已补单', labelEn: 'Supplemented',   color: 'blue' },
  pending_review: { label: '待审核', labelEn: 'Pending Review', color: 'orange' },
  closed:         { label: '已关闭', labelEn: 'Closed',         color: 'default' },
};

// 补单原因预设
export const SUPPLEMENT_REASONS = [
  { value: 'power_loss', label: '掉电', labelEn: 'Power Loss' },
  { value: 'device_fault', label: '设备故障', labelEn: 'Device Fault' },
  { value: 'customer_left', label: '客户离场', labelEn: 'Customer Left' },
  { value: 'other', label: '其他', labelEn: 'Other' },
];
