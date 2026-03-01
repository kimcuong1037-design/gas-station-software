import React, { useMemo, useState } from 'react';
import { Button, Card, Col, Empty, Progress, Radio, Row, Space, Statistic, Tooltip, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
interface LayoutContext {
  selectedStationId: string;
}
import { RequirementTag } from '../../../../components/RequirementTag';
import { getInventoryOverview } from '../../../../mock/inventory';

const { Title, Text } = Typography;

const InventoryOverview: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();
  const [trendRange, setTrendRange] = useState<'7d' | '30d'>('7d');

  const { cards, trendData } = useMemo(
    () => getInventoryOverview(selectedStationId),
    [selectedStationId],
  );

  const filteredTrend = useMemo(() => {
    const days = trendRange === '7d' ? 7 : 30;
    return trendData.slice(0, days * 3);
  }, [trendData, trendRange]);

  const getProgressColor = (ratio: number) => {
    if (ratio <= 10) return '#ff4d4f';
    if (ratio <= 30) return '#faad14';
    return '#52c41a';
  };

  const getAlertTag = (level: 'safe' | 'warning' | 'critical') => {
    if (level === 'safe') return null;
    if (level === 'warning') return <span style={{ color: '#faad14', fontSize: 12 }}>({t('inventory.alert.level_warning', '预警')})</span>;
    return <span style={{ color: '#ff4d4f', fontSize: 12 }}>({t('inventory.alert.level_critical', '紧急')})</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>{t('inventory.overview.title', '库存总览')}</Title>
          <RequirementTag componentIds={['inventory-overview', 'inventory-trend']} module="inventory-management" showDetail />
        </Space>
      </div>

      {/* 库存卡片区 */}
      {cards.length === 0 ? (
        <div style={{ marginBottom: 24, textAlign: 'center', padding: 48 }}>
          <Empty description={t('inventory.overview.empty', '暂无库存数据，请先完成入库操作')}>
            <Button type="primary" onClick={() => navigate('/energy-trade/inventory/inbound')}>
              {t('inventory.inbound.createInbound', '新增入库')}
            </Button>
          </Empty>
        </div>
      ) : (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          {cards.map(card => (
            <Col span={8} key={card.fuelTypeId}>
              <Card size="small">
                <div style={{ marginBottom: 12 }}>
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>{card.fuelTypeName}</Text>
                    {getAlertTag(card.alertLevel)}
                  </Space>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Space size={4}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {t('inventory.card.tankLevelRatio', '罐容比')}
                    </Text>
                    <Tooltip title={t('inventory.tooltip.tankLevelRatio', '罐容比 = 实际罐存 ÷ 储罐额定容量 × 100%')}>
                      <InfoCircleOutlined style={{ color: '#999', fontSize: 12 }} />
                    </Tooltip>
                  </Space>
                  <Progress
                    percent={card.tankLevelRatio}
                    strokeColor={getProgressColor(card.tankLevelRatio)}
                    format={p => `${p?.toFixed(1)}%`}
                    size="small"
                  />
                </div>
                <Statistic
                  title={t('inventory.card.currentStock', '当前库存')}
                  value={card.currentStock}
                  precision={3}
                  suffix="kg"
                  valueStyle={{ fontSize: 20 }}
                />
                <div style={{ marginTop: 12 }}>
                  <Space size={16}>
                    <Text style={{ color: '#52c41a', fontSize: 12 }}>
                      <ArrowUpOutlined /> {t('inventory.card.todayInbound', '入库')} {card.todayInbound.toFixed(1)} kg
                    </Text>
                    <Text style={{ color: '#1890ff', fontSize: 12 }}>
                      <ArrowDownOutlined /> {t('inventory.card.todayOutbound', '出库')} {card.todayOutbound.toFixed(1)} kg
                    </Text>
                    <Text style={{ color: card.todayNetChange >= 0 ? '#52c41a' : '#ff4d4f', fontSize: 12 }}>
                      {t('inventory.card.netChange', '净变化')} {card.todayNetChange >= 0 ? '+' : ''}{card.todayNetChange.toFixed(1)} kg
                    </Text>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 趋势图区域 */}
      <Card
        title={t('inventory.trend.title', '库存趋势')}
        extra={
          <Radio.Group value={trendRange} onChange={e => setTrendRange(e.target.value)} size="small">
            <Radio.Button value="7d">{t('inventory.trend.7days', '近 7 天')}</Radio.Button>
            <Radio.Button value="30d">{t('inventory.trend.30days', '近 30 天')}</Radio.Button>
          </Radio.Group>
        }
      >
        <div
          style={{
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fafafa',
            borderRadius: 8,
          }}
        >
          <Text type="secondary">
            {t('inventory.trend.placeholder', '库存趋势折线图（ECharts）')} — {filteredTrend.length} {t('inventory.trend.dataPoints', '个数据点')}
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default InventoryOverview;
