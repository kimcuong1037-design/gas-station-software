import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Collapse, DatePicker, Empty, Progress, Row, Select, Space, Table, Tabs, Tag, Tooltip, Typography } from 'antd';
import { ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import type { Dayjs } from 'dayjs';
interface LayoutContext {
  selectedStationId: string;
}
import { RequirementTag } from '../../../../components/RequirementTag';
import type { TankComparisonCard, TankComparisonLog } from '../types';
import { getTankComparisonRealtime, getLossAnalysis, tankComparisonLogs } from '../../../../mock/inventory';
import StockAdjustmentModal from '../components/StockAdjustmentModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TankComparison: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId } = useOutletContext<LayoutContext>();

  const [activeTab, setActiveTab] = useState<string>('realtime');
  const [expandedTankId, setExpandedTankId] = useState<string | null>(null);
  const [adjustmentTank, setAdjustmentTank] = useState<TankComparisonCard | null>(null);

  // History tab filters
  const [historyTankFilter, setHistoryTankFilter] = useState<string>('');
  const [historyDateRange, setHistoryDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const tanks = useMemo(() => getTankComparisonRealtime(selectedStationId), [selectedStationId]);
  const { transportLoss, stationLoss } = useMemo(() => getLossAnalysis(selectedStationId), [selectedStationId]);

  const historyRecords = useMemo(() => {
    let list = tankComparisonLogs.filter(r => r.stationId === selectedStationId);
    if (historyTankFilter) list = list.filter(r => r.tankId === historyTankFilter);
    if (historyDateRange) {
      const [start, end] = historyDateRange;
      list = list.filter(r => {
        const d = new Date(r.snapshotDate).getTime();
        return d >= start.startOf('day').valueOf() && d <= end.endOf('day').valueOf();
      });
    }
    return list.sort((a, b) => b.snapshotDate.localeCompare(a.snapshotDate));
  }, [selectedStationId, historyTankFilter, historyDateRange]);

  const getProgressColor = (ratio: number) => {
    if (ratio <= 10) return '#ff4d4f';
    if (ratio <= 30) return '#faad14';
    return '#52c41a';
  };

  const renderRealtimeTab = () => (
    <div>
      {tanks.length === 0 ? (
        <Empty description={t('inventory.tank.empty', '暂无储罐数据，请在设备设施中配置储罐')} style={{ padding: 48 }} />
      ) : (
      <>
      {/* Tank cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {tanks.map(tank => {
          const ratio = Math.round((tank.actualLevel / tank.ratedCapacity) * 10000) / 100;
          const isAbnormal = Math.abs(tank.deviationRate) > 2;
          return (
            <Col span={8} key={tank.tankId}>
              <Card
                size="small"
                style={isAbnormal ? { borderColor: '#ff4d4f' } : undefined}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong>{tank.tankName}</Text>
                  {isAbnormal && <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {t('inventory.field.fuelType', '燃料类型')}: {tank.fuelTypeName}
                </Text>

                <div style={{ margin: '12px 0' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {t('inventory.card.ratedCapacity', '额定容量')} {tank.ratedCapacity.toLocaleString()} kg
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {t('inventory.card.actualLevel', '实际罐存')} {tank.actualLevel.toFixed(3)} kg
                    </Text>
                  </div>
                  <Progress
                    percent={ratio}
                    strokeColor={getProgressColor(ratio)}
                    format={p => `${p?.toFixed(1)}%`}
                    size="small"
                    style={{ marginTop: 4 }}
                  />
                </div>

                <div style={{ marginBottom: 8 }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {t('inventory.card.theoreticalStock', '理论库存')}{' '}
                      <Tooltip title={t('inventory.tooltip.theoreticalFormula', '理论库存 = 期初 + Σ入库 − Σ销售出库 − Σ损耗出库 ± Σ盘点调整')}>
                        <InfoCircleOutlined style={{ color: '#999' }} />
                      </Tooltip>
                    </Text>
                    <Text style={{ marginLeft: 8 }}>{tank.theoreticalStock.toFixed(3)} kg</Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{t('inventory.card.deviation', '偏差值')}</Text>
                    <Text style={{ marginLeft: 8, color: tank.deviation >= 0 ? '#52c41a' : '#ff4d4f' }}>
                      {tank.deviation >= 0 ? '+' : ''}{tank.deviation.toFixed(3)} kg
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {t('inventory.card.deviationRate', '偏差率')}{' '}
                      <Tooltip title={t('inventory.tooltip.deviationFormula', '偏差率 = (实际罐存 − 理论库存) ÷ 理论库存 × 100%')}>
                        <InfoCircleOutlined style={{ color: '#999' }} />
                      </Tooltip>
                    </Text>
                    <Text style={{ marginLeft: 8, color: isAbnormal ? '#ff4d4f' : undefined }}>
                      {tank.deviationRate >= 0 ? '+' : ''}{tank.deviationRate.toFixed(2)}%
                    </Text>
                  </div>
                </div>

                <Space>
                  <Button
                    size="small"
                    type="link"
                    onClick={() => setExpandedTankId(expandedTankId === tank.tankId ? null : tank.tankId)}
                  >
                    {t('inventory.tank.deviationAnalysis', '偏差分析')}
                  </Button>
                  <Button
                    size="small"
                    type="link"
                    onClick={() => setAdjustmentTank(tank)}
                  >
                    {t('inventory.tank.stockAdjustment', '盘点调整')}
                  </Button>
                </Space>

                {expandedTankId === tank.tankId && (
                  <Collapse
                    ghost
                    defaultActiveKey={['analysis']}
                    style={{ marginTop: 8 }}
                    items={[{
                      key: 'analysis',
                      label: t('inventory.tank.deviationAnalysis', '偏差分析'),
                      children: (
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            <Tag color={tank.deviation >= 0 ? 'green' : 'red'}>
                              {tank.deviation >= 0
                                ? t('inventory.tank.surplus', '盈余')
                                : t('inventory.tank.deficit', '亏损')}
                            </Tag>
                            <Text>{Math.abs(tank.deviation).toFixed(3)} kg ({Math.abs(tank.deviationRate).toFixed(2)}%)</Text>
                          </div>
                          {tank.deviation < 0 && (
                            <div style={{ marginBottom: 8 }}>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {t('inventory.tank.possibleCauses', '可能原因')}:
                              </Text>
                              <ul style={{ margin: '4px 0', paddingLeft: 20, fontSize: 12 }}>
                                <li>{t('inventory.loss.leakage', '泄漏')}</li>
                                <li>{t('inventory.tank.measureError', '计量误差')}</li>
                                <li>{t('inventory.tank.unregisteredLoss', '未登记损耗')}</li>
                                <li>{t('inventory.loss.evaporation', '温度变化蒸发')}</li>
                              </ul>
                            </div>
                          )}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {isAbnormal
                              ? t('inventory.tank.suggestCheck', '建议检查储罐密封性并执行盘点调整')
                              : t('inventory.tank.normalRange', '偏差在正常范围内')}
                          </Text>
                          <div style={{ height: 80, marginTop: 8, background: '#fafafa', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {t('inventory.tank.trend7d', '近 7 天偏差趋势图（ECharts）')}
                            </Text>
                          </div>
                        </div>
                      ),
                    }]}
                  />
                )}
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Loss classification */}
      <Card title={t('inventory.tank.lossClassification', '损耗分类分析')} size="small">
        <Row gutter={24}>
          <Col span={12}>
            <Text strong>{t('inventory.tank.transportLoss', '运输损耗')}</Text>
            <Table
              dataSource={transportLoss}
              rowKey="supplierName"
              size="small"
              pagination={false}
              style={{ marginTop: 8 }}
              columns={[
                { title: t('inventory.inbound.supplier', '供应商'), dataIndex: 'supplierName', width: 140 },
                { title: t('inventory.tank.batchCount', '批次'), dataIndex: 'batchCount', width: 60 },
                { title: t('inventory.inbound.plannedQuantity', '计划量合计'), dataIndex: 'plannedTotal', width: 120, render: (v: number) => `${v.toFixed(1)} kg` },
                { title: t('inventory.inbound.actualQuantity', '实收量合计'), dataIndex: 'actualTotal', width: 120, render: (v: number) => `${v.toFixed(1)} kg` },
                {
                  title: t('inventory.inbound.variance', '偏差率'), dataIndex: 'varianceRate', width: 80,
                  render: (v: number) => <Text style={{ color: Math.abs(v) > 2 ? '#ff4d4f' : undefined }}>{v.toFixed(2)}%</Text>,
                },
              ]}
            />
          </Col>
          <Col span={12}>
            <Text strong>{t('inventory.tank.stationLoss', '站内损耗')}</Text>
            <Table
              dataSource={stationLoss}
              rowKey="tankId"
              size="small"
              pagination={false}
              style={{ marginTop: 8 }}
              columns={[
                { title: t('inventory.field.tank', '储罐'), dataIndex: 'tankName', width: 140 },
                {
                  title: t('inventory.tank.avgDailyDeviation', '日均偏差率'), dataIndex: 'avgDailyDeviationRate', width: 100,
                  render: (v: number) => <Text style={{ color: Math.abs(v) > 2 ? '#ff4d4f' : undefined }}>{v.toFixed(2)}%</Text>,
                },
                {
                  title: t('inventory.tank.lossTrend', '损耗趋势'), width: 120,
                  render: () => (
                    <div style={{ width: 100, height: 24, background: '#fafafa', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text type="secondary" style={{ fontSize: 10 }}>Sparkline</Text>
                    </div>
                  ),
                },
              ]}
            />
          </Col>
        </Row>
      </Card>
      </>
      )}
    </div>
  );

  const historyColumns: ColumnsType<TankComparisonLog> = [
    {
      title: t('inventory.tank.snapshotDate', '日期'),
      dataIndex: 'snapshotDate',
      width: 120,
      sorter: (a, b) => a.snapshotDate.localeCompare(b.snapshotDate),
      defaultSortOrder: 'descend',
    },
    { title: t('inventory.field.tank', '储罐'), dataIndex: 'tankName', width: 120 },
    { title: t('inventory.field.fuelType', '燃料类型'), dataIndex: 'fuelTypeName', width: 100 },
    {
      title: t('inventory.card.actualLevel', '实际罐存(kg)'),
      dataIndex: 'actualLevel',
      width: 130,
      render: (v: number) => v.toFixed(3),
    },
    {
      title: t('inventory.card.theoreticalStock', '理论库存(kg)'),
      dataIndex: 'theoreticalStock',
      width: 130,
      render: (v: number) => v.toFixed(3),
    },
    {
      title: t('inventory.card.deviation', '偏差值(kg)'),
      dataIndex: 'deviation',
      width: 120,
      render: (v: number) => <Text style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>{v >= 0 ? '+' : ''}{v.toFixed(3)}</Text>,
    },
    {
      title: t('inventory.card.deviationRate', '偏差率(%)'),
      dataIndex: 'deviationRate',
      width: 110,
      sorter: (a, b) => a.deviationRate - b.deviationRate,
      render: (v: number) => <Text style={{ color: Math.abs(v) > 2 ? '#ff4d4f' : undefined }}>{v >= 0 ? '+' : ''}{v.toFixed(2)}%</Text>,
    },
  ];

  const renderHistoryTab = () => (
    <div>
      {historyTankFilter && (
        <div style={{ height: 200, marginBottom: 16, background: '#fafafa', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">{t('inventory.tank.deviationTrendChart', '偏差率趋势折线图（ECharts）')} — {t('inventory.tank.refLine', '参考线 ±2%')}</Text>
        </div>
      )}
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          value={historyTankFilter}
          onChange={setHistoryTankFilter}
          style={{ width: 180 }}
          allowClear
          placeholder={t('inventory.field.tank', '储罐')}
          options={[
            { value: '', label: t('inventory.filter.all', '全部储罐') },
            { value: 'equip-tank-001', label: 'LNG储罐-01' },
            { value: 'equip-tank-002', label: 'CNG储罐-01' },
            { value: 'equip-tank-003', label: 'L-CNG储罐-01' },
          ]}
        />
        <RangePicker value={historyDateRange} onChange={v => setHistoryDateRange(v as [Dayjs, Dayjs] | null)} />
      </Space>
      <Table<TankComparisonLog>
        columns={historyColumns}
        dataSource={historyRecords}
        rowKey="id"
        scroll={{ x: 830 }}
        pagination={{ pageSize: 20, showSizeChanger: true, showQuickJumper: true, showTotal: total => `${t('inventory.pagination.total', '共')} ${total} ${t('inventory.pagination.items', '条')}` }}
      />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>{t('inventory.tankComparison', '罐存比对')}</Title>
          <RequirementTag
            componentIds={['tank-realtime', 'deviation-analysis', 'comparison-history', 'loss-classification', 'stock-adjustment']}
            module="inventory-management"
            showDetail
          />
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          { key: 'realtime', label: t('inventory.tank.realtimeTab', '实时比对'), children: renderRealtimeTab() },
          { key: 'history', label: t('inventory.tank.historyTab', '比对历史'), children: renderHistoryTab() },
        ]}
      />

      <StockAdjustmentModal
        open={!!adjustmentTank}
        onClose={() => setAdjustmentTank(null)}
        tank={adjustmentTank}
      />
    </div>
  );
};

export default TankComparison;
