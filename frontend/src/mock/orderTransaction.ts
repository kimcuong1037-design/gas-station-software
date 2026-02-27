import type {
  FuelingOrder,
  PaymentRecord,
  RefundRecord,
  OrderTagConfig,
  OrderStatistics,
  ExceptionStatistics,
} from '../features/energy-trade/order-transaction/types';

// ===== Helper =====
const d = (daysAgo: number, hour: number, min: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(hour, min, 0, 0);
  return dt.toISOString();
};

// ===== 订单标签配置 =====
export const orderTagConfigs: OrderTagConfig[] = [
  { id: 'tag-cfg-001', stationId: 'station-001', name: '滴滴', sortOrder: 0, usageCount: 8, createdAt: d(30, 9, 0) },
  { id: 'tag-cfg-002', stationId: 'station-001', name: '出租车', sortOrder: 1, usageCount: 5, createdAt: d(30, 9, 0) },
  { id: 'tag-cfg-003', stationId: 'station-001', name: '物流车队', sortOrder: 2, usageCount: 3, createdAt: d(28, 10, 0) },
  { id: 'tag-cfg-004', stationId: 'station-001', name: '自驾', sortOrder: 3, usageCount: 12, createdAt: d(25, 14, 0) },
  { id: 'tag-cfg-005', stationId: 'station-001', name: 'VIP', sortOrder: 4, usageCount: 2, createdAt: d(20, 11, 0) },
];

