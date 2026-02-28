import React, { useMemo, useState } from 'react';
import { Button, DatePicker, message, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { Dayjs } from 'dayjs';
interface LayoutContext {
  selectedStationId: string;
}
import { RequirementTag } from '../../../../components/RequirementTag';
import type { ApprovalStatus, OutboundRecord, OutboundSource, OutboundType } from '../types';
import { APPROVAL_STATUS_CONFIG, LOSS_REASON_CONFIG, OUTBOUND_SOURCE_CONFIG, OUTBOUND_TYPE_CONFIG, getLabel } from '../constants';
import { outboundRecords } from '../../../../mock/inventory';
import LossOutboundDrawer from '../components/LossOutboundDrawer';
import AuditModal from '../components/AuditModal';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const OutboundRecords: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedStationId } = useOutletContext<LayoutContext>();

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [typeFilter, setTypeFilter] = useState<OutboundType | ''>('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<OutboundSource | ''>('');
  const [lossDrawerOpen, setLossDrawerOpen] = useState(false);
  const [rejectingRecord, setRejectingRecord] = useState<OutboundRecord | null>(null);

  const records = useMemo(() => {
    let list = outboundRecords.filter(r => r.stationId === selectedStationId);
    if (typeFilter) list = list.filter(r => r.outboundType === typeFilter);
    if (fuelTypeFilter) list = list.filter(r => r.fuelTypeId === fuelTypeFilter);
    if (sourceFilter) list = list.filter(r => r.source === sourceFilter);
    if (dateRange) {
      const [start, end] = dateRange;
      list = list.filter(r => {
        const time = new Date(r.outboundTime).getTime();
        return time >= start.startOf('day').valueOf() && time <= end.endOf('day').valueOf();
      });
    }
    return list.sort((a, b) => new Date(b.outboundTime).getTime() - new Date(a.outboundTime).getTime());
  }, [selectedStationId, typeFilter, fuelTypeFilter, sourceFilter, dateRange]);

  const handleApprove = (record: OutboundRecord) => {
    message.success(`${t('inventory.audit.approved', '审批通过')}，${t('inventory.audit.stockUpdated', '库存已更新')}`);
    console.log('Approve outbound:', record.id);
  };

  const handleReject = (reason: string) => {
    if (rejectingRecord) {
      message.warning(`${t('inventory.audit.rejected', '已驳回')}，${t('inventory.audit.reason', '原因')}：${reason}`);
      console.log('Reject outbound:', rejectingRecord.id, reason);
      setRejectingRecord(null);
    }
  };

  const columns: ColumnsType<OutboundRecord> = [
    { title: t('inventory.outbound.outboundNo', '出库单号'), dataIndex: 'outboundNo', width: 160 },
    {
      title: t('inventory.outbound.outboundType', '出库类型'),
      dataIndex: 'outboundType',
      width: 100,
      render: (type: OutboundType) => {
        const cfg = OUTBOUND_TYPE_CONFIG[type];
        return <Tag color={cfg.color}>{getLabel(cfg)}</Tag>;
      },
    },
    { title: t('inventory.field.fuelType', '燃料类型'), dataIndex: 'fuelTypeName', width: 100 },
    {
      title: t('inventory.field.quantity', '数量(kg)'),
      dataIndex: 'quantity',
      width: 110,
      sorter: (a, b) => a.quantity - b.quantity,
      render: (v: number) => v.toFixed(3),
    },
    {
      title: t('inventory.field.amount', '金额(元)'),
      dataIndex: 'amount',
      width: 110,
      sorter: (a, b) => a.amount - b.amount,
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    {
      title: t('inventory.outbound.relatedOrder', '关联单号'),
      dataIndex: 'relatedOrderNo',
      width: 180,
      render: (v: string, record) => {
        if (record.outboundType === 'sales' && v) {
          return <a onClick={() => navigate('/energy-trade/order')}>{v}</a>;
        }
        return v || '—';
      },
    },
    {
      title: t('inventory.outbound.lossReason', '损耗原因'),
      dataIndex: 'lossReason',
      width: 120,
      render: (v: string | undefined, record) => {
        if (record.outboundType !== 'loss' || !v) return '—';
        const cfg = LOSS_REASON_CONFIG[v as keyof typeof LOSS_REASON_CONFIG];
        return cfg ? getLabel(cfg) : v;
      },
    },
    {
      title: t('inventory.outbound.source', '操作来源'),
      dataIndex: 'source',
      width: 80,
      render: (source: OutboundSource) => {
        const cfg = OUTBOUND_SOURCE_CONFIG[source];
        return <Tag color={cfg.color}>{getLabel(cfg)}</Tag>;
      },
    },
    {
      title: t('inventory.outbound.approvalStatus', '审批状态'),
      dataIndex: 'approvalStatus',
      width: 100,
      render: (status: ApprovalStatus | undefined, record) => {
        if (record.outboundType !== 'loss' || !status) return '—';
        const cfg = APPROVAL_STATUS_CONFIG[status];
        return <Tag color={cfg.color}>{getLabel(cfg)}</Tag>;
      },
    },
    {
      title: t('inventory.field.outboundTime', '出库时间'),
      dataIndex: 'outboundTime',
      width: 170,
      sorter: (a, b) => new Date(a.outboundTime).getTime() - new Date(b.outboundTime).getTime(),
      defaultSortOrder: 'descend',
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: t('inventory.field.actions', '操作'),
      width: 100,
      render: (_: unknown, record) => {
        if (record.outboundType === 'loss' && record.approvalStatus === 'pending_approval') {
          return (
            <Space size={4}>
              <Popconfirm
                title={t('inventory.audit.confirmApprove', '确认通过此损耗出库？')}
                onConfirm={() => handleApprove(record)}
              >
                <a style={{ color: '#52c41a' }}>{t('inventory.audit.approve', '通过')}</a>
              </Popconfirm>
              <a style={{ color: '#ff4d4f' }} onClick={() => setRejectingRecord(record)}>
                {t('inventory.audit.reject', '驳回')}
              </a>
            </Space>
          );
        }
        if (record.outboundType === 'sales') {
          return <a onClick={() => navigate('/energy-trade/order')}>{t('inventory.outbound.viewOrder', '查看订单')}</a>;
        }
        return null;
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>{t('inventory.outbound.title', '出库记录')}</Title>
          <RequirementTag componentIds={['outbound-list', 'loss-registration']} module="inventory-management" showDetail />
        </Space>
        <Button icon={<PlusOutlined />} onClick={() => setLossDrawerOpen(true)}>
          {t('inventory.outbound.registerLoss', '登记损耗出库')}
        </Button>
      </div>

      <Space wrap style={{ marginBottom: 16 }}>
        <RangePicker value={dateRange} onChange={v => setDateRange(v as [Dayjs, Dayjs] | null)} />
        <Select
          value={typeFilter}
          onChange={v => setTypeFilter(v as OutboundType | '')}
          style={{ width: 120 }}
          allowClear
          placeholder={t('inventory.outbound.outboundType', '出库类型')}
          options={[
            { value: '', label: t('inventory.filter.all', '全部') },
            ...Object.entries(OUTBOUND_TYPE_CONFIG).map(([k, v]) => ({ value: k, label: getLabel(v) })),
          ]}
        />
        <Select
          value={fuelTypeFilter}
          onChange={setFuelTypeFilter}
          style={{ width: 120 }}
          allowClear
          placeholder={t('inventory.field.fuelType', '燃料类型')}
          options={[
            { value: '', label: t('inventory.filter.all', '全部') },
            { value: 'ft-lng', label: 'LNG' },
            { value: 'ft-cng', label: 'CNG' },
            { value: 'ft-lcng', label: 'L-CNG' },
          ]}
        />
        <Select
          value={sourceFilter}
          onChange={v => setSourceFilter(v as OutboundSource | '')}
          style={{ width: 120 }}
          allowClear
          placeholder={t('inventory.outbound.source', '操作来源')}
          options={[
            { value: '', label: t('inventory.filter.all', '全部') },
            ...Object.entries(OUTBOUND_SOURCE_CONFIG).map(([k, v]) => ({ value: k, label: getLabel(v) })),
          ]}
        />
      </Space>

      <Table<OutboundRecord>
        columns={columns}
        dataSource={records}
        rowKey="id"
        scroll={{ x: 1430 }}
        pagination={{ pageSize: 20, showSizeChanger: true, showQuickJumper: true, showTotal: total => `${t('inventory.pagination.total', '共')} ${total} ${t('inventory.pagination.items', '条')}` }}
      />

      <LossOutboundDrawer
        open={lossDrawerOpen}
        onClose={() => setLossDrawerOpen(false)}
      />
      <AuditModal
        open={!!rejectingRecord}
        onClose={() => setRejectingRecord(null)}
        onConfirm={handleReject}
        title={`${t('inventory.audit.rejectTitle', '驳回损耗出库')} ${rejectingRecord?.outboundNo ?? ''}`}
      />
    </div>
  );
};

export default OutboundRecords;
