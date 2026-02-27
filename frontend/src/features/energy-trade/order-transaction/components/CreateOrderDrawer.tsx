import React, { useState } from 'react';
import {
  Drawer,
  Form,
  Select,
  Input,
  InputNumber,
  Button,
  Space,
  message,
} from 'antd';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;

// Inline mock nozzle data (no external import needed for Phase 2)
const mockNozzles = [
  { id: 'nozzle-001', nozzleNo: '01', fuelTypeName: 'LNG',   fuelUnit: 'kg', unitPrice: 4.80 },
  { id: 'nozzle-002', nozzleNo: '02', fuelTypeName: 'CNG',   fuelUnit: 'm³', unitPrice: 3.50 },
  { id: 'nozzle-003', nozzleNo: '03', fuelTypeName: 'LNG',   fuelUnit: 'kg', unitPrice: 4.80 },
  { id: 'nozzle-004', nozzleNo: '04', fuelTypeName: 'L-CNG', fuelUnit: 'kg', unitPrice: 4.20 },
];

interface NozzleOption {
  id: string;
  nozzleNo: string;
  fuelTypeName: string;
  fuelUnit: string;
  unitPrice: number;
}

interface CreateOrderDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreateOrderFormValues {
  nozzleId: string;
  quantity: number;
  vehiclePlateNo?: string;
  notes?: string;
}

const CreateOrderDrawer: React.FC<CreateOrderDrawerProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<CreateOrderFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [selectedNozzle, setSelectedNozzle] = useState<NozzleOption | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);

  const handleNozzleChange = (nozzleId: string) => {
    const nozzle = mockNozzles.find((n) => n.id === nozzleId) ?? null;
    setSelectedNozzle(nozzle);
    // Reset quantity and recalculate
    form.setFieldsValue({ quantity: undefined });
    setQuantity(null);
  };

  const handleQuantityChange = (value: number | null) => {
    setQuantity(value);
  };

  const computedAmount =
    selectedNozzle && quantity != null && quantity > 0
      ? (selectedNozzle.unitPrice * quantity).toFixed(2)
      : '';

  const handleClose = () => {
    form.resetFields();
    setSelectedNozzle(null);
    setQuantity(null);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setSubmitting(true);
      // Simulate async API call
      await new Promise<void>((resolve) => setTimeout(resolve, 500));
      message.success(t('order.create.success', '订单创建成功'));
      form.resetFields();
      setSelectedNozzle(null);
      setQuantity(null);
      onSuccess();
      onClose();
    } catch {
      // Validation errors are shown inline by Ant Design Form
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      title={t('order.create.title', '新建订单')}
      open={open}
      onClose={handleClose}
      width={480}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleClose}>
              {t('common.cancel', '取消')}
            </Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              {t('order.create.submit', '创建订单')}
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark
      >
        {/* 枪号 */}
        <Form.Item
          name="nozzleId"
          label={t('order.field.nozzleNo', '枪号')}
          rules={[{ required: true, message: t('order.create.nozzleRequired', '请选择枪号') }]}
        >
          <Select
            placeholder={t('order.create.selectNozzle', '请选择加气枪')}
            onChange={handleNozzleChange}
            options={mockNozzles.map((n) => ({
              value: n.id,
              label: `${n.nozzleNo} 号枪 — ${n.fuelTypeName}`,
            }))}
          />
        </Form.Item>

        {/* 燃料类型（只读，自动填充） */}
        <Form.Item label={t('order.field.fuelType', '燃料类型')}>
          <Input
            readOnly
            value={selectedNozzle?.fuelTypeName ?? ''}
            placeholder={t('order.create.autoFill', '选择枪号后自动填充')}
            style={{ backgroundColor: '#fafafa', cursor: 'default' }}
          />
        </Form.Item>

        {/* 当前单价（只读，自动填充） */}
        <Form.Item label={t('order.field.unitPrice', '当前单价')}>
          <Input
            readOnly
            value={
              selectedNozzle
                ? `¥${selectedNozzle.unitPrice.toFixed(2)}/${selectedNozzle.fuelUnit}`
                : ''
            }
            placeholder={t('order.create.autoFill', '选择枪号后自动填充')}
            style={{ backgroundColor: '#fafafa', cursor: 'default' }}
          />
        </Form.Item>

        {/* 充装量 */}
        <Form.Item
          name="quantity"
          label={
            selectedNozzle
              ? `${t('order.field.quantity', '充装量')}（${selectedNozzle.fuelUnit}）`
              : t('order.field.quantity', '充装量')
          }
          rules={[
            { required: true, message: t('order.create.quantityRequired', '请输入充装量') },
            {
              type: 'number',
              min: 0.01,
              message: t('order.create.quantityMin', '充装量必须大于 0.01'),
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0.01}
            max={9999}
            precision={2}
            step={0.1}
            placeholder={t('order.create.quantityPlaceholder', '请输入充装量')}
            addonAfter={selectedNozzle?.fuelUnit ?? 'kg'}
            onChange={handleQuantityChange}
            disabled={!selectedNozzle}
          />
        </Form.Item>

        {/* 订单金额（只读，自动计算） */}
        <Form.Item label={t('order.field.totalAmount', '订单金额')}>
          <Input
            readOnly
            value={computedAmount ? `¥${computedAmount}` : ''}
            placeholder={t('order.create.autoCalc', '自动计算：充装量 × 单价')}
            style={{ backgroundColor: '#fafafa', cursor: 'default' }}
          />
        </Form.Item>

        {/* 车牌号（可选） */}
        <Form.Item
          name="vehiclePlateNo"
          label={t('order.field.vehiclePlate', '车牌号')}
        >
          <Input
            placeholder={t('order.create.vehiclePlaceholder', '选填，如：京A12345')}
            maxLength={10}
          />
        </Form.Item>

        {/* 备注（可选） */}
        <Form.Item
          name="notes"
          label={t('order.field.notes', '备注')}
        >
          <TextArea
            placeholder={t('order.create.notesPlaceholder', '选填，最多 200 字')}
            maxLength={200}
            showCount
            rows={3}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default CreateOrderDrawer;
