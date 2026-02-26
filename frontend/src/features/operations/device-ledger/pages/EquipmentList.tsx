// P08: 设备台账列表页
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Input,
  Select,
  Table,
  Space,
  Tabs,
  Popconfirm,
  Dropdown,
  message,
} from 'antd';
import { PlusOutlined, SearchOutlined, ExportOutlined, MoreOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { equipments } from '../../../../mock/equipments';
import type { Equipment, DeviceStatus, DeviceType } from '../types';
import {
  DEVICE_STATUS_CONFIG,
  DEVICE_TYPE_CONFIG,
  DEFAULT_PAGE_SIZE,
  getLabel,
} from '../constants';
import DeviceStatusTag from '../components/DeviceStatusTag';
import DeviceTypeTag from '../components/DeviceTypeTag';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Title, Text } = Typography;

const deviceTypeTabs = [
  { key: 'all', label: '全部' },
  ...Object.entries(DEVICE_TYPE_CONFIG).map(([key, config]) => ({
    key,
    label: `${config.icon} ${getLabel(config)}`,
  })),
];

const EquipmentList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | 'all'>('all');
  const [typeTab, setTypeTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const filteredData = useMemo(() => {
    return equipments.filter((e) => {
      if (typeTab !== 'all' && e.deviceType !== typeTab) return false;
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (keyword) {
        const kw = keyword.toLowerCase();
        if (!e.deviceCode.toLowerCase().includes(kw) && !e.name.toLowerCase().includes(kw)) return false;
      }
      return true;
    }).sort((a, b) => {
      // 故障优先
      const faultOrder = { fault: 0, pending_maintenance: 1, active: 2, inactive: 3 };
      const diff = (faultOrder[a.status] ?? 9) - (faultOrder[b.status] ?? 9);
      if (diff !== 0) return diff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [keyword, statusFilter, typeTab]);

  const handleDeactivate = (record: Equipment) => {
    message.success(`已停用设备: ${record.name}`);
  };

  const handleReactivate = (record: Equipment) => {
    message.success(`已恢复设备: ${record.name}`);
  };

  const columns: ColumnsType<Equipment> = [
    {
      title: t('deviceLedger.equipment.deviceCode', '设备编号'),
      dataIndex: 'deviceCode',
      width: 140,
      sorter: (a, b) => a.deviceCode.localeCompare(b.deviceCode),
      render: (code: string, record) => (
        <a
          onClick={() => navigate(`/operations/device-ledger/equipment/${record.id}`)}
          style={{ fontWeight: 600 }}
        >
          {code}
        </a>
      ),
    },
    {
      title: t('deviceLedger.equipment.name', '名称'),
      dataIndex: 'name',
      width: 150,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t('deviceLedger.equipment.type', '类型'),
      dataIndex: 'deviceType',
      width: 100,
      align: 'center',
      render: (type: DeviceType) => <DeviceTypeTag type={type} />,
    },
    {
      title: t('deviceLedger.equipment.model', '型号'),
      dataIndex: 'model',
      width: 120,
      responsive: ['lg'],
    },
    {
      title: t('deviceLedger.equipment.status', '状态'),
      dataIndex: 'status',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (status: DeviceStatus) => <DeviceStatusTag status={status} />,
    },
    {
      title: t('deviceLedger.equipment.installDate', '安装日期'),
      dataIndex: 'installDate',
      width: 110,
      align: 'center',
      responsive: ['lg'],
      sorter: (a, b) => (a.installDate ?? '').localeCompare(b.installDate ?? ''),
    },
    {
      title: t('deviceLedger.equipment.nextMaintenance', '下次维保'),
      dataIndex: 'nextMaintenanceDate',
      width: 110,
      align: 'center',
      sorter: (a, b) => (a.nextMaintenanceDate ?? '').localeCompare(b.nextMaintenanceDate ?? ''),
      render: (date: string | undefined) => {
        if (!date) return '-';
        const days = Math.ceil((new Date(date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
        let color: string | undefined;
        if (days < 0) color = '#ff4d4f';
        else if (days <= 7) color = '#faad14';
        return <Text style={{ color }}>{date}</Text>;
      },
    },
    {
      title: t('common.actions', '操作'),
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/operations/device-ledger/equipment/${record.id}`)}>
            查看
          </Button>
          <Button type="link" size="small" onClick={() => navigate(`/operations/device-ledger/equipment/${record.id}/edit`)}>
            编辑
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'create-order',
                  label: '创建工单',
                  onClick: () => navigate(`/operations/device-ledger/maintenance/create?deviceId=${record.id}`),
                },
                record.status !== 'inactive'
                  ? {
                      key: 'deactivate',
                      label: (
                        <Popconfirm title="确定停用该设备？" onConfirm={() => handleDeactivate(record)}>
                          <span style={{ color: '#ff4d4f' }}>停用</span>
                        </Popconfirm>
                      ),
                    }
                  : {
                      key: 'reactivate',
                      label: '恢复',
                      onClick: () => handleReactivate(record),
                    },
              ],
            }}
          >
            <Button type="link" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Space align="center">
          <Title level={4} style={{ margin: 0 }}>
            {t('deviceLedger.equipment.title', '设备台账')}
          </Title>
          <RequirementTag componentIds={['equipment-list', 'equipment-list-search', 'equipment-type-filter', 'equipment-deactivate']} module="device-ledger" showDetail />
        </Space>
        <Space>
          <Button icon={<ExportOutlined />}>{t('common.export', '导出')}</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/operations/device-ledger/equipment/create')}
          >
            {t('deviceLedger.equipment.add', '新增设备')}
          </Button>
        </Space>
      </Row>

      {/* 类型Tab */}
      <Tabs
        activeKey={typeTab}
        onChange={(key) => { setTypeTab(key); setCurrentPage(1); }}
        items={deviceTypeTabs.map((tab) => ({ key: tab.key, label: tab.label }))}
        style={{ marginBottom: 0 }}
      />

      {/* 筛选区域 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Input
              prefix={<SearchOutlined />}
              placeholder="搜索设备编号/名称..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
              allowClear
              style={{ width: 240 }}
            />
          </Col>
          <Col>
            <Select
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
              style={{ width: 150 }}
              options={[
                { value: 'all', label: '全部状态' },
                ...Object.entries(DEVICE_STATUS_CONFIG).map(([key, config]) => ({
                  value: key,
                  label: getLabel(config),
                })),
              ]}
            />
          </Col>
          <Col flex="auto" />
          <Col>
            <Text type="secondary">共 {filteredData.length} 条记录</Text>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
          }}
          locale={{
            emptyText: (
              <div style={{ padding: 40 }}>
                <div style={{ marginBottom: 12 }}>还没有设备信息，添加第一台设备开始管理</div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/operations/device-ledger/equipment/create')}>
                  新增设备
                </Button>
              </div>
            ),
          }}
          scroll={{ x: 1100 }}
        />
      </Card>
    </div>
  );
};

export default EquipmentList;
