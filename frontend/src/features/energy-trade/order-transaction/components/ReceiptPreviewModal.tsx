// M03: ReceiptPreviewModal — 小票预览弹窗
import React from 'react';
import { Modal, Button, Space, Divider, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import type { FuelingOrder } from '../types';
import { PAYMENT_METHOD_CONFIG, getLabel } from '../constants';

interface ReceiptPreviewModalProps {
  open: boolean;
  onClose: () => void;
  order: FuelingOrder | null;
}

const STATION_NAME = '北京朝阳加气站';

const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({ open, onClose, order }) => {
  const { t } = useTranslation();

  const firstPayment = order?.paymentRecords?.[0];
  const paymentMethodLabel = firstPayment
    ? getLabel(PAYMENT_METHOD_CONFIG[firstPayment.paymentMethod])
    : '—';

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch {
      return iso;
    }
  };

  return (
    <Modal
      title={t('receipt.title', '小票预览')}
      open={open}
      onCancel={onClose}
      width={400}
      footer={
        <Space>
          <Button onClick={onClose}>{t('common.close', '关闭')}</Button>
          <Button onClick={() => window.print()}>
            {t('receipt.print', '打印')}
          </Button>
        </Space>
      }
    >
      {order && (
        <div
          style={{
            maxWidth: 280,
            margin: '0 auto',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 13,
            lineHeight: 1.7,
            background: '#fff',
            padding: '20px 16px',
            border: '1px solid #e8e8e8',
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {/* Station header */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
              {STATION_NAME}
            </div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
              {t('receipt.receipt', '销售小票')}
            </div>
          </div>

          <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />

          {/* Order info */}
          <ReceiptRow label={t('receipt.orderNo', '单号')} value={order.orderNo} />
          <ReceiptRow label={t('receipt.time', '时间')} value={formatDateTime(order.createdAt)} />

          <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />

          {/* Fueling details */}
          <ReceiptRow label={t('receipt.nozzle', '枪号')} value={order.nozzleNo} />
          <ReceiptRow label={t('receipt.fuelType', '油品')} value={order.fuelTypeName} />
          <ReceiptRow
            label={t('receipt.unitPrice', '单价')}
            value={`¥${order.unitPrice.toFixed(4)}/${order.fuelUnit}`}
          />
          <ReceiptRow
            label={t('receipt.quantity', '数量')}
            value={`${order.quantity.toFixed(2)} ${order.fuelUnit}`}
          />

          <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />

          {/* Amounts */}
          {order.discountAmount > 0 && (
            <ReceiptRow
              label={t('receipt.discount', '优惠')}
              value={`- ¥${order.discountAmount.toFixed(2)}`}
            />
          )}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              margin: '8px 0 4px',
            }}
          >
            <span style={{ fontWeight: 600 }}>{t('receipt.total', '实收')}</span>
            <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>
              ¥{order.payableAmount.toFixed(2)}
            </span>
          </div>
          <ReceiptRow label={t('receipt.paymentMethod', '方式')} value={paymentMethodLabel} />

          {/* Tags */}
          {order.tags && order.tags.length > 0 && (
            <>
              <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {order.tags.map((tag) => (
                  <Tag key={tag.id} style={{ fontFamily: 'inherit', fontSize: 11 }}>
                    {tag.tagName}
                  </Tag>
                ))}
              </div>
            </>
          )}

          {/* Notes */}
          {order.notes && (
            <>
              <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />
              <div style={{ fontSize: 11, color: '#8c8c8c', wordBreak: 'break-all' }}>
                {t('receipt.notes', '备注')}: {order.notes}
              </div>
            </>
          )}

          <Divider style={{ margin: '8px 0', borderStyle: 'dashed' }} />

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: 11, color: '#bfbfbf' }}>
            {t('receipt.thanks', '感谢惠顾，欢迎下次光临')}
          </div>
        </div>
      )}
    </Modal>
  );
};

// Helper sub-component for a single receipt row
interface ReceiptRowProps {
  label: string;
  value: string;
}

const ReceiptRow: React.FC<ReceiptRowProps> = ({ label, value }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
    }}
  >
    <span style={{ color: '#595959', flexShrink: 0 }}>{label}</span>
    <span style={{ textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
  </div>
);

export default ReceiptPreviewModal;
