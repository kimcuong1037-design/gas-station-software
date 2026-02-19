import React from 'react';
import { Tag } from 'antd';
import type { PlanStatus } from '../types';
import { PLAN_STATUS_CONFIG, getLabel } from '../constants';

interface PlanStatusTagProps {
  status: PlanStatus;
}

const PlanStatusTag: React.FC<PlanStatusTagProps> = ({ status }) => {
  const config = PLAN_STATUS_CONFIG[status];
  if (!config) return null;
  return <Tag color={config.color}>{getLabel(config)}</Tag>;
};

export default PlanStatusTag;