// ===== 充装订单 Mock (30 条) =====
export const fuelingOrders: FuelingOrder[] = [
  // === Day 0 (today) — 5 orders ===
  {
    id: 'order-001', orderNo: 'ST001-20260227-0001', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-001', nozzleNo: '01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-001', operatorName: '李明',
    unitPrice: 4.80, quantity: 32.50, totalAmount: 156.00, discountAmount: 0, payableAmount: 156.00,
    orderStatus: 'paid',
    vehiclePlateNo: '京A12345', memberName: '王伟', memberPhone: '138****1234', memberTier: 'vip',
    tags: [{ id: 'tag-001', orderId: 'order-001', tagName: '滴滴', createdAt: d(0, 8, 15) }],
    createdAt: d(0, 8, 10), updatedAt: d(0, 8, 15),
  },
  {
    id: 'order-002', orderNo: 'ST001-20260227-0002', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-002', nozzleNo: '02', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG', fuelUnit: 'm³',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-001', operatorName: '李明',
    unitPrice: 3.50, quantity: 45.00, totalAmount: 157.50, discountAmount: 0, payableAmount: 157.50,
    orderStatus: 'pending_payment',
    vehiclePlateNo: '京B67890',
    createdAt: d(0, 9, 30), updatedAt: d(0, 9, 30),
  },
  {
    id: 'order-003', orderNo: 'ST001-20260227-0003', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-003', nozzleNo: '03', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    operatorId: 'emp-002', operatorName: '张伟',
    unitPrice: 4.80, quantity: 18.75, totalAmount: 90.00, discountAmount: 0, payableAmount: 90.00,
    orderStatus: 'filling',
    createdAt: d(0, 10, 45), updatedAt: d(0, 10, 45),
  },
  {
    id: 'order-004', orderNo: 'ST001-20260227-0004', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-001', nozzleNo: '01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-001', operatorName: '李明',
    unitPrice: 4.80, quantity: 50.00, totalAmount: 240.00, discountAmount: 0, payableAmount: 240.00,
    orderStatus: 'completed',
    vehiclePlateNo: '京C11111', notes: '物流车队定期加注',
    tags: [{ id: 'tag-002', orderId: 'order-004', tagName: '物流车队', createdAt: d(0, 7, 30) }],
    createdAt: d(0, 7, 20), updatedAt: d(0, 7, 35),
  },
  {
    id: 'order-005', orderNo: 'ST001-20260227-0005', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-004', nozzleNo: '04', fuelTypeId: 'ft-lcng', fuelTypeName: 'L-CNG', fuelUnit: 'kg',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-002', operatorName: '张伟',
    unitPrice: 4.20, quantity: 25.00, totalAmount: 105.00, discountAmount: 0, payableAmount: 105.00,
    orderStatus: 'pending_payment',
    createdAt: d(0, 11, 0), updatedAt: d(0, 11, 0),
  },

  // === Day 1 — 5 orders ===
  {
    id: 'order-006', orderNo: 'ST001-20260226-0001', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-001', nozzleNo: '01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-002', shiftName: '中班', operatorId: 'emp-003', operatorName: '刘强',
    unitPrice: 4.80, quantity: 40.00, totalAmount: 192.00, discountAmount: 0, payableAmount: 192.00,
    orderStatus: 'paid',
    vehiclePlateNo: '京D22222',
    createdAt: d(1, 14, 20), updatedAt: d(1, 14, 25),
  },
  {
    id: 'order-007', orderNo: 'ST001-20260226-0002', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-002', nozzleNo: '02', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG', fuelUnit: 'm³',
    shiftId: 'shift-002', shiftName: '中班', operatorId: 'emp-003', operatorName: '刘强',
    unitPrice: 3.50, quantity: 60.00, totalAmount: 210.00, discountAmount: 0, payableAmount: 210.00,
    orderStatus: 'paid',
    vehiclePlateNo: '京E33333',
    tags: [{ id: 'tag-003', orderId: 'order-007', tagName: '出租车', createdAt: d(1, 15, 0) }],
    createdAt: d(1, 14, 50), updatedAt: d(1, 15, 0),
  },
  {
    id: 'order-008', orderNo: 'ST001-20260226-0003', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-003', nozzleNo: '03', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-001', operatorName: '李明',
    unitPrice: 4.80, quantity: 28.00, totalAmount: 134.40, discountAmount: 0, payableAmount: 134.40,
    orderStatus: 'completed',
    createdAt: d(1, 9, 15), updatedAt: d(1, 9, 20),
  },
  {
    id: 'order-009', orderNo: 'ST001-20260226-0004', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-001', nozzleNo: '01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-001', operatorName: '李明',
    unitPrice: 4.80, quantity: 22.50, totalAmount: 108.00, discountAmount: 0, payableAmount: 108.00,
    orderStatus: 'cancelled', cancelReason: '客户取消', cancelledAt: d(1, 10, 5),
    createdAt: d(1, 10, 0), updatedAt: d(1, 10, 5),
  },
  {
    id: 'order-010', orderNo: 'ST001-20260226-0005', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-004', nozzleNo: '04', fuelTypeId: 'ft-lcng', fuelTypeName: 'L-CNG', fuelUnit: 'kg',
    shiftId: 'shift-002', shiftName: '中班', operatorId: 'emp-003', operatorName: '刘强',
    unitPrice: 4.20, quantity: 35.00, totalAmount: 147.00, discountAmount: 0, payableAmount: 147.00,
    orderStatus: 'paid',
    createdAt: d(1, 16, 30), updatedAt: d(1, 16, 35),
  },

  // === Day 2 — 4 orders ===
  {
    id: 'order-011', orderNo: 'ST001-20260225-0001', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-001', nozzleNo: '01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-001', operatorName: '李明',
    unitPrice: 4.80, quantity: 55.00, totalAmount: 264.00, discountAmount: 0, payableAmount: 264.00,
    orderStatus: 'paid',
    vehiclePlateNo: '京F44444',
    createdAt: d(2, 8, 0), updatedAt: d(2, 8, 10),
  },
  {
    id: 'order-012', orderNo: 'ST001-20260225-0002', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-002', nozzleNo: '02', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG', fuelUnit: 'm³',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-002', operatorName: '张伟',
    unitPrice: 3.50, quantity: 38.00, totalAmount: 133.00, discountAmount: 0, payableAmount: 133.00,
    orderStatus: 'paid',
    createdAt: d(2, 9, 40), updatedAt: d(2, 9, 45),
  },
  {
    id: 'order-013', orderNo: 'ST001-20260225-0003', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-003', nozzleNo: '03', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-002', shiftName: '中班', operatorId: 'emp-003', operatorName: '刘强',
    unitPrice: 4.80, quantity: 42.00, totalAmount: 201.60, discountAmount: 0, payableAmount: 201.60,
    orderStatus: 'completed',
    createdAt: d(2, 15, 10), updatedAt: d(2, 15, 20),
  },
  {
    id: 'order-014', orderNo: 'ST001-20260225-0004', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-001', nozzleNo: '01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-002', shiftName: '中班', operatorId: 'emp-003', operatorName: '刘强',
    unitPrice: 4.80, quantity: 15.00, totalAmount: 72.00, discountAmount: 0, payableAmount: 72.00,
    orderStatus: 'refunded',
    vehiclePlateNo: '京G55555',
    createdAt: d(2, 16, 0), updatedAt: d(2, 16, 30),
  },

  // === Day 3 — 4 orders ===
  {
    id: 'order-015', orderNo: 'ST001-20260224-0001', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-002', nozzleNo: '02', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG', fuelUnit: 'm³',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-001', operatorName: '李明',
    unitPrice: 3.50, quantity: 50.00, totalAmount: 175.00, discountAmount: 0, payableAmount: 175.00,
    orderStatus: 'paid',
    createdAt: d(3, 8, 30), updatedAt: d(3, 8, 35),
  },
  {
    id: 'order-016', orderNo: 'ST001-20260224-0002', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-001', nozzleNo: '01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-002', operatorName: '张伟',
    unitPrice: 4.80, quantity: 30.00, totalAmount: 144.00, discountAmount: 0, payableAmount: 144.00,
    orderStatus: 'paid',
    vehiclePlateNo: '京H66666',
    tags: [{ id: 'tag-004', orderId: 'order-016', tagName: '自驾', createdAt: d(3, 10, 0) }],
    createdAt: d(3, 9, 50), updatedAt: d(3, 10, 0),
  },
  {
    id: 'order-017', orderNo: 'ST001-20260224-0003', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-003', nozzleNo: '03', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-002', shiftName: '中班', operatorId: 'emp-003', operatorName: '刘强',
    unitPrice: 4.80, quantity: 20.00, totalAmount: 96.00, discountAmount: 0, payableAmount: 96.00,
    orderStatus: 'completed',
    createdAt: d(3, 14, 0), updatedAt: d(3, 14, 10),
  },
  {
    id: 'order-018', orderNo: 'ST001-20260224-0004', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-004', nozzleNo: '04', fuelTypeId: 'ft-lcng', fuelTypeName: 'L-CNG', fuelUnit: 'kg',
    shiftId: 'shift-002', shiftName: '中班', operatorId: 'emp-003', operatorName: '刘强',
    unitPrice: 4.20, quantity: 48.00, totalAmount: 201.60, discountAmount: 0, payableAmount: 201.60,
    orderStatus: 'cancelled', cancelReason: '加注量错误', cancelledAt: d(3, 15, 10),
    createdAt: d(3, 15, 0), updatedAt: d(3, 15, 10),
  },

  // === Day 4 — 4 orders ===
  {
    id: 'order-019', orderNo: 'ST001-20260223-0001', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-001', nozzleNo: '01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-001', operatorName: '李明',
    unitPrice: 4.80, quantity: 38.00, totalAmount: 182.40, discountAmount: 0, payableAmount: 182.40,
    orderStatus: 'paid',
    createdAt: d(4, 8, 45), updatedAt: d(4, 8, 50),
  },
  {
    id: 'order-020', orderNo: 'ST001-20260223-0002', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-002', nozzleNo: '02', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG', fuelUnit: 'm³',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-002', operatorName: '张伟',
    unitPrice: 3.50, quantity: 55.00, totalAmount: 192.50, discountAmount: 0, payableAmount: 192.50,
    orderStatus: 'paid',
    createdAt: d(4, 10, 20), updatedAt: d(4, 10, 25),
  },
  {
    id: 'order-021', orderNo: 'ST001-20260223-0003', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-003', nozzleNo: '03', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-002', shiftName: '中班', operatorId: 'emp-003', operatorName: '刘强',
    unitPrice: 4.80, quantity: 27.50, totalAmount: 132.00, discountAmount: 0, payableAmount: 132.00,
    orderStatus: 'completed',
    createdAt: d(4, 14, 30), updatedAt: d(4, 14, 40),
  },
  {
    id: 'order-022', orderNo: 'ST001-20260223-0004', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-001', nozzleNo: '01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-002', shiftName: '中班', operatorId: 'emp-003', operatorName: '刘强',
    unitPrice: 4.80, quantity: 33.00, totalAmount: 158.40, discountAmount: 0, payableAmount: 158.40,
    orderStatus: 'paid',
    vehiclePlateNo: '京J88888',
    createdAt: d(4, 16, 0), updatedAt: d(4, 16, 5),
  },

  // === Day 5-6 — 4 orders ===
  {
    id: 'order-023', orderNo: 'ST001-20260222-0001', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-002', nozzleNo: '02', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG', fuelUnit: 'm³',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-001', operatorName: '李明',
    unitPrice: 3.50, quantity: 42.00, totalAmount: 147.00, discountAmount: 0, payableAmount: 147.00,
    orderStatus: 'paid',
    createdAt: d(5, 9, 0), updatedAt: d(5, 9, 5),
  },
  {
    id: 'order-024', orderNo: 'ST001-20260222-0002', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-001', nozzleNo: '01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-002', operatorName: '张伟',
    unitPrice: 4.80, quantity: 45.00, totalAmount: 216.00, discountAmount: 0, payableAmount: 216.00,
    orderStatus: 'paid',
    createdAt: d(5, 11, 0), updatedAt: d(5, 11, 5),
  },
  {
    id: 'order-025', orderNo: 'ST001-20260221-0001', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-003', nozzleNo: '03', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-002', shiftName: '中班', operatorId: 'emp-003', operatorName: '刘强',
    unitPrice: 4.80, quantity: 36.00, totalAmount: 172.80, discountAmount: 0, payableAmount: 172.80,
    orderStatus: 'completed',
    createdAt: d(6, 15, 30), updatedAt: d(6, 15, 40),
  },
  {
    id: 'order-026', orderNo: 'ST001-20260221-0002', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-004', nozzleNo: '04', fuelTypeId: 'ft-lcng', fuelTypeName: 'L-CNG', fuelUnit: 'kg',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-001', operatorName: '李明',
    unitPrice: 4.20, quantity: 29.00, totalAmount: 121.80, discountAmount: 0, payableAmount: 121.80,
    orderStatus: 'paid',
    createdAt: d(6, 10, 0), updatedAt: d(6, 10, 5),
  },

  // === 异常订单 (2 条) ===
  {
    id: 'order-027', orderNo: 'ST001-20260227-0006', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-001', nozzleNo: '01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-001', operatorName: '李明',
    unitPrice: 4.80, quantity: 25.00, totalAmount: 120.00, discountAmount: 0, payableAmount: 120.00,
    orderStatus: 'exception', exceptionType: 'power_loss', exceptionReason: '加注过程中突然断电',
    handleStatus: 'pending',
    createdAt: d(0, 9, 0), updatedAt: d(0, 9, 5),
  },
  {
    id: 'order-028', orderNo: 'ST001-20260226-0006', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-003', nozzleNo: '03', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-002', shiftName: '中班', operatorId: 'emp-003', operatorName: '刘强',
    unitPrice: 4.80, quantity: 18.00, totalAmount: 86.40, discountAmount: 0, payableAmount: 86.40,
    orderStatus: 'suspended', exceptionType: 'timeout', exceptionReason: '客户超时未付款',
    handleStatus: 'suspended',
    createdAt: d(1, 17, 0), updatedAt: d(1, 17, 30),
  },

  // === 已补单的异常 (1 条) + 已关闭 (1 条) ===
  {
    id: 'order-029', orderNo: 'ST001-20260225-0005', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-002', nozzleNo: '02', fuelTypeId: 'ft-cng', fuelTypeName: 'CNG', fuelUnit: 'm³',
    shiftId: 'shift-001', shiftName: '早班', operatorId: 'emp-002', operatorName: '张伟',
    unitPrice: 3.50, quantity: 30.00, totalAmount: 105.00, discountAmount: 0, payableAmount: 105.00,
    orderStatus: 'paid', exceptionType: 'amount_error', exceptionReason: '计量表读数偏差',
    handleStatus: 'supplemented',
    createdAt: d(2, 11, 0), updatedAt: d(2, 12, 0),
  },
  {
    id: 'order-030', orderNo: 'ST001-20260224-0005', stationId: 'station-001', stationName: '北京朝阳加气站',
    nozzleId: 'nozzle-001', nozzleNo: '01', fuelTypeId: 'ft-lng', fuelTypeName: 'LNG', fuelUnit: 'kg',
    shiftId: 'shift-002', shiftName: '中班', operatorId: 'emp-003', operatorName: '刘强',
    unitPrice: 4.80, quantity: 12.00, totalAmount: 57.60, discountAmount: 0, payableAmount: 57.60,
    orderStatus: 'closed', exceptionType: 'other', exceptionReason: '设备误触发',
    handleStatus: 'closed',
    createdAt: d(3, 16, 0), updatedAt: d(3, 16, 30),
  },
];

