import type {
  InboundRecord,
  OutboundRecord,
  InventoryLedger,
  TankComparisonLog,
  StockAdjustment,
  InventoryAlert,
  AlertConfig,
  InventoryCard,
  TrendDataPoint,
  TankComparisonCard,
  SupplierLoss,
  TankLoss,
} from '../features/energy-trade/inventory-management/types';

// ===== Helpers =====
const d = (daysAgo: number, hour: number, min: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(hour, min, 0, 0);
  return dt.toISOString();
};

const dateStr = (daysAgo: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  return dt.toISOString().slice(0, 10);
};

// ===== 入库记录 (12 条) =====
export const inboundRecords: InboundRecord[] = [
  // pending_review (2)
  {
    id: 'ib-001', inboundNo: 'IB-ST001-20260228-0001', stationId: 'station-001',
    tankId: 'equip-tank-001', tankName: 'LNG储罐-01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG',
    supplierName: '中石油华北供应', deliveryNo: 'DL-20260228-001',
    plannedQuantity: 5000.000, actualQuantity: 4950.500, variance: -49.500, varianceRate: -0.99,
    inboundTime: d(0, 7, 30), auditStatus: 'pending_review',
    operatorId: 'emp-002', operatorName: '张伟',
    remark: '运输途中损耗正常范围',
    createdAt: d(0, 7, 35), updatedAt: d(0, 7, 35),
  },
  {
    id: 'ib-002', inboundNo: 'IB-ST001-20260228-0002', stationId: 'station-001',
    tankId: 'equip-tank-002', tankName: 'CNG储罐-01', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG',
    supplierName: '昆仑能源', deliveryNo: 'DL-20260228-002',
    plannedQuantity: 3000.000, actualQuantity: 2985.200, variance: -14.800, varianceRate: -0.49,
    inboundTime: d(0, 10, 15), auditStatus: 'pending_review',
    operatorId: 'emp-002', operatorName: '张伟',
    createdAt: d(0, 10, 20), updatedAt: d(0, 10, 20),
  },
  // approved (8)
  {
    id: 'ib-003', inboundNo: 'IB-ST001-20260227-0001', stationId: 'station-001',
    tankId: 'equip-tank-001', tankName: 'LNG储罐-01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG',
    supplierName: '中石油华北供应', deliveryNo: 'DL-20260227-001',
    plannedQuantity: 8000.000, actualQuantity: 7920.300, variance: -79.700, varianceRate: -1.00,
    inboundTime: d(1, 6, 0), auditStatus: 'approved',
    auditedBy: 'emp-001', auditorName: '李明', auditedAt: d(1, 8, 0),
    operatorId: 'emp-002', operatorName: '张伟',
    createdAt: d(1, 6, 10), updatedAt: d(1, 8, 0),
  },
  {
    id: 'ib-004', inboundNo: 'IB-ST001-20260225-0001', stationId: 'station-001',
    tankId: 'equip-tank-002', tankName: 'CNG储罐-01', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG',
    supplierName: '昆仑能源', deliveryNo: 'DL-20260225-001',
    plannedQuantity: 5000.000, actualQuantity: 4960.000, variance: -40.000, varianceRate: -0.80,
    inboundTime: d(3, 14, 0), auditStatus: 'approved',
    auditedBy: 'emp-001', auditorName: '李明', auditedAt: d(3, 15, 30),
    operatorId: 'emp-003', operatorName: '王芳',
    createdAt: d(3, 14, 10), updatedAt: d(3, 15, 30),
  },
  {
    id: 'ib-005', inboundNo: 'IB-ST001-20260224-0001', stationId: 'station-001',
    tankId: 'equip-tank-001', tankName: 'LNG储罐-01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG',
    supplierName: '新奥能源', deliveryNo: 'DL-20260224-001',
    plannedQuantity: 6000.000, actualQuantity: 5880.500, variance: -119.500, varianceRate: -1.99,
    inboundTime: d(4, 8, 0), auditStatus: 'approved',
    auditedBy: 'emp-001', auditorName: '李明', auditedAt: d(4, 10, 0),
    operatorId: 'emp-002', operatorName: '张伟',
    remark: '偏差接近 2%，已要求供应商核查',
    createdAt: d(4, 8, 10), updatedAt: d(4, 10, 0),
  },
  {
    id: 'ib-006', inboundNo: 'IB-ST001-20260222-0001', stationId: 'station-001',
    tankId: 'equip-tank-003', tankName: 'L-CNG储罐-01', fuelTypeId: 'ft-lcng', fuelTypeName: 'L-CNG',
    supplierName: '中石油华北供应', deliveryNo: 'DL-20260222-001',
    plannedQuantity: 4000.000, actualQuantity: 3975.600, variance: -24.400, varianceRate: -0.61,
    inboundTime: d(6, 9, 0), auditStatus: 'approved',
    auditedBy: 'emp-001', auditorName: '李明', auditedAt: d(6, 11, 0),
    operatorId: 'emp-003', operatorName: '王芳',
    createdAt: d(6, 9, 10), updatedAt: d(6, 11, 0),
  },
  {
    id: 'ib-007', inboundNo: 'IB-ST001-20260220-0001', stationId: 'station-001',
    tankId: 'equip-tank-001', tankName: 'LNG储罐-01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG',
    supplierName: '新奥能源', deliveryNo: 'DL-20260220-001',
    plannedQuantity: 7000.000, actualQuantity: 6965.200, variance: -34.800, varianceRate: -0.50,
    inboundTime: d(8, 7, 0), auditStatus: 'approved',
    auditedBy: 'emp-001', auditorName: '李明', auditedAt: d(8, 9, 0),
    operatorId: 'emp-002', operatorName: '张伟',
    createdAt: d(8, 7, 10), updatedAt: d(8, 9, 0),
  },
  {
    id: 'ib-008', inboundNo: 'IB-ST001-20260218-0001', stationId: 'station-001',
    tankId: 'equip-tank-002', tankName: 'CNG储罐-01', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG',
    supplierName: '昆仑能源', deliveryNo: 'DL-20260218-001',
    plannedQuantity: 4500.000, actualQuantity: 4477.500, variance: -22.500, varianceRate: -0.50,
    inboundTime: d(10, 13, 0), auditStatus: 'approved',
    auditedBy: 'emp-001', auditorName: '李明', auditedAt: d(10, 14, 30),
    operatorId: 'emp-003', operatorName: '王芳',
    createdAt: d(10, 13, 10), updatedAt: d(10, 14, 30),
  },
  {
    id: 'ib-009', inboundNo: 'IB-ST001-20260215-0001', stationId: 'station-001',
    tankId: 'equip-tank-001', tankName: 'LNG储罐-01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG',
    supplierName: '中石油华北供应', deliveryNo: 'DL-20260215-001',
    plannedQuantity: 6500.000, actualQuantity: 6448.000, variance: -52.000, varianceRate: -0.80,
    inboundTime: d(13, 8, 0), auditStatus: 'approved',
    auditedBy: 'emp-001', auditorName: '李明', auditedAt: d(13, 10, 0),
    operatorId: 'emp-002', operatorName: '张伟',
    createdAt: d(13, 8, 10), updatedAt: d(13, 10, 0),
  },
  {
    id: 'ib-010', inboundNo: 'IB-ST001-20260212-0001', stationId: 'station-001',
    tankId: 'equip-tank-003', tankName: 'L-CNG储罐-01', fuelTypeId: 'ft-lcng', fuelTypeName: 'L-CNG',
    supplierName: '中石油华北供应', deliveryNo: 'DL-20260212-001',
    plannedQuantity: 3500.000, actualQuantity: 3480.200, variance: -19.800, varianceRate: -0.57,
    inboundTime: d(16, 10, 0), auditStatus: 'approved',
    auditedBy: 'emp-001', auditorName: '李明', auditedAt: d(16, 12, 0),
    operatorId: 'emp-003', operatorName: '王芳',
    createdAt: d(16, 10, 10), updatedAt: d(16, 12, 0),
  },
  // rejected (2)
  {
    id: 'ib-011', inboundNo: 'IB-ST001-20260226-0001', stationId: 'station-001',
    tankId: 'equip-tank-001', tankName: 'LNG储罐-01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG',
    supplierName: '新奥能源', deliveryNo: 'DL-20260226-001',
    plannedQuantity: 5500.000, actualQuantity: 5200.000, variance: -300.000, varianceRate: -5.45,
    inboundTime: d(2, 15, 0), auditStatus: 'rejected',
    auditedBy: 'emp-001', auditorName: '李明', auditedAt: d(2, 16, 30),
    rejectReason: '运输损耗超过 5%，需供应商重新核实数量',
    operatorId: 'emp-002', operatorName: '张伟',
    createdAt: d(2, 15, 10), updatedAt: d(2, 16, 30),
  },
  {
    id: 'ib-012', inboundNo: 'IB-ST001-20260210-0001', stationId: 'station-001',
    tankId: 'equip-tank-002', tankName: 'CNG储罐-01', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG',
    supplierName: '昆仑能源', deliveryNo: 'DL-20260210-001',
    plannedQuantity: 4000.000, actualQuantity: 3820.000, variance: -180.000, varianceRate: -4.50,
    inboundTime: d(18, 9, 0), auditStatus: 'rejected',
    auditedBy: 'emp-001', auditorName: '李明', auditedAt: d(18, 11, 0),
    rejectReason: '送货单号与实际不符，请核实后重新提交',
    operatorId: 'emp-003', operatorName: '王芳',
    createdAt: d(18, 9, 10), updatedAt: d(18, 11, 0),
  },
];

