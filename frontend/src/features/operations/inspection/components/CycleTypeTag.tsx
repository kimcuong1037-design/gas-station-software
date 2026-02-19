import React from 'react';
import { Tag } from 'antd';
import type { CycleType } from '../types';
import { CYCLE_TYPE_CONFIG, getLabel } from '../constants';

interface CycleTypeTagProps {
  cycle: CycleType;
}

const CycleTypeTag: React.FC<CycleTypeTagProps> = ({ cycle }) => {
  const config = CYCLE_TYPE_CONFIG[cycle];
  if (!config) return null;
  return <Tag color={config.color}>{getLabel(config)}</Tag>;
};

export default CycleTypeTag;
