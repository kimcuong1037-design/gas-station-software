// P03: 加气机状态看板
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Typography, Button, Space, Badge, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getDispensers } from '../../../../mock/equipments';
import type { DispenserStatus } from '../types';
import { DISPENSER_STATUS_CONFIG, getLabel } from '../constants';
import FaultReportDrawer from './FaultReportDrawer';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Title, Text } = Typography;

const DispenserStatusBoard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispensers = getDispensers();
  const [faultDrawerOpen, setFaultDrawerOpen] = useState(false);
  const [faultDeviceId, setFaultDeviceId] = useState<string | undefined>();

  // 状态汇总
  const statusCounts: Record<DispenserStatus, number> = { idle: 0, fueling: 0, fault: 0, offline: 0 };
  dispensers.forEach((d) => {
    const s = d.monitoring?.dispenserStatus ?? 'offline';
    statusCounts[s]++;
  });

  // 故障卡片置顶
  const sorted = [...dispensers].sort((a, b) => {
    const aFault = a.monitoring?.dispenserStatus === 'fault' ? 0 : 1;
    const bFault = b.monitoring?.dispenserStatus === 'fault' ? 0 : 1;
    return aFault - bFault;
  });

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/operations/device-ledger/monitoring')}>
            返回看板
          </Button>
          <Title level={4} style={{ margin: 0 }}>
            {t('deviceLedger.monitoring.dispenserTitle', '加气机状态')}
          </Title>
          <RequirementTag componentId="monitoring-dispenser" module="device-ledger" showDetail />
        </Space>
      </Row>

      {/* 状态汇总条 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space size={24}>
          {(Object.entries(statusCounts) as [DispenserStatus, number][]).map(([status, count]) => {
            const config = DISPENSER_STATUS_CONFIG[status];
            return (
              <Space key={status}>
                <Badge color={config.color === 'default' ? 'gray' : config.color} />
                <Text>{getLabel(config)}: {count}</Text>
              </Space>
            );
          })}
        </Space>
      </Card>

      {/* 加气机卡片网格 */}
      <Row gutter={[16, 16]}>
        {sorted.map((disp) => {
          const dispenserStatus = disp.monitoring?.dispenserStatus ?? 'offline';
          const config = DISPENSER_STATUS_CONFIG[dispenserStatus];
          const isFault = dispenserStatus === 'fault';
          return (
            <Col xs={24} sm={12} md={8} xl={6} key={disp.id}>
              <Card
                size="small"
                style={{
                  borderColor: isFault ? '#ff4d4f' : undefined,
                  borderWidth: isFault ? 2 : undefined,
                }}
              >
                <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                  <Text strong>{disp.name}</Text>
                  <Badge color={config.color === 'default' ? 'gray' : config.color} text={getLabel(config)} />
                </Row>
                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {disp.deviceCode} | {disp.model}
                  </Text>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>枪位状态：</Text>
                  {disp.monitoring?.nozzles?.map((nozzle) => {
                    const nozzleConfig = DISPENSER_STATUS_CONFIG[nozzle.status as DispenserStatus];
                    return (
                      <div key={nozzle.nozzleNo} style={{ padding: '2px 0' }}>
                        <Space size={4}>
                          <Text style={{ fontSize: 12 }}>{nozzle.nozzleNo}</Text>
                          <Tag style={{ fontSize: 10 }}>{nozzle.fuelType}</Tag>
                          <Badge
                            color={nozzleConfig?.color === 'default' ? 'gray' : nozzleConfig?.color}
                            text={<Text style={{ fontSize: 12 }}>{nozzleConfig ? getLabel(nozzleConfig) : nozzle.status}</Text>}
                          />
                          <Text type="secondary" style={{ fontSize: 11 }}>¥{nozzle.unitPrice}/m³</Text>
                        </Space>
                      </div>
                    );
                  })}
                </div>

                {isFault && disp.updatedAt && (
                  <div style={{ marginBottom: 8, fontSize: 12, color: '#ff4d4f' }}>
                    故障时间: {new Date(disp.updatedAt).toLocaleString('zh-CN')}
                  </div>
                )}

                <Space>
                  {isFault && (
                    <Button
                      type="primary"
                      danger
                      size="small"
                      onClick={() => {
                        setFaultDeviceId(disp.id);
                        setFaultDrawerOpen(true);
                      }}
                    >
                      快速报修
                    </Button>
                  )}
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate(`/operations/device-ledger/equipment/${disp.id}`)}
                  >
                    详情
                  </Button>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* 故障报修抽屉 */}
      <FaultReportDrawer
        open={faultDrawerOpen}
        onClose={() => { setFaultDrawerOpen(false); setFaultDeviceId(undefined); }}
        defaultDeviceId={faultDeviceId}
      />
    </div>
  );
};

export default DispenserStatusBoard;
