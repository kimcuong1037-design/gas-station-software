// P02: 调价历史列表页
import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Typography,
  Button,
  Input,
  Select,
  Table,
  Tag,
  Space,
  DatePicker,
  Drawer,
  Descriptions,
  message,
} from 'antd';
import {
  SearchOutlined,
  ExportOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { priceAdjustments, getAdjustmentDetail } from '../../../../mock/priceManagement';
import type { PriceAdjustment, AdjustmentDetail } from '../types';
import {
  ADJUSTMENT_STATUS_CONFIG,
  ADJUSTMENT_TYPE_CONFIG,
  getLabel,
} from '../constants';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface LayoutContext {
  selectedStationId: string;
}

const AdjustmentHistory: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId } = useOutletContext<LayoutContext>();

  const statusOptions = [
    { value: 'all', label: t('price.filter.allStatus', '全部状态') },
    { value: 'pending_approval', label: t('price.status.pendingApproval', '待审批') },
    { value: 'approved', label: t('price.status.approved', '待执行') },
    { value: 'rejected', label: t('price.status.rejected', '已驳回') },
    { value: 'executed', label: t('price.status.executed', '已执行') },
    { value: 'cancelled', label: t('price.status.cancelled', '已取消') },
  ];

  const typeOptions = [
    { value: 'all', label: t('price.filter.allTypes', '全部类型') },
    { value: 'immediate', label: t('price.type.immediate', '立即生效') },
    { value: 'scheduled', label: t('price.type.scheduled', '定时生效') },
  ];

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Detail drawer
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<AdjustmentDetail | undefined>(undefined);

  const filteredData = useMemo(() => {
    let data = priceAdjustments.filter((a) => a.stationId === selectedStationId);

    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      data = data.filter(
        (a) =>
          a.adjustmentNo.toLowerCase().includes(kw) ||
          a.fuelTypeName.toLowerCase().includes(kw) ||
          (a.reason && a.reason.toLowerCase().includes(kw)),
      );
    }

    if (statusFilter !== 'all') {
      data = data.filter((a) => a.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      data = data.filter((a) => a.adjustmentType === typeFilter);
    }

    if (dateRange) {
      data = data.filter((a) => {
        const d = dayjs(a.createdAt);
        return d.isAfter(dateRange[0].startOf('day')) && d.isBefore(dateRange[1].endOf('day'));
      });
    }

    return data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [keyword, statusFilter, typeFilter, dateRange, selectedStationId]);

  const handleViewDetail = (record: PriceAdjustment) => {
    const detail = getAdjustmentDetail(record.id);
    setSelectedDetail(detail);
    setDetailVisible(true);
  };

  const handleExport = () => {
    message.info(t('common.exportTodo', '导出功能即将上线'));
  };

  const handleReset = () => {
    setKeyword('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDateRange(null);
  };

  const columns: ColumnsType<PriceAdjustment> = [
    {
      title: t('price.field.adjustmentNo', '调价单号'),
      dataIndex: 'adjustmentNo',
      width: 180,
      render: (text: string) => <Text copyable={{ text }}>{text}</Text>,
    },
    {
      title: t('price.field.fuelType', '油品'),
      dataIndex: 'fuelTypeName',
      width: 100,
    },
    {
      title: t('price.field.priceChange', '价格变动'),
      key: 'priceChange',
      width: 180,
      render: (_, record) => {
        const isUp = record.changeAmount > 0;
        return (
          <Space>
            <Text>{record.oldPrice.toFixed(2)}</Text>
            <Text type="secondary">&rarr;</Text>
            <Text strong style={{ color: isUp ? '#ff4d4f' : '#52c41a' }}>
              {record.newPrice.toFixed(2)}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ({isUp ? '+' : ''}{record.changePct.toFixed(1)}%)
            </Text>
          </Space>
        );
      },
    },
    {
      title: t('price.field.adjustmentType', '类型'),
      dataIndex: 'adjustmentType',
      width: 100,
      render: (type: string) => {
        const config = ADJUSTMENT_TYPE_CONFIG[type as keyof typeof ADJUSTMENT_TYPE_CONFIG];
        return config ? <Tag color={config.color}>{getLabel(config)}</Tag> : type;
      },
    },
    {
      title: t('price.field.status', '状态'),
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const config = ADJUSTMENT_STATUS_CONFIG[status as keyof typeof ADJUSTMENT_STATUS_CONFIG];
        return config ? <Tag color={config.color}>{getLabel(config)}</Tag> : status;
      },
    },
    {
      title: t('price.field.adjustedBy', '发起人'),
      dataIndex: 'adjustedByName',
      width: 100,
    },
    {
      title: t('price.field.createdAt', '创建时间'),
      dataIndex: 'createdAt',
      width: 170,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('common.actions', '操作'),
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
          {t('common.view', '查看')}
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          {t('price.history.title', '调价历史')}
        </Title>
        <Button icon={<ExportOutlined />} onClick={handleExport}>
          {t('common.export', '导出')}
        </Button>
      </Row>

      {/* Filter Area */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap size={[16, 12]}>
          <Input
            placeholder={t('price.history.searchPlaceholder', '搜索调价单号/油品/原因')}
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 260 }}
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            style={{ width: 140 }}
          />
          <Select
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
            style={{ width: 140 }}
          />
          <RangePicker
            value={dateRange}
            onChange={(val) => setDateRange(val as [dayjs.Dayjs, dayjs.Dayjs] | null)}
          />
          <Button onClick={handleReset}>{t('common.reset', '重置')}</Button>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table<PriceAdjustment>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            defaultPageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `${t('common.total', '共')} ${total} ${t('common.records', '条')}`,
          }}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={t('price.history.detailTitle', '调价详情')}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={640}
      >
        {selectedDetail && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label={t('price.field.adjustmentNo', '调价单号')} span={2}>
                {selectedDetail.adjustmentNo}
              </Descriptions.Item>
              <Descriptions.Item label={t('price.field.fuelType', '油品')}>
                {selectedDetail.fuelTypeName}
              </Descriptions.Item>
              <Descriptions.Item label={t('price.field.adjustmentType', '类型')}>
                {(() => {
                  const config = ADJUSTMENT_TYPE_CONFIG[selectedDetail.adjustmentType];
                  return <Tag color={config.color}>{getLabel(config)}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label={t('price.field.oldPrice', '原价')}>
                ¥{selectedDetail.oldPrice.toFixed(2)}/{selectedDetail.fuelUnit}
              </Descriptions.Item>
              <Descriptions.Item label={t('price.field.newPrice', '新价')}>
                <Text strong style={{ color: '#1890ff' }}>
                  ¥{selectedDetail.newPrice.toFixed(2)}/{selectedDetail.fuelUnit}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('price.field.change', '变动')}>
                <Text style={{ color: selectedDetail.changeAmount > 0 ? '#ff4d4f' : '#52c41a' }}>
                  {selectedDetail.changeAmount > 0 ? '+' : ''}{selectedDetail.changeAmount.toFixed(2)} ({selectedDetail.changePct.toFixed(1)}%)
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('price.field.status', '状态')}>
                {(() => {
                  const config = ADJUSTMENT_STATUS_CONFIG[selectedDetail.status];
                  return <Tag color={config.color}>{getLabel(config)}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label={t('price.field.reason', '调价原因')} span={2}>
                {selectedDetail.reason || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('price.field.adjustedBy', '发起人')}>
                {selectedDetail.adjustedByName}
              </Descriptions.Item>
              <Descriptions.Item label={t('price.field.createdAt', '发起时间')}>
                {dayjs(selectedDetail.createdAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              {selectedDetail.approvedByName && (
                <>
                  <Descriptions.Item label={t('price.field.approvedBy', '审批人')}>
                    {selectedDetail.approvedByName}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('price.field.approvedAt', '审批时间')}>
                    {selectedDetail.approvedAt ? dayjs(selectedDetail.approvedAt).format('YYYY-MM-DD HH:mm') : '-'}
                  </Descriptions.Item>
                </>
              )}
              {selectedDetail.approvalNote && (
                <Descriptions.Item label={t('price.field.approvalNote', '审批备注')} span={2}>
                  {selectedDetail.approvalNote}
                </Descriptions.Item>
              )}
              {selectedDetail.executedAt && (
                <Descriptions.Item label={t('price.field.executedAt', '执行时间')} span={2}>
                  {dayjs(selectedDetail.executedAt).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Affected Nozzles */}
            {selectedDetail.affectedNozzles.length > 0 && (
              <Card title={t('price.history.affectedNozzles', '受影响的枪')} size="small">
                <Table
                  dataSource={selectedDetail.affectedNozzles}
                  rowKey="nozzleNo"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: t('price.field.nozzleNo', '枪号'), dataIndex: 'nozzleNo', width: 80 },
                    {
                      title: t('price.field.beforePrice', '调价前'),
                      dataIndex: 'beforePrice',
                      width: 100,
                      render: (v: number) => `¥${v.toFixed(2)}`,
                    },
                    {
                      title: t('price.field.afterPrice', '调价后'),
                      dataIndex: 'afterPrice',
                      width: 100,
                      render: (v: number) => <Text strong>¥{v.toFixed(2)}</Text>,
                    },
                    {
                      title: t('price.field.pricingStatus', '状态'),
                      dataIndex: 'isOverride',
                      width: 100,
                      render: (v: boolean) => v ? <Tag color="orange">{t('price.label.overridePrice', '独立定价')}</Tag> : <Tag color="green">{t('price.label.followBase', '跟随基准')}</Tag>,
                    },
                  ]}
                />
              </Card>
            )}
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default AdjustmentHistory;