// ===== 支付记录 Mock (25 条) =====
export const paymentRecords: PaymentRecord[] = [
  { id: 'pay-001', orderId: 'order-001', paymentMethod: 'wechat',   amount: 156.00, transactionRef: 'WX20260227081500001', paymentStatus: 'success', paidAt: d(0, 8, 15), createdAt: d(0, 8, 15) },
  { id: 'pay-002', orderId: 'order-004', paymentMethod: 'cash',     amount: 240.00, paymentStatus: 'success', paidAt: d(0, 7, 35), createdAt: d(0, 7, 35) },
  { id: 'pay-003', orderId: 'order-006', paymentMethod: 'alipay',   amount: 192.00, transactionRef: 'ALI20260226142500001', paymentStatus: 'success', paidAt: d(1, 14, 25), createdAt: d(1, 14, 25) },
  { id: 'pay-004', orderId: 'order-007', paymentMethod: 'cash',     amount: 210.00, paymentStatus: 'success', paidAt: d(1, 15, 0), createdAt: d(1, 15, 0) },
  { id: 'pay-005', orderId: 'order-008', paymentMethod: 'wechat',   amount: 134.40, transactionRef: 'WX20260226092000001', paymentStatus: 'success', paidAt: d(1, 9, 20), createdAt: d(1, 9, 20) },
  { id: 'pay-006', orderId: 'order-010', paymentMethod: 'unionpay', amount: 147.00, transactionRef: 'UP20260226163500001', paymentStatus: 'success', paidAt: d(1, 16, 35), createdAt: d(1, 16, 35) },
  { id: 'pay-007', orderId: 'order-011', paymentMethod: 'cash',     amount: 264.00, paymentStatus: 'success', paidAt: d(2, 8, 10), createdAt: d(2, 8, 10) },
  { id: 'pay-008', orderId: 'order-012', paymentMethod: 'alipay',   amount: 133.00, transactionRef: 'ALI20260225094500001', paymentStatus: 'success', paidAt: d(2, 9, 45), createdAt: d(2, 9, 45) },
  { id: 'pay-009', orderId: 'order-013', paymentMethod: 'wechat',   amount: 201.60, transactionRef: 'WX20260225152000001', paymentStatus: 'success', paidAt: d(2, 15, 20), createdAt: d(2, 15, 20) },
  { id: 'pay-010', orderId: 'order-014', paymentMethod: 'cash',     amount: 72.00, paymentStatus: 'success', paidAt: d(2, 16, 10), createdAt: d(2, 16, 10) },
  { id: 'pay-011', orderId: 'order-015', paymentMethod: 'wechat',   amount: 175.00, transactionRef: 'WX20260224083500001', paymentStatus: 'success', paidAt: d(3, 8, 35), createdAt: d(3, 8, 35) },
  { id: 'pay-012', orderId: 'order-016', paymentMethod: 'alipay',   amount: 144.00, transactionRef: 'ALI20260224100000001', paymentStatus: 'success', paidAt: d(3, 10, 0), createdAt: d(3, 10, 0) },
  { id: 'pay-013', orderId: 'order-017', paymentMethod: 'cash',     amount: 96.00, paymentStatus: 'success', paidAt: d(3, 14, 10), createdAt: d(3, 14, 10) },
  { id: 'pay-014', orderId: 'order-019', paymentMethod: 'unionpay', amount: 182.40, transactionRef: 'UP20260223085000001', paymentStatus: 'success', paidAt: d(4, 8, 50), createdAt: d(4, 8, 50) },
  { id: 'pay-015', orderId: 'order-020', paymentMethod: 'wechat',   amount: 192.50, transactionRef: 'WX20260223102500001', paymentStatus: 'success', paidAt: d(4, 10, 25), createdAt: d(4, 10, 25) },
  { id: 'pay-016', orderId: 'order-021', paymentMethod: 'alipay',   amount: 132.00, transactionRef: 'ALI20260223144000001', paymentStatus: 'success', paidAt: d(4, 14, 40), createdAt: d(4, 14, 40) },
  { id: 'pay-017', orderId: 'order-022', paymentMethod: 'cash',     amount: 158.40, paymentStatus: 'success', paidAt: d(4, 16, 5), createdAt: d(4, 16, 5) },
  { id: 'pay-018', orderId: 'order-023', paymentMethod: 'wechat',   amount: 147.00, transactionRef: 'WX20260222090500001', paymentStatus: 'success', paidAt: d(5, 9, 5), createdAt: d(5, 9, 5) },
  { id: 'pay-019', orderId: 'order-024', paymentMethod: 'unionpay', amount: 216.00, transactionRef: 'UP20260222110500001', paymentStatus: 'success', paidAt: d(5, 11, 5), createdAt: d(5, 11, 5) },
  { id: 'pay-020', orderId: 'order-025', paymentMethod: 'cash',     amount: 172.80, paymentStatus: 'success', paidAt: d(6, 15, 40), createdAt: d(6, 15, 40) },
  { id: 'pay-021', orderId: 'order-026', paymentMethod: 'alipay',   amount: 121.80, transactionRef: 'ALI20260221100500001', paymentStatus: 'success', paidAt: d(6, 10, 5), createdAt: d(6, 10, 5) },
  // 补单支付
  { id: 'pay-022', orderId: 'order-029', paymentMethod: 'cash',     amount: 105.00, paymentStatus: 'success', paidAt: d(2, 12, 0), createdAt: d(2, 12, 0) },
  // 额外几条匹配30条订单中其他paid的
  { id: 'pay-023', orderId: 'order-006', paymentMethod: 'cash',     amount: 0, paymentStatus: 'cancelled', createdAt: d(1, 14, 22) }, // 取消的支付尝试
  { id: 'pay-024', orderId: 'order-011', paymentMethod: 'wechat',   amount: 264.00, transactionRef: 'WX20260225080800001', paymentStatus: 'failed', createdAt: d(2, 8, 8) }, // 失败的支付
  { id: 'pay-025', orderId: 'order-015', paymentMethod: 'alipay',   amount: 175.00, transactionRef: 'ALI20260224083200001', paymentStatus: 'failed', createdAt: d(3, 8, 32) }, // 失败后重试
];

