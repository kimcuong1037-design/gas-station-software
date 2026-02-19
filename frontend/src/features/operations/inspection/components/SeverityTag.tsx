import React from 'react';
import { Tag } from 'antd';
import type { IssueSeverity } from '../types';
import { SEVERITY_CONFIG, getLabel } from '../constants';

interface SeverityTagProps {
  severity: IssueSeverity;
}

const SeverityTag: React.FC<SeverityTagProps> = ({ severity }) => {
  const config = SEVERITY_CONFIG[severity];
  if (!config) return null;
  return <Tag color={config.color}>{getLabel(config)}</Tag>;
};

export default SeverityTag;