// ===== 出库记录 (20 条) =====
export const outboundRecords: OutboundRecord[] = [
  // sales (15, auto)
  ...[0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3, 4, 5, 6, 7].map((daysAgo, i) => ({
    id: `ob-sales-${String(i + 1).padStart(3, '0')}`,
    outboundNo: `OB-ST001-SALE-${String(i + 1).padStart(4, '0')}`,
    stationId: 'station-001',
    fuelTypeId: i % 3 === 0 ? 'ft-lng' : i % 3 === 1 ? 'ft-cng' : 'ft-lcng',
    fuelTypeName: i % 3 === 0 ? 'LNG' : i % 3 === 1 ? 'CNG' : 'L-CNG',
    outboundType: 'sales' as const,
    quantity: 20 + Math.round(Math.random() * 80 * 1000) / 1000,
    amount: 0,
    orderId: `order-${String(i + 1).padStart(3, '0')}`,
    relatedOrderNo: `ST001-2026022${8 - daysAgo}-${String(i + 1).padStart(4, '0')}`,
    source: 'auto' as const,
    operatorName: '系统自动',
    outboundTime: d(daysAgo, 8 + (i % 12), i * 3 % 60),
    createdAt: d(daysAgo, 8 + (i % 12), i * 3 % 60),
    updatedAt: d(daysAgo, 8 + (i % 12), i * 3 % 60),
  })).map(r => ({ ...r, amount: Math.round(r.quantity * (r.fuelTypeId === 'ft-lng' ? 4.80 : r.fuelTypeId === 'ft-cng' ? 3.50 : 4.20) * 100) / 100 })),
  // loss (3, manual)
  {
    id: 'ob-loss-001', outboundNo: 'OB-ST001-LOSS-0001', stationId: 'station-001',
    fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', outboundType: 'loss',
    quantity: 15.500, amount: 74.40, lossReason: 'evaporation',
    source: 'manual', approvalStatus: 'approved',
    approvedBy: 'emp-001', approverName: '李明', approvedAt: d(3, 16, 0),
    operatorId: 'emp-002', operatorName: '张伟',
    outboundTime: d(3, 14, 30), createdAt: d(3, 14, 35), updatedAt: d(3, 16, 0),
  },
  {
    id: 'ob-loss-002', outboundNo: 'OB-ST001-LOSS-0002', stationId: 'station-001',
    fuelTypeId: 'ft-cng', fuelTypeName: 'CNG', outboundType: 'loss',
    quantity: 8.200, amount: 28.70, lossReason: 'leakage',
    lossReasonDetail: '3号接口法兰微泄漏，已维修',
    source: 'manual', approvalStatus: 'pending_approval',
    operatorId: 'emp-003', operatorName: '王芳',
    outboundTime: d(1, 11, 0), createdAt: d(1, 11, 5), updatedAt: d(1, 11, 5),
  },
  {
    id: 'ob-loss-003', outboundNo: 'OB-ST001-LOSS-0003', stationId: 'station-001',
    fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', outboundType: 'loss',
    quantity: 25.000, amount: 120.00, lossReason: 'other',
    lossReasonDetail: '计量设备校准偏差，实际量少于理论值',
    source: 'manual', approvalStatus: 'rejected',
    approvedBy: 'emp-001', approverName: '李明', approvedAt: d(5, 10, 0),
    rejectReason: '损耗量偏大，需重新核实计量设备读数',
    operatorId: 'emp-002', operatorName: '张伟',
    outboundTime: d(5, 8, 30), createdAt: d(5, 8, 35), updatedAt: d(5, 10, 0),
  },
  // reversal (2, auto)
  {
    id: 'ob-rev-001', outboundNo: 'OB-ST001-REV-0001', stationId: 'station-001',
    fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', outboundType: 'reversal',
    quantity: 32.500, amount: 156.00, orderId: 'order-ref-001', relatedOrderNo: 'ST001-20260225-0010',
    source: 'auto', operatorName: '系统自动',
    outboundTime: d(3, 16, 45), createdAt: d(3, 16, 45), updatedAt: d(3, 16, 45),
  },
  {
    id: 'ob-rev-002', outboundNo: 'OB-ST001-REV-0002', stationId: 'station-001',
    fuelTypeId: 'ft-cng', fuelTypeName: 'CNG', outboundType: 'reversal',
    quantity: 45.000, amount: 157.50, orderId: 'order-ref-002', relatedOrderNo: 'ST001-20260222-0005',
    source: 'auto', operatorName: '系统自动',
    outboundTime: d(6, 14, 20), createdAt: d(6, 14, 20), updatedAt: d(6, 14, 20),
  },
];