// ===== 退款记录 Mock (5 条) =====
export const refundRecords: RefundRecord[] = [
  {
    id: 'refund-001', orderId: 'order-014', orderNo: 'ST001-20260225-0004',
    refundType: 'full', refundAmount: 72.00, refundReason: '客户加错燃料类型',
    refundStatus: 'refunded', appliedBy: 'emp-003', applicantName: '刘强',
    approvedBy: 'emp-001', approverName: '李明', approvedAt: d(2, 16, 20), refundedAt: d(2, 16, 25),
    createdAt: d(2, 16, 10),
  },
  {
    id: 'refund-002', orderId: 'order-011', orderNo: 'ST001-20260225-0001',
    refundType: 'partial', refundAmount: 48.00, refundReason: '实际充装量少于订单量，退差价',
    refundStatus: 'refunded', appliedBy: 'emp-001', applicantName: '李明',
    approvedBy: 'emp-001', approverName: '李明', approvedAt: d(2, 10, 0), refundedAt: d(2, 10, 5),
    createdAt: d(2, 9, 30),
  },
  {
    id: 'refund-003', orderId: 'order-006', orderNo: 'ST001-20260226-0001',
    refundType: 'partial', refundAmount: 50.00, refundReason: '客户投诉计量不准',
    refundStatus: 'pending_approval', appliedBy: 'emp-003', applicantName: '刘强',
    createdAt: d(1, 16, 0),
  },
  {
    id: 'refund-004', orderId: 'order-016', orderNo: 'ST001-20260224-0002',
    refundType: 'full', refundAmount: 144.00, refundReason: '客户要求全额退款',
    refundStatus: 'pending_approval', appliedBy: 'emp-002', applicantName: '张伟',
    createdAt: d(3, 11, 0),
  },
  {
    id: 'refund-005', orderId: 'order-019', orderNo: 'ST001-20260223-0001',
    refundType: 'partial', refundAmount: 30.00, refundReason: '优惠未正确应用',
    refundStatus: 'rejected', appliedBy: 'emp-001', applicantName: '李明',
    approvedBy: 'emp-001', approverName: '李明', approvedAt: d(4, 10, 0),
    rejectionReason: '优惠规则正确，不予退款',
    createdAt: d(4, 9, 30),
  },
];

