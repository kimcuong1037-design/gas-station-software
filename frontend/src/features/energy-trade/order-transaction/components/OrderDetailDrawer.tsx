import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Descriptions,
  Steps,
  Table,
  Tag,
  Button,
  Space,
  Spin,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import type { FuelingOrder, PaymentRecord, RefundRecord } from '../types';
import {
  ORDER_STATUS_CONFIG,
  PAYMENT_METHOD_CONFIG,
  REFUND_STATUS_CONFIG,
  getLabel,
} from '../constants';
import { getOrderDetail } from '../../../../mock/orderTransaction';

const { Text } = Typography;

interface OrderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
  onPayment: (order: FuelingOrder) => void;
  onRefund: (order: FuelingOrder) => void;
}

// Map order status to step index
const STATUS_STEP_MAP: Record<string, number> = {
  filling: 0,
  pending_payment: 1,
  paid: 2,
  completed: 3,
  cancelled: 1,
  exception: 1,
  suspended: 1,
  refunded: 2,
  closed: 3,
};

const STEPS_CONFIG = [
  { title: '创建' },
  { title: '加注完成' },
  { title: '支付完成' },
  { title: '完成' },
];

const paymentColumns: ColumnsType<PaymentRecord> = [
  {
    title: '支付方式',
    dataIndex: 'paymentMethod',
    key: 'paymentMethod',
    render: (method: keyof typeof PAYMENT_METHOD_CONFIG) => {
      const cfg = PAYMENT_METHOD_CONFIG[method];
      return cfg ? (
        <Tag color={cfg.color}>
          {cfg.icon} {getLabel(cfg)}
        </Tag>
      ) : method;
    },
  },
  {
    title: '金额',
    dataIndex: 'amount',
    key: 'amount',
    render: (v: number) => `¥${v.toFixed(2)}`,
  },
  {
    title: '交易流水号',
    dataIndex: 'transactionRef',
    key: 'transactionRef',
    render: (v?: string) => v ?? '—',
  },
  {
    title: '支付时间',
    dataIndex: 'paidAt',
    key: 'paidAt',
    render: (v?: string) =>
      v ? new Date(v).toLocaleString('zh-CN', { hour12: false }) : '—',
  },
];

const refundColumns: ColumnsType<RefundRecord> = [
  {
    title: '退款类型',
    dataIndex: 'refundType',
    key: 'refundType',
    render: (v: string) => (v === 'full' ? '全额' : '部分'),
  },
  {
    title: '退款金额',
    dataIndex: 'refundAmount',
    key: 'refundAmount',
    render: (v: number) => `¥${v.toFixed(2)}`,
  },
  {
    title: '退款原因',
    dataIndex: 'refundReason',
    key: 'refundReason',
  },
  {
    title: '状态',
    dataIndex: 'refundStatus',
    key: 'refundStatus',
    render: (status: keyof typeof REFUND_STATUS_CONFIG) => {
      const cfg = REFUND_STATUS_CONFIG[status];
      return cfg ? <Tag color={cfg.color}>{getLabel(cfg)}</Tag> : status;
    },
  },
  {
    title: '申请人',
    dataIndex: 'applicantName',
    key: 'applicantName',
  },
  {
    title: '退款时间',
    dataIndex: 'refundedAt',
    key: 'refundedAt',
    render: (v?: string) =>
      v ? new Date(v).toLocaleString('zh-CN', { hour12: false }) : '—',
  },
];

