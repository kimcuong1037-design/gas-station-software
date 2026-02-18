// P17: 设备连接管理页
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Tabs,
  Alert,
  Space,
  Badge,
  Tooltip,
  Button,
} from 'antd';
import {
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { equipments } from '../../../../mock/equipments';
import type { Equipment, ConnectionStatus } from '../types';
import { CONNECTION_STATUS_CONFIG, getLabel } from '../constants';
import DeviceTypeTag from '../components/DeviceTypeTag';

const { Title, Text } = Typography;

// 模拟连接状态数据
interface DeviceConnection {
  id: string;
  deviceCode: string;
  name: string;
  deviceType: Equipment['deviceType'];
  connectionStatus: ConnectionStatus;
  protocol: string;
  lastHeartbeat: string;
  signalStrength: number; // 0-100
  ipAddress: string;
  port: number;
}

const mockConnections: DeviceConnection[] = equipments
  .filter((e) => e.status !== 'inactive')
  .map((e) => ({
    id: e.id,
    deviceCode: e.deviceCode,
    name: e.name,
    deviceType: e.deviceType,
    connectionStatus: (e.status === 'fault' ? 'disconnected' : e.status === 'active' ? 'connected' : 'unstable') as ConnectionStatus,
    protocol: e.deviceType === 'tank' || e.deviceType === 'dispenser' ? 'Modbus TCP' : e.deviceType === 'sensor' ? 'MQTT' : 'OPC UA',
    lastHeartbeat: e.status === 'fault' ? '2025-07-08 03:22:15' : '2025-07-10 14:30:' + Math.floor(Math.random() * 60).toString().padStart(2, '0'),
    signalStrength: e.status === 'fault' ? 0 : e.status === 'active' ? 75 + Math.floor(Math.random() * 25) : 30 + Math.floor(Math.random() * 30),
    ipAddress: `192.168.1.${100 + parseInt(e.id.split('-')[1] || '1')}`,
    port: e.deviceType === 'tank' || e.deviceType === 'dispenser' ? 502 : e.deviceType === 'sensor' ? 1883 : 4840,
  }));

const connectionStatusIcon: Record<ConnectionStatus, React.ReactNode> = {
  connected: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  disconnected: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
  unstable: <SyncOutlined spin style={{ color: '#faad14' }} />,
};

const DeviceConnectivity: React.FC = () => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return mockConnections;
    return mockConnections.filter((c) => c.connectionStatus === statusFilter);
  }, [statusFilter]);

  const statusCounts = useMemo(() => ({
    all: mockConnections.length,
    connected: mockConnections.filter((c) => c.connectionStatus === 'connected').length,
    disconnected: mockConnections.filter((c) => c.connectionStatus === 'disconnected').length,
    unstable: mockConnections.filter((c) => c.connectionStatus === 'unstable').length,
  }), []);

  const columns: ColumnsType<DeviceConnection> = [
    {
      title: '设备编号',
      dataIndex: 'deviceCode',
      width: 130,
      render: (code: string) => <Text style={{ fontFamily: 'monospace' }}>{code}</Text>,
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      width: 150,
    },
    {
      title: '类型',
      dataIndex: 'deviceType',
      width: 100,
      align: 'center',
      render: (type) => <DeviceTypeTag type={type} />,
    },
    {
      title: '连接状态',
      dataIndex: 'connectionStatus',
      width: 110,
      align: 'center',
      render: (status: ConnectionStatus) => {
        const config = CONNECTION_STATUS_CONFIG[status];
        return (
          <Space>
            {connectionStatusIcon[status]}
            <Tag color={config.color}>{getLabel(config)}</Tag>
          </Space>
        );
      },
    },
    {
      title: '通信协议',
      dataIndex: 'protocol',
      width: 110,
      align: 'center',
      render: (protocol: string) => <Tag>{protocol}</Tag>,
    },
    {
      title: '信号强度',
      dataIndex: 'signalStrength',
      width: 110,
      align: 'center',
      render: (strength: number) => {
        let color = '#52c41a';
        if (strength === 0) color = '#ff4d4f';
        else if (strength < 50) color = '#faad14';
        return (
          <Tooltip title={`${strength}%`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <div style={{ width: 60, height: 6, backgroundColor: '#f0f0f0', borderRadius: 3 }}>
                <div style={{ width: `${strength}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
              </div>
              <Text style={{ fontSize: 12, color }}>{strength}%</Text>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'IP 地址',
      dataIndex: 'ipAddress',
      width: 140,
      render: (ip: string, record) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {ip}:{record.port}
        </Text>
      ),
    },
    {
      title: '最后心跳',
      dataIndex: 'lastHeartbeat',
      width: 160,
      render: (time: string, record) => (
        <Text type={record.connectionStatus === 'disconnected' ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
          {time}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Space align="center">
          <ApiOutlined style={{ fontSize: 24 }} />
          <Title level={4} style={{ margin: 0 }}>
            {t('deviceLedger.connectivity.title', '设备连接')}
          </Title>
        </Space>
        <Button icon={<SyncOutlined />}>刷新状态</Button>
      </Row>

      {/* 未来版本提示 */}
      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message="设备连接管理"
        description="当前为设备连接状态概览视图。完整的设备协议配置、数据采集规则、远程诊断等功能将在后续版本中实现。"
        style={{ marginBottom: 16 }}
      />

      {/* 状态统计 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[
          { key: 'all', label: '总设备数', value: statusCounts.all, color: '#1677ff', icon: <ApiOutlined /> },
          { key: 'connected', label: '已连接', value: statusCounts.connected, color: '#52c41a', icon: <CheckCircleOutlined /> },
          { key: 'disconnected', label: '已断开', value: statusCounts.disconnected, color: '#ff4d4f', icon: <CloseCircleOutlined /> },
          { key: 'unstable', label: '不稳定', value: statusCounts.unstable, color: '#faad14', icon: <SyncOutlined /> },
        ].map((item) => (
          <Col span={6} key={item.key}>
            <Card
              size="small"
              hoverable
              onClick={() => setStatusFilter(item.key)}
              style={{
                borderColor: statusFilter === item.key ? item.color : undefined,
                borderWidth: statusFilter === item.key ? 2 : 1,
              }}
            >
              <Row align="middle" justify="space-between">
                <div>
                  <Text type="secondary">{item.label}</Text>
                  <div>
                    <Title level={3} style={{ margin: 0, color: item.color }}>{item.value}</Title>
                  </div>
                </div>
                <div style={{ fontSize: 28, color: item.color, opacity: 0.3 }}>{item.icon}</div>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 状态Tab */}
      <Tabs
        activeKey={statusFilter}
        onChange={setStatusFilter}
        items={[
          { key: 'all', label: `全部 (${statusCounts.all})` },
          ...Object.entries(CONNECTION_STATUS_CONFIG).map(([key, config]) => ({
            key,
            label: (
              <Space>
                {getLabel(config)}
                <Badge
                  count={statusCounts[key as keyof typeof statusCounts] ?? 0}
                  size="small"
                  color={config.color}
                />
              </Space>
            ),
          })),
        ]}
        style={{ marginBottom: 0 }}
      />

      {/* 设备连接表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          onRow={(record) => ({
            style: record.connectionStatus === 'disconnected' ? { backgroundColor: '#fff1f0' } : undefined,
          })}
        />
      </Card>
    </div>
  );
};

export default DeviceConnectivity;