// ===== 查询辅助函数 =====

export function getOrdersByStation(stationId: string): FuelingOrder[] {
  return fuelingOrders.filter(o => o.stationId === stationId);
}

export function getOrderStatistics(stationId: string, _dimension: 'today' | 'shift' = 'today'): OrderStatistics {
  const orders = fuelingOrders.filter(o => o.stationId === stationId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);

  const paidOrders = todayOrders.filter(o => ['paid', 'completed', 'refunded'].includes(o.orderStatus));
  const totalAmount = paidOrders.reduce((sum, o) => sum + o.payableAmount, 0);
  const totalQuantity = todayOrders.reduce((sum, o) => sum + o.quantity, 0);
  const pendingPaymentCount = todayOrders.filter(o => o.orderStatus === 'pending_payment').length;

  const methods: Array<'cash' | 'wechat' | 'alipay' | 'unionpay'> = ['cash', 'wechat', 'alipay', 'unionpay'];
  const todayPayments = paymentRecords.filter(p =>
    p.paymentStatus === 'success' &&
    todayOrders.some(o => o.id === p.orderId)
  );

  const paymentMethodBreakdown = methods.map(method => {
    const methodPayments = todayPayments.filter(p => p.paymentMethod === method);
    return {
      method,
      count: methodPayments.length,
      amount: methodPayments.reduce((sum, p) => sum + p.amount, 0),
    };
  });

  return {
    totalOrders: todayOrders.length,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalQuantity: Math.round(totalQuantity * 1000) / 1000,
    pendingPaymentCount,
    paymentMethodBreakdown,
  };
}

