import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Tabs,
  Button,
  Descriptions,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Table,
  Badge,
  Typography,
  Popconfirm,
  message,
  Empty,
  Alert,
} from 'antd';
import {
  EditOutlined,
  ArrowLeftOutlined,
  StopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CameraOutlined,
  ToolOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { StationStatus, Nozzle, DeviceStatus, FuelingStatus, Shift, StationEmployee } from '../types';
import { stations } from '../../../../mock/stations';
import { getNozzlesByStation } from '../../../../mock/nozzles';
import { getShiftsByStation } from '../../../../mock/shifts';
import { getEmployeesByStation } from '../../../../mock/employees';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/** 状态颜色映射 */
const statusColorMap: Record<StationStatus, string> = {
  active: 'green',
  inactive: 'default',
  suspended: 'orange',
};

/** 设备状态 Badge 映射 */
const deviceStatusMap: Record<DeviceStatus, { status: 'success' | 'error' | 'default'; text: string }> = {
  online: { status: 'success', text: '在线' },
  offline: { status: 'default', text: '离线' },
  error: { status: 'error', text: '故障' },
};

/** 充装状态映射 */
const fuelingStatusMap: Record<FuelingStatus, { color: string; text: string }> = {
  idle: { color: 'green', text: '空闲' },
  fueling: { color: 'blue', text: '充装中' },
};

const StationDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('basic');

  // 查找站点数据
  const station = useMemo(() => {
    return stations.find((s) => s.id === id);
  }, [id]);

  // 获取枪配置
  const nozzles = useMemo(() => {
    return id ? getNozzlesByStation(id) : [];
  }, [id]);

  // 获取班次
  const shifts = useMemo(() => {
    return id ? getShiftsByStation(id) : [];
  }, [id]);

  // 获取员工
  const employees = useMemo(() => {
    return id ? getEmployeesByStation(id) : [];
  }, [id]);

  // 故障枪统计
  const errorNozzles = nozzles.filter((n) => n.deviceStatus === 'error');

  if (!station) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="站点不存在" />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={() => navigate('/operations/station')}>{t('common.back')}</Button>
        </div>
      </div>
    );
  }

  // 状态标签
  const renderStatusTag = (status: StationStatus) => {
    const statusTextMap: Record<StationStatus, string> = {
      active: t('station.statusActive'),
      inactive: t('station.statusInactive'),
      suspended: t('station.statusMaintenance'),
    };
    return <Tag color={statusColorMap[status]}>{statusTextMap[status]}</Tag>;
  };

  // 枪列表列定义
  const nozzleColumns: ColumnsType<Nozzle> = [
    {
      title: t('station.nozzle.code'),
      dataIndex: 'nozzleNo',
      key: 'nozzleNo',
      width: 80,
      align: 'center',
    },
    {
      title: t('station.nozzle.fuelType'),
      dataIndex: ['fuelType', 'name'],
      key: 'fuelType',
      width: 130,
      render: (name: string, record) => {
        const categoryColors: Record<string, string> = {
          gasoline: 'red',
          diesel: 'orange',
          gas: 'blue',
          other: 'default',
        };
        return (
          <Tag color={categoryColors[record.fuelType?.category || 'other']}>
            {name || '-'}
          </Tag>
        );
      },
    },
    {
      title: t('station.nozzle.unitPrice'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (price: number, record) => `¥${price.toFixed(2)}/${record.fuelType?.unit || 'L'}`,
    },
    {
      title: '设备状态',
      dataIndex: 'deviceStatus',
      key: 'deviceStatus',
      width: 100,
      align: 'center',
      render: (status: DeviceStatus) => (
        <Badge
          status={deviceStatusMap[status].status}
          text={deviceStatusMap[status].text}
        />
      ),
    },
    {
      title: '充装状态',
      dataIndex: 'fuelingStatus',
      key: 'fuelingStatus',
      width: 100,
      align: 'center',
      render: (status: FuelingStatus) => (
        <Tag color={fuelingStatusMap[status].color}>
          {fuelingStatusMap[status].text}
        </Tag>
      ),
    },
    {
      title: '业务状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? t('common.enabled') : t('common.disabled')}
        </Tag>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 150,
      align: 'center',
      render: () => (
        <Space size="small">
          <Button type="link" size="small">
            {t('station.nozzle.setPrice')}
          </Button>
          <Button type="link" size="small">
            {t('common.edit')}
          </Button>
        </Space>
      ),
    },
  ];

  // 班次列表列定义
  const shiftColumns: ColumnsType<Shift> = [
    {
      title: t('station.shift.name'),
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: t('station.shift.startTime'),
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
    },
    {
      title: t('station.shift.endTime'),
      dataIndex: 'endTime',
      key: 'endTime',
      width: 100,
    },
    {
      title: '跨天',
      dataIndex: 'isOvernight',
      key: 'isOvernight',
      width: 80,
      render: (val: boolean) => (val ? <Tag color="orange">是</Tag> : <Tag>否</Tag>),
    },
    {
      title: t('station.shift.supervisor'),
      dataIndex: 'supervisorName',
      key: 'supervisorName',
      width: 120,
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? t('common.enabled') : t('common.disabled')}
        </Tag>
      ),
    },
  ];

  // 员工列表列定义
  const employeeColumns: ColumnsType<StationEmployee> = [
    {
      title: '工号',
      dataIndex: 'employeeNo',
      key: 'employeeNo',
      width: 100,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '岗位',
      dataIndex: 'position',
      key: 'position',
      width: 100,
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source: string) => (
        <Tag color={source === 'sync' ? 'blue' : 'green'}>
          {source === 'sync' ? '系统同步' : '本地维护'}
        </Tag>
      ),
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? t('common.enabled') : t('common.disabled')}
        </Tag>
      ),
    },
  ];

  // 枪配置看板渲染 - 按加注岛分组
  const renderNozzleBoard = () => {
    // 按 dispenserNo 分组
    const groupedNozzles = nozzles.reduce(
      (acc, nozzle) => {
        const key = nozzle.dispenserNo || '未分配';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(nozzle);
        return acc;
      },
      {} as Record<string, Nozzle[]>
    );

    const getStatusColor = (nozzle: Nozzle) => {
      if (nozzle.deviceStatus === 'error') return '#ff4d4f';
      if (nozzle.deviceStatus === 'offline') return '#d9d9d9';
      if (nozzle.fuelingStatus === 'fueling') return '#1890ff';
      return '#52c41a';
    };

    const getStatusIcon = (nozzle: Nozzle) => {
      if (nozzle.deviceStatus === 'error') return '🔴';
      if (nozzle.deviceStatus === 'offline') return '⚪';
      if (nozzle.fuelingStatus === 'fueling') return '🔵';
      return '🟢';
    };

    return (
      <div>
        {/* 状态汇总 */}
        <div style={{ marginBottom: 16 }}>
          <Space size="large">
            <Text>
              🟢 空闲: {nozzles.filter((n) => n.deviceStatus === 'online' && n.fuelingStatus === 'idle').length}
            </Text>
            <Text>
              🔵 充装中: {nozzles.filter((n) => n.fuelingStatus === 'fueling').length}
            </Text>
            <Text>
              ⚪ 离线: {nozzles.filter((n) => n.deviceStatus === 'offline').length}
            </Text>
            <Text>
              🔴 故障: {nozzles.filter((n) => n.deviceStatus === 'error').length}
            </Text>
          </Space>
        </div>

        {/* 加注岛布局 */}
        {Object.entries(groupedNozzles).map(([dispenserNo, dispenserNozzles]) => (
          <Card
            key={dispenserNo}
            title={`加注岛 ${dispenserNo}`}
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              {dispenserNozzles.map((nozzle) => (
                <Col key={nozzle.id} xs={12} sm={8} md={6} lg={4}>
                  <Card
                    size="small"
                    hoverable
                    style={{
                      borderColor: getStatusColor(nozzle),
                      borderWidth: nozzle.deviceStatus === 'error' ? 2 : 1,
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <Title level={5} style={{ marginBottom: 4 }}>
                        枪{nozzle.nozzleNo}
                      </Title>
                      <div style={{ marginBottom: 4 }}>
                        {getStatusIcon(nozzle)}{' '}
                        {nozzle.deviceStatus === 'error'
                          ? '故障'
                          : nozzle.fuelingStatus === 'fueling'
                          ? '充装中'
                          : nozzle.deviceStatus === 'offline'
                          ? '离线'
                          : '空闲'}
                      </div>
                      <Tag>{nozzle.fuelType?.name || '-'}</Tag>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary">
                          ¥{nozzle.unitPrice.toFixed(2)}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="middle">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/operations/station')}
              >
                {t('common.back')}
              </Button>
              <Title level={4} style={{ marginBottom: 0 }}>
                {station.name}
              </Title>
              {renderStatusTag(station.status)}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(`/operations/station/${id}/edit`)}
              >
                {t('common.edit')}
              </Button>
              <Popconfirm
                title="确定要停用该站点吗？"
                onConfirm={() => message.success(t('common.success'))}
              >
                <Button danger icon={<StopOutlined />}>
                  {t('common.disabled')}
                </Button>
              </Popconfirm>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 故障警告 */}
      {errorNozzles.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`该站点有 ${errorNozzles.length} 台枪处于故障状态`}
          action={
            <Button size="small" onClick={() => setActiveTab('nozzle')}>
              查看枪配置
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Tab 内容 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 基本信息 Tab */}
          <TabPane tab={t('station.tabBasic')} key="basic">
            {/* 站点信息 */}
            <Descriptions
              title="站点信息"
              bordered
              column={{ xs: 1, sm: 2, md: 2 }}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label={t('station.code')}>
                {station.code}
              </Descriptions.Item>
              <Descriptions.Item label={t('station.name')}>
                {station.name}
              </Descriptions.Item>
              <Descriptions.Item label={t('station.status')}>
                {renderStatusTag(station.status)}
              </Descriptions.Item>
              <Descriptions.Item label={t('station.address')}>
                <Space>
                  <EnvironmentOutlined />
                  {station.address}
                </Space>
              </Descriptions.Item>
              {station.latitude && station.longitude && (
                <Descriptions.Item label="坐标">
                  {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label={t('station.contact')}>
                {station.contactName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('station.phone')}>
                {station.contactPhone ? (
                  <Space>
                    <PhoneOutlined />
                    <a href={`tel:${station.contactPhone}`}>{station.contactPhone}</a>
                  </Space>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('station.businessHours')}>
                {station.businessHours ? (
                  <Space direction="vertical" size={0}>
                    <Text>
                      <ClockCircleOutlined style={{ marginRight: 8 }} />
                      工作日: {station.businessHours.weekday}
                    </Text>
                    <Text>
                      <ClockCircleOutlined style={{ marginRight: 8 }} />
                      周末: {station.businessHours.weekend}
                    </Text>
                  </Space>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label={t('station.group.title')}>
                {station.group?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('station.region.title')}>
                {station.region?.name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="员工管理模式">
                <Tag color={station.employeeSyncMode === 'sync' ? 'blue' : 'green'}>
                  {station.employeeSyncMode === 'sync' ? '系统同步' : '本地维护'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* 统计概览 */}
            <Title level={5}>统计概览</Title>
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title={t('station.nozzle.title')}
                    value={station.nozzleCount || nozzles.length}
                    prefix={<ToolOutlined />}
                  />
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setActiveTab('nozzle')}
                  >
                    {t('common.detail')}
                  </Button>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title={t('station.tabEmployee')}
                    value={station.employeeCount || employees.length}
                    prefix={<TeamOutlined />}
                  />
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setActiveTab('employee')}
                  >
                    {t('common.detail')}
                  </Button>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title={t('station.shift.title')}
                    value={station.shiftCount || shifts.length}
                    prefix={<ClockCircleOutlined />}
                  />
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setActiveTab('shift')}
                  >
                    {t('common.detail')}
                  </Button>
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title={t('station.photo.title')}
                    value={station.imageCount || 0}
                    prefix={<CameraOutlined />}
                  />
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setActiveTab('photo')}
                  >
                    {t('common.detail')}
                  </Button>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 枪配置 Tab */}
          <TabPane tab={t('station.tabNozzle')} key="nozzle">
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={5} style={{ marginBottom: 0 }}>
                  {t('station.nozzle.list')}
                </Title>
              </Col>
              <Col>
                <Space>
                  <Button icon={<ReloadOutlined />}>刷新状态</Button>
                  <Button type="primary" icon={<PlusOutlined />}>
                    {t('station.nozzle.add')}
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* 看板视图 */}
            {renderNozzleBoard()}

            {/* 列表视图 */}
            <Card title="枪配置列表" style={{ marginTop: 16 }}>
              <Table
                columns={nozzleColumns}
                dataSource={nozzles}
                rowKey="id"
                size="small"
                pagination={false}
              />
            </Card>
          </TabPane>

          {/* 班次排班 Tab */}
          <TabPane tab={t('station.tabShift')} key="shift">
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={5} style={{ marginBottom: 0 }}>
                  {t('station.shift.list')}
                </Title>
              </Col>
              <Col>
                <Button type="primary" icon={<PlusOutlined />}>
                  {t('station.shift.add')}
                </Button>
              </Col>
            </Row>
            <Table
              columns={shiftColumns}
              dataSource={shifts}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          {/* 站点照片 Tab */}
          <TabPane tab={t('station.tabPhoto')} key="photo">
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={5} style={{ marginBottom: 0 }}>
                  {t('station.photo.title')}
                </Title>
              </Col>
              <Col>
                <Button type="primary" icon={<PlusOutlined />}>
                  {t('station.photo.upload')}
                </Button>
              </Col>
            </Row>
            <Empty description="暂无照片" />
          </TabPane>

          {/* 员工管理 Tab */}
          <TabPane tab={t('station.tabEmployee')} key="employee">
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={5} style={{ marginBottom: 0 }}>
                  员工列表
                </Title>
              </Col>
              <Col>
                {station.employeeSyncMode === 'local' && (
                  <Button type="primary" icon={<PlusOutlined />}>
                    {t('common.add')}
                  </Button>
                )}
              </Col>
            </Row>
            <Table
              columns={employeeColumns}
              dataSource={employees}
              rowKey="id"
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default StationDetail;
