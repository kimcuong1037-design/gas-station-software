// 价格管理模块常量定义

import i18n from '../../../locales/i18n';
import type {
  AdjustmentStatus,
  AdjustmentType,
  AgreementStatus,
  DiscountType,
  MemberTier,
  PriceStatus,
} from './types';

// ============================================================
// 多语言标签辅助函数
// ============================================================

export const getLabel = (config: { label: string; labelEn: string }): string => {
  return i18n.language?.startsWith('en') ? config.labelEn : config.label;
};

// ============================================================
// 调价状态
// ============================================================

export const ADJUSTMENT_STATUS_CONFIG: Record<AdjustmentStatus, { label: string; labelEn: string; color: string }> = {
  pending_approval: { label: '待审批', labelEn: 'Pending Approval', color: 'orange' },
  approved: { label: '待执行', labelEn: 'Approved', color: 'blue' },
  rejected: { label: '已驳回', labelEn: 'Rejected', color: 'red' },
  executed: { label: '已执行', labelEn: 'Executed', color: 'green' },
  cancelled: { label: '已取消', labelEn: 'Cancelled', color: 'default' },
};

// ============================================================
// 调价类型
// ============================================================

export const ADJUSTMENT_TYPE_CONFIG: Record<AdjustmentType, { label: string; labelEn: string; color: string }> = {
  immediate: { label: '立即生效', labelEn: 'Immediate', color: 'blue' },
  scheduled: { label: '定时生效', labelEn: 'Scheduled', color: 'purple' },
};

// ============================================================
// 协议状态
// ============================================================

export const AGREEMENT_STATUS_CONFIG: Record<AgreementStatus, { label: string; labelEn: string; color: string }> = {
  active: { label: '生效中', labelEn: 'Active', color: 'green' },
  expired: { label: '已过期', labelEn: 'Expired', color: 'default' },
  terminated: { label: '已终止', labelEn: 'Terminated', color: 'red' },
};

// ============================================================
// 会员等级
// ============================================================

export const MEMBER_TIER_CONFIG: Record<MemberTier, { label: string; labelEn: string; color: string }> = {
  normal: { label: '普通会员', labelEn: 'Normal', color: 'default' },
  vip: { label: 'VIP', labelEn: 'VIP', color: 'gold' },
  svip: { label: 'SVIP', labelEn: 'SVIP', color: 'magenta' },
};

// ============================================================
// 优惠类型
// ============================================================

export const DISCOUNT_TYPE_CONFIG: Record<DiscountType, { label: string; labelEn: string; color: string }> = {
  fixed_amount: { label: '固定减免', labelEn: 'Fixed Amount', color: 'blue' },
  percentage: { label: '百分比折扣', labelEn: 'Percentage', color: 'cyan' },
};

// ============================================================
// 价格状态
// ============================================================

export const PRICE_STATUS_CONFIG: Record<PriceStatus, { label: string; labelEn: string; color: string }> = {
  active: { label: '生效', labelEn: 'Active', color: 'green' },
  inactive: { label: '停用', labelEn: 'Inactive', color: 'default' },
};

// ============================================================
// 参考市场价格
// ============================================================

export const REFERENCE_PRICES: Record<string, { price: number; unit: string }> = {
  CNG: { price: 3.50, unit: '元/m³' },
  LNG: { price: 5.80, unit: '元/kg' },
  GASOLINE_92: { price: 7.50, unit: '元/L' },
  GASOLINE_95: { price: 8.00, unit: '元/L' },
  GASOLINE_98: { price: 9.00, unit: '元/L' },
  DIESEL_0: { price: 7.20, unit: '元/L' },
};
