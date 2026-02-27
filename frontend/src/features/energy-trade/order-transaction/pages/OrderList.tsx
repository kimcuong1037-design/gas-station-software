import React, { useState, useMemo } from 'react';
import {
  Typography, Row, Col, Card, Statistic, Radio, Table, Tag, Button, Input, Select,
  DatePicker, Space, message, Popconfirm,
} from 'antd';
import {
  FileTextOutlined, MoneyCollectOutlined, ExperimentOutlined, ClockCircleOutlined,
  PlusOutlined, DownloadOutlined, SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { RequirementTag } from '../../../../components/RequirementTag';
import type { FuelingOrder, PaymentMethod, OrderStatus, ExceptionType } from '../types';
import { ORDER_STATUS_CONFIG, PAYMENT_METHOD_CONFIG, EXCEPTION_TYPE_CONFIG, getLabel } from '../constants';
import type { Dayjs } from 'dayjs';
import { fuelingOrders, paymentRecords, getOrderStatistics } from '../../../../mock/orderTransaction';
import OrderDetailDrawer from '../components/OrderDetailDrawer';
import CreateOrderDrawer from '../components/CreateOrderDrawer';
import PaymentModal from '../components/PaymentModal';
import RefundModal from '../components/RefundModal';
import ReceiptPreviewModal from '../components/ReceiptPreviewModal';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface LayoutContext {
  selectedStationId: string;
}

const OrderList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedStationId: stationId } = useOutletContext<LayoutContext>();

  // State: filters
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('');
  const [nozzleFilter, setNozzleFilter] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [statDimension, setStatDimension] = useState<'today' | 'shift'>('today');

  // State: drawers & modals
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<FuelingOrder | null>(null);
  const [refundOrder, setRefundOrder] = useState<FuelingOrder | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<FuelingOrder | null>(null);

  // Data
  const statistics = useMemo(() => getOrderStatistics(stationId, statDimension), [stationId, statDimension]);
  const orders = useMemo(() => {
    let list = fuelingOrders.filter(o => o.stationId === stationId);
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(o =>
        o.orderNo.toLowerCase().includes(kw) ||
        o.vehiclePlateNo?.toLowerCase().includes(kw) ||
        o.memberPhone?.includes(kw)
      );
    }
    if (statusFilter) list = list.filter(o => o.orderStatus === statusFilter);
    if (methodFilter) {
      const orderIdsWithMethod = new Set(
        paymentRecords.filter(p => p.paymentMethod === methodFilter).map(p => p.orderId)
      );
      list = list.filter(o => orderIdsWithMethod.has(o.id));
    }
    if (nozzleFilter) list = list.filter(o => o.nozzleNo === nozzleFilter);
    if (fuelTypeFilter) list = list.filter(o => o.fuelTypeName === fuelTypeFilter);
    if (dateRange) {
      const startMs = dateRange[0].startOf('day').valueOf();
      const endMs = dateRange[1].endOf('day').valueOf();
      list = list.filter(o => {
        const ms = new Date(o.createdAt).getTime();
        return ms >= startMs && ms <= endMs;
      });
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [stationId, keyword, statusFilter, methodFilter, nozzleFilter, fuelTypeFilter, dateRange]);

  const handleCancelOrder = (order: FuelingOrder) => {
    message.success(`订单 ${order.orderNo} 已取消`);
  };

  const columns: ColumnsType<FuelingOrder> = [
    {
      title: '订单号', dataIndex: 'orderNo', width: 220,
      render: (text: string, record) => (
        <Space size={4}>
          <a onClick={() => setDetailOrderId(record.id)}>{text}</a>
          {record.exceptionType && (
            <Tag color={EXCEPTION_TYPE_CONFIG[record.exceptionType as ExceptionType].color} style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px', margin: 0 }}>
              {getLabel(EXCEPTION_TYPE_CONFIG[record.exceptionType as ExceptionType])}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '时间', dataIndex: 'createdAt', width: 170, sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    { title: '枪号', dataIndex: 'nozzleNo', width: 80, render: (v: string) => `${v}号` },
    { title: '燃料类型', dataIndex: 'fuelTypeName', width: 100 },
    {
      title: '数量', dataIndex: 'quantity', width: 100,
      sorter: (a, b) => a.quantity - b.quantity,
      render: (v: number, r) => `${v.toFixed(2)} ${r.fuelUnit}`,
    },
    {
      title: '金额(元)', dataIndex: 'payableAmount', width: 110,
      sorter: (a, b) => a.payableAmount - b.payableAmount,
      render: (v: number) => <span style={{ fontWeight: 600 }}>¥{v.toFixed(2)}</span>,
    },
    {
      title: '支付状态', dataIndex: 'orderStatus', width: 100,
      render: (status: OrderStatus) => {
        const cfg = ORDER_STATUS_CONFIG[status];
        return <Tag color={cfg.color}>{getLabel(cfg)}</Tag>;
      },
    },
    {
      title: '操作', width: 140, fixed: 'right',
      render: (_: unknown, record) => {
        const { orderStatus } = record;
        return (
          <Space size={4}>
            {orderStatus === 'pending_payment' && (
              <>
                <Button type="primary" size="small" onClick={() => setPaymentOrder(record)}>收银</Button>
                <Popconfirm title="确认取消该订单？" onConfirm={() => handleCancelOrder(record)}>
                  <Button type="link" size="small">取消</Button>
                </Popconfirm>
              </>
            )}
            {(orderStatus === 'paid' || orderStatus === 'completed') && (
              <>
                <Button type="link" size="small" onClick={() => setDetailOrderId(record.id)}>详情</Button>
                <Button type="link" size="small" danger onClick={() => setRefundOrder(record)}>退款</Button>
              </>
            )}
            {orderStatus === 'exception' && (
              <>
                <Button type="link" size="small" onClick={() => setDetailOrderId(record.id)}>详情</Button>
                <Button type="link" size="small" onClick={() => navigate('/energy-trade/order/exceptions')}>处理</Button>
              </>
            )}
            {!['pending_payment', 'paid', 'completed', 'exception'].includes(orderStatus) && (
              <Button type="link" size="small" onClick={() => setDetailOrderId(record.id)}>详情</Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>{t('order.list', '订单列表')}</Title>
          <RequirementTag componentIds={['order-list', 'order-filter', 'order-search', 'order-statistics']} module="order-transaction" showDetail />
        </Space>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateDrawerOpen(true)}>
            {t('order.action.createOrder', '创建订单')}
          </Button>
          <Button icon={<DownloadOutlined />} onClick={() => message.info(t('common.exportTodo', '导出功能即将上线'))}>
            {t('order.action.export', '导出')}
          </Button>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title={t('order.stats.totalOrders', '总订单数')} value={statistics.totalOrders} prefix={<FileTextOutlined style={{ color: '#1890ff' }} />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title={t('order.stats.totalAmount', '总金额')} value={statistics.totalAmount} precision={2} prefix={<MoneyCollectOutlined style={{ color: '#52c41a' }} />} suffix="元" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title={t('order.stats.totalQuantity', '总充装量')} value={statistics.totalQuantity} precision={2} prefix={<ExperimentOutlined style={{ color: '#722ed1' }} />} suffix="kg" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title={t('order.stats.pendingPayment', '待支付')} value={statistics.pendingPaymentCount} prefix={<ClockCircleOutlined style={{ color: statistics.pendingPaymentCount > 0 ? '#faad14' : '#d9d9d9' }} />} />
          </Card>
        </Col>
      </Row>

      {/* 维度切换 */}
      <div style={{ marginBottom: 12, textAlign: 'right' }}>
        <Radio.Group value={statDimension} onChange={e => setStatDimension(e.target.value)} size="small">
          <Radio.Button value="today">当日</Radio.Button>
          <Radio.Button value="shift">当班</Radio.Button>
        </Radio.Group>
      </div>

      {/* 筛选栏 */}
      <Space wrap style={{ marginBottom: 16 }}>
        <RangePicker size="small" placeholder={['开始日期', '结束日期']} value={dateRange} onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)} />
        <Select size="small" allowClear placeholder="枪号" style={{ width: 100 }} value={nozzleFilter || undefined} onChange={v => setNozzleFilter(v || '')}
          options={[{ value: '01', label: '01号' }, { value: '02', label: '02号' }, { value: '03', label: '03号' }, { value: '04', label: '04号' }]}
        />
        <Select size="small" allowClear placeholder="燃料类型" style={{ width: 120 }} value={fuelTypeFilter || undefined} onChange={v => setFuelTypeFilter(v || '')}
          options={[{ value: 'LNG', label: 'LNG' }, { value: 'CNG', label: 'CNG' }, { value: 'L-CNG', label: 'L-CNG' }]}
        />
        <Select size="small" allowClear placeholder="支付状态" style={{ width: 120 }} value={statusFilter || undefined} onChange={v => setStatusFilter((v || '') as OrderStatus | '')}
          options={Object.entries(ORDER_STATUS_CONFIG).map(([k, v]) => ({ value: k, label: getLabel(v) }))}
        />
        <Select size="small" allowClear placeholder="支付方式" style={{ width: 120 }} value={methodFilter || undefined} onChange={v => setMethodFilter((v || '') as PaymentMethod | '')}
          options={Object.entries(PAYMENT_METHOD_CONFIG).map(([k, v]) => ({ value: k, label: getLabel(v) }))}
        />
        <Input.Search size="small" placeholder="订单号/车牌号/手机号" allowClear prefix={<SearchOutlined />} style={{ width: 220 }}
          onSearch={v => setKeyword(v)} onChange={e => { if (!e.target.value) setKeyword(''); }}
        />
      </Space>

      {/* 数据表格 */}
      <Table<FuelingOrder>
        columns={columns}
        dataSource={orders}
        rowKey="id"
        size="small"
        scroll={{ x: 1100 }}
        pagination={{ pageSize: 20, showSizeChanger: true, showQuickJumper: true, showTotal: total => `共 ${total} 条` }}
        locale={{ emptyText: '暂无订单记录' }}
      />

      {/* Drawers & Modals */}
      <OrderDetailDrawer
        open={!!detailOrderId} onClose={() => setDetailOrderId(null)} orderId={detailOrderId}
        onPayment={o => { setDetailOrderId(null); setPaymentOrder(o); }}
        onRefund={o => { setDetailOrderId(null); setRefundOrder(o); }}
      />
      <CreateOrderDrawer open={createDrawerOpen} onClose={() => setCreateDrawerOpen(false)} onSuccess={() => { setCreateDrawerOpen(false); message.success('订单创建成功'); }} />
      <PaymentModal open={!!paymentOrder} onClose={() => setPaymentOrder(null)} order={paymentOrder} onSuccess={() => { setPaymentOrder(null); setReceiptOrder(paymentOrder); }} />
      <RefundModal open={!!refundOrder} onClose={() => setRefundOrder(null)} order={refundOrder} onSuccess={() => setRefundOrder(null)} />
      <ReceiptPreviewModal open={!!receiptOrder} onClose={() => setReceiptOrder(null)} order={receiptOrder} />
    </div>
  );
};

export default OrderList;
