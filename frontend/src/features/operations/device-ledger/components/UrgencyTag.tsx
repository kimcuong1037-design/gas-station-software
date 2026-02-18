// 紧急程度 Tag 组件
import React from 'react';
import { Tag } from 'antd';
import type { UrgencyLevel } from '../types';
import { URGENCY_CONFIG, getLabel } from '../constants';

interface UrgencyTagProps {
  level: UrgencyLevel;
}

const UrgencyTag: React.FC<UrgencyTagProps> = ({ level }) => {
  const config = URGENCY_CONFIG[level];
  if (!config) return null;
  return <Tag color={config.color}>{getLabel(config)}</Tag>;
};

export default UrgencyTag;
