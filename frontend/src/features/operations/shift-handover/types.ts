// 交接班管理模块类型定义 - 基于 architecture.md 数据模型

/** 交接班状态 */
export type HandoverStatus = 'initiated' | 'pending_review' | 'completed' | 'cancelled';

/** 解缴状态 */
export type SettlementStatus = 'pending' | 'approved' | 'rejected';

/** 差异类型 */
export type DifferenceType = 'surplus' | 'shortage' | 'balanced';

/** 差异原因 */
export type DifferenceReason = 'change_error' | 'receipt_lost' | 'equipment_fault' | 'pending_verify' | 'other';

/** 解缴方式 */
export type SettlementMethod = 'safe' | 'bank' | 'manager';

/** 异常类型 */
export type IssueType = 'equipment' | 'inventory' | 'cash' | 'safety' | 'other';

/** 异常严重程度 */
export type IssueSeverity = 'low' | 'normal' | 'high' | 'critical';

/** 支付方式 */
export type PaymentMethod = 'cash' | 'wechat' | 'alipay' | 'unionpay' | 'ic_card' | 'member_card' | 'credit' | 'other';

/** 预检结果 */
export type PrecheckResult = 'pass' | 'warning' | 'fail';

/** 燃料汇总项 */
export interface FuelSummaryItem {
  fuelType: string;
  fuelTypeName: string;
  quantity: number;
  amount: number;
  unit: string;
}

/** 支付方式汇总项 */
export interface PaymentSummaryItem {
  paymentMethod: PaymentMethod;
  paymentMethodName: string;
  amount: number;
  orders: number;
}

/** 班次汇总 */
export interface ShiftSummary {
  id: string;
  handoverId?: string;
  totalAmount: number;
  totalOrders: number;
  totalRefundAmount: number;
  totalRefundOrders: number;
  netAmount: number;
  fuelSummary: FuelSummaryItem[];
  paymentSummary: PaymentSummaryItem[];
  createdAt: string;
}

/** 现金解缴 */
export interface CashSettlement {
  id: string;
  settlementNo: string;
  handoverId: string;
  stationId: string;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
  differenceType: DifferenceType;
  differenceReason?: DifferenceReason;
  differenceNote?: string;
  settlementMethod: SettlementMethod;
  settledBy: string;
  settledByName?: string;
  status: SettlementStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNote?: string;
  documents?: SettlementDocument[];
  createdAt: string;
  updatedAt: string;
}

/** 解缴凭证 */
export interface SettlementDocument {
  id: string;
  settlementId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  sortOrder: number;
  uploadedBy: string;
  createdAt: string;
}

/** 交接班异常 */
export interface HandoverIssue {
  id: string;
  handoverId: string;
  issueType: IssueType;
  severity: IssueSeverity;
  description: string;
  reportedBy: string;
  reportedByName?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

/** 预检项 */
export interface PrecheckItem {
  id: string;
  type: string;
  name: string;
  required: boolean;
  result: PrecheckResult;
  value: string;
  message: string;
  detail?: Record<string, unknown>;
}

/** 预检结果汇总 */
export interface PrecheckSummary {
  checkItems: PrecheckItem[];
  canProceed: boolean;
  warnings: number;
  failures: number;
}

/** 交接班记录 */
export interface ShiftHandover {
  id: string;
  handoverNo: string;
  stationId: string;
  stationName?: string;
  shiftId: string;
  shiftName?: string;
  shiftDate: string;
  handoverTime: string;
  handoverBy: string;
  handoverByName?: string;
  receivedBy?: string;
  receivedByName?: string;
  status: HandoverStatus;
  isForced: boolean;
  forcedBy?: string;
  forcedReason?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  summary?: ShiftSummary;
  settlement?: CashSettlement;
  issues?: HandoverIssue[];
}

/** 当前班次实时数据 */
export interface CurrentShiftData {
  shift: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    supervisor: string;
    supervisorId: string;
  };
  station: {
    id: string;
    name: string;
    code: string;
  };
  summary: {
    totalAmount: number;
    totalOrders: number;
    netAmount: number;
    refundAmount: number;
    refundOrders: number;
  };
  fuelSummary: FuelSummaryItem[];
  paymentSummary: PaymentSummaryItem[];
  previousShift?: {
    totalAmount: number;
    totalOrders: number;
  };
  unsettledCash: number;
  lastUpdated: string;
}

/** 交接班列表查询参数 */
export interface HandoverListParams {
  stationId?: string;
  shiftId?: string;
  startDate?: string;
  endDate?: string;
  handoverBy?: string;
  status?: HandoverStatus;
  page?: number;
  pageSize?: number;
}

/** 交接班列表响应 */
export interface HandoverListResponse {
  items: ShiftHandover[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
