// M02: RefundModal — 退款申请弹窗
import React, { useEffect } from 'react';
import { Modal, Form, Radio, InputNumber, Input, Button, Space, message, Popconfirm } from 'antd';
import { useTranslation } from 'react-i18next';
import type { FuelingOrder, RefundForm } from '../types';

interface RefundModalProps {
  open: boolean;
  onClose: () => void;
  order: FuelingOrder | null;
  onSuccess: () => void;
}

const RefundModal: React.FC<RefundModalProps> = ({ open, onClose, order, onSuccess }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<RefundForm>();
  const refundType = Form.useWatch('refundType', form);

  const payableAmount = order?.payableAmount ?? 0;
  const isFullRefund = refundType === 'full' || refundType == null;

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({
        refundType: 'full',
        refundAmount: order?.payableAmount ?? 0,
      });
    }
  }, [open, order, form]);

  // When switching to full refund, auto-fill the payable amount
  useEffect(() => {
    if (refundType === 'full') {
      form.setFieldValue('refundAmount', payableAmount);
    } else if (refundType === 'partial') {
      form.setFieldValue('refundAmount', undefined);
    }
  }, [refundType, payableAmount, form]);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      message.success(t('refund.submitSuccess', '退款申请已提交，等待审批'));
      onSuccess();
      onClose();
    } catch {
      // validation failed, stay open
    }
  };

  return (
    <Modal
      title={t('refund.title', '申请退款')}
      open={open}
      onCancel={onClose}
      width={480}
      maskClosable={false}
      footer={
        <Space>
          <Button onClick={onClose}>{t('common.cancel', '取消')}</Button>
          <Popconfirm
            title={t('refund.popconfirmTitle', '确认提交退款申请？')}
            description={t('refund.popconfirmDesc', '退款将等待审批。')}
            onConfirm={handleSubmit}
            okText={t('common.confirm', '确认')}
            cancelText={t('common.cancel', '取消')}
            okButtonProps={{ danger: true }}
          >
            <Button danger type="primary">
              {t('refund.submit', '提交退款申请')}
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      {order && (
        <Form
          form={form}
          layout="vertical"
          initialValues={{ refundType: 'full', refundAmount: order.payableAmount }}
        >
          {/* 退款类型 */}
          <Form.Item
            name="refundType"
            label={t('refund.refundType', '退款类型')}
            rules={[{ required: true, message: t('refund.refundTypeRequired', '请选择退款类型') }]}
          >
            <Radio.Group>
              <Radio value="full">{t('refund.full', '全额退款')}</Radio>
              <Radio value="partial">{t('refund.partial', '部分退款')}</Radio>
            </Radio.Group>
          </Form.Item>

          {/* 退款金额 */}
          <Form.Item
            name="refundAmount"
            label={t('refund.refundAmount', '退款金额')}
            rules={[
              { required: true, message: t('refund.refundAmountRequired', '请输入退款金额') },
              {
                validator: (_, value) => {
                  if (value == null) return Promise.resolve();
                  if (value <= 0) return Promise.reject(new Error(t('refund.amountPositive', '退款金额须大于0')));
                  if (value > payableAmount) return Promise.reject(new Error(t('refund.amountExceeds', `退款金额不能超过 ¥${payableAmount.toFixed(2)}`)));
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              prefix="¥"
              min={0.01}
              max={payableAmount}
              precision={2}
              step={0.01}
              style={{ width: '100%' }}
              disabled={isFullRefund}
              placeholder="0.00"
            />
          </Form.Item>

          {/* 可退金额提示 */}
          <div
            style={{
              background: '#fff7e6',
              border: '1px solid #ffd591',
              borderRadius: 6,
              padding: '8px 12px',
              marginBottom: 20,
              fontSize: 13,
              color: '#d48806',
            }}
          >
            {t('refund.maxRefundable', '可退金额')}:{' '}
            <strong>¥{payableAmount.toFixed(2)}</strong>
          </div>

          {/* 退款原因 */}
          <Form.Item
            name="refundReason"
            label={t('refund.refundReason', '退款原因')}
            rules={[
              { required: true, message: t('refund.refundReasonRequired', '请填写退款原因') },
              { max: 500, message: t('refund.refundReasonMax', '退款原因最多500个字符') },
            ]}
          >
            <Input.TextArea
              rows={4}
              maxLength={500}
              showCount
              placeholder={t('refund.refundReasonPlaceholder', '请详细描述退款原因...')}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default RefundModal;
