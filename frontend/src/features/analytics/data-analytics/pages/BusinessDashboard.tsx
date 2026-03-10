import React, { useMemo, useState } from 'react';
import { Alert, Card, Col, Radio, Row, Select, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';

interface LayoutContext {
  selectedStationId: string;
}

import { RequirementTag } from '../../../../components/RequirementTag';
import { LineChart, BarChart, PieChart } from '../../../../components/Charts';
import KPICard from '../components/KPICard';
import { KPI_CARDS, RANKING_METRIC_OPTIONS, ANALYTICS_ROUTES } from '../constants';
import { getDashboardData, sparklineData } from '../mockData/dashboardMock';
import type { TimePeriod, RankingMetric, StationRankingItem } from '../types';

const { Title, Text } = Typography;

const SPARKLINE_MAP: Record<string, number[]> = {
  totalRevenue: sparklineData.revenue,
  totalOrders: sparklineData.orders,
  totalFuelVolume: sparklineData.fuelVolume,
  avgOrderValue: sparklineData.avgOrderValue,
};

const BusinessDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedStationId: _stationId } = useOutletContext<LayoutContext>();

  const [period, setPeriod] = useState<TimePeriod>('day');
  const [rankingMetric, setRankingMetric] = useState<RankingMetric>('revenue');

  const dashboardData = useMemo(() => getDashboardData(period), [period]);
  const { kpi, salesTrend, fuelBreakdown, stationRanking, memberStats } = dashboardData;

  // Line chart data
  const trendChartData = useMemo(
    () => salesTrend.map(p => ({ date: p.date, value: p.revenue, seriesName: t('analytics.dashboard.kpi.revenue') })),
    [salesTrend, t],
  );

  // Pie chart data
  const fuelPieData = useMemo(
    () => fuelBreakdown.map(f => ({ name: f.fuelTypeName, value: f.revenue })),
    [fuelBreakdown],
  );
  const totalRevenue = useMemo(
    () => fuelBreakdown.reduce((sum, f) => sum + f.revenue, 0),
    [fuelBreakdown],
  );

  // Bar chart data (station ranking)
  const rankingBarData = useMemo(
    () => stationRanking
      .sort((a, b) => (b[rankingMetric] as number) - (a[rankingMetric] as number))
      .map(s => ({ name: s.stationName, value: s[rankingMetric] as number })),
    [stationRanking, rankingMetric],
  );

  const handleStationClick = (params: { name: string }) => {
    const station = stationRanking.find((s: StationRankingItem) => s.stationName === params.name);
    if (station) {
      navigate(`${ANALYTICS_ROUTES.SALES}?stationId=${station.stationId}`);
    }
  };

  const getKPIFormat = (format: string) => {
    switch (format) {
      case 'currency': return { prefix: '¥', precision: 2 };
      case 'volume': return { suffix: ' m³', precision: 1 };
      case 'integer': return { suffix: ` ${t('common.unit', '单')}`, precision: 0 };
      default: return { precision: 0 };
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Title level={4} style={{ margin: 0 }}>{t('analytics.dashboard.title')}</Title>
          <RequirementTag componentIds={['analytics-kpi', 'analytics-sales-trend', 'analytics-fuel-breakdown', 'analytics-station-ranking', 'analytics-station-filter', 'analytics-member-stats']} module="data-analytics" showDetail />
        </div>
      </div>

      {/* Global Filter */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Radio.Group
            value={period}
            onChange={e => setPeriod(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            options={[
              { value: 'day', label: t('analytics.period.day') },
              { value: 'week', label: t('analytics.period.week') },
              { value: 'month', label: t('analytics.period.month') },
              { value: 'year', label: t('analytics.period.year') },
            ]}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t('analytics.dashboard.dataAsOf', '数据截至')} {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </div>
      </Card>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {KPI_CARDS.map(card => {
          const fmt = getKPIFormat(card.format);
          const kpiValue = kpi[card.key as keyof typeof kpi] as number;
          const growthValue = kpi[card.growthKey as keyof typeof kpi] as number;
          return (
            <Col span={6} key={card.key}>
              <KPICard
                title={t(card.labelKey)}
                value={kpiValue}
                prefix={fmt.prefix}
                suffix={fmt.suffix}
                precision={fmt.precision}
                growth={growthValue}
                sparklineData={SPARKLINE_MAP[card.key]}
                tooltip={card.key === 'avgOrderValue' ? t('analytics.dashboard.kpi.avgOrderValueTooltip', '总营业额 ÷ 总订单数') : undefined}
                onClick={() => navigate(ANALYTICS_ROUTES.SALES)}
              />
            </Col>
          );
        })}
      </Row>

      {/* Sales Trend + Fuel Breakdown */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card title={t('analytics.dashboard.chart.salesTrend')} size="small">
            <LineChart
              data={trendChartData}
              height={280}
              yAxisLabel={t('analytics.dashboard.kpi.revenue')}
              yAxisUnit={t('common.yuan', '元')}
              emptyText={t('analytics.dashboard.chart.emptyTrend', '该时段暂无营业数据')}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title={t('analytics.dashboard.chart.fuelBreakdown')} size="small">
            <PieChart
              data={fuelPieData}
              height={280}
              doughnut
              centerValue={`¥${Math.round(totalRevenue / 10000)}万`}
              centerLabel={t('analytics.dashboard.kpi.revenue')}
            />
          </Card>
        </Col>
      </Row>

      {/* Station Ranking */}
      <Card
        title={t('analytics.dashboard.chart.stationRanking')}
        size="small"
        extra={
          <Select
            value={rankingMetric}
            onChange={setRankingMetric}
            style={{ width: 120 }}
            options={RANKING_METRIC_OPTIONS.map(o => ({ value: o.value, label: t(o.labelKey) }))}
          />
        }
        style={{ marginBottom: 16 }}
      >
        <BarChart
          data={rankingBarData}
          height={200}
          horizontal
          onBarClick={handleStationClick}
        />
      </Card>

      {/* Member Stats (MVP+) */}
      <Alert
        type="info"
        showIcon
        message={t('analytics.dashboard.member.mockBanner')}
        style={{ marginBottom: 8 }}
      />
      <Card title={t('analytics.dashboard.member.title')} size="small" style={{ background: '#fafafa' }}>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card size="small"><Text type="secondary">{t('analytics.dashboard.member.total', '会员总数')}</Text><div style={{ fontSize: 20, fontWeight: 600 }}>{memberStats.totalMembers.toLocaleString()} {t('common.person', '人')}</div></Card>
          </Col>
          <Col span={6}>
            <Card size="small"><Text type="secondary">{t('analytics.dashboard.member.new', '本期新增')}</Text><div style={{ fontSize: 20, fontWeight: 600 }}>{memberStats.newMembersThisPeriod} {t('common.person', '人')}</div></Card>
          </Col>
          <Col span={6}>
            <Card size="small"><Text type="secondary">{t('analytics.dashboard.member.active', '活跃会员')}</Text><div style={{ fontSize: 20, fontWeight: 600 }}>{memberStats.activeMembers.toLocaleString()} {t('common.person', '人')}</div></Card>
          </Col>
          <Col span={6}>
            <Card size="small"><Text type="secondary">{t('analytics.dashboard.member.revenueRatio', '会员消费占比')}</Text><div style={{ fontSize: 20, fontWeight: 600 }}>{(memberStats.memberRevenueRatio * 100).toFixed(1)}%</div></Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default BusinessDashboard;
