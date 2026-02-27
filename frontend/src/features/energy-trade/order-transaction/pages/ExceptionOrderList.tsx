import React, { useState, useMemo } from 'react';
import { Typography, Row, Col, Card, Statistic, Table, Tag, Button, Select, DatePicker, Space, message, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RequirementTag } from '../../../../components/RequirementTag';
import type { FuelingOrder, ExceptionType, HandleStatus } from '../types';
import { EXCEPTION_TYPE_CONFIG, HANDLE_STATUS_CONFIG, getLabel } from '../constants';
import type { Dayjs } from 'dayjs';
import { fuelingOrders, getExceptionStatistics } from '../../../../mock/orderTransaction';
import OrderDetailDrawer from '../components/OrderDetailDrawer';
import SupplementDrawer from '../components/SupplementDrawer';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface LayoutContext {
  selectedStationId: string;
}

const ExceptionOrderList: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId: stationId } = useOutletContext<LayoutContext>();

  const [exceptionTypeFilter, setExceptionTypeFilter] = useState<ExceptionType | ''>('');
  const [handleStatusFilter, setHandleStatusFilter] = useState<HandleStatus | ''>('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [supplementOrder, setSupplementOrder] = useState<FuelingOrder | null>(null);

  const stats = useMemo(() => getExceptionStatistics(stationId), [stationId]);

  const exceptionOrders = useMemo(() => {
    let list = fuelingOrders.filter(o => o.stationId === stationId && o.exceptionType);
    if (exceptionTypeFilter) list = list.filter(o => o.exceptionType === exceptionTypeFilter);
    if (handleStatusFilter) list = list.filter(o => o.handleStatus === handleStatusFilter);
    if (dateRange) {
      const startMs = dateRange[0].startOf('day').valueOf();
      const endMs = dateRange[1].endOf('day').valueOf();
      list = list.filter(o => {
        const ms = new Date(o.createdAt).getTime();
        return ms >= startMs && ms <= endMs;
      });
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [stationId, exceptionTypeFilter, handleStatusFilter, dateRange]);

  const handleSuspend = (order: FuelingOrder) => {
    message.success(`订单 ${order.orderNo} 已挂起`);
  };
  const handleUnsuspend = (order: FuelingOrder) => {
    message.success(`订单 ${order.orderNo} 已取消挂起`);
  };

  const columns: ColumnsType<FuelingOrder> = [
    {
      title: '订单号', dataIndex: 'orderNo', width: 180,
      render: (text: string, record) => <a onClick={() => setDetailOrderId(record.id)}>{text}</a>,
    },
    {
      title: '时间', dataIndex: 'createdAt', width: 170,
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: '异常类型', dataIndex: 'exceptionType', width: 120,
      render: (type: ExceptionType) => {
        const cfg = EXCEPTION_TYPE_CONFIG[type];
        return <Tag color={cfg.color}>{getLabel(cfg)}</Tag>;
      },
    },
    {
      title: '异常原因', dataIndex: 'exceptionReason', width: 200, ellipsis: true,
    },
    {
      title: '金额(元)', dataIndex: 'payableAmount', width: 100,
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    {
      title: '处理状态', dataIndex: 'handleStatus', width: 100,
      render: (status: HandleStatus) => {
        if (!status) return '-';
        const cfg = HANDLE_STATUS_CONFIG[status];
        return <Tag color={cfg.color}>{getLabel(cfg)}</Tag>;
      },
    },
    {
      title: '操作', width: 160, fixed: 'right',
      render: (_: unknown, record) => {
        const hs = record.handleStatus;
        return (
          <Space size={4}>
            {hs === 'pending' && (
              <>
                <Popconfirm title="确认挂起该异常订单？" onConfirm={() => handleSuspend(record)}>
                  <Button size="small">挂起</Button>
                </Popconfirm>
                <Button type="primary" size="small" onClick={() => setSupplementOrder(record)}>补单</Button>
              </>
            )}
            {hs === 'suspended' && (
              <>
                <Button type="link" size="small" onClick={() => handleUnsuspend(record)}>取消挂起</Button>
                <Button type="primary" size="small" onClick={() => setSupplementOrder(record)}>补单</Button>
              </>
            )}
            {(hs === 'supplemented' || hs === 'closed') && (
              <Button type="link" size="small" onClick={() => setDetailOrderId(record.id)}>详情</Button>
            )}
          </Space>
        );
      },
    },
  ];

  const statCards = [
    { title: '待处理', value: stats.pendingCount, color: '#ff4d4f', status: 'pending' as HandleStatus },
    { title: '已挂起', value: stats.suspendedCount, color: '#faad14', status: 'suspended' as HandleStatus },
    { title: '已补单', value: stats.supplementedCount, color: '#1890ff', status: 'supplemented' as HandleStatus },
    { title: '已关闭', value: stats.closedCount, color: '#d9d9d9', status: 'closed' as HandleStatus },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>{t('order.exceptions', '异常订单')}</Title>
          <RequirementTag componentIds={['exception-list', 'exception-suspend', 'exception-supplement']} module="order-transaction" showDetail />
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {statCards.map(card => (
          <Col span={6} key={card.status}>
            <Card
              size="small"
              hoverable
              onClick={() => setHandleStatusFilter(card.status === handleStatusFilter ? '' : card.status)}
              style={handleStatusFilter === card.status ? { borderColor: card.color } : undefined}
            >
              <Statistic title={card.title} value={card.value} valueStyle={{ color: card.color }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 筛选栏 */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Select size="small" allowClear placeholder="异常类型" style={{ width: 140 }} value={exceptionTypeFilter || undefined}
          onChange={v => setExceptionTypeFilter((v || '') as ExceptionType | '')}
          options={Object.entries(EXCEPTION_TYPE_CONFIG).map(([k, v]) => ({ value: k, label: getLabel(v) }))}
        />
        <Select size="small" allowClear placeholder="处理状态" style={{ width: 140 }} value={handleStatusFilter || undefined}
          onChange={v => setHandleStatusFilter((v || '') as HandleStatus | '')}
          options={Object.entries(HANDLE_STATUS_CONFIG).map(([k, v]) => ({ value: k, label: getLabel(v) }))}
        />
        <RangePicker size="small" placeholder={['开始日期', '结束日期']} value={dateRange} onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)} />
      </Space>

      {/* 数据表格 */}
      <Table<FuelingOrder>
        columns={columns}
        dataSource={exceptionOrders}
        rowKey="id"
        size="small"
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: total => `共 ${total} 条` }}
        locale={{ emptyText: '暂无异常订单' }}
      />

      <OrderDetailDrawer
        open={!!detailOrderId} onClose={() => setDetailOrderId(null)} orderId={detailOrderId}
        onPayment={() => {}} onRefund={() => {}}
      />
      <SupplementDrawer
        open={!!supplementOrder} onClose={() => setSupplementOrder(null)} order={supplementOrder}
        onSuccess={() => { setSupplementOrder(null); message.success('补单提交成功'); }}
      />
    </div>
  );
};

export default ExceptionOrderList;
