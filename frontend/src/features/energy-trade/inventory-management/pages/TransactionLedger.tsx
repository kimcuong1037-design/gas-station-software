import React, { useMemo, useState } from 'react';
import { Button, DatePicker, Select, Space, Table, Tag, Typography, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import type { Dayjs } from 'dayjs';
interface LayoutContext {
  selectedStationId: string;
}
import { RequirementTag } from '../../../../components/RequirementTag';
import type { InventoryLedger, TransactionType } from '../types';
import { TRANSACTION_TYPE_CONFIG, getLabel } from '../constants';
import { inventoryLedgerEntries } from '../../../../mock/inventory';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const TransactionLedger: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId } = useOutletContext<LayoutContext>();

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [typeFilter, setTypeFilter] = useState<TransactionType[]>([]);
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string>('');

  const records = useMemo(() => {
    let list = inventoryLedgerEntries.filter(r => r.stationId === selectedStationId);
    if (typeFilter.length > 0) list = list.filter(r => typeFilter.includes(r.transactionType));
    if (fuelTypeFilter) list = list.filter(r => r.fuelTypeId === fuelTypeFilter);
    if (dateRange) {
      const [start, end] = dateRange;
      list = list.filter(r => {
        const time = new Date(r.transactionTime).getTime();
        return time >= start.startOf('day').valueOf() && time <= end.endOf('day').valueOf();
      });
    }
    return list.sort((a, b) => new Date(b.transactionTime).getTime() - new Date(a.transactionTime).getTime());
  }, [selectedStationId, typeFilter, fuelTypeFilter, dateRange]);

  const handleExport = () => {
    message.success(t('inventory.ledger.exportSuccess', '导出成功，共导出 ') + records.length + t('inventory.ledger.exportItems', ' 条记录'));
  };

  const columns: ColumnsType<InventoryLedger> = [
    {
      title: t('inventory.ledger.time', '时间'),
      dataIndex: 'transactionTime',
      width: 170,
      sorter: (a, b) => new Date(a.transactionTime).getTime() - new Date(b.transactionTime).getTime(),
      defaultSortOrder: 'descend',
      render: (v: string) => new Date(v).toLocaleString('zh-CN'),
    },
    {
      title: t('inventory.ledger.transactionType', '类型'),
      dataIndex: 'transactionType',
      width: 100,
      render: (type: TransactionType) => {
        const cfg = TRANSACTION_TYPE_CONFIG[type];
        return <Tag color={cfg.color}>{getLabel(cfg)}</Tag>;
      },
    },
    { title: t('inventory.field.fuelType', '燃料类型'), dataIndex: 'fuelTypeName', width: 100 },
    {
      title: t('inventory.field.quantity', '数量(kg)'),
      dataIndex: 'quantity',
      width: 110,
      sorter: (a, b) => a.quantity - b.quantity,
      render: (v: number) => (
        <Text style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {v >= 0 ? '+' : ''}{v.toFixed(3)}
        </Text>
      ),
    },
    {
      title: t('inventory.field.amount', '金额(元)'),
      dataIndex: 'amount',
      width: 110,
      sorter: (a, b) => a.amount - b.amount,
      render: (v: number) => `¥${v.toFixed(2)}`,
    },
    {
      title: t('inventory.ledger.stockBalance', '库存余量(kg)'),
      dataIndex: 'stockBalance',
      width: 120,
      render: (v: number) => v.toFixed(3),
    },
    {
      title: t('inventory.ledger.operatorSource', '操作人/来源'),
      dataIndex: 'operatorOrSource',
      width: 120,
    },
    {
      title: t('inventory.ledger.relatedNo', '关联单号'),
      dataIndex: 'relatedNo',
      width: 180,
    },
  ];

  const expandedRowRender = (record: InventoryLedger) => (
    <div style={{ padding: '8px 0' }}>
      {record.auditRecord && (
        <div><Text type="secondary">{t('inventory.ledger.auditRecord', '审批记录')}：</Text>{record.auditRecord}</div>
      )}
      {record.remark && (
        <div><Text type="secondary">{t('inventory.field.remark', '备注')}：</Text>{record.remark}</div>
      )}
      {!record.auditRecord && !record.remark && (
        <Text type="secondary">{t('inventory.ledger.noExtra', '无附加信息')}</Text>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>{t('inventory.ledger.title', '进销存流水')}</Title>
          <RequirementTag componentIds={['transaction-ledger']} module="inventory-management" showDetail />
        </Space>
        <Button icon={<DownloadOutlined />} onClick={handleExport}>
          {t('inventory.ledger.export', '导出')}
        </Button>
      </div>

      <Space wrap style={{ marginBottom: 16 }}>
        <RangePicker value={dateRange} onChange={v => setDateRange(v as [Dayjs, Dayjs] | null)} />
        <Select
          mode="multiple"
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ minWidth: 200 }}
          allowClear
          placeholder={t('inventory.ledger.transactionType', '流水类型')}
          options={Object.entries(TRANSACTION_TYPE_CONFIG).map(([k, v]) => ({ value: k, label: getLabel(v) }))}
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
      </Space>

      <Table<InventoryLedger>
        columns={columns}
        dataSource={records}
        rowKey="id"
        scroll={{ x: 1010 }}
        expandable={{ expandedRowRender }}
        pagination={{ pageSize: 20, showSizeChanger: true, showQuickJumper: true, showTotal: total => `${t('inventory.pagination.total', '共')} ${total} ${t('inventory.pagination.items', '条')}` }}
      />
    </div>
  );
};

export default TransactionLedger;
