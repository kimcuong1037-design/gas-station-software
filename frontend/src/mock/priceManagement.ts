// 价格管理模块模拟数据
import type {
  FuelTypePrice,
  NozzlePriceOverride,
  PriceAdjustment,
  PriceDefenseConfig,
  MemberPriceRule,
  PriceAgreement,
  PriceOverviewData,
  PriceBoardData,
  PriceBoardItem,
  AdjustmentDetail,
  FuelTypePriceWithNozzles,
  NozzlePrice,
} from '../features/energy-trade/price-management/types';

// ============================================================
// 1. 燃料类型基准价（station-001: 北京朝阳加气站）
// ============================================================

export const fuelTypePrices: FuelTypePrice[] = [
  {
    id: 'ftp-001',
    stationId: 'station-001',
    fuelTypeId: 'fuel-005',
    fuelTypeName: 'CNG',
    fuelTypeCode: 'CNG',
    fuelUnit: 'm³',
    basePrice: 3.50,
    effectiveFrom: '2026-02-20T00:00:00Z',
    status: 'active',
    updatedBy: 'emp-001',
    updatedByName: '张建国',
    lastAdjustedAt: '2026-02-20T08:00:00Z',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2026-02-20T08:00:00Z',
  },
  {
    id: 'ftp-002',
    stationId: 'station-001',
    fuelTypeId: 'fuel-006',
    fuelTypeName: 'LNG',
    fuelTypeCode: 'LNG',
    fuelUnit: 'kg',
    basePrice: 5.80,
    effectiveFrom: '2026-02-18T00:00:00Z',
    status: 'active',
    updatedBy: 'emp-001',
    updatedByName: '张建国',
    lastAdjustedAt: '2026-02-18T10:00:00Z',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2026-02-18T10:00:00Z',
  },
  {
    id: 'ftp-003',
    stationId: 'station-001',
    fuelTypeId: 'fuel-001',
    fuelTypeName: '92#汽油',
    fuelTypeCode: 'GASOLINE_92',
    fuelUnit: 'L',
    basePrice: 7.50,
    effectiveFrom: '2026-02-15T00:00:00Z',
    status: 'active',
    updatedBy: 'emp-001',
    updatedByName: '张建国',
    lastAdjustedAt: '2026-02-15T09:00:00Z',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'ftp-004',
    stationId: 'station-001',
    fuelTypeId: 'fuel-002',
    fuelTypeName: '95#汽油',
    fuelTypeCode: 'GASOLINE_95',
    fuelUnit: 'L',
    basePrice: 8.00,
    effectiveFrom: '2026-02-10T00:00:00Z',
    status: 'active',
    updatedBy: 'emp-001',
    updatedByName: '张建国',
    lastAdjustedAt: '2026-02-10T08:30:00Z',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2026-02-10T08:30:00Z',
  },
];

// ============================================================
// 2. 枪独立定价（station-001）
// ============================================================

export const nozzlePriceOverrides: NozzlePriceOverride[] = [
  {
    id: 'npo-001',
    nozzleId: 'nozzle-003',
    nozzleNo: '03',
    stationId: 'station-001',
    fuelTypeId: 'fuel-006',
    fuelTypeName: 'LNG',
    overridePrice: 6.00,
    effectiveFrom: '2026-02-19T00:00:00Z',
    createdBy: 'emp-001',
    createdByName: '张建国',
    createdAt: '2026-02-19T09:00:00Z',
  },
  {
    id: 'npo-002',
    nozzleId: 'nozzle-005',
    nozzleNo: '05',
    stationId: 'station-001',
    fuelTypeId: 'fuel-001',
    fuelTypeName: '92#汽油',
    overridePrice: 7.30,
    effectiveFrom: '2026-02-16T00:00:00Z',
    createdBy: 'emp-002',
    createdByName: '李明',
    createdAt: '2026-02-16T08:00:00Z',
  },
];

// ============================================================
// 3. 调价记录
// ============================================================

