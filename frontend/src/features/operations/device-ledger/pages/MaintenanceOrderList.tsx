// P12: 维保工单列表页
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
  Badge,
  message,
} from 'antd';
import { PlusOutlined, SearchOutlined, ExportOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { maintenanceOrders, getOrderStats } from '../../../../mock/maintenanceOrders';
import { equipments } from '../../../../mock/equipments';
import type { MaintenanceOrder, OrderStatus, UrgencyLevel } from '../types';
import {
  ORDER_STATUS_CONFIG,
  URGENCY_CONFIG,
  DEFAULT_PAGE_SIZE,
  getLabel,
} from '../constants';
import OrderStatusTag from '../components/OrderStatusTag';
import OrderTypeTag from '../components/OrderTypeTag';
import UrgencyTag from '../components/UrgencyTag';
import FaultReportDrawer from './FaultReportDrawer';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Title, Text } = Typography;

const MaintenanceOrderList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [statusTab, setStatusTab] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [faultDrawerOpen, setFaultDrawerOpen] = useState(false);

  const stats = useMemo(() => getOrderStats(), []);

  // 设备ID -> 名称映射
  const deviceNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    equipments.forEach((e) => { map[e.id] = e.name; });
    return map;
  }, []);

  const filteredData = useMemo(() => {
    return maintenanceOrders
      .filter((o) => {
        if (statusTab !== 'all' && o.status !== statusTab) return false;
        if (urgencyFilter !== 'all' && o.urgency !== urgencyFilter) return false;
        if (keyword) {
          const kw = keyword.toLowerCase();
          if (
            !o.orderNo.toLowerCase().includes(kw) &&
            !o.description.toLowerCase().includes(kw) &&
            !(deviceNameMap[o.deviceId] || '').toLowerCase().includes(kw)
          )
            return false;
        }
        return true;
      })
      .sort((a, b) => {
        // 紧急程度优先排序
        const urgencyOrder: Record<UrgencyLevel, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        const diff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [keyword, urgencyFilter, statusTab, deviceNameMap]);

  const statusTabs = [
    { key: 'all', label: '全部', count: maintenanceOrders.length },
    ...Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => ({
      key,
      label: getLabel(config),
      count: maintenanceOrders.filter((o) => o.status === key).length,
    })),
  ];

  const columns: ColumnsType<MaintenanceOrder> = [
    {
      title: t('deviceLedger.maintenance.orderNumber', '工单号'),
      dataIndex: 'orderNo',
      width: 140,
      render: (num: string, record) => (
        <a
          onClick={() => navigate(`/operations/device-ledger/maintenance/${record.id}`)}
          style={{ fontWeight: 600 }}
        >
          {num}
        </a>
      ),
    },
    {
      title: t('deviceLedger.maintenance.type', '类型'),
      dataIndex: 'orderType',
      width: 80,
      align: 'center',
      render: (type) => <OrderTypeTag type={type} />,
    },
    {
      title: t('deviceLedger.maintenance.device', '关联设备'),
      dataIndex: 'deviceId',
      width: 140,
      render: (deviceId: string) => deviceNameMap[deviceId] || deviceId,
    },
    {
      title: t('deviceLedger.maintenance.urgency', '紧急程度'),
      dataIndex: 'urgency',
      width: 90,
      align: 'center',
      sorter: (a, b) => {
        const order: Record<UrgencyLevel, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return order[a.urgency] - order[b.urgency];
      },
      render: (urgency: UrgencyLevel) => <UrgencyTag level={urgency} />,
    },
    {
      title: t('deviceLedger.maintenance.status', '状态'),
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (status: OrderStatus) => <OrderStatusTag status={status} />,
    },
    {
      title: t('deviceLedger.maintenance.assignee', '处理人'),
      dataIndex: 'assignee',
      width: 80,
      align: 'center',
      render: (a) => a?.name || '-',
    },
    {
      title: t('deviceLedger.maintenance.createdAt', '创建时间'),
      dataIndex: 'createdAt',
      width: 120,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: t('deviceLedger.maintenance.description', '描述'),
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: t('common.actions', '操作'),
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => navigate(`/operations/device-ledger/maintenance/${record.id}`)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Space align="center">
          <Title level={4} style={{ margin: 0 }}>
            {t('deviceLedger.maintenance.title', '维保工单')}
          </Title>
          <RequirementTag componentIds={['maintenance-list', 'fault-report']} module="device-ledger" showDetail />
        </Space>
        <Space>
          <Button icon={<ExportOutlined />}>{t('common.export', '导出')}</Button>
          <Button
            icon={<PlusOutlined />}
            onClick={() => navigate('/operations/device-ledger/maintenance/create')}
          >
            {t('deviceLedger.maintenance.createOrder', '新建工单')}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setFaultDrawerOpen(true)}
          >
            {t('deviceLedger.maintenance.report', '故障报修')}
          </Button>
        </Space>
      </Row>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {[
          { label: '待处理', value: stats.pending, color: '#faad14', statusKey: 'pending' },
          { label: '处理中', value: stats.processing, color: '#1677ff', statusKey: 'processing' },
          { label: '待审核', value: stats.pending_review, color: '#722ed1', statusKey: 'pending_review' },
          { label: '已完成', value: stats.completed, color: '#52c41a', statusKey: 'completed' },
        ].map((item) => (
          <Col span={6} key={item.label}>
            <Card
              size="small"
              hoverable
              onClick={() => { setStatusTab(item.statusKey); setCurrentPage(1); }}
              style={statusTab === item.statusKey ? { borderColor: item.color, borderWidth: 2 } : undefined}
            >
              <Text type="secondary">{item.label}</Text>
              <div>
                <Title level={3} style={{ margin: 0, color: item.color }}>
                  {item.value}
                </Title>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 状态Tab */}
      <Tabs
        activeKey={statusTab}
        onChange={(key) => { setStatusTab(key); setCurrentPage(1); }}
        items={statusTabs.map((tab) => ({
          key: tab.key,
          label: (
            <Space>
              {tab.label}
              {tab.count > 0 && <Badge count={tab.count} size="small" />}
            </Space>
          ),
        }))}
        style={{ marginBottom: 0 }}
      />

      {/* 筛选区域 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Input
              prefix={<SearchOutlined />}
              placeholder="搜索工单号/描述/设备..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
              allowClear
              style={{ width: 260 }}
            />
          </Col>
          <Col>
            <Select
              value={urgencyFilter}
              onChange={(v) => { setUrgencyFilter(v); setCurrentPage(1); }}
              style={{ width: 150 }}
              options={[
                { value: 'all', label: '全部紧急程度' },
                ...Object.entries(URGENCY_CONFIG).map(([key, config]) => ({
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
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
          }}
          onRow={(record) => ({
            style: record.urgency === 'urgent' ? { backgroundColor: '#fff1f0' } : undefined,
          })}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 故障报修抽屉 */}
      <FaultReportDrawer
        open={faultDrawerOpen}
        onClose={() => setFaultDrawerOpen(false)}
        onSuccess={() => {
          setFaultDrawerOpen(false);
          message.success('工单已创建');
        }}
      />
    </div>
  );
};

export default MaintenanceOrderList;
