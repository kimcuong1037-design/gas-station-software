import React, { useMemo, useState } from 'react';
import { Button, Drawer, Form, Input, InputNumber, message, Select, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
interface LayoutContext {
  selectedStationId: string;
}
import type { LossOutboundForm, LossReason } from '../types';
import { LOSS_REASON_CONFIG, getLabel } from '../constants';

const { Text } = Typography;
const { TextArea } = Input;

interface LossOutboundDrawerProps {
  open: boolean;
  onClose: () => void;
}

const fuelTypeOptions = [
  { value: 'ft-lng', label: 'LNG', price: 4.80, stock: 15230.500 },
  { value: 'ft-cng', label: 'CNG', price: 3.50, stock: 8520.000 },
  { value: 'ft-lcng', label: 'L-CNG', price: 4.20, stock: 5461.500 },
];

const LossOutboundDrawer: React.FC<LossOutboundDrawerProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { selectedStationId } = useOutletContext<LayoutContext>();
  const [form] = Form.useForm<LossOutboundForm>();
  const [selectedFuelId, setSelectedFuelId] = useState<string>('');

  void selectedStationId;

  const selectedFuel = useMemo(() => fuelTypeOptions.find(f => f.value === selectedFuelId), [selectedFuelId]);
  const quantity = Form.useWatch('quantity', form);
  const lossReason = Form.useWatch('lossReason', form) as LossReason | undefined;

  const autoAmount = selectedFuel && quantity ? Math.round(quantity * selectedFuel.price * 100) / 100 : null;
  const isOverStock = selectedFuel && quantity ? quantity > selectedFuel.stock : false;
  const isLargeAmount = selectedFuel && quantity ? quantity > selectedFuel.stock * 0.1 : false;

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (isOverStock) {
        message.error(t('inventory.outbound.overStock', `损耗量不能超过当前理论库存 (${selectedFuel?.stock.toFixed(3)} kg)`));
        return;
      }
      message.success(t('inventory.outbound.lossSubmitted', '损耗记录已提交，等待审批'));
      form.resetFields();
      setSelectedFuelId('');
      onClose();
    } catch {
      // validation errors shown by form
    }
  };

  const handleClose = () => {
    form.resetFields();
    setSelectedFuelId('');
    onClose();
  };

  return (
    <Drawer
      title={t('inventory.outbound.registerLoss', '登记损耗出库')}
      open={open}
      onClose={handleClose}
      width={480}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={handleClose}>{t('inventory.action.cancel', '取消')}</Button>
          <Button type="primary" onClick={handleSubmit}>{t('inventory.outbound.submitLoss', '提交损耗登记')}</Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="fuelTypeId" label={t('inventory.field.fuelType', '燃料类型')} rules={[{ required: true, message: t('inventory.outbound.fuelRequired', '请选择燃料类型') }]}>
          <Select
            placeholder={t('inventory.outbound.selectFuel', '请选择燃料类型')}
            options={fuelTypeOptions.map(o => ({ value: o.value, label: o.label }))}
            onChange={v => setSelectedFuelId(v)}
          />
        </Form.Item>

        {selectedFuel && (
          <div style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 8 }}>
            <Text type="secondary">{t('inventory.card.theoreticalStock', '当前理论库存')}：{selectedFuel.stock.toFixed(3)} kg</Text>
            <br />
            <Text type="secondary">{t('inventory.outbound.currentPrice', '当前单价')}：¥{selectedFuel.price.toFixed(2)}/kg</Text>
          </div>
        )}

        <Form.Item name="quantity" label={t('inventory.outbound.lossQuantity', '损耗量(kg)')} rules={[{ required: true, message: t('inventory.outbound.quantityRequired', '请输入损耗量') }]}>
          <InputNumber min={0.001} max={selectedFuel?.stock ?? 99999} precision={3} style={{ width: '100%' }} addonAfter="kg" />
        </Form.Item>

        {autoAmount != null && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">{t('inventory.outbound.amount', '金额(元)')}：</Text>
            <Text>¥{autoAmount.toFixed(2)}</Text>
          </div>
        )}

        {isOverStock && (
          <div style={{ marginBottom: 16, padding: 8, background: '#fff1f0', borderRadius: 4, border: '1px solid #ffa39e' }}>
            <Text type="danger" style={{ fontSize: 12 }}>
              {t('inventory.outbound.overStockError', `损耗量不能超过当前理论库存 (${selectedFuel?.stock.toFixed(3)} kg)`)}
            </Text>
          </div>
        )}

        {isLargeAmount && !isOverStock && (
          <div style={{ marginBottom: 16, padding: 8, background: '#fff7e6', borderRadius: 4, border: '1px solid #ffd591' }}>
            <Text type="warning" style={{ fontSize: 12 }}>
              ⚠️ {t('inventory.outbound.largeAmountWarning', '损耗量较大，请确认数据准确性')}
            </Text>
          </div>
        )}

        <Form.Item name="lossReason" label={t('inventory.outbound.lossReason', '损耗原因')} rules={[{ required: true, message: t('inventory.outbound.reasonRequired', '请选择损耗原因') }]}>
          <Select
            placeholder={t('inventory.outbound.selectReason', '请选择损耗原因')}
            options={Object.entries(LOSS_REASON_CONFIG).map(([key, cfg]) => ({ value: key, label: getLabel(cfg) }))}
          />
        </Form.Item>

        <Form.Item
          name="reasonDetail"
          label={t('inventory.outbound.reasonDetail', '原因说明')}
          rules={lossReason === 'other' ? [{ required: true, message: t('inventory.outbound.detailRequired', '选择"其他"时必须填写原因说明') }] : []}
        >
          <TextArea maxLength={500} showCount rows={3} placeholder={t('inventory.outbound.detailPlaceholder', '请描述具体原因')} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default LossOutboundDrawer;
