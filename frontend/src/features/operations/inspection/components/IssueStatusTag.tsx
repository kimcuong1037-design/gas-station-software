import React from 'react';
import { Tag } from 'antd';
import type { IssueStatus } from '../types';
import { ISSUE_STATUS_CONFIG, getLabel } from '../constants';

interface IssueStatusTagProps {
  status: IssueStatus;
}

const IssueStatusTag: React.FC<IssueStatusTagProps> = ({ status }) => {
  const config = ISSUE_STATUS_CONFIG[status];
  if (!config) return null;
  return <Tag color={config.color}>{getLabel(config)}</Tag>;
};

export default IssueStatusTag;
