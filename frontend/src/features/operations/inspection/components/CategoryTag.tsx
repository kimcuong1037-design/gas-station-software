import React from 'react';
import { Tag } from 'antd';
import type { CheckItemCategory } from '../types';
import { CATEGORY_CONFIG, getLabel } from '../constants';

interface CategoryTagProps {
  category: CheckItemCategory;
}

const CategoryTag: React.FC<CategoryTagProps> = ({ category }) => {
  const config = CATEGORY_CONFIG[category];
  if (!config) return null;
  return <Tag color={config.color}>{getLabel(config)}</Tag>;
};

export default CategoryTag;
