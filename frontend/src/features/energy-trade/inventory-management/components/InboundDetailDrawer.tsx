import React from 'react';
import { Button, Descriptions, Drawer, message, Popconfirm, Space, Steps, Table, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { InboundRecord } from '../types';
import { AUDIT_STATUS_CONFIG, getLabel } from '../constants';

const { Text } = Typography;

interface InboundDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  record: InboundRecord | null;
  onReject?: () => void;
}

const InboundDetailDrawer: React.FC<InboundDetailDrawerProps> = ({ open, onClose, record, onReject }) => {
  const { t } = useTranslation();

  if (!record) return null;

  const stepCurrent = record.auditStatus === 'pending_review' ? 1 : record.auditStatus === 'approved' ? 2 : 2;
  const stepStatus = record.auditStatus === 'rejected' ? 'error' as const : undefined;

  const handleApprove = () => {
    message.success(t('inventory.audit.approveSuccess', '入库单已通过审核'));
    onClose();
  };

  const auditRecords = record.auditedBy
    ? [{
        key: '1',
        auditor: record.auditorName,
        time: record.auditedAt ? new Date(record.auditedAt).toLocaleString('zh-CN') : '—',
        result: record.auditStatus === 'approved' ? t('inventory.audit.approved', '已通过') : t('inventory.audit.rejected', '已驳回'),
        reason: record.rejectReason || '—',
      }]
    : [];

  return (
    <Drawer
      title={`${t('inventory.inbound.detail', '入库详情')} — ${record.inboundNo}`}
      open={open}
      onClose={onClose}
      width={640}
      footer={
        record.auditStatus === 'pending_review' ? (
          <Space style={{ float: 'right' }}>
            <Button danger onClick={onReject}>{t('inventory.audit.reject', '驳回')}</Button>
            <Popconfirm title={t('inventory.audit.confirmApprove', '确认通过审核？')} onConfirm={handleApprove}>
              <Button type="primary">{t('inventory.audit.approve', '通过')}</Button>
            </Popconfirm>
          </Space>
        ) : null
      }
    >
      <Steps
        current={stepCurrent}
        status={stepStatus}
        size="small"
        style={{ marginBottom: 24 }}
        items={[
          { title: t('inventory.inbound.stepSubmit', '提交') },
          { title: t('inventory.inbound.stepAudit', '审核') },
          { title: t('inventory.inbound.stepSettled', '入账') },
        ]}
      />

      <Descriptions title={t('inventory.inbound.basicInfo', '基本信息')} column={2} size="small" bordered style={{ marginBottom: 16 }}>
        <Descriptions.Item label={t('inventory.inbound.inboundNo', '入库单号')}>{record.inboundNo}</Descriptions.Item>
        <Descriptions.Item label={t('inventory.inbound.inboundTime', '入库时间')}>{new Date(record.inboundTime).toLocaleString('zh-CN')}</Descriptions.Item>
        <Descriptions.Item label={t('inventory.inbound.supplier', '供应商')}>{record.supplierName}</Descriptions.Item>
        <Descriptions.Item label={t('inventory.inbound.deliveryNo', '送货单号')}>{record.deliveryNo || '—'}</Descriptions.Item>
        <Descriptions.Item label={t('inventory.field.tank', '目标储罐')}>{record.tankName}</Descriptions.Item>
        <Descriptions.Item label={t('inventory.field.fuelType', '燃料类型')}>{record.fuelTypeName}</Descriptions.Item>
        <Descriptions.Item label={t('inventory.inbound.operator', '操作员')}>{record.operatorName}</Descriptions.Item>
        <Descriptions.Item label={t('inventory.audit.status', '审核状态')}>
          <Tag color={AUDIT_STATUS_CONFIG[record.auditStatus].color}>
            {getLabel(AUDIT_STATUS_CONFIG[record.auditStatus])}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Descriptions title={t('inventory.inbound.quantityInfo', '数量信息')} column={2} size="small" bordered style={{ marginBottom: 16 }}>
        <Descriptions.Item label={t('inventory.inbound.plannedQuantity', '计划量(kg)')}>{record.plannedQuantity.toFixed(3)}</Descriptions.Item>
        <Descriptions.Item label={t('inventory.inbound.actualQuantity', '实收量(kg)')}>{record.actualQuantity.toFixed(3)}</Descriptions.Item>
        <Descriptions.Item label={t('inventory.inbound.variance', '入库偏差(kg)')}>
          <Text style={{ color: record.variance >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {record.variance >= 0 ? '+' : ''}{record.variance.toFixed(3)}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label={t('inventory.inbound.varianceRate', '偏差率(%)')}>
          <Text style={{ color: Math.abs(record.varianceRate) > 2 ? '#ff4d4f' : undefined }}>
            {record.varianceRate >= 0 ? '+' : ''}{record.varianceRate.toFixed(2)}%
          </Text>
        </Descriptions.Item>
      </Descriptions>

      {record.remark && (
        <Descriptions size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label={t('inventory.field.remark', '备注')}>{record.remark}</Descriptions.Item>
        </Descriptions>
      )}

      {auditRecords.length > 0 && (
        <>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>{t('inventory.audit.records', '审核记录')}</Text>
          <Table
            dataSource={auditRecords}
            rowKey="key"
            size="small"
            pagination={false}
            columns={[
              { title: t('inventory.audit.auditor', '审核人'), dataIndex: 'auditor', width: 100 },
              { title: t('inventory.audit.time', '审核时间'), dataIndex: 'time', width: 180 },
              { title: t('inventory.audit.result', '审核结果'), dataIndex: 'result', width: 100 },
              { title: t('inventory.audit.rejectReason', '驳回原因'), dataIndex: 'reason' },
            ]}
          />
        </>
      )}
    </Drawer>
  );
};

export default InboundDetailDrawer;
