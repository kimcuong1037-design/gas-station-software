import React from 'react';
import { Tooltip, Tag, Space } from 'antd';
import { LinkOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { UserStoryMapping } from '../features/operations/station/userStoryMapping';
import { stationUserStories } from '../features/operations/station/userStoryMapping';
import { shiftHandoverUserStories } from '../features/operations/shift-handover/userStoryMapping';
import { deviceLedgerUserStories } from '../features/operations/device-ledger/userStoryMapping';
import { inspectionUserStories } from '../features/operations/inspection/userStoryMapping';
import { priceManagementUserStories } from '../features/energy-trade/price-management/userStoryMapping';
import { orderTransactionUserStories } from '../features/energy-trade/order-transaction/userStoryMapping';
import { inventoryUserStories } from '../features/energy-trade/inventory-management/userStoryMapping';
import { analyticsUserStories } from '../features/analytics/data-analytics/userStoryMapping';

// 合并所有模块的 User Story 映射
const allUserStories: Record<string, UserStoryMapping> = {
  ...stationUserStories,
  ...shiftHandoverUserStories,
  ...deviceLedgerUserStories,
  ...inspectionUserStories,
  ...priceManagementUserStories,
  ...orderTransactionUserStories,
  ...inventoryUserStories,
  ...analyticsUserStories,
};

// 模块映射表，用于按模块筛选
const moduleStories = {
  station: stationUserStories,
  'shift-handover': shiftHandoverUserStories,
  'device-ledger': deviceLedgerUserStories,
  inspection: inspectionUserStories,
  'price-management': priceManagementUserStories,
  'order-transaction': orderTransactionUserStories,
  'inventory-management': inventoryUserStories,
  'data-analytics': analyticsUserStories,
  all: allUserStories,
} as const;

type ModuleType = keyof typeof moduleStories;

interface RequirementTagProps {
  /** 组件 ID，自动从映射表查找 */
  componentId?: string;
  /** 多个组件 ID，支持聚合多个 user story */
  componentIds?: string[];
  /** User Story 映射数据 (优先于 componentId) */
  mapping?: UserStoryMapping;
  /** 模块类型，用于指定从哪个模块的映射表查找 */
  module?: ModuleType;
  /** 是否显示详细信息 */
  showDetail?: boolean;
  /** 仅在开发模式下显示 */
  devOnly?: boolean;
}

const statusConfig = {
  implemented: { color: 'success', icon: <CheckCircleOutlined />, text: '已实现' },
  partial: { color: 'warning', icon: <ClockCircleOutlined />, text: '部分实现' },
  planned: { color: 'processing', icon: <ClockCircleOutlined />, text: '计划中' },
  'not-planned': { color: 'default', icon: <ExclamationCircleOutlined />, text: '暂不实现' },
};

const priorityConfig = {
  'MVP': { color: '#22A06B' },
  'MVP+': { color: '#1F845A' },
  'PROD': { color: '#E79D13' },
  'FUTURE': { color: '#d9d9d9' },
};

/**
 * 需求追踪标记组件
 * 
 * 在 UI 元素上显示关联的 User Story，支持 tooltip 详情。
 * 仅在开发模式下显示（通过 devOnly 控制）。
 * 
 * @example
 * ```tsx
 * <RequirementTag componentId="station-list" showDetail />
 * <RequirementTag componentId="shift-summary" module="shift-handover" showDetail />
 * ```
 */
export const RequirementTag: React.FC<RequirementTagProps> = ({
  componentId,
  componentIds,
  mapping: propMapping,
  module = 'all',
  showDetail = false,
  devOnly = true,
}) => {
  // 生产模式下不显示
  if (devOnly && import.meta.env.PROD) {
    return null;
  }

  // 选择对应模块的映射表
  const storiesMap = moduleStories[module];

  // 支持多个 componentId
  const ids = componentIds || (componentId ? [componentId] : []);
  
  // 收集所有映射
  const mappings = propMapping 
    ? [propMapping]
    : ids.map(id => storiesMap[id]).filter(Boolean);
  
  if (mappings.length === 0) {
    return null;
  }

  // 聚合所有 user story（去重）
  const allUS = [...new Set(mappings.flatMap(m => m.us))];
  const allDescs = mappings.map(m => m.desc);
  
  // 取最高优先级
  const priorityOrder = ['MVP', 'MVP+', 'PROD', 'FUTURE'] as const;
  const highestPriority = mappings
    .map(m => m.priority)
    .sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b))[0];
  
  // 取最低状态
  const statusOrder = ['implemented', 'partial', 'planned', 'not-planned'] as const;
  const lowestStatus = mappings
    .map(m => m.status)
    .sort((a, b) => statusOrder.indexOf(b) - statusOrder.indexOf(a))[0];

  const { us, desc, priority, status } = {
    us: allUS,
    desc: allDescs.join('；'),
    priority: highestPriority,
    status: lowestStatus,
  };
  const statusInfo = statusConfig[status];
  const priorityInfo = priorityConfig[priority];

  const tooltipContent = (
    <div style={{ maxWidth: 280 }}>
      <div style={{ marginBottom: 8 }}>
        <strong>关联需求</strong>
      </div>
      <div style={{ marginBottom: 4 }}>
        <strong>User Story:</strong> {us.join(', ')}
      </div>
      <div style={{ marginBottom: 4 }}>
        <strong>功能描述:</strong> {desc}
      </div>
      <div style={{ marginBottom: 4 }}>
        <strong>优先级:</strong>{' '}
        <Tag color={priorityInfo.color} style={{ marginLeft: 4 }}>
          {priority}
        </Tag>
      </div>
      <div>
        <strong>状态:</strong>{' '}
        <Tag color={statusInfo.color} icon={statusInfo.icon} style={{ marginLeft: 4 }}>
          {statusInfo.text}
        </Tag>
      </div>
    </div>
  );

  if (showDetail) {
    return (
      <Tooltip title={tooltipContent} placement="topLeft">
        <Space size={4} style={{ cursor: 'help' }}>
          <LinkOutlined style={{ color: '#22A06B', fontSize: 12 }} />
          {us.map(u => (
            <Tag
              key={u}
              color={priorityInfo.color}
              style={{ 
                fontSize: 10, 
                padding: '0 4px',
                lineHeight: '16px',
                margin: 0,
              }}
            >
              {u}
            </Tag>
          ))}
        </Space>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltipContent} placement="top">
      <Tag
        color={priorityInfo.color}
        icon={<LinkOutlined />}
        style={{ 
          fontSize: 10, 
          padding: '0 4px',
          lineHeight: '16px',
          cursor: 'help',
        }}
      >
        {us.length > 1 ? `${us[0]}+${us.length - 1}` : us[0]}
      </Tag>
    </Tooltip>
  );
};

/**
 * 开发者工具栏 - 显示当前页面的需求覆盖情况
 */
export const DevRequirementPanel: React.FC<{
  componentId?: string;
  componentIds?: string[];
  mappings?: Record<string, UserStoryMapping>;
  module?: ModuleType;
}> = ({ componentId, componentIds = [], mappings, module = 'all' }) => {
  if (import.meta.env.PROD) {
    return null;
  }

  const useMappings = mappings || moduleStories[module];
  const useIds = componentId ? [componentId] : componentIds;

  const relevantMappings = useIds
    .map(id => ({ id, ...useMappings[id] }))
    .filter(m => m.us);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        fontSize: 12,
        maxWidth: 300,
        maxHeight: 400,
        overflow: 'auto',
        zIndex: 9999,
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
        📋 需求追踪 (开发模式)
      </div>
      {relevantMappings.map(m => (
        <div key={m.id} style={{ marginBottom: 6, borderBottom: '1px solid #333', paddingBottom: 4 }}>
          <div style={{ color: '#91caff' }}>{m.id}</div>
          <div style={{ color: '#aaa' }}>{m.us?.join(', ')} - {m.desc}</div>
        </div>
      ))}
    </div>
  );
};
