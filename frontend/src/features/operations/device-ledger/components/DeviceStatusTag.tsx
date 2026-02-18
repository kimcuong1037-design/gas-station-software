// 设备状态 Tag 组件
import React from 'react';
import { Tag } from 'antd';
import type { DeviceStatus } from '../types';
import { DEVICE_STATUS_CONFIG, getLabel } from '../constants';

interface DeviceStatusTagProps {
  status: DeviceStatus;
}

const DeviceStatusTag: React.FC<DeviceStatusTagProps> = ({ status }) => {
  const config = DEVICE_STATUS_CONFIG[status];
  if (!config) return null;
  return <Tag color={config.color}>{getLabel(config)}</Tag>;
};

export default DeviceStatusTag;
