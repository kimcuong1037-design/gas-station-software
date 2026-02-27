import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Descriptions,
  Form,
  Select,
  InputNumber,
  Input,
  Radio,
  Button,
  Space,
  Tag,
  message,
  Divider,
  Typography,
} from 'antd';
import { useTranslation } from 'react-i18next';
import type { FuelingOrder, PaymentMethod } from '../types';
import {
  PAYMENT_METHOD_CONFIG,
  SUPPLEMENT_REASONS,
  getLabel,
} from '../constants';

const { TextArea } = Input;
const { Text } = Typography;

interface SupplementDrawerProps {
  open: boolean;
  onClose: () => void;
  order: FuelingOrder | null;
  onSuccess: () => void;
}

interface SupplementFormValues {
  paymentMethod: PaymentMethod;
  amount: number;
  supplementReason: string;
  supplementReasonDetail?: string;
}

const SupplementDrawer: React.FC<SupplementDrawerProps> = ({
  open,
  onClose,
  order,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<SupplementFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [showReasonDetail, setShowReasonDetail] = useState(false);

  // Reset form when order changes or drawer opens
  useEffect(() => {
    if (open && order) {
      form.setFieldsValue({
        paymentMethod: 'cash',
        amount: order.payableAmount,
        supplementReason: undefined,
        supplementReasonDetail: undefined,
      });
      setShowReasonDetail(false);
    } else {
      form.resetFields();
      setShowReasonDetail(false);
    }
  }, [open, order, form]);

  const handleReasonChange = (value: string) => {
    setShowReasonDetail(value === 'other');
    if (value !== 'other') {
      form.setFieldValue('supplementReasonDetail', undefined);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setShowReasonDetail(false);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setSubmitting(true);
      // Simulate async API call
      await new Promise<void>((resolve) => setTimeout(resolve, 500));
      message.success(t('supplement.success', '补单提交成功'));
      form.resetFields();
      setShowReasonDetail(false);
      onSuccess();
      onClose();
    } catch {
      // Validation errors are shown inline
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      title={t('supplement.title', '异常补单')}
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
              {t('supplement.submit', '提交补单')}
            </Button>
          </Space>
        </div>
      }
    >
      {order ? (
        <>
          {/* ── 1. 订单摘要（只读） ── */}
          <Descriptions
            title={t('supplement.orderSummary', '原订单信息')}
            bordered
            size="small"
            column={2}
          >
            <Descriptions.Item label={t('order.field.orderNo', '订单号')} span={2}>
              <Text code style={{ fontSize: 12 }}>
                {order.orderNo}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label={t('order.field.nozzleNo', '枪号')}>
              {order.nozzleNo} 号枪
            </Descriptions.Item>
            <Descriptions.Item label={t('order.field.fuelType', '燃料类型')}>
              {order.fuelTypeName}
            </Descriptions.Item>
            <Descriptions.Item label={t('order.field.quantity', '加注量')}>
              {order.quantity} {order.fuelUnit}
            </Descriptions.Item>
            <Descriptions.Item label={t('order.field.totalAmount', '订单金额')}>
              <Text strong>¥{order.totalAmount.toFixed(2)}</Text>
            </Descriptions.Item>
            {order.exceptionReason && (
              <Descriptions.Item
                label={t('order.field.exceptionReason', '异常原因')}
                span={2}
              >
                <Tag color="red">{order.exceptionReason}</Tag>
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider />

          {/* ── 2. 补单表单 ── */}
          <div
            style={{
              fontWeight: 600,
              marginBottom: 16,
              color: 'rgba(0,0,0,0.85)',
            }}
          >
            {t('supplement.formTitle', '补单信息')}
          </div>

          <Form
            form={form}
            layout="vertical"
            requiredMark
            initialValues={{
              paymentMethod: 'cash',
              amount: order.payableAmount,
            }}
          >
            {/* 支付方式 */}
            <Form.Item
              name="paymentMethod"
              label={t('supplement.field.paymentMethod', '支付方式')}
              rules={[
                {
                  required: true,
                  message: t(
                    'supplement.validation.paymentRequired',
                    '请选择支付方式'
                  ),
                },
              ]}
            >
              <Radio.Group>
                <Space direction="vertical" size={4}>
                  {(
                    Object.entries(PAYMENT_METHOD_CONFIG) as [
                      PaymentMethod,
                      (typeof PAYMENT_METHOD_CONFIG)[PaymentMethod]
                    ][]
                  ).map(([method, cfg]) => (
                    <Radio key={method} value={method}>
                      <Tag color={cfg.color} style={{ marginRight: 4 }}>
                        {cfg.icon} {getLabel(cfg)}
                      </Tag>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>

            {/* 实付金额 */}
            <Form.Item
              name="amount"
              label={t('supplement.field.amount', '实付金额')}
              rules={[
                {
                  required: true,
                  message: t(
                    'supplement.validation.amountRequired',
                    '请输入实付金额'
                  ),
                },
                {
                  type: 'number',
                  min: 0.01,
                  message: t(
                    'supplement.validation.amountMin',
                    '实付金额必须大于 0'
                  ),
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0.01}
                precision={2}
                step={1}
                addonBefore="¥"
                placeholder={t(
                  'supplement.field.amountPlaceholder',
                  '请输入实付金额'
                )}
              />
            </Form.Item>

            {/* 补单原因 */}
            <Form.Item
              name="supplementReason"
              label={t('supplement.field.reason', '补单原因')}
              rules={[
                {
                  required: true,
                  message: t(
                    'supplement.validation.reasonRequired',
                    '请选择补单原因'
                  ),
                },
              ]}
            >
              <Select
                placeholder={t(
                  'supplement.field.reasonPlaceholder',
                  '请选择补单原因'
                )}
                onChange={handleReasonChange}
                options={SUPPLEMENT_REASONS.map((r) => ({
                  value: r.value,
                  label: getLabel(r),
                }))}
              />
            </Form.Item>

            {/* 其他原因详情（仅当选择"其他"时显示） */}
            {showReasonDetail && (
              <Form.Item
                name="supplementReasonDetail"
                label={t('supplement.field.reasonDetail', '原因说明')}
                rules={[
                  {
                    required: true,
                    message: t(
                      'supplement.validation.reasonDetailRequired',
                      '请输入原因说明'
                    ),
                  },
                ]}
              >
                <TextArea
                  placeholder={t(
                    'supplement.field.reasonDetailPlaceholder',
                    '请详细描述补单原因'
                  )}
                  maxLength={200}
                  showCount
                  rows={3}
                />
              </Form.Item>
            )}
          </Form>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
          {t('order.detail.notFound', '暂无数据')}
        </div>
      )}
    </Drawer>
  );
};

export default SupplementDrawer;
