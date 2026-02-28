import React, { useMemo, useState } from 'react';
import { Button, DatePicker, Input, message, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import type { Dayjs } from 'dayjs';
interface LayoutContext {
  selectedStationId: string;
}
import { RequirementTag } from '../../../../components/RequirementTag';
import type { AuditStatus, InboundRecord } from '../types';
import { AUDIT_STATUS_CONFIG, getLabel } from '../constants';
import { inboundRecords } from '../../../../mock/inventory';
import CreateInboundDrawer from '../components/CreateInboundDrawer';
import InboundDetailDrawer from '../components/InboundDetailDrawer';
import AuditModal from '../components/AuditModal';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const InboundManagement: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId } = useOutletContext<LayoutContext>();

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<AuditStatus | ''>('');
  const [keyword, setKeyword] = useState('');
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<InboundRecord | null>(null);
  const [rejectingRecord, setRejectingRecord] = useState<InboundRecord | null>(null);

  const records = useMemo(() => {
    let list = inboundRecords.filter(r => r.stationId === selectedStationId);
    if (fuelTypeFilter) list = list.filter(r => r.fuelTypeId === fuelTypeFilter);
    if (statusFilter) list = list.filter(r => r.auditStatus === statusFilter);
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(r =>
        r.inboundNo.toLowerCase().includes(kw) ||
        r.supplierName.toLowerCase().includes(kw) ||
        (r.deliveryNo ?? '').toLowerCase().includes(kw),
      );
    }
    if (dateRange) {
      const [start, end] = dateRange;
      list = list.filter(r => {
        const t = new Date(r.inboundTime).getTime();
        return t >= start.startOf('day').valueOf() && t <= end.endOf('day').valueOf();
      });
    }
    return list.sort((a, b) => new Date(b.inboundTime).getTime() - new Date(a.inboundTime).getTime());
  }, [selectedStationId, fuelTypeFilter, statusFilter, keyword, dateRange]);

  const handleApprove = (record: InboundRecord) => {
    message.success(`${t('inventory.audit.approved', '审核通过')}，${t('inventory.audit.stockUpdated', '库存已更新')}`);
    console.log('Approve inbound:', record.id);
  };

  const handleReject = (reason: string) => {
    if (rejectingRecord) {
      message.warning(`${t('inventory.audit.rejected', '已驳回')}，${t('inventory.audit.reason', '原因')}：${reason}`);
      console.log('Reject inbound:', rejectingRecord.id, reason);
      setRejectingRecord(null);
    }
  };

  const columns: ColumnsType<InboundRecord> = [
    {
      title: t('inventory.inbound.inboundNo', '入库单号'),
      dataIndex: 'inboundNo',
      width: 160,
      render: (text: string, record) => (
        <a onClick={() => setDetailRecord(record)}>{text}</a>
      ),
    },
    { title: t('inventory.inbound.supplier', '供应商'), dataIndex: 'supplierName', width: 140 },
    { title: t('inventory.inbound.deliveryNo', '送货单号'), dataIndex: 'deliveryNo', width: 140, render: (v: string) => v || '—' },
    { title: t('inventory.field.fuelType', '燃料类型'), dataIndex: 'fuelTypeName', width: 100 },
    { title: t('inventory.field.tank', '目标储罐'), dataIndex: 'tankName', width: 120 },
    {
      title: t('inventory.inbound.plannedQuantity', '计划量(kg)'),
      dataIndex: 'plannedQuantity',
      width: 110,
      sorter: (a, b) => a.plannedQuantity - b.plannedQuantity,
      render: (v: number) => v.toFixed(3),
    },
    {
      title: t('inventory.inbound.actualQuantity', '实收量(kg)'),
      dataIndex: 'actualQuantity',
      width: 110,
      sorter: (a, b) => a.actualQuantity - b.actualQuantity,
      render: (v: number) => v.toFixed(3),
    },
    {
      title: t('inventory.inbound.variance', '入库偏差'),
      dataIndex: 'variance',
      width: 110,
      render: (_: number, record) => (
        <span style={{ color: record.variance < 0 ? '#ff4d4f' : '#52c41a' }}>
          {record.variance.toFixed(3)} kg ({record.varianceRate.toFixed(2)}%)
        </span>
      ),
    },
    {
      title: t('inventory.field.inboundTime', '入库时间'),
      dataIndex: 'inboundTime',
      width: 170,
      sorter: (a, b) => new Date(a.inboundTime).getTime() - new Date(b.inboundTime).getTime(),
      defaultSortOrder: 'descend',
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    { title: t('inventory.field.operator', '操作员'), dataIndex: 'operatorName', width: 100 },
    {
      title: t('inventory.field.auditStatus', '审核状态'),
      dataIndex: 'auditStatus',
      width: 100,
      render: (status: AuditStatus) => {
        const cfg = AUDIT_STATUS_CONFIG[status];
        return <Tag color={cfg.color}>{getLabel(cfg)}</Tag>;
      },
    },
    {
      title: t('inventory.field.actions', '操作'),
      width: 120,
      render: (_: unknown, record) => {
        if (record.auditStatus === 'pending_review') {
          return (
            <Space size={4}>
              <Popconfirm
                title={t('inventory.audit.confirmApprove', '确认通过此入库单？通过后将更新理论库存。')}
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
        return <a onClick={() => setDetailRecord(record)}>{t('inventory.field.detail', '详情')}</a>;
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>{t('inventory.inbound.title', '入库管理')}</Title>
          <RequirementTag componentIds={['inbound-list', 'inbound-create', 'inbound-audit']} module="inventory-management" showDetail />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateDrawerOpen(true)}>
          {t('inventory.inbound.createInbound', '新增入库')}
        </Button>
      </div>

      <Space wrap style={{ marginBottom: 16 }}>
        <RangePicker value={dateRange} onChange={v => setDateRange(v as [Dayjs, Dayjs] | null)} />
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
          value={statusFilter}
          onChange={v => setStatusFilter(v as AuditStatus | '')}
          style={{ width: 120 }}
          allowClear
          placeholder={t('inventory.field.auditStatus', '审核状态')}
          options={[
            { value: '', label: t('inventory.filter.all', '全部') },
            ...Object.entries(AUDIT_STATUS_CONFIG).map(([k, v]) => ({ value: k, label: getLabel(v) })),
          ]}
        />
        <Input.Search
          placeholder={t('inventory.inbound.searchPlaceholder', '入库单号/供应商/送货单号')}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
      </Space>

      <Table<InboundRecord>
        columns={columns}
        dataSource={records}
        rowKey="id"
        scroll={{ x: 1480 }}
        pagination={{ pageSize: 20, showSizeChanger: true, showQuickJumper: true, showTotal: total => `${t('inventory.pagination.total', '共')} ${total} ${t('inventory.pagination.items', '条')}` }}
      />

      <CreateInboundDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
      />
      <InboundDetailDrawer
        open={!!detailRecord}
        onClose={() => setDetailRecord(null)}
        record={detailRecord}
        onReject={() => { if (detailRecord) setRejectingRecord(detailRecord); }}
      />
      <AuditModal
        open={!!rejectingRecord}
        onClose={() => setRejectingRecord(null)}
        onConfirm={handleReject}
        title={`${t('inventory.audit.rejectTitle', '驳回入库单')} ${rejectingRecord?.inboundNo ?? ''}`}
      />
    </div>
  );
};

export default InboundManagement;