export const priceAdjustments: PriceAdjustment[] = [
  {
    id: 'adj-001',
    adjustmentNo: 'PA-BJCY-202602-001',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    fuelTypeId: 'fuel-005',
    fuelTypeName: 'CNG',
    fuelUnit: 'm³',
    oldPrice: 3.20,
    newPrice: 3.50,
    changeAmount: 0.30,
    changePct: 9.38,
    adjustmentType: 'immediate',
    effectiveAt: '2026-02-20T08:00:00Z',
    status: 'executed',
    reason: '上游气源采购价上调，同步调整终端价格',
    adjustedBy: 'emp-001',
    adjustedByName: '张建国',
    approvedBy: 'emp-hq-001',
    approvedByName: '王大明',
    approvedAt: '2026-02-20T07:50:00Z',
    executedAt: '2026-02-20T08:00:00Z',
    createdAt: '2026-02-20T07:30:00Z',
    updatedAt: '2026-02-20T08:00:00Z',
  },
  {
    id: 'adj-002',
    adjustmentNo: 'PA-BJCY-202602-002',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    fuelTypeId: 'fuel-006',
    fuelTypeName: 'LNG',
    fuelUnit: 'kg',
    oldPrice: 5.50,
    newPrice: 5.80,
    changeAmount: 0.30,
    changePct: 5.45,
    adjustmentType: 'immediate',
    effectiveAt: '2026-02-18T10:00:00Z',
    status: 'executed',
    reason: 'LNG市场价格波动，跟随调整',
    adjustedBy: 'emp-001',
    adjustedByName: '张建国',
    approvedBy: 'emp-hq-001',
    approvedByName: '王大明',
    approvedAt: '2026-02-18T09:45:00Z',
    executedAt: '2026-02-18T10:00:00Z',
    createdAt: '2026-02-18T09:00:00Z',
    updatedAt: '2026-02-18T10:00:00Z',
  },
  {
    id: 'adj-003',
    adjustmentNo: 'PA-BJCY-202602-003',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    fuelTypeId: 'fuel-006',
    fuelTypeName: 'LNG',
    fuelUnit: 'kg',
    nozzleId: 'nozzle-003',
    nozzleNo: '03',
    oldPrice: 5.80,
    newPrice: 6.00,
    changeAmount: 0.20,
    changePct: 3.45,
    adjustmentType: 'immediate',
    effectiveAt: '2026-02-19T09:00:00Z',
    status: 'executed',
    reason: '03号枪独立定价：大车专用枪加价',
    adjustedBy: 'emp-001',
    adjustedByName: '张建国',
    executedAt: '2026-02-19T09:00:00Z',
    createdAt: '2026-02-19T08:30:00Z',
    updatedAt: '2026-02-19T09:00:00Z',
  },
  {
    id: 'adj-004',
    adjustmentNo: 'PA-BJCY-202602-004',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    fuelTypeId: 'fuel-001',
    fuelTypeName: '92#汽油',
    fuelUnit: 'L',
    oldPrice: 7.50,
    newPrice: 7.80,
    changeAmount: 0.30,
    changePct: 4.00,
    adjustmentType: 'immediate',
    effectiveAt: '2026-02-24T00:00:00Z',
    status: 'pending_approval',
    reason: '发改委指导价上调，同步调整零售价',
    adjustedBy: 'emp-001',
    adjustedByName: '张建国',
    createdAt: '2026-02-24T08:00:00Z',
    updatedAt: '2026-02-24T08:00:00Z',
  },
  {
    id: 'adj-005',
    adjustmentNo: 'PA-BJCY-202602-005',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    fuelTypeId: 'fuel-002',
    fuelTypeName: '95#汽油',
    fuelUnit: 'L',
    oldPrice: 8.00,
    newPrice: 8.30,
    changeAmount: 0.30,
    changePct: 3.75,
    adjustmentType: 'scheduled',
    effectiveAt: '2026-02-26T00:00:00Z',
    status: 'approved',
    reason: '配合发改委调价窗口，定时生效',
    adjustedBy: 'emp-001',
    adjustedByName: '张建国',
    approvedBy: 'emp-hq-001',
    approvedByName: '王大明',
    approvedAt: '2026-02-24T10:00:00Z',
    createdAt: '2026-02-24T09:00:00Z',
    updatedAt: '2026-02-24T10:00:00Z',
  },
  {
    id: 'adj-006',
    adjustmentNo: 'PA-BJCY-202602-006',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    fuelTypeId: 'fuel-005',
    fuelTypeName: 'CNG',
    fuelUnit: 'm³',
    oldPrice: 3.50,
    newPrice: 4.20,
    changeAmount: 0.70,
    changePct: 20.00,
    adjustmentType: 'immediate',
    effectiveAt: '2026-02-22T00:00:00Z',
    status: 'rejected',
    reason: '市场竞争对手涨价，建议跟进',
    adjustedBy: 'emp-002',
    adjustedByName: '李明',
    approvedBy: 'emp-hq-001',
    approvedByName: '王大明',
    approvedAt: '2026-02-22T11:00:00Z',
    approvalNote: '涨幅20%过高，超出CNG品类最大涨幅限制(10%)，请重新调整',
    createdAt: '2026-02-22T09:00:00Z',
    updatedAt: '2026-02-22T11:00:00Z',
  },
  {
    id: 'adj-007',
    adjustmentNo: 'PA-BJCY-202602-007',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    fuelTypeId: 'fuel-006',
    fuelTypeName: 'LNG',
    fuelUnit: 'kg',
    oldPrice: 5.80,
    newPrice: 6.20,
    changeAmount: 0.40,
    changePct: 6.90,
    adjustmentType: 'scheduled',
    effectiveAt: '2026-02-25T00:00:00Z',
    status: 'cancelled',
    reason: '预计下周市场价格波动，提前调整',
    adjustedBy: 'emp-001',
    adjustedByName: '张建国',
    approvedBy: 'emp-hq-001',
    approvedByName: '王大明',
    approvedAt: '2026-02-21T14:00:00Z',
    approvalNote: '因市场价格回落，取消此次定时调价',
    createdAt: '2026-02-21T10:00:00Z',
    updatedAt: '2026-02-23T16:00:00Z',
  },
  {
    id: 'adj-008',
    adjustmentNo: 'PA-BJCY-202602-008',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    fuelTypeId: 'fuel-001',
    fuelTypeName: '92#汽油',
    fuelUnit: 'L',
    oldPrice: 7.20,
    newPrice: 7.50,
    changeAmount: 0.30,
    changePct: 4.17,
    adjustmentType: 'immediate',
    effectiveAt: '2026-02-15T09:00:00Z',
    status: 'executed',
    reason: '发改委2月调价窗口执行',
    adjustedBy: 'emp-001',
    adjustedByName: '张建国',
    approvedBy: 'emp-hq-001',
    approvedByName: '王大明',
    approvedAt: '2026-02-15T08:45:00Z',
    executedAt: '2026-02-15T09:00:00Z',
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
  },
];