// ===== 进销存流水 (35 条) =====
export const inventoryLedgerEntries: InventoryLedger[] = [
  // Build from inbound + outbound records — representative sample
  ...[
    { daysAgo: 0, type: 'inbound' as const, fuel: 'LNG', qty: 4950.500, amt: 23762.40, bal: 15230.500, op: '张伟', rel: 'IB-ST001-20260228-0001' },
    { daysAgo: 0, type: 'sales_outbound' as const, fuel: 'LNG', qty: -65.200, amt: -313.00, bal: 15165.300, op: '系统自动', rel: 'ST001-20260228-0001' },
    { daysAgo: 0, type: 'sales_outbound' as const, fuel: 'CNG', qty: -45.000, amt: -157.50, bal: 8520.000, op: '系统自动', rel: 'ST001-20260228-0002' },
    { daysAgo: 0, type: 'sales_outbound' as const, fuel: 'L-CNG', qty: -38.500, amt: -161.70, bal: 5461.500, op: '系统自动', rel: 'ST001-20260228-0003' },
    { daysAgo: 1, type: 'inbound' as const, fuel: 'LNG', qty: 7920.300, amt: 38017.44, bal: 10280.000, op: '张伟', rel: 'IB-ST001-20260227-0001' },
    { daysAgo: 1, type: 'sales_outbound' as const, fuel: 'LNG', qty: -82.400, amt: -395.52, bal: 10197.600, op: '系统自动', rel: 'ST001-20260227-0005' },
    { daysAgo: 1, type: 'sales_outbound' as const, fuel: 'CNG', qty: -52.300, amt: -183.05, bal: 8565.000, op: '系统自动', rel: 'ST001-20260227-0006' },
    { daysAgo: 1, type: 'loss_outbound' as const, fuel: 'CNG', qty: -8.200, amt: -28.70, bal: 8556.800, op: '王芳', rel: 'OB-ST001-LOSS-0002' },
    { daysAgo: 2, type: 'sales_outbound' as const, fuel: 'LNG', qty: -95.100, amt: -456.48, bal: 2360.000, op: '系统自动', rel: 'ST001-20260226-0001' },
    { daysAgo: 2, type: 'sales_outbound' as const, fuel: 'L-CNG', qty: -41.200, amt: -173.04, bal: 5500.000, op: '系统自动', rel: 'ST001-20260226-0002' },
    { daysAgo: 3, type: 'inbound' as const, fuel: 'CNG', qty: 4960.000, amt: 17360.00, bal: 8617.300, op: '王芳', rel: 'IB-ST001-20260225-0001' },
    { daysAgo: 3, type: 'loss_outbound' as const, fuel: 'LNG', qty: -15.500, amt: -74.40, bal: 2344.500, op: '张伟', rel: 'OB-ST001-LOSS-0001' },
    { daysAgo: 3, type: 'reversal' as const, fuel: 'LNG', qty: 32.500, amt: 156.00, bal: 2377.000, op: '系统自动', rel: 'OB-ST001-REV-0001' },
    { daysAgo: 3, type: 'sales_outbound' as const, fuel: 'CNG', qty: -48.700, amt: -170.45, bal: 8568.600, op: '系统自动', rel: 'ST001-20260225-0003' },
    { daysAgo: 4, type: 'inbound' as const, fuel: 'LNG', qty: 5880.500, amt: 28226.40, bal: 2455.100, op: '张伟', rel: 'IB-ST001-20260224-0001' },
    { daysAgo: 4, type: 'sales_outbound' as const, fuel: 'LNG', qty: -78.600, amt: -377.28, bal: 2376.500, op: '系统自动', rel: 'ST001-20260224-0001' },
    { daysAgo: 5, type: 'sales_outbound' as const, fuel: 'LNG', qty: -110.300, amt: -529.44, bal: -3525.200, op: '系统自动', rel: 'ST001-20260223-0001' },
    { daysAgo: 5, type: 'sales_outbound' as const, fuel: 'CNG', qty: -55.100, amt: -192.85, bal: 3657.300, op: '系统自动', rel: 'ST001-20260223-0002' },
    { daysAgo: 6, type: 'inbound' as const, fuel: 'L-CNG', qty: 3975.600, amt: 16697.52, bal: 5541.200, op: '王芳', rel: 'IB-ST001-20260222-0001' },
    { daysAgo: 6, type: 'reversal' as const, fuel: 'CNG', qty: 45.000, amt: 157.50, bal: 3702.300, op: '系统自动', rel: 'OB-ST001-REV-0002' },
    { daysAgo: 6, type: 'sales_outbound' as const, fuel: 'L-CNG', qty: -35.800, amt: -150.36, bal: 5505.400, op: '系统自动', rel: 'ST001-20260222-0003' },
    { daysAgo: 7, type: 'sales_outbound' as const, fuel: 'LNG', qty: -88.200, amt: -423.36, bal: -3613.400, op: '系统自动', rel: 'ST001-20260221-0001' },
    { daysAgo: 8, type: 'inbound' as const, fuel: 'LNG', qty: 6965.200, amt: 33433.00, bal: 3351.800, op: '张伟', rel: 'IB-ST001-20260220-0001' },
    { daysAgo: 8, type: 'sales_outbound' as const, fuel: 'CNG', qty: -62.400, amt: -218.40, bal: 3764.700, op: '系统自动', rel: 'ST001-20260220-0002' },
    { daysAgo: 10, type: 'inbound' as const, fuel: 'CNG', qty: 4477.500, amt: 15671.25, bal: 3827.100, op: '王芳', rel: 'IB-ST001-20260218-0001' },
    { daysAgo: 10, type: 'sales_outbound' as const, fuel: 'LNG', qty: -72.500, amt: -348.00, bal: 3279.300, op: '系统自动', rel: 'ST001-20260218-0001' },
    { daysAgo: 12, type: 'sales_outbound' as const, fuel: 'L-CNG', qty: -42.900, amt: -180.18, bal: 1565.600, op: '系统自动', rel: 'ST001-20260216-0001' },
    { daysAgo: 13, type: 'inbound' as const, fuel: 'LNG', qty: 6448.000, amt: 30950.40, bal: 3351.800, op: '张伟', rel: 'IB-ST001-20260215-0001' },
    { daysAgo: 13, type: 'sales_outbound' as const, fuel: 'CNG', qty: -58.300, amt: -204.05, bal: -650.300, op: '系统自动', rel: 'ST001-20260215-0001' },
    { daysAgo: 14, type: 'stock_adjustment' as const, fuel: 'LNG', qty: -120.000, amt: -576.00, bal: -3096.200, op: '李明', rel: 'SA-ST001-20260214-0001' },
    { daysAgo: 15, type: 'sales_outbound' as const, fuel: 'LNG', qty: -68.900, amt: -330.72, bal: -3165.100, op: '系统自动', rel: 'ST001-20260213-0001' },
    { daysAgo: 16, type: 'inbound' as const, fuel: 'L-CNG', qty: 3480.200, amt: 14616.84, bal: 1608.500, op: '王芳', rel: 'IB-ST001-20260212-0001' },
    { daysAgo: 16, type: 'sales_outbound' as const, fuel: 'L-CNG', qty: -39.100, amt: -164.22, bal: 1569.400, op: '系统自动', rel: 'ST001-20260212-0002' },
    { daysAgo: 18, type: 'sales_outbound' as const, fuel: 'CNG', qty: -44.800, amt: -156.80, bal: -695.100, op: '系统自动', rel: 'ST001-20260210-0001' },
    { daysAgo: 20, type: 'sales_outbound' as const, fuel: 'LNG', qty: -75.200, amt: -360.96, bal: -3240.300, op: '系统自动', rel: 'ST001-20260208-0001' },
  ].map((e, i) => ({
    id: `ledger-${String(i + 1).padStart(3, '0')}`,
    stationId: 'station-001',
    fuelTypeId: e.fuel === 'LNG' ? 'ft-lng' : e.fuel === 'CNG' ? 'ft-cng' : 'ft-lcng',
    fuelTypeName: e.fuel,
    transactionType: e.type,
    quantity: e.qty,
    amount: e.amt,
    stockBalance: e.bal,
    operatorOrSource: e.op,
    relatedNo: e.rel,
    transactionTime: d(e.daysAgo, 8 + (i % 10), i * 7 % 60),
    createdAt: d(e.daysAgo, 8 + (i % 10), i * 7 % 60),
  })),
];

