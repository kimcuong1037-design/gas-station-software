import React, { useMemo, useState } from 'react';
import { Button, DatePicker, Drawer, Form, Input, InputNumber, message, Select, Space, Typography } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
interface LayoutContext {
  selectedStationId: string;
}
import type { CreateInboundForm } from '../types';

const { Text } = Typography;
const { TextArea } = Input;

interface CreateInboundDrawerProps {
  open: boolean;
  onClose: () => void;
}

const tankOptions = [
  { value: 'equip-tank-001', label: 'LNG储罐-01', fuelType: 'LNG', fuelTypeId: 'ft-lng', capacity: 20000, currentLevel: 15230.5 },
  { value: 'equip-tank-002', label: 'CNG储罐-01', fuelType: 'CNG', fuelTypeId: 'ft-cng', capacity: 10000, currentLevel: 8520.0 },
  { value: 'equip-tank-003', label: 'L-CNG储罐-01', fuelType: 'L-CNG', fuelTypeId: 'ft-lcng', capacity: 20000, currentLevel: 5461.5 },
];

const CreateInboundDrawer: React.FC<CreateInboundDrawerProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { selectedStationId } = useOutletContext<LayoutContext>();
  const [form] = Form.useForm<CreateInboundForm>();
  const [selectedTankId, setSelectedTankId] = useState<string>('');

  void selectedStationId;

  const selectedTank = useMemo(() => tankOptions.find(t => t.value === selectedTankId), [selectedTankId]);
  const plannedQty = Form.useWatch('plannedQuantity', form);
  const actualQty = Form.useWatch('actualQuantity', form);

  const variance = plannedQty && actualQty ? actualQty - plannedQty : null;
  const varianceRate = plannedQty && variance != null ? (variance / plannedQty) * 100 : null;
  const remainingCapacity = selectedTank ? selectedTank.capacity - selectedTank.currentLevel : null;
  const isOverCapacity = remainingCapacity != null && actualQty && actualQty > remainingCapacity;

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      message.success(t('inventory.inbound.submitted', '入库单已提交，等待审核'));
      form.resetFields();
      setSelectedTankId('');
      onClose();
    } catch {
      // validation errors shown by form
    }
  };

  const handleClose = () => {
    form.resetFields();
    setSelectedTankId('');
    onClose();
  };

  return (
    <Drawer
      title={t('inventory.inbound.createInbound', '新增入库')}
      open={open}
      onClose={handleClose}
      width={480}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={handleClose}>{t('inventory.action.cancel', '取消')}</Button>
          <Button type="primary" onClick={handleSubmit}>{t('inventory.inbound.submitInbound', '提交入库单')}</Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item name="tankId" label={t('inventory.inbound.targetTank', '目标储罐')} rules={[{ required: true, message: t('inventory.inbound.tankRequired', '请选择储罐') }]}>
          <Select
            placeholder={t('inventory.inbound.selectTank', '请选择储罐')}
            options={tankOptions.map(o => ({ value: o.value, label: o.label }))}
            onChange={v => setSelectedTankId(v)}
          />
        </Form.Item>

        {selectedTank && (
          <div style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 8 }}>
            <div><Text type="secondary">{t('inventory.field.fuelType', '燃料类型')}：</Text><Text>{selectedTank.fuelType}</Text></div>
            <div><Text type="secondary">{t('inventory.card.actualLevel', '当前罐存')}：</Text><Text>{selectedTank.currentLevel.toLocaleString()} kg</Text></div>
            <div><Text type="secondary">{t('inventory.inbound.remainingCapacity', '剩余容量')}：</Text><Text>{remainingCapacity?.toLocaleString()} kg</Text></div>
          </div>
        )}

        <Form.Item name="supplierName" label={t('inventory.inbound.supplier', '供应商')} rules={[{ required: true, message: t('inventory.inbound.supplierRequired', '请输入供应商') }]}>
          <Input maxLength={100} placeholder={t('inventory.inbound.supplierPlaceholder', '请输入供应商名称')} />
        </Form.Item>

        <Form.Item name="deliveryNo" label={t('inventory.inbound.deliveryNo', '送货单号')}>
          <Input maxLength={50} placeholder={t('inventory.inbound.deliveryNoPlaceholder', '可选填')} />
        </Form.Item>

        <Form.Item name="plannedQuantity" label={t('inventory.inbound.plannedQuantity', '计划量(kg)')} rules={[{ required: true, message: t('inventory.inbound.plannedRequired', '请输入计划量') }]}>
          <InputNumber min={0.001} max={99999} precision={3} style={{ width: '100%' }} addonAfter="kg" />
        </Form.Item>

        <Form.Item name="actualQuantity" label={t('inventory.inbound.actualQuantity', '实收量(kg)')} rules={[{ required: true, message: t('inventory.inbound.actualRequired', '请输入实收量') }]}>
          <InputNumber min={0.001} max={99999} precision={3} style={{ width: '100%' }} addonAfter="kg" />
        </Form.Item>

        <Form.Item name="inboundTime" label={t('inventory.inbound.inboundTime', '入库时间')} rules={[{ required: true, message: t('inventory.inbound.timeRequired', '请选择入库时间') }]}>
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="remark" label={t('inventory.field.remark', '备注')}>
          <TextArea maxLength={200} showCount rows={2} placeholder={t('inventory.field.remarkPlaceholder', '可选填')} />
        </Form.Item>
      </Form>

      {variance != null && varianceRate != null && (
        <div style={{ padding: 12, background: '#fafafa', borderRadius: 8, marginBottom: 12 }}>
          <Text strong>{t('inventory.inbound.variance', '入库偏差')}</Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">{t('inventory.inbound.varianceQuantity', '偏差量')}：</Text>
            <Text style={{ color: variance >= 0 ? '#52c41a' : '#ff4d4f' }}>{variance >= 0 ? '+' : ''}{variance.toFixed(3)} kg</Text>
          </div>
          <div>
            <Text type="secondary">{t('inventory.inbound.varianceRate', '偏差率')}：</Text>
            <Text style={{ color: variance >= 0 ? '#52c41a' : '#ff4d4f' }}>{varianceRate >= 0 ? '+' : ''}{varianceRate.toFixed(2)}%</Text>
          </div>
          {variance < 0 && (
            <div style={{ marginTop: 4 }}>
              <Text type="warning" style={{ fontSize: 12 }}>
                ⚠️ {t('inventory.inbound.transportLossNote', '运输损耗')} {Math.abs(variance).toFixed(3)} kg，{t('inventory.inbound.accountsFor', '占计划量')} {Math.abs(varianceRate).toFixed(2)}%
              </Text>
            </div>
          )}
        </div>
      )}

      {isOverCapacity && (
        <div style={{ padding: 8, background: '#fff7e6', borderRadius: 4, border: '1px solid #ffd591' }}>
          <WarningOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
          <Text type="warning" style={{ fontSize: 12 }}>
            {t('inventory.inbound.overCapacity', '超出储罐剩余容量')} ({t('inventory.inbound.remaining', '剩余')} {remainingCapacity?.toFixed(0)} kg)
          </Text>
        </div>
      )}
    </Drawer>
  );
};

export default CreateInboundDrawer;
