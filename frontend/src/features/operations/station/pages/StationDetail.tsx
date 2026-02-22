import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
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
  CalendarOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { RequirementTag } from '../../../../components/RequirementTag';
import type { ColumnsType } from 'antd/es/table';
import type { StationStatus, Nozzle, DeviceStatus, FuelingStatus, Shift, StationEmployee } from '../types';
import { stations } from '../../../../mock/stations';
import { getNozzlesByStation } from '../../../../mock/nozzles';
import { getShiftsByStation } from '../../../../mock/shifts';
import { getEmployeesByStation } from '../../../../mock/employees';
import { fuelTypes } from '../../../../mock/fuelTypes';
import ShiftSchedulePanel from '../components/ShiftSchedulePanel';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/** 状态颜色映射 */
import { statusColorMap } from '../constants';

/** 设备状态 Badge 映射 */
const deviceStatusMap: Record<DeviceStatus, { status: 'success' | 'error' | 'default'; textKey: string }> = {
  online: { status: 'success', textKey: 'station.device.online' },
  offline: { status: 'default', textKey: 'station.device.offline' },
  error: { status: 'error', textKey: 'station.device.error' },
};

/** 充装状态映射 */
const fuelingStatusMap: Record<FuelingStatus, { color: string; textKey: string }> = {
  idle: { color: 'green', textKey: 'station.nozzle.statusIdle' },
  fueling: { color: 'blue', textKey: 'station.nozzle.statusFueling' },
};

const StationDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'basic';
  const initialSubTab = searchParams.get('subTab') || 'definitions';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [shiftSubTab, setShiftSubTab] = useState(initialSubTab);

  // 枪配置本地 CRUD 状态
  const [localNozzles, setLocalNozzles] = useState<Nozzle[]>([]);
  const [nozzleFormOpen, setNozzleFormOpen] = useState(false);
  const [editingNozzle, setEditingNozzle] = useState<Nozzle | null>(null);
  const [priceFormOpen, setPriceFormOpen] = useState(false);
  const [pricingNozzle, setPricingNozzle] = useState<Nozzle | null>(null);
  const [nozzleForm] = Form.useForm();
  const [priceForm] = Form.useForm();

  // 查找站点数据
  const station = useMemo(() => {
    return stations.find((s) => s.id === id);
  }, [id]);

  // 初始化枪配置（当站点 ID 变化时重置）
  useEffect(() => {
    setLocalNozzles(id ? getNozzlesByStation(id) : []);
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
  const errorNozzles = localNozzles.filter((n) => n.deviceStatus === 'error');

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
      title: t('station.device.online'),
      dataIndex: 'deviceStatus',
      key: 'deviceStatus',
      width: 100,
      align: 'center',
      render: (status: DeviceStatus) => (
        <Badge
          status={deviceStatusMap[status].status}
          text={t(deviceStatusMap[status].textKey)}
        />
      ),
    },
    {
      title: t('station.nozzle.statusFueling'),
      dataIndex: 'fuelingStatus',
      key: 'fuelingStatus',
      width: 100,
      align: 'center',
      render: (status: FuelingStatus) => (
        <Tag color={fuelingStatusMap[status].color}>
          {t(fuelingStatusMap[status].textKey)}
        </Tag>
      ),
    },
    {
      title: t('station.nozzle.businessStatus'),
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
      render: (_: unknown, record: Nozzle) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleSetPrice(record)}>
            {t('station.nozzle.setPrice')}
          </Button>
          <Button type="link" size="small" onClick={() => handleEditNozzle(record)}>
            {t('common.edit')}
          </Button>
        </Space>
      ),
    },
  ];

  // ===== 枪配置 CRUD 处理函数 =====

  const handleAddNozzle = () => {
    setEditingNozzle(null);
    nozzleForm.resetFields();
    setNozzleFormOpen(true);
  };

  const handleEditNozzle = (nozzle: Nozzle) => {
    setEditingNozzle(nozzle);
    nozzleForm.setFieldsValue({
      nozzleNo: nozzle.nozzleNo,
      fuelTypeId: nozzle.fuelTypeId,
      dispenserNo: nozzle.dispenserNo || '',
      status: nozzle.status,
    });
    setNozzleFormOpen(true);
  };

  const handleNozzleModalOk = async () => {
    try {
      const values = await nozzleForm.validateFields();
      const fuelType = fuelTypes.find((f) => f.id === values.fuelTypeId);
      if (editingNozzle) {
        setLocalNozzles((prev) =>
          prev.map((n) =>
            n.id === editingNozzle.id
              ? { ...n, ...values, fuelType, updatedAt: new Date().toISOString() }
              : n
          )
        );
        message.success(t('station.nozzle.edit') + ' ' + t('common.success'));
      } else {
        const newNozzle: Nozzle = {
          id: `nozzle-${Date.now()}`,
          stationId: id!,
          nozzleNo: values.nozzleNo,
          fuelTypeId: values.fuelTypeId,
          fuelType,
          unitPrice: 0,
          dispenserNo: values.dispenserNo || undefined,
          deviceStatus: 'offline',
          fuelingStatus: 'idle',
          status: values.status || 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setLocalNozzles((prev) => [...prev, newNozzle]);
        message.success(t('station.nozzle.add') + ' ' + t('common.success'));
      }
      setNozzleFormOpen(false);
    } catch {
      // form validation failed, keep modal open
    }
  };

  const handleSetPrice = (nozzle: Nozzle) => {
    setPricingNozzle(nozzle);
    priceForm.setFieldsValue({ unitPrice: nozzle.unitPrice });
    setPriceFormOpen(true);
  };

  const handlePriceModalOk = async () => {
    if (!pricingNozzle) return;
    try {
      const values = await priceForm.validateFields();
      setLocalNozzles((prev) =>
        prev.map((n) =>
          n.id === pricingNozzle.id
            ? { ...n, unitPrice: values.unitPrice, updatedAt: new Date().toISOString() }
            : n
        )
      );
      message.success(t('common.success'));
      setPriceFormOpen(false);
    } catch {
      // form validation failed
    }
  };

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
      title: t('station.detailPage.overnight'),
      dataIndex: 'isOvernight',
      key: 'isOvernight',
      width: 80,
      render: (val: boolean) => (val ? <Tag color="orange">{t('common.yes')}</Tag> : <Tag>{t('common.no')}</Tag>),
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
      title: t('station.employee.no'),
      dataIndex: 'employeeNo',
      key: 'employeeNo',
      width: 100,
    },
    {
      title: t('station.employee.name'),
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: t('station.employee.phone'),
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: t('station.employee.position'),
      dataIndex: 'position',
      key: 'position',
      width: 100,
    },
    {
      title: t('station.employee.source'),
      dataIndex: 'source',
      key: 'source',
      width: 100,
      render: (source: string) => (
        <Tag color={source === 'sync' ? 'blue' : 'green'}>
          {source === 'sync' ? t('station.employee.sourceSync') : t('station.employee.sourceLocal')}
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
    const groupedNozzles = localNozzles.reduce(
      (acc: Record<string, Nozzle[]>, nozzle: Nozzle) => {
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
      if (nozzle.deviceStatus === 'error') return '#CA3521';
      if (nozzle.deviceStatus === 'offline') return '#d9d9d9';
      if (nozzle.fuelingStatus === 'fueling') return '#22A06B';
      return '#1F845A';
    };

    const getStatusIcon = (nozzle: Nozzle) => {
      if (nozzle.deviceStatus === 'error') return <span role="img" aria-label={t('station.device.error')}>🔴</span>;
      if (nozzle.deviceStatus === 'offline') return <span role="img" aria-label={t('station.device.offline')}>⚪</span>;
      if (nozzle.fuelingStatus === 'fueling') return <span role="img" aria-label={t('station.nozzle.statusFueling')}>🔵</span>;
      return <span role="img" aria-label={t('station.nozzle.statusIdle')}>🟢</span>;
    };

    return (
      <div>
        {/* 状态汇总 */}
        <div style={{ marginBottom: 16 }}>
          <Space size="large">
            <Text>
              <span role="img" aria-label={t('station.nozzle.statusIdle')}>🟢</span> {t('station.nozzle.statusIdle')}: {localNozzles.filter((n) => n.deviceStatus === 'online' && n.fuelingStatus === 'idle').length}
            </Text>
            <Text>
              <span role="img" aria-label={t('station.nozzle.statusFueling')}>🔵</span> {t('station.nozzle.statusFueling')}: {localNozzles.filter((n) => n.fuelingStatus === 'fueling').length}
            </Text>
            <Text>
              <span role="img" aria-label={t('station.device.offline')}>⚪</span> {t('station.device.offline')}: {localNozzles.filter((n) => n.deviceStatus === 'offline').length}
            </Text>
            <Text>
              <span role="img" aria-label={t('station.device.error')}>🔴</span> {t('station.device.error')}: {localNozzles.filter((n) => n.deviceStatus === 'error').length}
            </Text>
          </Space>
        </div>

        {/* 加注岛布局 */}
        {Object.entries(groupedNozzles).map(([dispenserNo, dispenserNozzles]) => (
          <Card
            key={dispenserNo}
            title={`${t('station.nozzle.dispenser')} ${dispenserNo}`}
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
                        {t('station.nozzle.code')}{nozzle.nozzleNo}
                      </Title>
                      <div style={{ marginBottom: 4 }}>
                        {getStatusIcon(nozzle)}{' '}
                        {nozzle.deviceStatus === 'error'
                          ? t('station.device.error')
                          : nozzle.fuelingStatus === 'fueling'
                          ? t('station.nozzle.statusFueling')
                          : nozzle.deviceStatus === 'offline'
                          ? t('station.device.offline')
                          : t('station.nozzle.statusIdle')}
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
              <RequirementTag componentId="station-detail" showDetail />
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
                title={t('station.detailPage.confirmDisableStation')}
                onConfirm={() => {
                  // TODO: 调用实际的停用站点 API
                  // 例如: await disableStation(id);
                  message.success(t('common.stationDisabled'));
                  navigate('/operations/station');
                }}
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
          message={t('station.detailPage.errorNozzleAlert', { count: errorNozzles.length })}
          action={
            <Button size="small" onClick={() => setActiveTab('nozzle')}>
              {t('station.detailPage.viewNozzleConfig')}
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Tab 内容 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 基本信息 Tab */}
          <TabPane 
            tab={
              <Space size={4}>
                {t('station.tabBasic')}
                <RequirementTag componentId="station-detail-basic-tab" />
              </Space>
            } 
            key="basic"
          >
            {/* 站点信息 */}
            <Descriptions
              title={t('station.detailPage.stationInfo')}
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
                <Descriptions.Item label={t('station.form.coordinate')}>
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
                      {t('station.form.weekdayHours')}: {station.businessHours.weekday}
                    </Text>
                    <Text>
                      <ClockCircleOutlined style={{ marginRight: 8 }} />
                      {t('station.form.weekendHours')}: {station.businessHours.weekend}
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
              <Descriptions.Item label={t('station.form.employeeSyncMode')}>
                <Tag color={station.employeeSyncMode === 'sync' ? 'blue' : 'green'}>
                  {station.employeeSyncMode === 'sync' ? t('station.employee.sourceSync') : t('station.employee.sourceLocal')}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* 统计概览 */}
            <Title level={5}>{t('station.detailPage.overview')}</Title>
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title={t('station.nozzle.title')}
                    value={station.nozzleCount || localNozzles.length}
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
          <TabPane 
            tab={
              <Space size={4}>
                {t('station.tabNozzle')}
                <RequirementTag componentIds={['nozzle-list-tab', 'nozzle-realtime-status']} />
              </Space>
            } 
            key="nozzle"
          >
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={5} style={{ marginBottom: 0 }}>
                  {t('station.nozzle.list')}
                </Title>
              </Col>
              <Col>
                <Space>
                  <Button icon={<ReloadOutlined />}>{t('station.detailPage.refreshStatus')}</Button>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNozzle}>
                    {t('station.nozzle.add')}
                  </Button>
                </Space>
              </Col>
            </Row>

            {/* 看板视图 */}
            {renderNozzleBoard()}

            {/* 列表视图 */}
            <Card title={t('station.detailPage.nozzleConfig')} style={{ marginTop: 16 }}>
              <Table
                columns={nozzleColumns}
                dataSource={localNozzles}
                rowKey="id"
                size="small"
                pagination={false}
              />
            </Card>
          </TabPane>

          {/* 班次排班 Tab */}
          <TabPane 
            tab={
              <Space size={4}>
                {t('station.tabShift')}
                <RequirementTag componentId="shift-tab" />
              </Space>
            } 
            key="shift"
          >
            <Tabs
              activeKey={shiftSubTab}
              onChange={setShiftSubTab}
              size="small"
              type="card"
              items={[
                {
                  key: 'definitions',
                  label: (
                    <Space size={4}>
                      <UnorderedListOutlined />
                      {t('station.shift.definitionsTab')}
                    </Space>
                  ),
                  children: (
                    <>
                      <Row justify="space-between" align="middle" style={{ marginBottom: 16, marginTop: 16 }}>
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
                    </>
                  ),
                },
                {
                  key: 'schedule',
                  label: (
                    <Space size={4}>
                      <CalendarOutlined />
                      {t('station.shift.scheduleTab')}
                    </Space>
                  ),
                  children: (
                    <div style={{ marginTop: 16 }}>
                      {id && <ShiftSchedulePanel stationId={id} />}
                    </div>
                  ),
                },
              ]}
            />
          </TabPane>

          {/* 站点照片 Tab */}
          <TabPane 
            tab={
              <Space size={4}>
                {t('station.tabPhoto')}
                <RequirementTag componentId="photo-tab" />
              </Space>
            } 
            key="photo"
          >
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
            <Empty description={t('station.detailPage.noPhoto')} />
          </TabPane>

          {/* 员工管理 Tab */}
          <TabPane 
            tab={
              <Space size={4}>
                {t('station.tabEmployee')}
                <RequirementTag componentId="employee-tab" />
              </Space>
            } 
            key="employee"
          >
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={5} style={{ marginBottom: 0 }}>
                  {t('station.employee.list')}
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

      {/* 新增/编辑枪配置 Modal */}
      <Modal
        title={editingNozzle ? t('station.nozzle.edit') : t('station.nozzle.add')}
        open={nozzleFormOpen}
        onOk={handleNozzleModalOk}
        onCancel={() => setNozzleFormOpen(false)}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        destroyOnHidden
      >
        <Form form={nozzleForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="nozzleNo"
            label={t('station.nozzle.code')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Input placeholder="如 01、02" />
          </Form.Item>
          <Form.Item
            name="fuelTypeId"
            label={t('station.nozzle.fuelType')}
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select
              options={fuelTypes.filter((f) => f.status === 'active').map((f) => ({
                value: f.id,
                label: f.name,
              }))}
              placeholder={t('station.nozzle.fuelType')}
            />
          </Form.Item>
          <Form.Item name="dispenserNo" label={t('station.nozzle.dispenser')}>
            <Input placeholder="如 D01、D02" />
          </Form.Item>
          <Form.Item name="status" label={t('station.nozzle.status')} initialValue="active">
            <Select
              options={[
                { value: 'active', label: t('common.enabled') },
                { value: 'inactive', label: t('common.disabled') },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 设置单价 Modal */}
      <Modal
        title={`${t('station.nozzle.setPrice')}${pricingNozzle ? ` — ${t('station.nozzle.code')}${pricingNozzle.nozzleNo}` : ''}`}
        open={priceFormOpen}
        onOk={handlePriceModalOk}
        onCancel={() => setPriceFormOpen(false)}
        okText={t('common.save')}
        cancelText={t('common.cancel')}
        destroyOnHidden
      >
        <Form form={priceForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="unitPrice"
            label={`${t('station.nozzle.unitPrice')}${pricingNozzle?.fuelType?.unit ? ` (¥ / ${pricingNozzle.fuelType.unit})` : ' (¥)'}`}
            rules={[
              { required: true, message: t('common.required') },
              { type: 'number', min: 0, message: '单价不能为负数' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              precision={2}
              min={0}
              prefix="¥"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StationDetail;
