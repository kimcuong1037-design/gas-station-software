// 交接班管理模块常量定义

import i18n from '../../../locales/i18n';
import type {
  HandoverStatus,
  SettlementStatus,
  DifferenceType,
  DifferenceReason,
  SettlementMethod,
  IssueType,
  IssueSeverity,
  PaymentMethod,
  PrecheckResult,
} from './types';

/** 根据当前语言获取标签 */
export const getLabel = (config: { label: string; labelEn: string }): string => {
  return i18n.language?.startsWith('en') ? config.labelEn : config.label;
};

/** 交接班状态配置 */
export const HANDOVER_STATUS_CONFIG: Record<HandoverStatus, { label: string; labelEn: string; color: string }> = {
  initiated: { label: '待接班', labelEn: 'Pending Takeover', color: 'warning' },
  pending_review: { label: '待审核', labelEn: 'Pending Review', color: 'informative' },
  completed: { label: '已完成', labelEn: 'Completed', color: 'success' },
  cancelled: { label: '已取消', labelEn: 'Cancelled', color: 'neutral' },
};

/** 解缴状态配置 */
export const SETTLEMENT_STATUS_CONFIG: Record<SettlementStatus, { label: string; labelEn: string; color: string }> = {
  pending: { label: '待审核', labelEn: 'Pending', color: 'warning' },
  approved: { label: '已通过', labelEn: 'Approved', color: 'success' },
  rejected: { label: '已驳回', labelEn: 'Rejected', color: 'danger' },
};

/** 差异类型配置 */
export const DIFFERENCE_TYPE_CONFIG: Record<DifferenceType, { label: string; labelEn: string; color: string; icon: string }> = {
  surplus: { label: '长款', labelEn: 'Surplus', color: 'success', icon: 'ArrowUp' },
  shortage: { label: '短款', labelEn: 'Shortage', color: 'danger', icon: 'ArrowDown' },
  balanced: { label: '平账', labelEn: 'Balanced', color: 'neutral', icon: 'Check' },
};

/** 差异原因配置 */
export const DIFFERENCE_REASON_CONFIG: Record<DifferenceReason, { label: string; labelEn: string }> = {
  change_error: { label: '找零误差', labelEn: 'Change Error' },
  receipt_lost: { label: '票据丢失', labelEn: 'Receipt Lost' },
  equipment_fault: { label: '设备故障', labelEn: 'Equipment Fault' },
  pending_verify: { label: '待核实', labelEn: 'Pending Verification' },
  other: { label: '其他', labelEn: 'Other' },
};

/** 解缴方式配置 */
export const SETTLEMENT_METHOD_CONFIG: Record<SettlementMethod, { label: string; labelEn: string; icon: string }> = {
  safe: { label: '存入保险柜', labelEn: 'Deposit to Safe', icon: 'Safe' },
  bank: { label: '银行存款', labelEn: 'Bank Deposit', icon: 'Bank' },
  manager: { label: '交站长', labelEn: 'Hand to Manager', icon: 'Person' },
};

/** 异常类型配置 */
export const ISSUE_TYPE_CONFIG: Record<IssueType, { label: string; labelEn: string; icon: string }> = {
  equipment: { label: '设备故障', labelEn: 'Equipment', icon: 'Wrench' },
  inventory: { label: '库存异常', labelEn: 'Inventory', icon: 'Box' },
  cash: { label: '现金差异', labelEn: 'Cash', icon: 'Money' },
  safety: { label: '安全隐患', labelEn: 'Safety', icon: 'Warning' },
  other: { label: '其他', labelEn: 'Other', icon: 'Info' },
};

/** 异常严重程度配置 */
export const ISSUE_SEVERITY_CONFIG: Record<IssueSeverity, { label: string; labelEn: string; color: string }> = {
  low: { label: '低', labelEn: 'Low', color: 'informative' },
  normal: { label: '一般', labelEn: 'Normal', color: 'warning' },
  high: { label: '高', labelEn: 'High', color: 'severe' },
  critical: { label: '严重', labelEn: 'Critical', color: 'danger' },
};

/** 支付方式配置 */
export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string; labelEn: string; icon: string; category: string }> = {
  cash: { label: '现金', labelEn: 'Cash', icon: 'Money', category: 'cash' },
  wechat: { label: '微信支付', labelEn: 'WeChat Pay', icon: 'Chat', category: 'electronic' },
  alipay: { label: '支付宝', labelEn: 'Alipay', icon: 'Wallet', category: 'electronic' },
  unionpay: { label: '银联', labelEn: 'UnionPay', icon: 'CreditCard', category: 'electronic' },
  ic_card: { label: 'IC卡', labelEn: 'IC Card', icon: 'Card', category: 'stored_value' },
  member_card: { label: '会员卡', labelEn: 'Member Card', icon: 'CardHolder', category: 'stored_value' },
  credit: { label: '挂账', labelEn: 'Credit', icon: 'Document', category: 'credit' },
  other: { label: '其他', labelEn: 'Other', icon: 'MoreHorizontal', category: 'other' },
};

/** 预检结果配置 */
export const PRECHECK_RESULT_CONFIG: Record<PrecheckResult, { label: string; labelEn: string; color: string; icon: string }> = {
  pass: { label: '通过', labelEn: 'Pass', color: 'success', icon: 'CheckmarkCircle' },
  warning: { label: '警告', labelEn: 'Warning', color: 'warning', icon: 'Warning' },
  fail: { label: '失败', labelEn: 'Fail', color: 'danger', icon: 'DismissCircle' },
};

/** 预检项类型配置 */
export const PRECHECK_TYPE_CONFIG: Record<string, { name: string; nameEn: string }> = {
  pending_orders: { name: '未完成订单', nameEn: 'Pending Orders' },
  unsettled_cash: { name: '未解缴现金', nameEn: 'Unsettled Cash' },
  cash_difference: { name: '现金差异', nameEn: 'Cash Difference' },
  abnormal_orders: { name: '异常订单', nameEn: 'Abnormal Orders' },
};

/** 现金差异阈值（元） */
export const CASH_DIFFERENCE_THRESHOLD = 50;

/** 数据自动刷新间隔（毫秒） */
export const AUTO_REFRESH_INTERVAL = 20000;

/** 列表默认分页大小 */
export const DEFAULT_PAGE_SIZE = 20;

/** 列表默认日期范围（天） */
export const DEFAULT_DATE_RANGE_DAYS = 7;
