import React from 'react';
import { Tag } from 'antd';
import type { TaskStatus } from '../types';
import { TASK_STATUS_CONFIG, getLabel } from '../constants';

interface TaskStatusTagProps {
  status: TaskStatus;
}

const TaskStatusTag: React.FC<TaskStatusTagProps> = ({ status }) => {
  const config = TASK_STATUS_CONFIG[status];
  if (!config) return null;
  return <Tag color={config.color}>{getLabel(config)}</Tag>;
};

export default TaskStatusTag;
