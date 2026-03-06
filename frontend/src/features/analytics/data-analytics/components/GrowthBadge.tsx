import React from 'react';
import { Tooltip } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface GrowthBadgeProps {
  value: number | null | undefined;
  tooltip?: string;
}

const GrowthBadge: React.FC<GrowthBadgeProps> = ({ value, tooltip }) => {
  if (value === null || value === undefined) {
    const content = <span style={{ color: '#999' }}>—</span>;
    return tooltip ? <Tooltip title={tooltip}>{content}</Tooltip> : content;
  }

  const isPositive = value > 0;
  const isNegative = value < 0;
  const color = isPositive ? '#52c41a' : isNegative ? '#ff4d4f' : '#999';
  const Icon = isPositive ? ArrowUpOutlined : isNegative ? ArrowDownOutlined : null;

  const content = (
    <span style={{ color, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {Icon && <Icon style={{ marginRight: 2, fontSize: 12 }} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );

  return tooltip ? <Tooltip title={tooltip}>{content}</Tooltip> : content;
};

export default GrowthBadge;