// ===== 罐存比对日志 (3 罐 × 30 天 = 90 条，取代表性子集) =====
const generateTankLogs = (): TankComparisonLog[] => {
  const tanks = [
    { tankId: 'equip-tank-001', tankName: 'LNG储罐-01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', baseActual: 15000, baseTheory: 15200 },
    { tankId: 'equip-tank-002', tankName: 'CNG储罐-01', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG', baseActual: 8500, baseTheory: 8600 },
    { tankId: 'equip-tank-003', tankName: 'L-CNG储罐-01', fuelTypeId: 'ft-lcng', fuelTypeName: 'L-CNG', baseActual: 5400, baseTheory: 5500 },
  ];
  const logs: TankComparisonLog[] = [];
  for (let day = 0; day < 30; day++) {
    tanks.forEach((tank, ti) => {
      const dailyDrift = (Math.sin(day * 0.5 + ti) * 50 + (Math.random() - 0.5) * 30);
      const actual = Math.round((tank.baseActual - day * 80 + dailyDrift + Math.random() * 200) * 1000) / 1000;
      const theory = Math.round((tank.baseTheory - day * 75 + dailyDrift * 0.3) * 1000) / 1000;
      const deviation = Math.round((actual - theory) * 1000) / 1000;
      const deviationRate = theory !== 0 ? Math.round((deviation / theory) * 10000) / 100 : 0;
      logs.push({
        id: `tcl-${String(day * 3 + ti + 1).padStart(3, '0')}`,
        stationId: 'station-001',
        tankId: tank.tankId,
        tankName: tank.tankName,
        fuelTypeId: tank.fuelTypeId,
        fuelTypeName: tank.fuelTypeName,
        snapshotDate: dateStr(day),
        actualLevel: Math.max(actual, 500),
        theoreticalStock: Math.max(theory, 500),
        deviation,
        deviationRate,
        createdAt: d(day, 23, 59),
      });
    });
  }
  return logs;
};

export const tankComparisonLogs: TankComparisonLog[] = generateTankLogs();

// ===== 盘点调整 (3 条) =====
export const stockAdjustments: StockAdjustment[] = [
  {
    id: 'sa-001', adjustmentNo: 'SA-ST001-20260214-0001', stationId: 'station-001',
    tankId: 'equip-tank-001', tankName: 'LNG储罐-01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG',
    beforeStock: 3216.200, afterStock: 3096.200, adjustmentQuantity: -120.000,
    reason: '月度盘点，实际罐存与理论库存偏差-120kg，经核实为蒸发累积损耗',
    auditStatus: 'approved',
    appliedBy: 'emp-002', applicantName: '张伟',
    auditedBy: 'emp-001', auditorName: '李明', auditedAt: d(14, 15, 0),
    createdAt: d(14, 13, 0), updatedAt: d(14, 15, 0),
  },
  {
    id: 'sa-002', adjustmentNo: 'SA-ST001-20260221-0001', stationId: 'station-001',
    tankId: 'equip-tank-002', tankName: 'CNG储罐-01', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG',
    beforeStock: 3700.500, afterStock: 3720.000, adjustmentQuantity: 19.500,
    reason: '计量设备校准后重新测量，实际库存略高于理论值',
    auditStatus: 'pending_review',
    appliedBy: 'emp-003', applicantName: '王芳',
    createdAt: d(7, 10, 0), updatedAt: d(7, 10, 0),
  },
  {
    id: 'sa-003', adjustmentNo: 'SA-ST001-20260219-0001', stationId: 'station-001',
    tankId: 'equip-tank-003', tankName: 'L-CNG储罐-01', fuelTypeId: 'ft-lcng', fuelTypeName: 'L-CNG',
    beforeStock: 1580.000, afterStock: 1500.000, adjustmentQuantity: -80.000,
    reason: '检测到持续偏差，申请调减理论库存',
    auditStatus: 'rejected',
    appliedBy: 'emp-002', applicantName: '张伟',
    auditedBy: 'emp-001', auditorName: '李明', auditedAt: d(9, 14, 0),
    rejectReason: '偏差超过3%，需先排查泄漏原因后再提交',
    createdAt: d(9, 11, 0), updatedAt: d(9, 14, 0),
  },
];

// ===== 库存预警 (8 条) =====
export const inventoryAlerts: InventoryAlert[] = [
  // Active (3)
  {
    id: 'alert-001', stationId: 'station-001',
    fuelTypeId: 'ft-lcng', fuelTypeName: 'L-CNG',
    tankId: 'equip-tank-003', tankName: 'L-CNG储罐-01',
    alertLevel: 'warning', alertType: 'low_stock',
    currentValue: '27.3% (5,460 kg)', thresholdValue: '≤ 30%',
    handleStatus: 'active', triggeredAt: d(0, 6, 15),
    createdAt: d(0, 6, 15),
  },
  {
    id: 'alert-002', stationId: 'station-001',
    fuelTypeId: 'ft-cng', fuelTypeName: 'CNG',
    alertLevel: 'critical', alertType: 'low_stock',
    currentValue: '8.5% (850 kg)', thresholdValue: '≤ 10%',
    handleStatus: 'active', triggeredAt: d(1, 22, 0),
    createdAt: d(1, 22, 0),
  },
  {
    id: 'alert-003', stationId: 'station-001',
    fuelTypeId: 'ft-lng', fuelTypeName: 'LNG',
    tankId: 'equip-tank-001', tankName: 'LNG储罐-01',
    alertLevel: 'loss_anomaly', alertType: 'loss_anomaly',
    currentValue: '偏差率 -2.35%', thresholdValue: '> ±2%',
    handleStatus: 'active', triggeredAt: d(0, 0, 5),
    createdAt: d(0, 0, 5),
  },
  // History: acknowledged (2)
  {
    id: 'alert-004', stationId: 'station-001',
    fuelTypeId: 'ft-lng', fuelTypeName: 'LNG',
    alertLevel: 'warning', alertType: 'low_stock',
    currentValue: '25.1% (5,020 kg)', thresholdValue: '≤ 30%',
    handleStatus: 'acknowledged', triggeredAt: d(5, 8, 0),
    handledBy: 'emp-001', handlerName: '李明', handledAt: d(5, 9, 30),
    createdAt: d(5, 8, 0),
  },
  {
    id: 'alert-005', stationId: 'station-001',
    fuelTypeId: 'ft-cng', fuelTypeName: 'CNG',
    tankId: 'equip-tank-002', tankName: 'CNG储罐-01',
    alertLevel: 'loss_anomaly', alertType: 'loss_anomaly',
    currentValue: '偏差率 -2.80%', thresholdValue: '> ±2%',
    handleStatus: 'acknowledged', triggeredAt: d(8, 0, 10),
    handledBy: 'emp-001', handlerName: '李明', handledAt: d(8, 8, 0),
    createdAt: d(8, 0, 10),
  },
  // History: dismissed (1)
  {
    id: 'alert-006', stationId: 'station-001',
    fuelTypeId: 'ft-lcng', fuelTypeName: 'L-CNG',
    alertLevel: 'warning', alertType: 'low_stock',
    currentValue: '29.8% (5,960 kg)', thresholdValue: '≤ 30%',
    handleStatus: 'dismissed', triggeredAt: d(12, 18, 0),
    handledBy: 'emp-001', handlerName: '李明', handledAt: d(12, 19, 0),
    createdAt: d(12, 18, 0),
  },
  // History: recovered (2)
  {
    id: 'alert-007', stationId: 'station-001',
    fuelTypeId: 'ft-lng', fuelTypeName: 'LNG',
    alertLevel: 'critical', alertType: 'low_stock',
    currentValue: '7.2% (1,440 kg)', thresholdValue: '≤ 10%',
    handleStatus: 'recovered', triggeredAt: d(15, 6, 0),
    resolvedAt: d(13, 8, 30),
    createdAt: d(15, 6, 0),
  },
  {
    id: 'alert-008', stationId: 'station-001',
    fuelTypeId: 'ft-cng', fuelTypeName: 'CNG',
    alertLevel: 'warning', alertType: 'low_stock',
    currentValue: '22.0% (2,200 kg)', thresholdValue: '≤ 30%',
    handleStatus: 'recovered', triggeredAt: d(20, 14, 0),
    resolvedAt: d(18, 14, 0),
    createdAt: d(20, 14, 0),
  },
];

// ===== 预警规则配置 (3 条) =====
export const alertConfigs: AlertConfig[] = [
  {
    id: 'ac-001', stationId: 'station-001', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG',
    safeThreshold: 30, warningThreshold: 30, criticalThreshold: 10, lossDeviationThreshold: 2,
    thresholdType: 'percentage',
    createdAt: d(30, 9, 0), updatedAt: d(30, 9, 0),
  },
  {
    id: 'ac-002', stationId: 'station-001', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG',
    safeThreshold: 30, warningThreshold: 30, criticalThreshold: 10, lossDeviationThreshold: 2,
    thresholdType: 'percentage',
    createdAt: d(30, 9, 0), updatedAt: d(30, 9, 0),
  },
  {
    id: 'ac-003', stationId: 'station-001', fuelTypeId: 'ft-lcng', fuelTypeName: 'L-CNG',
    safeThreshold: 30, warningThreshold: 30, criticalThreshold: 10, lossDeviationThreshold: 2,
    thresholdType: 'percentage',
    createdAt: d(30, 9, 0), updatedAt: d(30, 9, 0),
  },
];

// ===== 查询辅助函数 =====

export function getInventoryOverview(stationId: string): { cards: InventoryCard[]; trendData: TrendDataPoint[] } {
  const fuelTypes = [
    { id: 'ft-lng', name: 'LNG', stock: 15230.500, capacity: 20000, alert: 'safe' as const },
    { id: 'ft-cng', name: 'CNG', stock: 8520.000, capacity: 10000, alert: 'warning' as const },
    { id: 'ft-lcng', name: 'L-CNG', stock: 5461.500, capacity: 20000, alert: 'warning' as const },
  ];

  const cards: InventoryCard[] = fuelTypes.map(ft => {
    const todayIn = inboundRecords
      .filter(r => r.stationId === stationId && r.fuelTypeId === ft.id && r.auditStatus === 'approved' && r.inboundTime >= d(0, 0, 0))
      .reduce((sum, r) => sum + r.actualQuantity, 0);
    const todayOut = outboundRecords
      .filter(r => r.stationId === stationId && r.fuelTypeId === ft.id && r.outboundTime >= d(0, 0, 0))
      .reduce((sum, r) => sum + r.quantity, 0);
    return {
      fuelTypeId: ft.id,
      fuelTypeName: ft.name,
      currentStock: ft.stock,
      ratedCapacity: ft.capacity,
      tankLevelRatio: Math.round((ft.stock / ft.capacity) * 10000) / 100,
      alertLevel: ft.alert,
      todayInbound: Math.round(todayIn * 1000) / 1000,
      todayOutbound: Math.round(todayOut * 1000) / 1000,
      todayNetChange: Math.round((todayIn - todayOut) * 1000) / 1000,
    };
  });

  const trendData: TrendDataPoint[] = [];
  for (let day = 0; day < 30; day++) {
    fuelTypes.forEach(ft => {
      trendData.push({
        date: dateStr(day),
        fuelTypeId: ft.id,
        fuelTypeName: ft.name,
        stock: Math.round((ft.stock - day * 80 + Math.sin(day * 0.3) * 500 + Math.random() * 200) * 100) / 100,
      });
    });
  }

  return { cards, trendData };
}

export function getTankComparisonRealtime(stationId: string): TankComparisonCard[] {
  const todayLogs = tankComparisonLogs.filter(l => l.stationId === stationId && l.snapshotDate === dateStr(0));
  return todayLogs.map(log => {
    const trend7d = tankComparisonLogs
      .filter(l => l.tankId === log.tankId && l.stationId === stationId)
      .sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate))
      .slice(-7)
      .map(l => ({ date: l.snapshotDate, deviationRate: l.deviationRate }));
    const capacity = log.fuelTypeId === 'ft-lng' ? 20000 : log.fuelTypeId === 'ft-cng' ? 10000 : 20000;
    return {
      tankId: log.tankId,
      tankName: log.tankName,
      fuelTypeId: log.fuelTypeId,
      fuelTypeName: log.fuelTypeName,
      ratedCapacity: capacity,
      actualLevel: log.actualLevel,
      theoreticalStock: log.theoreticalStock,
      deviation: log.deviation,
      deviationRate: log.deviationRate,
      alertLevel: (Math.abs(log.deviationRate) > 2 ? 'critical' : log.deviationRate < -1 ? 'warning' : 'safe') as 'safe' | 'warning' | 'critical',
      trend7d,
    };
  });
}

