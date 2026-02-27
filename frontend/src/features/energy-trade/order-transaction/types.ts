// 订单与交易模块类型定义 — 基于 architecture.md 数据模型

// ===== 枚举类型 =====

export type OrderStatus =
  | 'filling'
  | 'pending_payment'
  | 'paid'
  | 'completed'
  | 'cancelled'
  | 'exception'
  | 'suspended'
  | 'refunded'
  | 'closed';

export type PaymentMethod = 'cash' | 'wechat' | 'alipay' | 'unionpay';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';

export type RefundType = 'full' | 'partial';

export type RefundStatus = 'pending_approval' | 'refunded' | 'rejected';

export type ExceptionType = 'power_loss' | 'timeout' | 'amount_error' | 'other';

export type HandleStatus = 'pending' | 'suspended' | 'supplemented' | 'pending_review' | 'closed';

// ===== 核心实体 =====

export interface FuelingOrder {
  id: string;
  orderNo: string;
  stationId: string;
  stationName: string;
  nozzleId: string;
  nozzleNo: string;
  fuelTypeId: string;
  fuelTypeName: string;
  fuelUnit: string;
  shiftId?: string;
  shiftName?: string;
  operatorId?: string;
  operatorName?: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  discountAmount: number;
  payableAmount: number;
  orderStatus: OrderStatus;
  exceptionType?: ExceptionType;
  exceptionReason?: string;
  handleStatus?: HandleStatus;
  vehiclePlateNo?: string;
  memberId?: string;
  memberName?: string;
  memberPhone?: string;
  memberTier?: string;
  enterpriseId?: string;
  enterpriseName?: string;
  notes?: string;
  tags?: OrderTag[];
  paymentRecords?: PaymentRecord[];
  refundRecords?: RefundRecord[];
  createdBy?: string;
  createdByName?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  transactionRef?: string;
  paymentStatus: PaymentStatus;
  paidAt?: string;
  createdAt: string;
}

export interface RefundRecord {
  id: string;
  orderId: string;
  orderNo: string;
  refundType: RefundType;
  refundAmount: number;
  refundReason: string;
  refundStatus: RefundStatus;
  appliedBy: string;
  applicantName: string;
  approvedBy?: string;
  approverName?: string;
  approvedAt?: string;
  refundedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface OrderTag {
  id: string;
  orderId: string;
  tagName: string;
  createdAt: string;
}

export interface OrderTagConfig {
  id: string;
  stationId: string;
  name: string;
  sortOrder: number;
  usageCount: number;
  createdAt: string;
}

// ===== 聚合/视图类型 =====

export interface OrderStatistics {
  totalOrders: number;
  totalAmount: number;
  totalQuantity: number;
  pendingPaymentCount: number;
  paymentMethodBreakdown: { method: PaymentMethod; count: number; amount: number }[];
}

export interface ExceptionStatistics {
  pendingCount: number;
  suspendedCount: number;
  supplementedCount: number;
  closedCount: number;
}

// ===== 表单类型 =====

export interface CreateOrderForm {
  nozzleId: string;
  quantity: number;
  vehiclePlateNo?: string;
  notes?: string;
}

export interface SupplementForm {
  paymentMethod: PaymentMethod;
  amount: number;
  supplementReason: string;
  supplementReasonDetail?: string;
}

export interface RefundForm {
  refundType: RefundType;
  refundAmount: number;
  refundReason: string;
}

export interface PaymentForm {
  paymentMethod: PaymentMethod;
  amount: number;
  receivedAmount?: number; // 现金模式实收金额
}
