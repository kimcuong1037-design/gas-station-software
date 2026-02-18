// P02: 储罐监控详情
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Typography, Button, Space, Progress, Tag, Segmented } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { getTanks } from '../../../../mock/equipments';
import type { Equipment } from '../types';
import { getTankLevelColor, AUTO_REFRESH_INTERVAL } from '../constants';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Title, Text } = Typography;

const TankMonitoring: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tanks, setTanks] = useState<Equipment[]>(getTanks());
  const [timeRange, setTimeRange] = useState<string>('24h');

  const refreshData = useCallback(() => {
    setTanks(
      getTanks().map((tank) => ({
        ...tank,
        monitoring: tank.monitoring
          ? {
              ...tank.monitoring,
              levelPercent: Math.max(0, Math.min(100, (tank.monitoring.levelPercent ?? 50) + (Math.random() - 0.5) * 2)),
              pressure: Math.round(((tank.monitoring.pressure ?? 0.6) + (Math.random() - 0.5) * 0.02) * 100) / 100,
              temperature: Math.round(((tank.monitoring.temperature ?? -162) + (Math.random() - 0.5) * 0.5) * 10) / 10,
            }
          : undefined,
      }))
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(refreshData, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [refreshData]);

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/operations/device-ledger/monitoring')}>
            返回看板
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {t('deviceLedger.monitoring.tankTitle', '储罐监控')}
          </Title>
          <RequirementTag componentId="monitoring-tank" module="device-ledger" showDetail />
        </Space>
        <Button icon={<ReloadOutlined />} onClick={refreshData}>
          {t('common.refresh', '刷新')}
        </Button>
      </Row>

      {/* 储罐详情卡片 */}
      <Row gutter={[16, 16]}>
        {tanks.map((tank) => {
          const levelPct = Math.round(tank.monitoring?.levelPercent ?? 0);
          const levelColor = getTankLevelColor(levelPct);
          const pressureOk = (tank.monitoring?.pressure ?? 0) <= (tank.maxPressure ?? 1.2);
          return (
            <Col xs={24} md={12} xl={8} key={tank.id}>
              <Card title={tank.name} extra={<Text type="secondary">{tank.deviceCode}</Text>}>
                <Row gutter={16} align="middle">
                  <Col span={8} style={{ textAlign: 'center' }}>
                    <Progress
                      type="dashboard"
                      percent={levelPct}
                      strokeColor={levelColor}
                      format={(pct) => `${pct}%`}
                      size={100}
                    />
                    <div><Text type="secondary">液位</Text></div>
                  </Col>
                  <Col span={16}>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">液位体积: </Text>
                      <Text strong>{tank.monitoring?.levelVolume ?? '-'} m³</Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">压力: </Text>
                      <Text strong style={{ color: pressureOk ? undefined : '#ff4d4f' }}>
                        {tank.monitoring?.pressure ?? '-'} MPa
                      </Text>
                      {pressureOk ? (
                        <Tag color="green" style={{ marginLeft: 8 }}>✅</Tag>
                      ) : (
                        <Tag color="red" style={{ marginLeft: 8 }}>⚠</Tag>
                      )}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">温度: </Text>
                      <Text strong>{tank.monitoring?.temperature ?? '-'}℃</Text>
                      <Tag color="green" style={{ marginLeft: 8 }}>✅</Tag>
                    </div>
                    <div>
                      <Text type="secondary">状态: </Text>
                      {levelPct < 20 ? (
                        <Tag color="red">异常</Tag>
                      ) : (
                        <Tag color="green">正常</Tag>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* 液位变化趋势图 (模拟) */}
      <Card
        title={
          <Space>
            <span style={{ borderLeft: '3px solid #1890ff', paddingLeft: 8 }}>液位变化趋势</span>
          </Space>
        }
        extra={
          <Segmented
            value={timeRange}
            onChange={(v) => setTimeRange(v as string)}
            options={[
              { label: '24小时', value: '24h' },
              { label: '7天', value: '7d' },
              { label: '30天', value: '30d' },
            ]}
          />
        }
        style={{ marginTop: 16 }}
      >
        <div
          style={{
            height: 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fafafa',
            borderRadius: 8,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary">📈 液位趋势图</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              (ECharts 图表 - 显示各储罐{timeRange === '24h' ? '24小时' : timeRange === '7d' ? '7天' : '30天'}液位变化)
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              ── 储罐#1 ({Math.round(tanks[0]?.monitoring?.levelPercent ?? 0)}%)
              &nbsp;&nbsp;─ ─ 储罐#2 ({Math.round(tanks[1]?.monitoring?.levelPercent ?? 0)}%)
              &nbsp;&nbsp;═══ ⚠ 20%阈值线
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TankMonitoring;
