// 工单状态 Tag 组件
import React from 'react';
import { Tag } from 'antd';
import type { OrderStatus } from '../types';
import { ORDER_STATUS_CONFIG, getLabel } from '../constants';

interface OrderStatusTagProps {
  status: OrderStatus;
}

const OrderStatusTag: React.FC<OrderStatusTagProps> = ({ status }) => {
  const config = ORDER_STATUS_CONFIG[status];
  if (!config) return null;
  return <Tag color={config.color}>{getLabel(config)}</Tag>;
};

export default OrderStatusTag;
