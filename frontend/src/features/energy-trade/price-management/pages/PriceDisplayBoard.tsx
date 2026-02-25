// P03: 价格公示看板页 - LED 风格展示
import React, { useMemo, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Typography, Space, Tag, Button } from 'antd';
import { ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getPriceBoardData } from '../../../../mock/priceManagement';
import type { PriceBoardItem } from '../types';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Title, Text } = Typography;

interface LayoutContext {
  selectedStationId: string;
}

const PriceDisplayBoard: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId } = useOutletContext<LayoutContext>();
  const [refreshKey, setRefreshKey] = useState(0);

  const boardData = useMemo(() => {
    return getPriceBoardData(selectedStationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStationId, refreshKey]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Space align="center">
          <Title level={4} style={{ margin: 0 }}>
            {t('price.board.title', '价格公示看板')}
          </Title>
          <RequirementTag componentIds={['price-board']} module="price-management" showDetail />
        </Space>
        <Space>
          <ClockCircleOutlined />
          <Text type="secondary">
            {t('price.board.lastUpdate', '最后更新')}: {dayjs(boardData.lastUpdatedAt).format('YYYY-MM-DD HH:mm')}
          </Text>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            {t('common.refresh', '刷新')}
          </Button>
        </Space>
      </Row>

      {/* Station Name Banner */}
      <Card
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, #001529 0%, #003a70 100%)',
          borderRadius: 12,
          textAlign: 'center',
        }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <Title level={3} style={{ color: '#fff', margin: 0 }}>
          {boardData.stationName}
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
          {t('price.board.subtitle', '实时价格公示')}
        </Text>
      </Card>

      {/* Price Cards - LED style */}
      <Row gutter={[24, 24]}>
        {boardData.prices.map((item: PriceBoardItem) => (
          <Col xs={24} sm={12} lg={6} key={item.fuelTypeName}>
            <Card
              hoverable
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                background: '#001529',
                border: '1px solid #003a70',
              }}
              styles={{ body: { padding: 0 } }}
            >
              {/* Fuel Type Header */}
              <div style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                padding: '12px 16px',
                textAlign: 'center',
              }}>
                <Text strong style={{ color: '#fff', fontSize: 16 }}>
                  {item.fuelTypeName}
                </Text>
              </div>

              {/* Standard Price */}
              <div style={{ padding: '24px 16px 12px', textAlign: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                  {t('price.board.standardPrice', '标准价')}
                </Text>
                <div style={{
                  fontFamily: "'Digital-7', 'Courier New', monospace",
                  fontSize: 48,
                  fontWeight: 700,
                  color: '#ff4d4f',
                  lineHeight: 1.2,
                  textShadow: '0 0 10px rgba(255, 77, 79, 0.5)',
                }}>
                  {item.standardPrice.toFixed(2)}
                </div>
                <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
                  {t('price.board.unit', '元')}/{item.fuelUnit}
                </Text>
              </div>

              {/* Member Price */}
              {item.memberPrice !== undefined && (
                <div style={{
                  padding: '12px 16px 16px',
                  textAlign: 'center',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <Space>
                    <Tag color="gold" style={{ marginRight: 0 }}>
                      {t('price.board.memberPrice', '会员价')}
                    </Tag>
                    <Text style={{ color: '#fadb14', fontSize: 20, fontWeight: 600 }}>
                      ¥{item.memberPrice.toFixed(2)}
                    </Text>
                  </Space>
                  {item.maxDiscount !== undefined && (
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                        {t('price.board.maxDiscount', '最高优惠')} ¥{item.maxDiscount.toFixed(2)}/{item.fuelUnit}
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PriceDisplayBoard;
