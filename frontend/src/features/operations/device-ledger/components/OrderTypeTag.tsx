// 工单类型 Tag 组件
import React from 'react';
import { Tag } from 'antd';
import type { OrderType } from '../types';
import { ORDER_TYPE_CONFIG, getLabel } from '../constants';

interface OrderTypeTagProps {
  type: OrderType;
}

const OrderTypeTag: React.FC<OrderTypeTagProps> = ({ type }) => {
  const config = ORDER_TYPE_CONFIG[type];
  if (!config) return null;
  return <Tag color={config.color}>{getLabel(config)}</Tag>;
};

export default OrderTypeTag;
