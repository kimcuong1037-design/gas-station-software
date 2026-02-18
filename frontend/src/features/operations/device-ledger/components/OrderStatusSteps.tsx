// 工单状态步骤条组件
import React from 'react';
import { Steps } from 'antd';
import {
  ClockCircleOutlined,
  LoadingOutlined,
  AuditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { OrderStatus } from '../types';
import { ORDER_STATUS_CONFIG, getLabel } from '../constants';

interface OrderStatusStepsProps {
  status: OrderStatus;
  records?: Array<{ action: string; timestamp: string }>;
}

const statusSteps: { status: OrderStatus; icon: React.ReactNode }[] = [
  { status: 'pending', icon: <ClockCircleOutlined /> },
  { status: 'processing', icon: <LoadingOutlined /> },
  { status: 'pending_review', icon: <AuditOutlined /> },
  { status: 'completed', icon: <CheckCircleOutlined /> },
];

const actionToStatusMap: Record<string, OrderStatus> = {
  created: 'pending',
  started: 'processing',
  submitted_review: 'pending_review',
  approved: 'completed',
  closed: 'closed',
};

const OrderStatusSteps: React.FC<OrderStatusStepsProps> = ({ status, records }) => {
  const currentStep = ORDER_STATUS_CONFIG[status]?.step ?? 0;

  const getTimestamp = (targetStatus: OrderStatus): string | undefined => {
    if (!records) return undefined;
    const targetAction = Object.entries(actionToStatusMap).find(([, s]) => s === targetStatus)?.[0];
    if (!targetAction) return undefined;
    const record = records.find((r) => r.action === targetAction);
    return record?.timestamp
      ? new Date(record.timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      : undefined;
  };

  return (
    <Steps
      current={currentStep}
      size="small"
      items={statusSteps.map((step) => ({
        title: getLabel(ORDER_STATUS_CONFIG[step.status]),
        icon: step.icon,
        description: getTimestamp(step.status),
      }))}
    />
  );
};

export default OrderStatusSteps;
