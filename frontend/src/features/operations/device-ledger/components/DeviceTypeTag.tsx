// 设备类型 Tag 组件
import React from 'react';
import { Tag } from 'antd';
import type { DeviceType } from '../types';
import { DEVICE_TYPE_CONFIG, getLabel } from '../constants';

interface DeviceTypeTagProps {
  type: DeviceType;
  showIcon?: boolean;
}

const DeviceTypeTag: React.FC<DeviceTypeTagProps> = ({ type, showIcon = true }) => {
  const config = DEVICE_TYPE_CONFIG[type];
  if (!config) return null;
  return (
    <Tag color={config.color}>
      {showIcon && <span style={{ marginRight: 4 }}>{config.icon}</span>}
      {getLabel(config)}
    </Tag>
  );
};

export default DeviceTypeTag;
