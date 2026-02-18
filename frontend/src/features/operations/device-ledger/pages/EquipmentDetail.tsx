// P10: 设备详情页
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Descriptions,
  Tabs,
  Space,
  Tag,
  Progress,
  Alert,
  Empty,
  Popconfirm,
  message,
  Table,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  StopOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { equipments } from '../../../../mock/equipments';
import { maintenanceOrders } from '../../../../mock/maintenanceOrders';
import type { MaintenanceOrder } from '../types';
import {
  MAINTENANCE_CYCLE_CONFIG,
  MAINTENANCE_REMINDER_DAYS,
  getTankLevelColor,
  getLabel,
} from '../constants';
import DeviceStatusTag from '../components/DeviceStatusTag';
import DeviceTypeTag from '../components/DeviceTypeTag';
import OrderStatusTag from '../components/OrderStatusTag';
import UrgencyTag from '../components/UrgencyTag';

const { Title, Text } = Typography;

const EquipmentDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('basic');

  const equipment = useMemo(() => equipments.find((e) => e.id === id), [id]);
  const relatedOrders = useMemo(
    () => maintenanceOrders.filter((o) => o.deviceId === id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [id]
  );

  if (!equipment) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="设备不存在">
          <Button onClick={() => navigate('/operations/device-ledger/equipment')}>返回列表</Button>
        </Empty>
      </div>
    );
  }

  // 维保提醒
  const maintenanceDays = equipment.nextMaintenanceDate
    ? Math.ceil((new Date(equipment.nextMaintenanceDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    : null;
  const showMaintenanceAlert = maintenanceDays !== null && maintenanceDays <= MAINTENANCE_REMINDER_DAYS;

  const handleDeactivate = () => {
    message.success(`已停用设备: ${equipment.name}`);
  };

  // 维保记录列
  const orderColumns: ColumnsType<MaintenanceOrder> = [
    {
      title: '工单号',
      dataIndex: 'orderNumber',
      width: 140,
      render: (num: string, record) => (
        <a onClick={() => navigate(`/operations/device-ledger/maintenance/${record.id}`)}>
          {num}
        </a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'orderType',
      width: 80,
      align: 'center',
      render: (type: string) => <Tag>{type === 'repair' ? '维修' : type === 'maintenance' ? '保养' : '巡检'}</Tag>,
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      width: 80,
      align: 'center',
      render: (urgency) => <UrgencyTag level={urgency} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (status) => <OrderStatusTag status={status} />,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 120,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
  ];

  // 运行状态 (仅储罐/加气机)
  const renderOperatingStatus = () => {
    if (equipment.deviceType === 'tank' && equipment.monitoring) {
      const m = equipment.monitoring;
      return (
        <Row gutter={[24, 24]}>
          <Col span={8}>
            <Card size="small" title="液位">
              <div style={{ textAlign: 'center' }}>
                <Progress
                  type="dashboard"
                  percent={m.levelPercent ?? 0}
                  strokeColor={getTankLevelColor(m.levelPercent ?? 0)}
                  format={(pct) => `${pct}%`}
                  size={120}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">当前液位</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="压力">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Title level={2} style={{ margin: 0, color: (m.pressure ?? 0) > 1.5 ? '#ff4d4f' : undefined }}>
                  {m.pressure ?? '-'} <Text type="secondary" style={{ fontSize: 14 }}>MPa</Text>
                </Title>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">工作压力</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="温度">
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Title level={2} style={{ margin: 0, color: (m.temperature ?? 0) > -140 ? '#faad14' : undefined }}>
                  {m.temperature ?? '-'} <Text type="secondary" style={{ fontSize: 14 }}>°C</Text>
                </Title>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">罐体温度</Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      );
    }

    if (equipment.deviceType === 'dispenser' && equipment.monitoring) {
      const m = equipment.monitoring;
      return (
        <Card size="small">
          <Descriptions column={2}>
            <Descriptions.Item label="当前状态">
              <Tag color={m.dispenserStatus === 'fueling' ? 'blue' : m.dispenserStatus === 'fault' ? 'red' : 'default'}>
                {m.dispenserStatus === 'idle' ? '空闲' : m.dispenserStatus === 'fueling' ? '加注中' : m.dispenserStatus === 'fault' ? '故障' : '离线'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="今日加注量">{m.dailyVolume ?? '-'} m³</Descriptions.Item>
          </Descriptions>
          {m.nozzles && m.nozzles.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Text strong style={{ marginBottom: 8, display: 'block' }}>加注口状态</Text>
              <Row gutter={[12, 12]}>
                {m.nozzles.map((nozzle) => (
                  <Col key={nozzle.nozzleNo} span={8}>
                    <Card size="small" style={{ borderColor: nozzle.status === 'fault' ? '#ff4d4f' : undefined }}>
                      <Text strong>{nozzle.nozzleNo}</Text>
                      <br />
                      <Tag color={nozzle.status === 'idle' ? 'default' : nozzle.status === 'fueling' ? 'processing' : 'error'}>
                        {nozzle.status === 'idle' ? '空闲' : nozzle.status === 'fueling' ? '加注中' : '故障'}
                      </Tag>
                      {nozzle.currentFlow !== undefined && (
                        <Text type="secondary" style={{ fontSize: 12 }}> {nozzle.currentFlow} m³/h</Text>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Card>
      );
    }

    return <Empty description="该设备类型暂不支持运行状态监控" />;
  };

  const tabItems = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <Card>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="设备编号">{equipment.deviceCode}</Descriptions.Item>
            <Descriptions.Item label="设备名称">{equipment.name}</Descriptions.Item>
            <Descriptions.Item label="设备类型">
              <DeviceTypeTag type={equipment.deviceType} />
            </Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <DeviceStatusTag status={equipment.status} />
            </Descriptions.Item>
            <Descriptions.Item label="型号">{equipment.model || '-'}</Descriptions.Item>
            <Descriptions.Item label="厂商">{equipment.manufacturer || '-'}</Descriptions.Item>
            <Descriptions.Item label="序列号">{equipment.serialNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="安装日期">{equipment.installDate || '-'}</Descriptions.Item>
            <Descriptions.Item label="维保周期">
              {equipment.maintenanceCycle ? getLabel(MAINTENANCE_CYCLE_CONFIG[equipment.maintenanceCycle]) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="下次维保日期">
              {equipment.nextMaintenanceDate ? (
                <Text style={{ color: maintenanceDays !== null && maintenanceDays <= 7 ? '#ff4d4f' : undefined }}>
                  {equipment.nextMaintenanceDate}
                  {maintenanceDays !== null && maintenanceDays <= 7 && (
                    <Text type="danger" style={{ marginLeft: 8 }}>
                      ({maintenanceDays <= 0 ? '已过期' : `${maintenanceDays}天后`})
                    </Text>
                  )}
                </Text>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{equipment.remark || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    ...(equipment.deviceType === 'tank' || equipment.deviceType === 'dispenser'
      ? [
          {
            key: 'status',
            label: '运行状态',
            children: renderOperatingStatus(),
          },
        ]
      : []),
    {
      key: 'maintenance',
      label: `维保记录 (${relatedOrders.length})`,
      children: relatedOrders.length > 0 ? (
        <Card>
          <Table
            columns={orderColumns}
            dataSource={relatedOrders}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      ) : (
        <Card>
          <Empty description="暂无维保记录">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/operations/device-ledger/maintenance/create?deviceId=${equipment.id}`)}
            >
              创建工单
            </Button>
          </Empty>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <Row align="middle" style={{ marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 8 }} />
        <div style={{ flex: 1 }}>
          <Row align="middle" justify="space-between">
            <Space align="center">
              <Title level={4} style={{ margin: 0 }}>{equipment.name}</Title>
              <DeviceStatusTag status={equipment.status} />
              <DeviceTypeTag type={equipment.deviceType} />
            </Space>
            <Space>
              <Button
                icon={<PlusOutlined />}
                onClick={() => navigate(`/operations/device-ledger/maintenance/create?deviceId=${equipment.id}`)}
              >
                创建工单
              </Button>
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/operations/device-ledger/equipment/${equipment.id}/edit`)}
              >
                编辑
              </Button>
              {equipment.status !== 'inactive' && (
                <Popconfirm title="确定停用该设备？停用后设备将不再参与监控。" onConfirm={handleDeactivate}>
                  <Button danger icon={<StopOutlined />}>
                    停用
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Row>
        </div>
      </Row>

      {/* 维保提醒 */}
      {showMaintenanceAlert && (
        <Alert
          type={maintenanceDays! <= 0 ? 'error' : 'warning'}
          message={
            maintenanceDays! <= 0
              ? `该设备维保已过期 ${Math.abs(maintenanceDays!)} 天，请尽快安排维保`
              : `该设备将在 ${maintenanceDays} 天后需要维保`
          }
          icon={<WarningOutlined />}
          showIcon
          closable
          action={
            <Button
              size="small"
              onClick={() => navigate(`/operations/device-ledger/maintenance/create?deviceId=${equipment.id}`)}
            >
              创建维保工单
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Tab内容 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </div>
  );
};

export default EquipmentDetail;
