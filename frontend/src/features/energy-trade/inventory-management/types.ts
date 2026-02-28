// 库存管理模块类型定义 — 基于 architecture.md 数据模型

// ===== 枚举类型 =====

export type AuditStatus = 'pending_review' | 'approved' | 'rejected';

export type OutboundType = 'sales' | 'loss' | 'reversal';

export type OutboundSource = 'auto' | 'manual';

export type LossReason = 'evaporation' | 'leakage' | 'transfer' | 'other';

export type TransactionType = 'inbound' | 'sales_outbound' | 'loss_outbound' | 'stock_adjustment' | 'reversal';

export type AlertLevel = 'warning' | 'critical' | 'loss_anomaly';

export type AlertType = 'low_stock' | 'loss_anomaly';

export type HandleStatus = 'active' | 'acknowledged' | 'dismissed' | 'recovered';

export type ThresholdType = 'percentage' | 'absolute';

export type ApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

// ===== 核心实体 =====

export interface InboundRecord {
  id: string;
  inboundNo: string;
  stationId: string;
  tankId: string;
  tankName: string;
  fuelTypeId: string;
  fuelTypeName: string;
  supplierName: string;
  deliveryNo?: string;
  plannedQuantity: number;
  actualQuantity: number;
  variance: number;
  varianceRate: number;
  inboundTime: string;
  auditStatus: AuditStatus;
  auditedBy?: string;
  auditorName?: string;
  auditedAt?: string;
  rejectReason?: string;
  operatorId: string;
  operatorName: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutboundRecord {
  id: string;
  outboundNo: string;
  stationId: string;
  fuelTypeId: string;
  fuelTypeName: string;
  outboundType: OutboundType;
  quantity: number;
  amount: number;
  orderId?: string;
  relatedOrderNo?: string;
  lossReason?: LossReason;
  lossReasonDetail?: string;
  source: OutboundSource;
  approvalStatus?: ApprovalStatus;
  approvedBy?: string;
  approverName?: string;
  approvedAt?: string;
  rejectReason?: string;
  operatorId?: string;
  operatorName?: string;
  relatedInboundId?: string;
  outboundTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLedger {
  id: string;
  stationId: string;
  fuelTypeId: string;
  fuelTypeName: string;
  transactionType: TransactionType;
  quantity: number;
  amount: number;
  stockBalance: number;
  operatorOrSource: string;
  relatedNo: string;
  relatedId?: string;
  remark?: string;
  auditRecord?: string;
  transactionTime: string;
  createdAt: string;
}

export interface TankComparisonLog {
  id: string;
  stationId: string;
  tankId: string;
  tankName: string;
  fuelTypeId: string;
  fuelTypeName: string;
  snapshotDate: string;
  actualLevel: number;
  theoreticalStock: number;
  deviation: number;
  deviationRate: number;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNo: string;
  stationId: string;
  tankId: string;
  tankName: string;
  fuelTypeId: string;
  fuelTypeName: string;
  beforeStock: number;
  afterStock: number;
  adjustmentQuantity: number;
  reason: string;
  auditStatus: AuditStatus;
  appliedBy: string;
  applicantName: string;
  auditedBy?: string;
  auditorName?: string;
  auditedAt?: string;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAlert {
  id: string;
  stationId: string;
  fuelTypeId: string;
  fuelTypeName: string;
  tankId?: string;
  tankName?: string;
  alertLevel: AlertLevel;
  alertType: AlertType;
  currentValue: string;
  thresholdValue: string;
  handleStatus: HandleStatus;
  triggeredAt: string;
  handledBy?: string;
  handlerName?: string;
  handledAt?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AlertConfig {
  id: string;
  stationId: string;
  fuelTypeId: string;
  fuelTypeName: string;
  safeThreshold: number;
  warningThreshold: number;
  criticalThreshold: number;
  lossDeviationThreshold: number;
  thresholdType: ThresholdType;
  createdAt: string;
  updatedAt: string;
}

// ===== 聚合/视图类型 =====

export interface InventoryCard {
  fuelTypeId: string;
  fuelTypeName: string;
  currentStock: number;
  ratedCapacity: number;
  tankLevelRatio: number;
  alertLevel: 'safe' | 'warning' | 'critical';
  todayInbound: number;
  todayOutbound: number;
  todayNetChange: number;
}

export interface TrendDataPoint {
  date: string;
  fuelTypeId: string;
  fuelTypeName: string;
  stock: number;
}

export interface TankComparisonCard {
  tankId: string;
  tankName: string;
  fuelTypeId: string;
  fuelTypeName: string;
  ratedCapacity: number;
  actualLevel: number;
  theoreticalStock: number;
  deviation: number;
  deviationRate: number;
  alertLevel: 'safe' | 'warning' | 'critical';
  trend7d: { date: string; deviationRate: number }[];
}

export interface SupplierLoss {
  supplierName: string;
  batchCount: number;
  plannedTotal: number;
  actualTotal: number;
  varianceRate: number;
}

export interface TankLoss {
  tankId: string;
  tankName: string;
  fuelTypeName: string;
  avgDailyDeviationRate: number;
  trend: { date: string; deviationRate: number }[];
}

// ===== 表单类型 =====

export interface CreateInboundForm {
  tankId: string;
  supplierName: string;
  deliveryNo?: string;
  plannedQuantity: number;
  actualQuantity: number;
  inboundTime: string;
  remark?: string;
}

export interface LossOutboundForm {
  fuelTypeId: string;
  quantity: number;
  lossReason: LossReason;
  reasonDetail?: string;
}

export interface StockAdjustmentForm {
  adjustedStock: number;
  adjustmentReason: string;
}
