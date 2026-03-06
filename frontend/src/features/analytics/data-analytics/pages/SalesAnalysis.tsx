import React, { useMemo, useState } from 'react';
import { Button, Card, Col, DatePicker, Radio, Row, Select, Table, Tabs, Tag, Typography } from 'antd';
import { ExportOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Tooltip } from 'antd';

interface LayoutContext {
  selectedStationId: string;
}

import { RequirementTag } from '../../../../components/RequirementTag';
import { LineChart, BarChart, PieChart } from '../../../../components/Charts';
import GrowthBadge from '../components/GrowthBadge';
import { DIMENSION_OPTIONS, STATION_OPTIONS, FUEL_TYPE_OPTIONS } from '../constants';
import {
  timeAnalysisRows,
  stationAnalysisRows,
  fuelAnalysisRows,
  timeSegmentData,
} from '../mockData/salesAnalysisMock';
import type { AnalyticsDimension, DimensionAnalysisRow, TimeSegmentDataPoint } from '../types';

const { Title } = Typography;

const SalesAnalysis: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId: _stationId } = useOutletContext<LayoutContext>();
  const [searchParams] = useSearchParams();

  const initialStation = searchParams.get('stationId');
  const [dimension, setDimension] = useState<AnalyticsDimension>('time');
  const [compareType, setCompareType] = useState<'yoy' | 'mom' | 'none'>('yoy');
  const [timeGranularity, setTimeGranularity] = useState<'day' | 'week' | 'month'>('month');
  const [segmentDayType, setSegmentDayType] = useState<'weekday' | 'weekend' | 'compare'>('weekday');
  const [_selectedStations] = useState<string[]>(initialStation ? [initialStation] : []);
  const [showAllRows, setShowAllRows] = useState(false);

  // Data for each dimension
  const dimensionDataMap: Record<AnalyticsDimension, DimensionAnalysisRow[]> = {
    time: timeAnalysisRows,
    station: stationAnalysisRows,
    fuel: fuelAnalysisRows,
    segment: [],
  };

  const currentRows = dimensionDataMap[dimension];

  // Chart data for time/station/fuel dimensions
  const chartData = useMemo(() => {
    if (dimension === 'segment') return [];
    return currentRows.map(row => ({
      date: row.dimensionLabel,
      value: row.revenue,
      seriesName: t('analytics.dashboard.kpi.revenue'),
    }));
  }, [currentRows, dimension, t]);

  // Fuel pie chart data
  const fuelPieData = useMemo(
    () => fuelAnalysisRows.map(r => ({ name: r.dimensionLabel, value: r.revenue })),
    [],
  );

  // Time segment bar chart data
  const segmentBarData = useMemo(() => {
    let filtered: TimeSegmentDataPoint[];
    if (segmentDayType === 'compare') {
      return timeSegmentData.map(d => ({
        name: `${String(d.hour).padStart(2, '0')}:00`,
        value: d.avgRevenue,
        group: d.dayType === 'weekday' ? t('analytics.sales.segment.weekday', '工作日') : t('analytics.sales.segment.weekend', '周末'),
      }));
    }
    filtered = timeSegmentData.filter(d => d.dayType === segmentDayType);
    return filtered.map(d => ({
      name: `${String(d.hour).padStart(2, '0')}:00`,
      value: d.avgRevenue,
    }));
  }, [segmentDayType, t]);

  // Common table columns
  const baseColumns: ColumnsType<DimensionAnalysisRow> = [
    {
      title: dimension === 'time' ? t('analytics.sales.column.time', '时间')
        : dimension === 'station' ? t('analytics.sales.column.station', '站点名称')
        : t('analytics.sales.column.fuelType', '燃料类型'),
      dataIndex: 'dimensionLabel',
      width: 120,
    },
    {
      title: t('analytics.sales.column.revenue', '营业额（元）'),
      dataIndex: 'revenue',
      width: 120,
      align: 'right' as const,
      sorter: (a: DimensionAnalysisRow, b: DimensionAnalysisRow) => a.revenue - b.revenue,
      render: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      title: t('analytics.sales.column.orders', '订单数'),
      dataIndex: 'orders',
      width: 80,
      align: 'right' as const,
      sorter: (a: DimensionAnalysisRow, b: DimensionAnalysisRow) => a.orders - b.orders,
    },
    {
      title: t('analytics.sales.column.fuelVolume', '充装量（m³）'),
      dataIndex: 'fuelVolume',
      width: 100,
      align: 'right' as const,
      sorter: (a: DimensionAnalysisRow, b: DimensionAnalysisRow) => a.fuelVolume - b.fuelVolume,
    },
    {
      title: t('analytics.sales.column.avgOrderValue', '客单价（元）'),
      dataIndex: 'avgOrderValue',
      width: 100,
      align: 'right' as const,
      render: (v: number) => `¥${v.toFixed(1)}`,
    },
  ];

  const growthColumns: ColumnsType<DimensionAnalysisRow> = compareType !== 'none' ? [
    ...(compareType === 'yoy' ? [{
      title: t('analytics.sales.column.yoyGrowth', '同比增长'),
      dataIndex: 'yoyGrowth' as const,
      width: 100,
      align: 'right' as const,
      render: (v: number | null) => <GrowthBadge value={v} tooltip={v === null ? t('analytics.sales.noHistoryData', '历史数据不足') : undefined} />,
    }] : []),
    ...(compareType === 'mom' ? [{
      title: t('analytics.sales.column.momGrowth', '环比增长'),
      dataIndex: 'momGrowth' as const,
      width: 100,
      align: 'right' as const,
      render: (v: number | null) => <GrowthBadge value={v} tooltip={v === null ? t('analytics.sales.noHistoryData', '历史数据不足') : undefined} />,
    }] : []),
  ] : [];

  // Fuel-specific ratio column
  const fuelRatioColumn: ColumnsType<DimensionAnalysisRow> = dimension === 'fuel' ? [{
    title: t('analytics.sales.column.ratio', '占比（%）'),
    dataIndex: 'revenue',
    key: 'revenueRatio',
    width: 80,
    align: 'right' as const,
    render: (_: number, record: DimensionAnalysisRow) => {
      const total = fuelAnalysisRows.reduce((s, r) => s + r.revenue, 0);
      const ratio = total > 0 ? (record.revenue / total * 100) : 0;
      return <span style={{ color: record.momGrowth !== null && record.momGrowth < 0 ? '#ff4d4f' : undefined }}>{ratio.toFixed(1)}%</span>;
    },
  }] : [];

  const tableColumns = [...baseColumns, ...fuelRatioColumn, ...growthColumns];

  // Time segment table columns
  const segmentColumns: ColumnsType<TimeSegmentDataPoint> = [
    {
      title: t('analytics.sales.column.timeSlot', '时段'),
      dataIndex: 'hour',
      width: 120,
      render: (h: number) => `${String(h).padStart(2, '0')}:00~${String(h + 1).padStart(2, '0')}:00`,
    },
    {
      title: t('analytics.sales.column.dayType', '工作日类型'),
      dataIndex: 'dayType',
      width: 80,
      align: 'center' as const,
      render: (v: string) => (
        <Tag color={v === 'weekday' ? 'blue' : 'orange'}>
          {v === 'weekday' ? t('analytics.sales.segment.weekday', '工作日') : t('analytics.sales.segment.weekend', '周末')}
        </Tag>
      ),
    },
    {
      title: t('analytics.sales.column.avgRevenue', '平均营业额（元）'),
      dataIndex: 'avgRevenue',
      width: 120,
      align: 'right' as const,
      render: (v: number) => `¥${v.toLocaleString()}`,
    },
    {
      title: t('analytics.sales.column.avgOrders', '平均订单数'),
      dataIndex: 'avgOrders',
      width: 80,
      align: 'right' as const,
    },
    {
      title: t('analytics.sales.column.peakFlag', '是否高峰'),
      dataIndex: 'peakFlag',
      width: 80,
      align: 'center' as const,
      render: (v: boolean) => v ? '⭐' : '—',
    },
  ];

  const filteredSegmentData = useMemo(() => {
    if (segmentDayType === 'compare') return timeSegmentData;
    return timeSegmentData.filter(d => d.dayType === segmentDayType);
  }, [segmentDayType]);

  const displayRows = showAllRows ? currentRows : currentRows.slice(0, 20);

  const tabItems = DIMENSION_OPTIONS.map(opt => ({
    key: opt.value,
    label: t(opt.labelKey),
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Title level={4} style={{ margin: 0 }}>{t('analytics.sales.title')}</Title>
          <RequirementTag module="data-analytics" />
        </div>
        <Tooltip title={t('analytics.sales.exportComingSoon', '即将上线')}>
          <Button icon={<ExportOutlined />} disabled>{t('analytics.sales.export', '导出')}</Button>
        </Tooltip>
      </div>

      {/* Filter Panel */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <DatePicker.RangePicker
              style={{ width: 260 }}
              disabledDate={current => current && current.isAfter(new Date())}
            />
          </Col>
          <Col>
            <Select
              mode="multiple"
              placeholder={t('analytics.sales.filter.station', '选择站点')}
              style={{ width: 240 }}
              maxCount={5}
              options={STATION_OPTIONS}
            />
          </Col>
          <Col>
            <Select
              mode="multiple"
              placeholder={t('analytics.sales.filter.fuelType', '选择燃料类型')}
              style={{ width: 220 }}
              options={FUEL_TYPE_OPTIONS}
            />
          </Col>
          <Col>
            <Radio.Group
              value={compareType}
              onChange={e => setCompareType(e.target.value)}
              optionType="button"
              buttonStyle="solid"
              options={[
                { value: 'yoy', label: t('analytics.compare.yoy', '同比') },
                { value: 'mom', label: t('analytics.compare.mom', '环比') },
                { value: 'none', label: t('analytics.compare.none', '不对比') },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Dimension Tabs */}
      <Tabs
        activeKey={dimension}
        onChange={key => setDimension(key as AnalyticsDimension)}
        items={tabItems}
      />

      {/* Chart Area */}
      <Card size="small" style={{ marginBottom: 16 }}>
        {dimension === 'time' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <Radio.Group
                value={timeGranularity}
                onChange={e => setTimeGranularity(e.target.value)}
                optionType="button"
                size="small"
                options={[
                  { value: 'day', label: t('analytics.period.day', '日') },
                  { value: 'week', label: t('analytics.period.week', '周') },
                  { value: 'month', label: t('analytics.period.month', '月') },
                ]}
              />
            </div>
            <LineChart data={chartData} height={320} yAxisUnit={t('common.yuan', '元')} />
          </>
        )}
        {dimension === 'station' && (
          <LineChart data={chartData} height={320} yAxisUnit={t('common.yuan', '元')} />
        )}
        {dimension === 'fuel' && (
          <PieChart
            data={fuelPieData}
            height={320}
            doughnut
            centerValue={`¥${Math.round(fuelAnalysisRows.reduce((s, r) => s + r.revenue, 0) / 10000)}万`}
            centerLabel={t('analytics.dashboard.kpi.revenue')}
          />
        )}
        {dimension === 'segment' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <Radio.Group
                value={segmentDayType}
                onChange={e => setSegmentDayType(e.target.value)}
                optionType="button"
                size="small"
                options={[
                  { value: 'weekday', label: t('analytics.sales.segment.weekday', '工作日') },
                  { value: 'weekend', label: t('analytics.sales.segment.weekend', '周末') },
                  { value: 'compare', label: t('analytics.sales.segment.compare', '对比') },
                ]}
              />
            </div>
            <BarChart
              data={segmentBarData}
              height={300}
              highlightPredicate={item => {
                const hourStr = item.name.split(':')[0];
                const hour = parseInt(hourStr, 10);
                const match = timeSegmentData.find(d => d.hour === hour && d.peakFlag);
                return !!match;
              }}
            />
          </>
        )}
      </Card>

      {/* Data Table */}
      {dimension !== 'segment' ? (
        <Card size="small">
          <Table<DimensionAnalysisRow>
            dataSource={displayRows}
            columns={tableColumns}
            rowKey="dimensionKey"
            pagination={false}
            scroll={{ x: dimension === 'fuel' ? 700 : dimension === 'station' ? 620 : 720 }}
            size="small"
          />
          {currentRows.length > 20 && !showAllRows && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <Button type="link" onClick={() => setShowAllRows(true)}>
                {t('analytics.sales.expandAll', '展开全部')}
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card size="small">
          <Table<TimeSegmentDataPoint>
            dataSource={filteredSegmentData}
            columns={segmentColumns}
            rowKey={record => `${record.hour}-${record.dayType}`}
            pagination={false}
            scroll={{ x: 480 }}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};

export default SalesAnalysis;