export function getLossAnalysis(_stationId: string): { transportLoss: SupplierLoss[]; stationLoss: TankLoss[] } {
  const supplierMap = new Map<string, { batches: number; planned: number; actual: number }>();
  inboundRecords.filter(r => r.auditStatus === 'approved').forEach(r => {
    const existing = supplierMap.get(r.supplierName) ?? { batches: 0, planned: 0, actual: 0 };
    existing.batches++;
    existing.planned += r.plannedQuantity;
    existing.actual += r.actualQuantity;
    supplierMap.set(r.supplierName, existing);
  });
  const transportLoss: SupplierLoss[] = Array.from(supplierMap.entries()).map(([name, data]) => ({
    supplierName: name,
    batchCount: data.batches,
    plannedTotal: Math.round(data.planned * 1000) / 1000,
    actualTotal: Math.round(data.actual * 1000) / 1000,
    varianceRate: Math.round(((data.actual - data.planned) / data.planned) * 10000) / 100,
  }));

  const tankIds = ['equip-tank-001', 'equip-tank-002', 'equip-tank-003'];
  const stationLoss: TankLoss[] = tankIds.map(tankId => {
    const logs = tankComparisonLogs.filter(l => l.tankId === tankId).slice(0, 7);
    const avgRate = logs.length > 0 ? Math.round(logs.reduce((s, l) => s + l.deviationRate, 0) / logs.length * 100) / 100 : 0;
    return {
      tankId,
      tankName: logs[0]?.tankName ?? tankId,
      fuelTypeName: logs[0]?.fuelTypeName ?? '',
      avgDailyDeviationRate: avgRate,
      trend: logs.map(l => ({ date: l.snapshotDate, deviationRate: l.deviationRate })),
    };
  });

  return { transportLoss, stationLoss };
}

export function getActiveAlertCount(stationId: string): number {
  return inventoryAlerts.filter(a => a.stationId === stationId && a.handleStatus === 'active').length;
}
