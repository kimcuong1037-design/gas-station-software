// M01: PaymentModal — 支付弹窗
import React, { useState, useEffect } from 'react';
import { Modal, InputNumber, Button, Space, message, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { FuelingOrder } from '../types';
import type { PaymentMethod } from '../types';
import { PAYMENT_METHOD_CONFIG, getLabel } from '../constants';

const { Title, Text } = Typography;

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  order: FuelingOrder | null;
  onSuccess: () => void;
}

const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'wechat', 'alipay', 'unionpay'];

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onClose, order, onSuccess }) => {
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [receivedAmount, setReceivedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (open) {
      setSelectedMethod(null);
      setReceivedAmount(null);
      setLoading(false);
      setCountdown(300);
    }
  }, [open]);

  // Countdown timer for electronic payment
  useEffect(() => {
    if (!open || !selectedMethod || selectedMethod === 'cash') return;
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [open, selectedMethod, countdown]);

  const payableAmount = order?.payableAmount ?? 0;
  const isCash = selectedMethod === 'cash';
  const isElectronic = selectedMethod && selectedMethod !== 'cash';
  const change = isCash && receivedAmount != null ? receivedAmount - payableAmount : 0;
  const changeDisplay = change >= 0 ? change.toFixed(2) : '0.00';

  const canConfirm = (() => {
    if (!selectedMethod) return false;
    if (isCash) return receivedAmount != null && receivedAmount >= payableAmount;
    return true; // electronic: method selected is enough
  })();

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setLoading(true);
    // Simulate async payment processing
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    message.success(t('payment.success', '支付成功'));
    onSuccess();
    onClose();
  };

  return (
    <Modal
      title={t('payment.title', '收款')}
      open={open}
      onCancel={onClose}
      width={520}
      maskClosable={false}
      footer={
        <Space>
          <Button onClick={onClose}>{t('common.cancel', '取消')}</Button>
          <Button
            type="primary"
            disabled={!canConfirm}
            loading={loading}
            onClick={handleConfirm}
          >
            {t('payment.confirm', '确认支付')}
          </Button>
        </Space>
      }
    >
      {order && (
        <>
          {/* Header: amount display */}
          <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 13, color: '#8c8c8c', marginBottom: 4 }}>
              {t('payment.payable', '应收金额')}
            </div>
            <Title level={2} style={{ margin: 0, color: '#1677ff', letterSpacing: 1 }}>
              ¥ {payableAmount.toFixed(2)}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {order.nozzleNo} · {order.fuelTypeName} · {order.quantity.toFixed(2)}{order.fuelUnit}
            </Text>
          </div>

          {/* Payment method grid */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#595959', marginBottom: 10 }}>
              {t('payment.method', '支付方式')}
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              {PAYMENT_METHODS.map((method) => {
                const config = PAYMENT_METHOD_CONFIG[method];
                const isSelected = selectedMethod === method;
                return (
                  <button
                    key={method}
                    onClick={() => setSelectedMethod(method)}
                    style={{
                      width: '100%',
                      height: 60,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid #1677ff' : '1px solid #d9d9d9',
                      borderRadius: 8,
                      background: isSelected ? '#e6f4ff' : '#fafafa',
                      transition: 'all 0.2s',
                      gap: 4,
                      outline: 'none',
                    }}
                  >
                    <span style={{ fontSize: 22, lineHeight: 1 }}>{config.icon}</span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? '#1677ff' : '#262626',
                      }}
                    >
                      {getLabel(config)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash mode */}
          {isCash && (
            <div
              style={{
                background: '#fafafa',
                borderRadius: 8,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#595959', flexShrink: 0 }}>
                  {t('payment.received', '实收金额')}
                </span>
                <InputNumber
                  value={receivedAmount}
                  onChange={(v) => setReceivedAmount(v)}
                  prefix="¥"
                  min={0}
                  precision={2}
                  step={0.01}
                  style={{ width: 180 }}
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#595959' }}>
                  {t('payment.change', '找零')}
                </span>
                <span
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: change >= 0 ? '#52c41a' : '#ff4d4f',
                    fontFamily: 'monospace',
                  }}
                >
                  ¥ {changeDisplay}
                </span>
              </div>
            </div>
          )}

          {/* Electronic payment mode */}
          {isElectronic && (
            <div
              style={{
                background: '#f6ffed',
                border: '1px dashed #b7eb8f',
                borderRadius: 8,
                padding: '20px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 15, color: '#595959', marginBottom: 12 }}>
                {t('payment.waitingConfirm', '等待支付确认...')}
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: countdown <= 0 ? '#ff4d4f' : '#1677ff',
                  letterSpacing: 2,
                  marginBottom: 16,
                }}
              >
                {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
              </div>
              {countdown <= 0 && (
                <div style={{ fontSize: 13, color: '#ff4d4f', marginBottom: 8 }}>
                  {t('payment.timeout', '支付超时，请重新发起')}
                </div>
              )}
              <Button
                size="small"
                type="default"
                style={{ borderColor: '#52c41a', color: '#52c41a' }}
                disabled={countdown <= 0}
                onClick={handleConfirm}
              >
                {t('payment.confirmReceived', '确认收到')}
              </Button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default PaymentModal;
