import React, { useMemo, useState } from 'react';
import { Alert, Card, Col, Collapse, Row, Select, Table, Tag, Tooltip, Typography } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import type { EChartsOption } from 'echarts';

interface LayoutContext {
  selectedStationId: string;
}

import { RequirementTag } from '../../../../components/RequirementTag';
import { BarChart, PieChart } from '../../../../components/Charts';
import BaseChart from '../../../../components/Charts/BaseChart';
import { useChartTheme } from '../../../../components/Charts/useChartTheme';
import { createBaseOption } from '../../../../components/Charts/chartDefaults';
import { RFM_SEGMENT_CONFIG, CHURN_PROBABILITY_CONFIG, STATION_OPTIONS } from '../constants';
import {
  customerOverview,
  rfmCustomers,
  segmentSummary,
  lifecycleData,
  memberGrowthTrend,
  churnRiskList,
} from '../mockData/customerAnalysisMock';
import type { ChurnRiskCustomer, RFMSegment } from '../types';

const { Title, Text } = Typography;

const CustomerAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId: _stationId } = useOutletContext<LayoutContext>();
  const chartTheme = useChartTheme();

  const [_period] = useState('12m');

  // Customer overview cards
  const overviewCards = [
    { label: t('analytics.customers.overview.total', '客户总数'), value: customerOverview.totalCustomers, warn: false },
    { label: t('analytics.customers.overview.new', '本期新增'), value: customerOverview.newCustomersThisPeriod, warn: false },
    { label: t('analytics.customers.overview.active', '活跃客户'), value: customerOverview.activeCustomers, warn: false },
    { label: t('analytics.customers.overview.churnRisk', '流失风险'), value: customerOverview.churnRiskCustomers, warn: customerOverview.churnRiskCustomers / customerOverview.totalCustomers > 0.1 },
  ];

  // RFM Scatter chart option
  const rfmOption = useMemo<EChartsOption>(() => {
    const base = createBaseOption(chartTheme);
    const segments = Object.keys(RFM_SEGMENT_CONFIG) as RFMSegment[];

    const series = segments.map(seg => ({
      name: t(RFM_SEGMENT_CONFIG[seg].labelKey),
      type: 'scatter' as const,
      data: rfmCustomers
        .filter(c => c.segment === seg)
        .map(c => [c.frequency, c.monetary, c.recencyDays, c.customerName]),
      itemStyle: { color: RFM_SEGMENT_CONFIG[seg].color },
      symbolSize: 10,
    }));

    return {
      ...base,
      tooltip: {
        ...base.tooltip as object,
        trigger: 'item',
        formatter: (params: unknown) => {
          const p = params as { value: [number, number, number, string] };
          const [f, m, r, name] = p.value;
          return `${name}<br/>R: ${r}${t('common.day', '天')}<br/>F: ${f}${t('common.times', '次')}<br/>M: ¥${m.toLocaleString()}`;
        },
      },
      legend: {
        ...base.legend as object,
        bottom: 0,
      },
      xAxis: {
        ...base.xAxis as object,
        name: `F (${t('analytics.customers.rfm.frequency', '消费频次')})`,
      },
      yAxis: {
        ...base.yAxis as object,
        name: `M (${t('analytics.customers.rfm.monetary', '消费金额')})`,
      },
      series,
    };
  }, [chartTheme, t]);

  // Segment pie chart data
  const segmentPieData = useMemo(
    () => segmentSummary.map(s => ({ name: s.segmentLabel, value: s.count })),
    [],
  );
  const segmentColors = useMemo(
    () => segmentSummary.map(s => RFM_SEGMENT_CONFIG[s.segment].color),
    [],
  );

  // Lifecycle bar chart data
  const lifecycleBarData = useMemo(
    () => lifecycleData.map(l => ({ name: l.stageLabel, value: l.count })),
    [],
  );

  // Member growth line chart option (mixed line + bar)
  const memberGrowthOption = useMemo<EChartsOption>(() => {
    const base = createBaseOption(chartTheme);
    const months = memberGrowthTrend.map(p => p.date.slice(0, 7));

    return {
      ...base,
      tooltip: {
        ...base.tooltip as object,
        trigger: 'axis',
      },
      legend: { ...base.legend as object },
      xAxis: {
        ...base.xAxis as object,
        data: months,
      },
      yAxis: [
        { ...base.yAxis as object, name: t('analytics.customers.memberGrowth.total', '累计会员数') },
        { ...base.yAxis as object, name: t('analytics.customers.memberGrowth.new', '新增'), splitLine: { show: false } },
      ],
      series: [
        {
          name: t('analytics.customers.memberGrowth.total', '累计会员数'),
          type: 'line',
          data: memberGrowthTrend.map(p => p.totalCount),
          smooth: true,
          itemStyle: { color: chartTheme.colorPalette[0] },
        },
        {
          name: t('analytics.customers.memberGrowth.new', '新增'),
          type: 'bar',
          yAxisIndex: 1,
          data: memberGrowthTrend.map(p => p.newCount),
          itemStyle: { color: chartTheme.colorPalette[1], opacity: 0.5 },
          barMaxWidth: 20,
        },
      ],
    };
  }, [chartTheme, t]);

  // Churn risk table columns
  const churnColumns: ColumnsType<ChurnRiskCustomer> = [
    { title: t('analytics.customers.churn.name', '客户名称'), dataIndex: 'customerName', width: 100 },
    { title: t('analytics.customers.churn.lastDate', '最近消费日期'), dataIndex: 'lastPurchaseDate', width: 120, align: 'center' },
    {
      title: t('analytics.customers.churn.daysSince', '未消费天数'),
      dataIndex: 'daysSinceLastPurchase',
      width: 100,
      align: 'right',
      render: (v: number) => `${v} ${t('common.day', '天')}`,
    },
    {
      title: t('analytics.customers.churn.frequency', '历史消费频次'),
      dataIndex: 'purchaseFrequency',
      width: 100,
      align: 'right',
      render: (v: number) => `${v} ${t('analytics.customers.churn.timesPerMonth', '次/月')}`,
    },
    {
      title: t('analytics.customers.churn.totalAmount', '历史消费总额'),
      dataIndex: 'totalMonetary',
      width: 120,
      align: 'right',
      render: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      title: t('analytics.customers.churn.probability', '流失风险'),
      dataIndex: 'churnProbability',
      width: 80,
      align: 'center',
      render: (v: string) => {
        const config = CHURN_PROBABILITY_CONFIG[v];
        return <Tag color={config?.color}>{t(config?.labelKey ?? v)}</Tag>;
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Title level={4} style={{ margin: 0 }}>{t('analytics.customers.title')}</Title>
          <RequirementTag module="data-analytics" />
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        message={t('analytics.customers.mockBanner')}
        style={{ marginBottom: 16 }}
      />

      {/* Filter */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Select
              defaultValue="12m"
              style={{ width: 160 }}
              options={[
                { value: '3m', label: t('analytics.customers.period.3m', '近 3 个月') },
                { value: '6m', label: t('analytics.customers.period.6m', '近 6 个月') },
                { value: '12m', label: t('analytics.customers.period.12m', '近 12 个月') },
              ]}
            />
          </Col>
          <Col>
            <Select
              defaultValue="all"
              style={{ width: 160 }}
              options={[
                { value: 'all', label: t('analytics.customers.filter.allStations', '全部站点') },
                ...STATION_OPTIONS,
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Overview Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {overviewCards.map(card => (
          <Col span={6} key={card.label}>
            <Card size="small" style={{ backgroundColor: card.warn ? '#fff2f0' : undefined }}>
              <Text type="secondary">{card.label}</Text>
              <div style={{ fontSize: 24, fontWeight: 600 }}>{card.value.toLocaleString()} {t('common.person', '人')}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* RFM Scatter + Segment Pie */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={14}>
          <Card
            title={t('analytics.customers.rfm.title', 'RFM 客户分析')}
            size="small"
            extra={
              <Tooltip title={t('analytics.customers.rfm.tooltip')}>
                <QuestionCircleOutlined style={{ color: '#999' }} />
              </Tooltip>
            }
          >
            <BaseChart option={rfmOption} height={340} />
          </Card>
        </Col>
        <Col span={10}>
          <Card title={t('analytics.customers.segmentPie.title', '客户分层分布')} size="small">
            <PieChart
              data={segmentPieData}
              height={340}
              doughnut
              centerValue={customerOverview.totalCustomers.toLocaleString()}
              centerLabel={t('analytics.customers.overview.total', '客户总数')}
              colors={segmentColors}
            />
            {(() => {
              const dormant = lifecycleData.find(l => l.stage === 'dormant');
              if (dormant && dormant.ratio > 0.3) {
                return (
                  <Alert
                    type="warning"
                    showIcon
                    message={t('analytics.customers.dormantWarning', '沉睡客户占比较高，建议关注')}
                    style={{ marginTop: 8 }}
                  />
                );
              }
              return null;
            })()}
          </Card>
        </Col>
      </Row>

      {/* Lifecycle + Member Growth */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title={t('analytics.customers.lifecycle.title', '客户生命周期分布')} size="small">
            <BarChart
              data={lifecycleBarData}
              height={260}
              horizontal
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={t('analytics.customers.memberGrowth.title', '会员增长趋势')} size="small">
            <BaseChart option={memberGrowthOption} height={260} />
          </Card>
        </Col>
      </Row>

      {/* Churn Risk List (MVP+) */}
      <Collapse
        items={[{
          key: 'churn',
          label: (
            <span>
              {t('analytics.customers.churn.title', '流失预警名单')}
              <Tag color="red" style={{ marginLeft: 8 }}>{churnRiskList.length}</Tag>
            </span>
          ),
          children: (
            <Table<ChurnRiskCustomer>
              dataSource={churnRiskList}
              columns={churnColumns}
              rowKey="customerId"
              pagination={{ pageSize: 20 }}
              scroll={{ x: 620 }}
              size="small"
            />
          ),
        }]}
      />
    </div>
  );
};

export default CustomerAnalysis;