// ============================================================
// 4. 调价防御配置
// ============================================================

export const priceDefenseConfigs: PriceDefenseConfig[] = [
  {
    id: 'pdc-001',
    maxIncreasePct: 20,
    maxDecreasePct: 20,
    requireApproval: true,
    approvalThresholdPct: 10,
    updatedBy: 'emp-hq-001',
    updatedByName: '王大明',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'pdc-002',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    maxIncreasePct: 15,
    maxDecreasePct: 15,
    requireApproval: true,
    approvalThresholdPct: 8,
    updatedBy: 'emp-hq-001',
    updatedByName: '王大明',
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'pdc-003',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    fuelTypeId: 'fuel-005',
    fuelTypeName: 'CNG',
    maxIncreasePct: 10,
    maxDecreasePct: 10,
    requireApproval: false,
    approvalThresholdPct: 0,
    updatedBy: 'emp-001',
    updatedByName: '张建国',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2026-02-10T14:00:00Z',
  },
];

// ============================================================
// 5. 会员专享价规则（station-001）
// ============================================================

export const memberPriceRules: MemberPriceRule[] = [
  {
    id: 'mpr-001',
    stationId: 'station-001',
    fuelTypeId: 'fuel-005',
    fuelTypeName: 'CNG',
    fuelUnit: 'm³',
    basePrice: 3.50,
    memberTier: 'normal',
    discountType: 'fixed_amount',
    discountValue: 0.10,
    status: 'active',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2026-02-20T08:00:00Z',
  },
  {
    id: 'mpr-002',
    stationId: 'station-001',
    fuelTypeId: 'fuel-005',
    fuelTypeName: 'CNG',
    fuelUnit: 'm³',
    basePrice: 3.50,
    memberTier: 'vip',
    discountType: 'fixed_amount',
    discountValue: 0.20,
    status: 'active',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2026-02-20T08:00:00Z',
  },
  {
    id: 'mpr-003',
    stationId: 'station-001',
    fuelTypeId: 'fuel-005',
    fuelTypeName: 'CNG',
    fuelUnit: 'm³',
    basePrice: 3.50,
    memberTier: 'svip',
    discountType: 'fixed_amount',
    discountValue: 0.30,
    status: 'active',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2026-02-20T08:00:00Z',
  },
  {
    id: 'mpr-004',
    stationId: 'station-001',
    fuelTypeId: 'fuel-006',
    fuelTypeName: 'LNG',
    fuelUnit: 'kg',
    basePrice: 5.80,
    memberTier: 'vip',
    discountType: 'percentage',
    discountValue: 3,
    status: 'active',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2026-02-18T10:00:00Z',
  },
];

