import React, { useState, useMemo } from 'react';
import { Typography, Tabs, Table, Tag, Button, Select, DatePicker, Input, Space, message, Modal, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { RequirementTag } from '../../../../components/RequirementTag';
import type { RefundRecord, RefundStatus } from '../types';
import type { Dayjs } from 'dayjs';
import { REFUND_STATUS_CONFIG, getLabel } from '../constants';
import { refundRecords as allRefunds, fuelingOrders } from '../../../../mock/orderTransaction';
import OrderDetailDrawer from '../components/OrderDetailDrawer';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface LayoutContext {
  selectedStationId: string;
}

const RefundManagement: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId: stationId } = useOutletContext<LayoutContext>();

  const [activeTab, setActiveTab] = useState<'records' | 'approvals'>('records');
  const [statusFilter, setStatusFilter] = useState<RefundStatus | ''>('');
  const [keyword, setKeyword] = useState('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingRecord, setRejectingRecord] = useState<RefundRecord | null>(null);

  // Filter refunds by station — match via orderId → fuelingOrders.stationId
  const stationOrderIds = useMemo(() => {
    return new Set(fuelingOrders.filter(o => o.stationId === stationId).map(o => o.id));
  }, [stationId]);

  const stationRefunds = useMemo(() => {
    return allRefunds.filter(r => stationOrderIds.has(r.orderId));
  }, [stationOrderIds]);

  const pendingApprovalCount = stationRefunds.filter(r => r.refundStatus === 'pending_approval').length;

  const recordList = useMemo(() => {
    let list = [...stationRefunds];
    if (statusFilter) list = list.filter(r => r.refundStatus === statusFilter);
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(r => r.orderNo.toLowerCase().includes(kw));
    }
    if (dateRange) {
      const startMs = dateRange[0].startOf('day').valueOf();
      const endMs = dateRange[1].endOf('day').valueOf();
      list = list.filter(r => {
        const ms = new Date(r.createdAt).getTime();
        return ms >= startMs && ms <= endMs;
      });
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [stationRefunds, statusFilter, keyword, dateRange]);

  const approvalList = useMemo(() => {
    return stationRefunds.filter(r => r.refundStatus === 'pending_approval')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [stationRefunds]);

  const handleApprove = (record: RefundRecord) => {
    message.success(`退款 ${record.orderNo} 审批通过，退款已执行`);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      message.error('请填写驳回原因');
      return;
    }
    message.success(`退款 ${rejectingRecord?.orderNo} 已驳回`);
    setRejectModalOpen(false);
    setRejectReason('');
    setRejectingRecord(null);
  };

  const baseColumns: ColumnsType<RefundRecord> = [
    {
      title: '原订单号', dataIndex: 'orderNo', width: 180,
      render: (text: string, record) => <a onClick={() => setDetailOrderId(record.orderId)}>{text}</a>,
    },
    {
      title: '退款金额', dataIndex: 'refundAmount', width: 110,
      render: (v: number) => <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥{v.toFixed(2)}</span>,
    },
    {
      title: '退款类型', dataIndex: 'refundType', width: 100,
      render: (v: string) => v === 'full' ? '全额退款' : '部分退款',
    },
    { title: '退款原因', dataIndex: 'refundReason', width: 200, ellipsis: true },
    {
      title: '退款状态', dataIndex: 'refundStatus', width: 100,
      render: (status: RefundStatus) => {
        const cfg = REFUND_STATUS_CONFIG[status];
        return <Tag color={cfg.color}>{getLabel(cfg)}</Tag>;
      },
    },
    { title: '申请人', dataIndex: 'applicantName', width: 100 },
    {
      title: '申请时间', dataIndex: 'createdAt', width: 160,
      render: (v: string) => new Date(v).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    },
  ];

  const recordColumns: ColumnsType<RefundRecord> = [
    ...baseColumns,
    {
      title: '操作', width: 80, fixed: 'right',
      render: (_: unknown, record) => <Button type="link" size="small" onClick={() => setDetailOrderId(record.orderId)}>详情</Button>,
    },
  ];

  const approvalColumns: ColumnsType<RefundRecord> = [
    ...baseColumns,
    {
      title: '操作', width: 160, fixed: 'right',
      render: (_: unknown, record) => {
        if (record.refundStatus !== 'pending_approval') {
          return <Button type="link" size="small" onClick={() => setDetailOrderId(record.orderId)}>详情</Button>;
        }
        return (
          <Space size={4}>
            <Popconfirm title="确认通过此退款申请？" onConfirm={() => handleApprove(record)}>
              <Button size="small" style={{ color: '#52c41a', borderColor: '#52c41a' }}>通过</Button>
            </Popconfirm>
            <Button size="small" danger onClick={() => { setRejectingRecord(record); setRejectModalOpen(true); }}>驳回</Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>{t('order.refunds', '退款管理')}</Title>
          <RequirementTag componentIds={['refund-apply', 'refund-approve', 'refund-records']} module="order-transaction" showDetail />
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={k => setActiveTab(k as 'records' | 'approvals')}
        items={[
          { key: 'records', label: '退款记录' },
          {
            key: 'approvals',
            label: (
              <span>
                退款审批
                {pendingApprovalCount > 0 && (
                  <Tag color="orange" style={{ marginLeft: 6 }}>{pendingApprovalCount}</Tag>
                )}
              </span>
            ),
          },
        ]}
      />

      {activeTab === 'records' && (
        <>
          <Space wrap style={{ marginBottom: 16 }}>
            <Select size="small" allowClear placeholder="退款状态" style={{ width: 140 }} value={statusFilter || undefined}
              onChange={v => setStatusFilter((v || '') as RefundStatus | '')}
              options={Object.entries(REFUND_STATUS_CONFIG).map(([k, v]) => ({ value: k, label: getLabel(v) }))}
            />
            <RangePicker size="small" placeholder={['开始日期', '结束日期']} value={dateRange} onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)} />
            <Input.Search size="small" placeholder="按订单号搜索" allowClear style={{ width: 200 }}
              onSearch={v => setKeyword(v)} onChange={e => { if (!e.target.value) setKeyword(''); }}
            />
          </Space>
          <Table<RefundRecord> columns={recordColumns} dataSource={recordList} rowKey="id" size="small" scroll={{ x: 1000 }}
            pagination={{ pageSize: 20, showTotal: total => `共 ${total} 条` }} locale={{ emptyText: '暂无退款记录' }}
          />
        </>
      )}

      {activeTab === 'approvals' && (
        <Table<RefundRecord> columns={approvalColumns} dataSource={approvalList} rowKey="id" size="small" scroll={{ x: 1000 }}
          pagination={{ pageSize: 20, showTotal: total => `共 ${total} 条` }} locale={{ emptyText: '暂无待审批退款' }}
        />
      )}

      <OrderDetailDrawer
        open={!!detailOrderId} onClose={() => setDetailOrderId(null)} orderId={detailOrderId}
        onPayment={() => {}} onRefund={() => {}}
      />

      <Modal
        title={`驳回退款申请${rejectingRecord ? ` — ${rejectingRecord.orderNo}` : ''}`}
        open={rejectModalOpen}
        onCancel={() => { setRejectModalOpen(false); setRejectReason(''); setRejectingRecord(null); }}
        onOk={handleReject} okText="确认驳回" okButtonProps={{ danger: true }}
      >
        <TextArea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
          placeholder="请输入驳回原因（必填）" maxLength={500}
        />
      </Modal>
    </div>
  );
};

export default RefundManagement;
