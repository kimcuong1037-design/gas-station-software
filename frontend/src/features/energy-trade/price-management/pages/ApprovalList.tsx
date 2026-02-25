// P04: 审批列表页
import React, { useState, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Input,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { priceAdjustments } from '../../../../mock/priceManagement';
import type { PriceAdjustment } from '../types';
import {
  ADJUSTMENT_TYPE_CONFIG,
  getLabel,
} from '../constants';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface LayoutContext {
  selectedStationId: string;
}

const ApprovalList: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId } = useOutletContext<LayoutContext>();

  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<PriceAdjustment | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNote, setApprovalNote] = useState('');
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  const pendingData = useMemo(() => {
    return priceAdjustments
      .filter((a) => a.status === 'pending_approval' && a.stationId === selectedStationId && !processedIds.has(a.id))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [selectedStationId, processedIds]);

  const handleOpenApproval = useCallback((record: PriceAdjustment, action: 'approve' | 'reject') => {
    setCurrentRecord(record);
    setApprovalAction(action);
    setApprovalNote('');
    setApprovalModalVisible(true);
  }, []);

  const handleConfirmApproval = useCallback(() => {
    if (approvalAction === 'reject' && !approvalNote.trim()) {
      message.warning(t('price.approval.rejectNoteRequired', '驳回必须填写原因'));
      return;
    }
    const actionLabel = approvalAction === 'approve'
      ? t('price.approval.approved', '已通过')
      : t('price.approval.rejected', '已驳回');
    message.success(`${currentRecord?.adjustmentNo} ${actionLabel}`);
    if (currentRecord) {
      setProcessedIds((prev) => new Set(prev).add(currentRecord.id));
    }
    setApprovalModalVisible(false);
  }, [approvalAction, approvalNote, currentRecord, t]);

  const columns: ColumnsType<PriceAdjustment> = [
    {
      title: t('price.field.adjustmentNo', '调价单号'),
      dataIndex: 'adjustmentNo',
      width: 180,
    },
    {
      title: t('price.field.fuelType', '油品'),
      dataIndex: 'fuelTypeName',
      width: 100,
    },
    {
      title: t('price.field.priceChange', '价格变动'),
      key: 'priceChange',
      width: 200,
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
      title: t('price.field.reason', '调价原因'),
      dataIndex: 'reason',
      width: 200,
      ellipsis: true,
    },
    {
      title: t('price.field.adjustedBy', '发起人'),
      dataIndex: 'adjustedByName',
      width: 100,
    },
    {
      title: t('price.field.createdAt', '发起时间'),
      dataIndex: 'createdAt',
      width: 170,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: t('common.actions', '操作'),
      key: 'actions',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleOpenApproval(record, 'approve')}
          >
            {t('price.action.approve', '通过')}
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => handleOpenApproval(record, 'reject')}
          >
            {t('price.action.reject', '驳回')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          {t('price.approval.title', '调价审批')}
          {pendingData.length > 0 && (
            <Tag color="red" style={{ marginLeft: 8 }}>{pendingData.length}</Tag>
          )}
        </Title>
      </Row>

      <Card>
        <Table<PriceAdjustment>
          columns={columns}
          dataSource={pendingData}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: (
              <div style={{ padding: 40 }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 12 }} />
                <div><Text type="secondary">{t('price.approval.empty', '暂无待审批的调价申请')}</Text></div>
              </div>
            ),
          }}
        />
      </Card>

      {/* Approval Modal */}
      <Modal
        title={approvalAction === 'approve'
          ? t('price.approval.approveTitle', '确认通过调价')
          : t('price.approval.rejectTitle', '驳回调价')
        }
        open={approvalModalVisible}
        onOk={handleConfirmApproval}
        onCancel={() => setApprovalModalVisible(false)}
        okText={approvalAction === 'approve' ? t('price.action.approve', '通过') : t('price.action.reject', '驳回')}
        okButtonProps={{ danger: approvalAction === 'reject' }}
      >
        {currentRecord && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">{t('price.field.adjustmentNo', '调价单号')}: </Text>
              <Text strong>{currentRecord.adjustmentNo}</Text>
            </div>
            <div>
              <Text type="secondary">{t('price.field.priceChange', '价格变动')}: </Text>
              <Text>
                {currentRecord.fuelTypeName} ¥{currentRecord.oldPrice.toFixed(2)} &rarr;{' '}
                <Text strong style={{ color: currentRecord.changeAmount > 0 ? '#ff4d4f' : '#52c41a' }}>
                  ¥{currentRecord.newPrice.toFixed(2)}
                </Text>
                {' '}({currentRecord.changeAmount > 0 ? '+' : ''}{currentRecord.changePct.toFixed(1)}%)
              </Text>
            </div>
            <div>
              <Text type="secondary">{t('price.field.reason', '调价原因')}: </Text>
              <Text>{currentRecord.reason || '-'}</Text>
            </div>
            <div>
              <Text type="secondary">{t('price.field.approvalNote', '审批备注')}: </Text>
              <TextArea
                rows={3}
                placeholder={approvalAction === 'reject'
                  ? t('price.approval.rejectNotePlaceholder', '请输入驳回原因（必填）')
                  : t('price.approval.approveNotePlaceholder', '可选备注')
                }
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
              />
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ApprovalList;