export function getExceptionStatistics(stationId: string): ExceptionStatistics {
  const exceptionOrders = fuelingOrders.filter(o =>
    o.stationId === stationId && o.exceptionType
  );
  return {
    pendingCount: exceptionOrders.filter(o => o.handleStatus === 'pending').length,
    suspendedCount: exceptionOrders.filter(o => o.handleStatus === 'suspended').length,
    supplementedCount: exceptionOrders.filter(o => o.handleStatus === 'supplemented').length,
    closedCount: exceptionOrders.filter(o => o.handleStatus === 'closed').length,
  };
}

export function getRefundsByStation(stationId: string): RefundRecord[] {
  const stationOrderIds = fuelingOrders.filter(o => o.stationId === stationId).map(o => o.id);
  return refundRecords.filter(r => stationOrderIds.includes(r.orderId));
}

export function getOrderDetail(orderId: string): FuelingOrder | undefined {
  const order = fuelingOrders.find(o => o.id === orderId);
  if (!order) return undefined;
  return {
    ...order,
    paymentRecords: paymentRecords.filter(p => p.orderId === orderId),
    refundRecords: refundRecords.filter(r => r.orderId === orderId),
  };
}

export function getOrderTagConfigs(stationId: string): OrderTagConfig[] {
  return orderTagConfigs.filter(t => t.stationId === stationId);
}
