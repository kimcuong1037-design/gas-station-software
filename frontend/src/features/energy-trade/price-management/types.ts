// 价格管理模块类型定义 - 基于 architecture.md 数据模型

/** 价格状态 */
export type PriceStatus = 'active' | 'inactive';

/** 调价类型 */
export type AdjustmentType = 'immediate' | 'scheduled';

/** 调价状态 */
export type AdjustmentStatus = 'pending_approval' | 'approved' | 'rejected' | 'executed' | 'cancelled';

/** 优惠类型 */
export type DiscountType = 'fixed_amount' | 'percentage';

/** 会员等级 */
export type MemberTier = 'normal' | 'vip' | 'svip';

/** 协议状态 */
export type AgreementStatus = 'active' | 'expired' | 'terminated';

/** 调价方式（批量调价） */
export type AdjustmentMode = 'absolute' | 'percentage';

// ============================================================
// 核心实体
// ============================================================

/** 燃料类型基准价 */
export interface FuelTypePrice {
  id: string;
  stationId: string;
  fuelTypeId: string;
  fuelTypeName: string;
  fuelTypeCode: string;
  fuelUnit: string;
  basePrice: number;
  effectiveFrom: string;
  status: PriceStatus;
  updatedBy: string;
  updatedByName: string;
  lastAdjustedAt: string;
  createdAt: string;
  updatedAt: string;
}

/** 调价记录 */
export interface PriceAdjustment {
  id: string;
  adjustmentNo: string;
  stationId: string;
  stationName: string;
  fuelTypeId: string;
  fuelTypeName: string;
  fuelUnit: string;
  nozzleId?: string;
  nozzleNo?: string;
  oldPrice: number;
  newPrice: number;
  changeAmount: number;
  changePct: number;
  adjustmentType: AdjustmentType;
  effectiveAt: string;
  status: AdjustmentStatus;
  reason?: string;
  adjustedBy: string;
  adjustedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  approvalNote?: string;
  executedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** 枪独立定价 */
export interface NozzlePriceOverride {
  id: string;
  nozzleId: string;
  nozzleNo: string;
  stationId: string;
  fuelTypeId: string;
  fuelTypeName: string;
  overridePrice: number;
  effectiveFrom: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

/** 调价防御配置 */
export interface PriceDefenseConfig {
  id: string;
  stationId?: string;
  stationName?: string;
  fuelTypeId?: string;
  fuelTypeName?: string;
  maxIncreasePct: number;
  maxDecreasePct: number;
  requireApproval: boolean;
  approvalThresholdPct: number;
  updatedBy: string;
  updatedByName: string;
  createdAt: string;
  updatedAt: string;
}

/** 会员专享价规则 */
export interface MemberPriceRule {
  id: string;
  stationId: string;
  fuelTypeId: string;
  fuelTypeName: string;
  fuelUnit: string;
  basePrice: number;
  memberTier: MemberTier;
  discountType: DiscountType;
  discountValue: number;
  status: PriceStatus;
  createdAt: string;
  updatedAt: string;
}

/** 价格协议 */
export interface PriceAgreement {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  stationId: string;
  stationName: string;
  fuelTypeId: string;
  fuelTypeName: string;
  fuelUnit: string;
  agreedPrice: number;
  basePrice: number;
  validFrom: string;
  validTo: string;
  status: AgreementStatus;
  createdBy: string;
  createdByName: string;
  terminatedAt?: string;
  terminationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 聚合视图类型
// ============================================================

/** 价格总览聚合 */
export interface PriceOverviewData {
  fuelTypeCount: number;
  overrideNozzleCount: number;
  pendingScheduleCount: number;
  fuelTypePrices: FuelTypePriceWithNozzles[];
  pendingAdjustments: PriceAdjustment[];
  defenseConfig?: PriceDefenseConfig;
}

/** 燃料类型价格（含枪明细） */
export interface FuelTypePriceWithNozzles extends FuelTypePrice {
  nozzleCount: number;
  overrideCount: number;
  nozzles: NozzlePrice[];
  pendingAdjustment?: PriceAdjustment;
}

/** 枪价格信息 */
export interface NozzlePrice {
  nozzleId: string;
  nozzleNo: string;
  currentPrice: number;
  isOverride: boolean;
  overrideId?: string;
}

/** 价格公示看板数据 */
export interface PriceBoardData {
  stationName: string;
  prices: PriceBoardItem[];
  lastUpdatedAt: string;
}

/** 看板单项 */
export interface PriceBoardItem {
  fuelTypeName: string;
  fuelUnit: string;
  standardPrice: number;
  memberPrice?: number;
  maxDiscount?: number;
}

/** 调价详情（含影响枪列表） */
export interface AdjustmentDetail extends PriceAdjustment {
  affectedNozzles: AffectedNozzle[];
  defenseConfig?: PriceDefenseConfig;
}

/** 受影响的枪 */
export interface AffectedNozzle {
  nozzleNo: string;
  beforePrice: number;
  afterPrice: number;
  isOverride: boolean;
}