const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  open,
  onClose,
  orderId,
  onPayment,
  onRefund,
}) => {
  const { t } = useTranslation();
  const [order, setOrder] = useState<FuelingOrder | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && orderId) {
      setLoading(true);
      // Simulate async load
      setTimeout(() => {
        const detail = getOrderDetail(orderId) ?? null;
        setOrder(detail);
        setLoading(false);
      }, 200);
    } else {
      setOrder(null);
    }
  }, [open, orderId]);

  const statusCfg = order ? ORDER_STATUS_CONFIG[order.orderStatus] : null;
  const currentStep = order ? (STATUS_STEP_MAP[order.orderStatus] ?? 0) : 0;
  const isException =
    order?.orderStatus === 'exception' ||
    order?.orderStatus === 'suspended';

  const renderFooter = () => {
    if (!order) return null;

    const { orderStatus } = order;

    if (orderStatus === 'pending_payment') {
      return (
        <Space>
          <Button type="primary" onClick={() => onPayment(order)}>
            {t('order.action.pay', '收银')}
          </Button>
          <Button>{t('order.action.cancel', '取消订单')}</Button>
        </Space>
      );
    }

    if (orderStatus === 'paid' || orderStatus === 'completed') {
      return (
        <Space>
          <Button danger type="text" onClick={() => onRefund(order)}>
            {t('order.action.refund', '退款')}
          </Button>
          <Button>{t('order.action.addNote', '添加备注')}</Button>
        </Space>
      );
    }

    if (isException) {
      return (
        <Space>
          <Button type="primary">
            {t('order.action.supplement', '补单')}
          </Button>
          <Button>{t('order.action.suspend', '挂起')}</Button>
        </Space>
      );
    }

    return null;
  };

  return (
    <Drawer
      title={t('order.detail.title', '订单详情')}
      open={open}
      onClose={onClose}
      width={640}
      footer={
        <div style={{ textAlign: 'right', padding: '4px 0' }}>
          {renderFooter()}
        </div>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
        </div>
      ) : !order ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
          {t('order.detail.notFound', '暂无数据')}
        </div>
      ) : (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          {/* ── 1. 订单流程步骤 ── */}
          <Steps
            current={currentStep}
            items={STEPS_CONFIG}
            status={isException ? 'error' : undefined}
            size="small"
          />

          {/* ── 2. 基本信息 ── */}
          <Descriptions
            title={t('order.detail.basic', '基本信息')}
            bordered
            size="small"
            column={2}
          >
            <Descriptions.Item label={t('order.field.orderNo', '订单号')} span={2}>
              {order.orderNo}
            </Descriptions.Item>
            <Descriptions.Item label={t('order.field.createdAt', '创建时间')}>
              {new Date(order.createdAt).toLocaleString('zh-CN', { hour12: false })}
            </Descriptions.Item>
            <Descriptions.Item label={t('order.field.nozzleNo', '枪号')}>
              {order.nozzleNo} 号枪
            </Descriptions.Item>
            <Descriptions.Item label={t('order.field.fuelType', '燃料类型')}>
              {order.fuelTypeName}
            </Descriptions.Item>
            <Descriptions.Item label={t('order.field.status', '订单状态')}>
              {statusCfg ? (
                <Tag color={statusCfg.color}>{getLabel(statusCfg)}</Tag>
              ) : (
                order.orderStatus
              )}
            </Descriptions.Item>
            <Descriptions.Item label={t('order.field.operator', '操作员')} span={2}>
              {order.operatorName ?? '—'}
            </Descriptions.Item>
          </Descriptions>

          {/* ── 3. 加注明细 ── */}
          <Descriptions
            title={t('order.detail.fueling', '加注明细')}
            bordered
            size="small"
            column={2}
          >
            <Descriptions.Item label={t('order.field.quantity', '加注量')}>
              {order.quantity} {order.fuelUnit}
            </Descriptions.Item>
            <Descriptions.Item label={t('order.field.unitPrice', '单价')}>
              ¥{order.unitPrice.toFixed(2)}/{order.fuelUnit}
            </Descriptions.Item>
            <Descriptions.Item label={t('order.field.totalAmount', '订单金额')} span={2}>
              <Text strong style={{ fontSize: 16 }}>
                ¥{order.totalAmount.toFixed(2)}
              </Text>
            </Descriptions.Item>
          </Descriptions>

          {/* ── 4. 支付记录 ── */}
          {(order.paymentRecords?.length ?? 0) > 0 && (
            <div>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 8,
                  color: 'rgba(0,0,0,0.85)',
                }}
              >
                {t('order.detail.payments', '支付记录')}
              </div>
              <Table<PaymentRecord>
                dataSource={order.paymentRecords}
                columns={paymentColumns}
                rowKey="id"
                size="small"
                pagination={false}
              />
            </div>
          )}

          {/* ── 5. 优惠信息（仅当 discountAmount > 0 时展示） ── */}
          {order.discountAmount > 0 && (
            <Descriptions
              title={t('order.detail.discount', '优惠信息')}
              bordered
              size="small"
              column={2}
            >
              <Descriptions.Item label={t('order.field.discountAmount', '优惠金额')}>
                <Text type="success">-¥{order.discountAmount.toFixed(2)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={t('order.field.payableAmount', '实付金额')}>
                <Text strong>¥{order.payableAmount.toFixed(2)}</Text>
              </Descriptions.Item>
            </Descriptions>
          )}

          {/* ── 6. 会员信息（Phase 4 依赖） ── */}
          <Descriptions
            title={
              <span>
                {t('order.detail.member', '会员信息')}{' '}
                <Text type="warning" style={{ fontSize: 12, fontWeight: 400 }}>
                  ⚠️ Phase 4 依赖
                </Text>
              </span>
            }
            bordered
            size="small"
            column={2}
          >
            <Descriptions.Item label={t('order.field.memberName', '会员姓名')}>
              {order.memberName ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('order.field.memberPhone', '会员手机')}>
              {order.memberPhone ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('order.field.memberTier', '会员等级')} span={2}>
              {order.memberTier ? (
                <Tag color="gold">{order.memberTier.toUpperCase()}</Tag>
              ) : (
                '—'
              )}
            </Descriptions.Item>
          </Descriptions>

          {/* ── 7. 车辆信息（Phase 4 依赖） ── */}
          <Descriptions
            title={
              <span>
                {t('order.detail.vehicle', '车辆信息')}{' '}
                <Text type="warning" style={{ fontSize: 12, fontWeight: 400 }}>
                  ⚠️ Phase 4 依赖
                </Text>
              </span>
            }
            bordered
            size="small"
            column={2}
          >
            <Descriptions.Item label={t('order.field.vehiclePlate', '车牌号')} span={2}>
              {order.vehiclePlateNo ? (
                <Tag>{order.vehiclePlateNo}</Tag>
              ) : (
                '—'
              )}
            </Descriptions.Item>
          </Descriptions>

          {/* ── 8. 标签 & 备注 ── */}
          {((order.tags?.length ?? 0) > 0 || order.notes) && (
            <Descriptions
              title={t('order.detail.tagsNotes', '标签与备注')}
              bordered
              size="small"
              column={1}
            >
              {(order.tags?.length ?? 0) > 0 && (
                <Descriptions.Item label={t('order.field.tags', '标签')}>
                  <Space size={4} wrap>
                    {order.tags!.map((tag) => (
                      <Tag key={tag.id} color="blue">
                        {tag.tagName}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
              {order.notes && (
                <Descriptions.Item label={t('order.field.notes', '备注')}>
                  {order.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}

          {/* ── 9. 退款记录 ── */}
          {(order.refundRecords?.length ?? 0) > 0 && (
            <div>
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 8,
                  color: 'rgba(0,0,0,0.85)',
                }}
              >
                {t('order.detail.refunds', '退款记录')}
              </div>
              <Table<RefundRecord>
                dataSource={order.refundRecords}
                columns={refundColumns}
                rowKey="id"
                size="small"
                pagination={false}
              />
            </div>
          )}
        </Space>
      )}
    </Drawer>
  );
};

export default OrderDetailDrawer;