// ============================================================
// 6. 价格协议
// ============================================================

export const priceAgreements: PriceAgreement[] = [
  {
    id: 'agr-001',
    enterpriseId: 'ent-001',
    enterpriseName: '中石化运输有限公司',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    fuelTypeId: 'fuel-005',
    fuelTypeName: 'CNG',
    fuelUnit: 'm³',
    agreedPrice: 3.30,
    basePrice: 3.50,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    status: 'active',
    createdBy: 'emp-hq-001',
    createdByName: '王大明',
    createdAt: '2025-12-20T10:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'agr-002',
    enterpriseId: 'ent-002',
    enterpriseName: '顺丰速运集团',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    fuelTypeId: 'fuel-006',
    fuelTypeName: 'LNG',
    fuelUnit: 'kg',
    agreedPrice: 5.50,
    basePrice: 5.80,
    validFrom: '2025-06-01',
    validTo: '2026-03-15',
    status: 'active',
    createdBy: 'emp-hq-001',
    createdByName: '王大明',
    createdAt: '2025-05-20T14:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'agr-003',
    enterpriseId: 'ent-003',
    enterpriseName: '京东物流股份有限公司',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    fuelTypeId: 'fuel-005',
    fuelTypeName: 'CNG',
    fuelUnit: 'm³',
    agreedPrice: 3.10,
    basePrice: 3.20,
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    status: 'expired',
    createdBy: 'emp-hq-001',
    createdByName: '王大明',
    createdAt: '2024-12-15T10:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'agr-004',
    enterpriseId: 'ent-004',
    enterpriseName: '圆通速递有限公司',
    stationId: 'station-001',
    stationName: '北京朝阳加气站',
    fuelTypeId: 'fuel-006',
    fuelTypeName: 'LNG',
    fuelUnit: 'kg',
    agreedPrice: 5.40,
    basePrice: 5.50,
    validFrom: '2025-07-01',
    validTo: '2026-06-30',
    status: 'terminated',
    createdBy: 'emp-hq-001',
    createdByName: '王大明',
    terminatedAt: '2026-01-15T16:00:00Z',
    terminationReason: '企业车队缩减，双方协商提前终止',
    createdAt: '2025-06-20T09:00:00Z',
    updatedAt: '2026-01-15T16:00:00Z',
  },
];

// ============================================================
// 7. 辅助函数
// ============================================================

const station001NozzleMap: Record<string, { nozzleNo: string; fuelTypeId: string }> = {
  'nozzle-001': { nozzleNo: '01', fuelTypeId: 'fuel-005' },
  'nozzle-002': { nozzleNo: '02', fuelTypeId: 'fuel-005' },
  'nozzle-003': { nozzleNo: '03', fuelTypeId: 'fuel-006' },
  'nozzle-004': { nozzleNo: '04', fuelTypeId: 'fuel-006' },
  'nozzle-005': { nozzleNo: '05', fuelTypeId: 'fuel-001' },
  'nozzle-006': { nozzleNo: '06', fuelTypeId: 'fuel-002' },
};

function getNozzlesForFuelType(stationId: string, fuelTypeId: string): NozzlePrice[] {
  if (stationId !== 'station-001') return [];

  return Object.entries(station001NozzleMap)
    .filter(([, info]) => info.fuelTypeId === fuelTypeId)
    .map(([nozzleId, info]) => {
      const override = nozzlePriceOverrides.find(
        (o) => o.nozzleId === nozzleId && o.stationId === stationId,
      );
      const ftp = fuelTypePrices.find(
        (f) => f.stationId === stationId && f.fuelTypeId === fuelTypeId,
      );
      return {
        nozzleId,
        nozzleNo: info.nozzleNo,
        currentPrice: override ? override.overridePrice : (ftp?.basePrice ?? 0),
        isOverride: !!override,
        overrideId: override?.id,
      };
    });
}

