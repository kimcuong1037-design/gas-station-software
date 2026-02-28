import React, { useEffect, useState } from 'react';
import { Button, Descriptions, Input, InputNumber, message, Modal, Popconfirm, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TankComparisonCard } from '../types';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface StockAdjustmentModalProps {
  open: boolean;
  onClose: () => void;
  tank: TankComparisonCard | null;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ open, onClose, tank }) => {
  const { t } = useTranslation();
  const [adjustedStock, setAdjustedStock] = useState<number | null>(null);
  const [adjustmentReason, setAdjustmentReason] = useState('');

  useEffect(() => {
    if (tank) {
      setAdjustedStock(tank.actualLevel);
      setAdjustmentReason('');
    }
  }, [tank]);

  if (!tank) return null;

  const adjustmentQty = adjustedStock != null ? adjustedStock - tank.theoreticalStock : 0;
  const adjustmentPct = tank.theoreticalStock !== 0 ? Math.abs(adjustmentQty / tank.theoreticalStock) * 100 : 0;

  const handleSubmit = () => {
    if (adjustedStock == null) {
      message.error(t('inventory.adjustment.stockRequired', '请输入调整后理论库存'));
      return;
    }
    if (!adjustmentReason.trim()) {
      message.error(t('inventory.adjustment.reasonRequired', '请填写调整原因'));
      return;
    }
    message.success(t('inventory.adjustment.submitted', '盘点调整已提交审批'));
    onClose();
  };

  return (
    <Modal
      title={t('inventory.tank.stockAdjustment', '盘点调整')}
      open={open}
      onCancel={onClose}
      width={480}
      footer={
        <Space>
          <Popconfirm
            title={t('inventory.adjustment.confirmSubmit', '确认提交盘点调整？调整将影响理论库存。')}
            onConfirm={handleSubmit}
          >
            <Button type="primary">{t('inventory.adjustment.submit', '提交盘点调整')}</Button>
          </Popconfirm>
          <Button onClick={onClose}>{t('inventory.action.cancel', '取消')}</Button>
        </Space>
      }
    >
      <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label={t('inventory.field.tank', '储罐')}>{tank.tankName} — {tank.fuelTypeName}</Descriptions.Item>
        <Descriptions.Item label={t('inventory.card.theoreticalStock', '当前理论库存')}>{tank.theoreticalStock.toFixed(3)} kg</Descriptions.Item>
        <Descriptions.Item label={t('inventory.card.actualLevel', '当前实际罐存')}>{tank.actualLevel.toFixed(3)} kg</Descriptions.Item>
        <Descriptions.Item label={t('inventory.card.deviation', '当前偏差')}>
          <Text style={{ color: tank.deviation >= 0 ? '#52c41a' : '#ff4d4f' }}>
            {tank.deviation >= 0 ? '+' : ''}{tank.deviation.toFixed(3)} kg ({tank.deviationRate >= 0 ? '+' : ''}{tank.deviationRate.toFixed(2)}%)
          </Text>
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginBottom: 16 }}>
        <Paragraph style={{ marginBottom: 4 }}>
          <Text strong>{t('inventory.adjustment.adjustedStock', '调整后理论库存(kg)')}</Text> <Text type="danger">*</Text>
        </Paragraph>
        <InputNumber
          value={adjustedStock}
          onChange={v => setAdjustedStock(v)}
          min={0}
          max={tank.ratedCapacity}
          precision={3}
          style={{ width: '100%' }}
          addonAfter="kg"
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <Paragraph style={{ marginBottom: 4 }}>
          <Text strong>{t('inventory.adjustment.reason', '调整原因')}</Text> <Text type="danger">*</Text>
        </Paragraph>
        <TextArea
          value={adjustmentReason}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAdjustmentReason(e.target.value)}
          maxLength={500}
          showCount
          rows={3}
          placeholder={t('inventory.adjustment.reasonPlaceholder', '请描述调整原因')}
        />
      </div>

      {adjustedStock != null && (
        <div style={{ padding: 12, background: '#fafafa', borderRadius: 8 }}>
          <Text strong>{t('inventory.adjustment.preview', '调整量预览')}</Text>
          <div style={{ marginTop: 8 }}>
            <Text style={{ color: adjustmentQty >= 0 ? '#52c41a' : '#ff4d4f' }}>
              {adjustmentQty >= 0 ? '+' : ''}{adjustmentQty.toFixed(3)} kg
            </Text>
          </div>
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {adjustmentPct > 1
                ? t('inventory.adjustment.needStationMaster', '调整量超过 1%，需站长审批')
                : t('inventory.adjustment.teamLeadCanApprove', '班组长可审批')}
            </Text>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default StockAdjustmentModal;
