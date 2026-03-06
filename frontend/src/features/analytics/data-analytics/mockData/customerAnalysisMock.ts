import type { CustomerOverview, RFMCustomerPoint, CustomerSegmentSummary, CustomerLifecycleData, MemberGrowthPoint, ChurnRiskCustomer } from '../types';

export const customerOverview: CustomerOverview = {
  totalCustomers: 4821,
  newCustomersThisPeriod: 143,
  activeCustomers: 2143,
  churnRiskCustomers: 312,
  memberRatio: 0.782,
};

// 50 个 RFM 客户数据点
const segments = ['high_value', 'growing', 'regular', 'churn_risk'] as const;
const surnames = ['张', '李', '王', '赵', '刘', '陈', '杨', '黄', '周', '吴'];

export const rfmCustomers: RFMCustomerPoint[] = Array.from({ length: 50 }, (_, i) => {
  const segment = segments[i < 5 ? 0 : i < 15 ? 1 : i < 35 ? 2 : 3];
  const r = segment === 'high_value' ? 2 + Math.floor(Math.random() * 8) :
            segment === 'growing' ? 10 + Math.floor(Math.random() * 20) :
            segment === 'regular' ? 20 + Math.floor(Math.random() * 40) :
            65 + Math.floor(Math.random() * 60);
  const f = segment === 'high_value' ? 20 + Math.floor(Math.random() * 15) :
            segment === 'growing' ? 8 + Math.floor(Math.random() * 12) :
            segment === 'regular' ? 3 + Math.floor(Math.random() * 6) :
            1 + Math.floor(Math.random() * 2);
  const m = segment === 'high_value' ? 3000 + Math.floor(Math.random() * 3000) :
            segment === 'growing' ? 1200 + Math.floor(Math.random() * 1500) :
            segment === 'regular' ? 300 + Math.floor(Math.random() * 600) :
            100 + Math.floor(Math.random() * 300);
  return {
    customerId: `CUST-${String(i + 1).padStart(4, '0')}`,
    customerName: `${surnames[i % surnames.length]}**`,
    recencyDays: r,
    frequency: f,
    monetary: m,
    rfmScore: segment === 'high_value' ? 85 + Math.floor(Math.random() * 15) :
              segment === 'growing' ? 55 + Math.floor(Math.random() * 25) :
              segment === 'regular' ? 30 + Math.floor(Math.random() * 20) :
              5 + Math.floor(Math.random() * 20),
    segment,
  };
});

export const segmentSummary: CustomerSegmentSummary[] = [
  { segment: 'high_value', segmentLabel: '高价值', count: 483, ratio: 0.10, avgMonetary: 4150 },
  { segment: 'growing', segmentLabel: '成长型', count: 962, ratio: 0.20, avgMonetary: 1820 },
  { segment: 'regular', segmentLabel: '一般', count: 2414, ratio: 0.50, avgMonetary: 680 },
  { segment: 'churn_risk', segmentLabel: '流失风险', count: 962, ratio: 0.20, avgMonetary: 240 },
];

export const lifecycleData: CustomerLifecycleData[] = [
  { stage: 'new', stageLabel: '新客户', count: 143, ratio: 0.03, avgDaysSinceLastPurchase: 5 },
  { stage: 'active', stageLabel: '活跃', count: 2143, ratio: 0.44, avgDaysSinceLastPurchase: 12 },
  { stage: 'dormant', stageLabel: '沉睡', count: 1823, ratio: 0.38, avgDaysSinceLastPurchase: 48 },
  { stage: 'churned', stageLabel: '流失', count: 712, ratio: 0.15, avgDaysSinceLastPurchase: 95 },
];

export const memberGrowthTrend: MemberGrowthPoint[] = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  const date = `2025-${String(month).padStart(2, '0')}-01`;
  const baseTotal = 3800 + i * 90;
  const newCount = 80 + Math.floor(Math.random() * 60) + (i > 8 ? 30 : 0);
  return {
    date,
    totalCount: baseTotal + newCount,
    newCount,
    growthRate: Math.round((newCount / baseTotal) * 100 * 10) / 10,
  };
});

export const churnRiskList: ChurnRiskCustomer[] = [
  { customerId: 'CUST-0042', customerName: '李**', lastPurchaseDate: '2025-12-03', purchaseFrequency: 8.5, totalMonetary: 1840, daysSinceLastPurchase: 93, churnProbability: 'high' },
  { customerId: 'CUST-0108', customerName: '王**', lastPurchaseDate: '2025-12-15', purchaseFrequency: 6.2, totalMonetary: 1320, daysSinceLastPurchase: 81, churnProbability: 'high' },
  { customerId: 'CUST-0215', customerName: '赵**', lastPurchaseDate: '2025-12-28', purchaseFrequency: 4.8, totalMonetary: 980, daysSinceLastPurchase: 68, churnProbability: 'high' },
  { customerId: 'CUST-0067', customerName: '刘**', lastPurchaseDate: '2026-01-05', purchaseFrequency: 5.1, totalMonetary: 1150, daysSinceLastPurchase: 60, churnProbability: 'medium' },
  { customerId: 'CUST-0183', customerName: '陈**', lastPurchaseDate: '2026-01-08', purchaseFrequency: 3.9, totalMonetary: 820, daysSinceLastPurchase: 57, churnProbability: 'medium' },
  { customerId: 'CUST-0294', customerName: '杨**', lastPurchaseDate: '2026-01-12', purchaseFrequency: 4.3, totalMonetary: 960, daysSinceLastPurchase: 53, churnProbability: 'medium' },
  { customerId: 'CUST-0155', customerName: '黄**', lastPurchaseDate: '2026-01-15', purchaseFrequency: 3.5, totalMonetary: 720, daysSinceLastPurchase: 50, churnProbability: 'medium' },
  { customerId: 'CUST-0321', customerName: '周**', lastPurchaseDate: '2026-01-18', purchaseFrequency: 2.8, totalMonetary: 580, daysSinceLastPurchase: 47, churnProbability: 'medium' },
  { customerId: 'CUST-0078', customerName: '吴**', lastPurchaseDate: '2026-01-22', purchaseFrequency: 2.5, totalMonetary: 490, daysSinceLastPurchase: 43, churnProbability: 'low' },
  { customerId: 'CUST-0401', customerName: '张**', lastPurchaseDate: '2026-01-25', purchaseFrequency: 2.2, totalMonetary: 430, daysSinceLastPurchase: 40, churnProbability: 'low' },
];
