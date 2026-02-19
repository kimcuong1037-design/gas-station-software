import React from 'react';
import { Tag } from 'antd';
import type { CheckResult } from '../types';
import { CHECK_RESULT_CONFIG, getLabel } from '../constants';

interface ResultTagProps {
  result: CheckResult;
}

const ResultTag: React.FC<ResultTagProps> = ({ result }) => {
  const config = CHECK_RESULT_CONFIG[result];
  if (!config) return null;
  return <Tag color={config.color}>{config.icon} {getLabel(config)}</Tag>;
};

export default ResultTag;
