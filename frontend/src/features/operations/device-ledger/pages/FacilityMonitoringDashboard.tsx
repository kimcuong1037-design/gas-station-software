// P01: 设施监控看板
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Badge,
  Progress,
  List,
  Statistic,
  Tag,
  Empty,
} from 'antd';
import {
  ToolOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ReloadOutlined,
  RightOutlined,
  AlertOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { equipments, getMonitoringStats, getPendingActions, getTanks, getDispensers } from '../../../../mock/equipments';
import type { Equipment, MonitoringStats, PendingAction } from '../types';
import { DISPENSER_STATUS_CONFIG, getTankLevelColor, AUTO_REFRESH_INTERVAL, getLabel } from '../constants';
import FaultReportDrawer from './FaultReportDrawer';

const { Title, Text } = Typography;

const FacilityMonitoringDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<MonitoringStats>(getMonitoringStats());
  const [tanks, setTanks] = useState<Equipment[]>(getTanks());
  const [dispensers, setDispensers] = useState<Equipment[]>(getDispensers());
  const [pendingActions, setPendingActions] = useState<PendingAction[]>(getPendingActions());
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString('zh-CN'));
  const [faultDrawerOpen, setFaultDrawerOpen] = useState(false);
  const [faultDeviceId, setFaultDeviceId] = useState<string | undefined>();

  const refreshData = useCallback(() => {
    // 模拟数据刷新 + 随机波动
    const updatedTanks = getTanks().map((tank) => ({
      ...tank,
      monitoring: tank.monitoring
        ? {
            ...tank.monitoring,
            levelPercent: Math.max(0, Math.min(100, (tank.monitoring.levelPercent ?? 50) + (Math.random() - 0.5) * 2)),
            pressure: Math.round(((tank.monitoring.pressure ?? 0.6) + (Math.random() - 0.5) * 0.02) * 100) / 100,
            temperature: Math.round(((tank.monitoring.temperature ?? -162) + (Math.random() - 0.5) * 0.5) * 10) / 10,
          }
        : undefined,
    }));
    setTanks(updatedTanks);
    setDispensers(getDispensers());
    setStats(getMonitoringStats());
    setPendingActions(getPendingActions());
    setLastUpdated(new Date().toLocaleTimeString('zh-CN'));
  }, []);

  // 自动刷新 15s
  useEffect(() => {
    const timer = setInterval(refreshData, AUTO_REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [refreshData]);

  const handleFaultReport = (deviceId?: string) => {
    setFaultDeviceId(deviceId);
    setFaultDrawerOpen(true);
  };

  const handlePendingAction = (action: PendingAction) => {
    if (action.actionLabel === '快速报修') {
      handleFaultReport(action.deviceId);
    } else if (action.actionTarget) {
      navigate(action.actionTarget);
    }
  };

  if (equipments.filter((e) => e.status !== 'inactive').length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="暂无设备数据，请先录入设备台账">
          <Button type="primary" onClick={() => navigate('/operations/device-ledger/equipment/create')}>
            前往新增设备
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          {t('deviceLedger.monitoring.title', '设施监控')}
        </Title>
        <Space>
          <Text type="secondary">最后更新: {lastUpdated}</Text>
          <Button icon={<ReloadOutlined />} onClick={refreshData}>
            {t('common.refresh', '刷新')}
          </Button>
        </Space>
      </Row>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('deviceLedger.monitoring.totalDevices', '设备总数')}
              value={stats.totalDevices}
              prefix={<ToolOutlined style={{ color: '#1890ff' }} />}
              suffix={
                <Text type="secondary" style={{ fontSize: 14 }}>
                  在线 {Math.round((stats.totalDevices * stats.onlineRate) / 100)} / 离线{' '}
                  {stats.totalDevices - Math.round((stats.totalDevices * stats.onlineRate) / 100)}
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('deviceLedger.monitoring.onlineRate', '在线率')}
              value={stats.onlineRate}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('deviceLedger.monitoring.alarms', '告警')}
              value={stats.alarmCount}
              prefix={<WarningOutlined style={{ color: stats.alarmCount > 0 ? '#ff4d4f' : '#52c41a' }} />}
              valueStyle={{ color: stats.alarmCount > 0 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('deviceLedger.monitoring.pendingMaintenance', '待维保')}
              value={stats.pendingMaintenance}
              prefix={<ToolOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: stats.pendingMaintenance > 0 ? '#faad14' : undefined }}
            />
          </Card>
        </Col>
      </Row>

      {/* 储罐区域 */}
      <Card
        title={
          <Space>
            <span style={{ borderLeft: '3px solid #1890ff', paddingLeft: 8 }}>储罐区</span>
          </Space>
        }
        extra={
          <Button type="link" onClick={() => navigate('/operations/device-ledger/monitoring/tanks')}>
            查看详情 <RightOutlined />
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          {tanks.map((tank) => (
            <Col xs={24} sm={12} md={8} key={tank.id}>
              <Card
                size="small"
                hoverable
                onClick={() => navigate('/operations/device-ledger/monitoring/tanks')}
                style={{
                  borderColor: (tank.monitoring?.levelPercent ?? 100) < 20 ? '#ff4d4f' : undefined,
                }}
              >
                <Row justify="space-between" align="middle">
                  <Text strong>{tank.name}</Text>
                  {(tank.monitoring?.levelPercent ?? 100) < 20 ? (
                    <Tag color="red">⚠ 低液位</Tag>
                  ) : (
                    <Tag color="green">✅ 正常</Tag>
                  )}
                </Row>
                <div style={{ margin: '12px 0' }}>
                  <Progress
                    percent={Math.round(tank.monitoring?.levelPercent ?? 0)}
                    strokeColor={getTankLevelColor(tank.monitoring?.levelPercent ?? 0)}
                    size="small"
                  />
                </div>
                <Row gutter={8}>
                  <Col span={8}>
                    <Text type="secondary" style={{ fontSize: 12 }}>液位</Text>
                    <div>{tank.monitoring?.levelVolume ?? '-'}m³</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary" style={{ fontSize: 12 }}>压力</Text>
                    <div>{tank.monitoring?.pressure ?? '-'} MPa</div>
                  </Col>
                  <Col span={8}>
                    <Text type="secondary" style={{ fontSize: 12 }}>温度</Text>
                    <div>{tank.monitoring?.temperature ?? '-'}℃</div>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 加气机区域 */}
      <Card
        title={
          <Space>
            <span style={{ borderLeft: '3px solid #1890ff', paddingLeft: 8 }}>加气机区</span>
          </Space>
        }
        extra={
          <Button type="link" onClick={() => navigate('/operations/device-ledger/monitoring/dispensers')}>
            查看详情 <RightOutlined />
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          {dispensers.map((disp) => {
            const dispenserStatus = disp.monitoring?.dispenserStatus ?? 'offline';
            const statusConfig = DISPENSER_STATUS_CONFIG[dispenserStatus];
            const isFault = dispenserStatus === 'fault';
            return (
              <Col xs={24} sm={12} md={6} key={disp.id}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => navigate('/operations/device-ledger/monitoring/dispensers')}
                  style={{
                    borderColor: isFault ? '#ff4d4f' : undefined,
                    animation: isFault ? 'pulse 2s infinite' : undefined,
                  }}
                >
                  <Row justify="space-between" align="middle">
                    <Text strong>{disp.name}</Text>
                    <Badge color={statusConfig.color === 'default' ? 'gray' : statusConfig.color} text={getLabel(statusConfig)} />
                  </Row>
                  <div style={{ marginTop: 8 }}>
                    {disp.monitoring?.nozzles?.map((nozzle) => (
                      <div key={nozzle.nozzleNo} style={{ fontSize: 12, padding: '2px 0' }}>
                        <Space size={4}>
                          <Text>{nozzle.nozzleNo}</Text>
                          <Tag style={{ fontSize: 10 }}>{nozzle.fuelType}</Tag>
                          <Badge
                            color={DISPENSER_STATUS_CONFIG[nozzle.status as keyof typeof DISPENSER_STATUS_CONFIG]?.color === 'default' ? 'gray' : DISPENSER_STATUS_CONFIG[nozzle.status as keyof typeof DISPENSER_STATUS_CONFIG]?.color}
                            text={<Text style={{ fontSize: 12 }}>{getLabel(DISPENSER_STATUS_CONFIG[nozzle.status as keyof typeof DISPENSER_STATUS_CONFIG] || { label: nozzle.status, labelEn: nozzle.status })}</Text>}
                          />
                        </Space>
                      </div>
                    ))}
                  </div>
                  {isFault && (
                    <div style={{ marginTop: 8 }}>
                      <Button type="link" danger size="small" onClick={(e) => { e.stopPropagation(); handleFaultReport(disp.id); }}>
                        快速报修
                      </Button>
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>

      {/* 待处理事项 */}
      {pendingActions.length > 0 && (
        <Card
          title={
            <Space>
              <span style={{ borderLeft: '3px solid #1890ff', paddingLeft: 8 }}>待处理事项</span>
            </Space>
          }
        >
          <List
            size="small"
            dataSource={pendingActions.slice(0, 5)}
            renderItem={(action) => (
              <List.Item
                actions={[
                  <Button type="link" size="small" onClick={() => handlePendingAction(action)}>
                    {action.actionLabel}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    action.icon === 'warning' ? (
                      <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 18 }} />
                    ) : action.icon === 'fault' ? (
                      <AlertOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
                    ) : (
                      <ToolOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                    )
                  }
                  description={action.message}
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* 故障报修抽屉 */}
      <FaultReportDrawer
        open={faultDrawerOpen}
        onClose={() => { setFaultDrawerOpen(false); setFaultDeviceId(undefined); }}
        defaultDeviceId={faultDeviceId}
      />
    </div>
  );
};

export default FacilityMonitoringDashboard;