export function getPriceOverviewData(stationId: string): PriceOverviewData {
  const stationFuelPrices = fuelTypePrices.filter((f) => f.stationId === stationId);
  const stationOverrides = nozzlePriceOverrides.filter((o) => o.stationId === stationId);
  const pendingAdj = priceAdjustments.filter(
    (a) => a.stationId === stationId && (a.status === 'pending_approval' || a.status === 'approved'),
  );

  const defenseConfig =
    priceDefenseConfigs.find((c) => c.stationId === stationId && c.fuelTypeId) ??
    priceDefenseConfigs.find((c) => c.stationId === stationId && !c.fuelTypeId) ??
    priceDefenseConfigs.find((c) => !c.stationId && !c.fuelTypeId);

  const fuelTypePricesWithNozzles: FuelTypePriceWithNozzles[] = stationFuelPrices.map((ftp) => {
    const nozzles = getNozzlesForFuelType(stationId, ftp.fuelTypeId);
    const overrideCount = nozzles.filter((n) => n.isOverride).length;
    const pending = pendingAdj.find((a) => a.fuelTypeId === ftp.fuelTypeId && !a.nozzleId);

    return {
      ...ftp,
      nozzleCount: nozzles.length,
      overrideCount,
      nozzles,
      pendingAdjustment: pending,
    };
  });

  return {
    fuelTypeCount: stationFuelPrices.length,
    overrideNozzleCount: stationOverrides.length,
    pendingScheduleCount: pendingAdj.filter((a) => a.status === 'approved' && a.adjustmentType === 'scheduled').length,
    fuelTypePrices: fuelTypePricesWithNozzles,
    pendingAdjustments: pendingAdj,
    defenseConfig,
  };
}

export function getPriceBoardData(stationId: string): PriceBoardData {
  const stationFuelPrices = fuelTypePrices.filter((f) => f.stationId === stationId);
  const stationMemberRules = memberPriceRules.filter(
    (r) => r.stationId === stationId && r.status === 'active',
  );

  const stationName =
    stationId === 'station-001' ? '北京朝阳加气站'
    : stationId === 'station-002' ? '上海浦东加气站'
    : stationId === 'station-003' ? '杭州西湖加气站'
    : '未知站点';

  const latestUpdate = stationFuelPrices.reduce(
    (latest, ftp) => (ftp.updatedAt > latest ? ftp.updatedAt : latest),
    '2000-01-01T00:00:00Z',
  );

  const prices = stationFuelPrices.map((ftp) => {
    const rules = stationMemberRules.filter((r) => r.fuelTypeId === ftp.fuelTypeId);

    let memberPrice: number | undefined;
    let maxDiscount: number | undefined;

    if (rules.length > 0) {
      const discounts = rules.map((rule) => {
        if (rule.discountType === 'fixed_amount') return rule.discountValue;
        return ftp.basePrice * (rule.discountValue / 100);
      });

      maxDiscount = Math.max(...discounts);
      memberPrice = Number((ftp.basePrice - maxDiscount).toFixed(2));
      maxDiscount = Number(maxDiscount.toFixed(2));
    }

    const item: PriceBoardItem = {
      fuelTypeName: ftp.fuelTypeName,
      fuelUnit: ftp.fuelUnit,
      standardPrice: ftp.basePrice,
      memberPrice,
      maxDiscount,
    };
    return item;
  });

  return {
    stationName,
    prices,
    lastUpdatedAt: latestUpdate,
  };
}

export function getAdjustmentDetail(id: string): AdjustmentDetail | undefined {
  const adjustment = priceAdjustments.find((a) => a.id === id);
  if (!adjustment) return undefined;

  const defenseConfig =
    priceDefenseConfigs.find(
      (c) => c.stationId === adjustment.stationId && c.fuelTypeId === adjustment.fuelTypeId,
    ) ??
    priceDefenseConfigs.find(
      (c) => c.stationId === adjustment.stationId && !c.fuelTypeId,
    ) ??
    priceDefenseConfigs.find((c) => !c.stationId && !c.fuelTypeId);

  let affectedNozzles: AdjustmentDetail['affectedNozzles'] = [];

  if (adjustment.nozzleId) {
    affectedNozzles = [
      {
        nozzleNo: adjustment.nozzleNo!,
        beforePrice: adjustment.oldPrice,
        afterPrice: adjustment.newPrice,
        isOverride: true,
      },
    ];
  } else {
    const nozzles = getNozzlesForFuelType(adjustment.stationId, adjustment.fuelTypeId);
    affectedNozzles = nozzles.map((nozzle) => ({
      nozzleNo: nozzle.nozzleNo,
      beforePrice: nozzle.isOverride ? nozzle.currentPrice : adjustment.oldPrice,
      afterPrice: nozzle.isOverride ? nozzle.currentPrice : adjustment.newPrice,
      isOverride: nozzle.isOverride,
    }));
  }

  return {
    ...adjustment,
    affectedNozzles,
    defenseConfig,
  };
}
