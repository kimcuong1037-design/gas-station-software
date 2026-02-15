// 站点分组模拟数据
import type { StationGroup } from '../features/operations/station/types';

export const groups: StationGroup[] = [
  {
    id: 'group-001',
    name: '高速服务区站点',
    description: '位于高速公路服务区的加气站',
    sortOrder: 1,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'group-002',
    name: '城市加气站',
    description: '位于城市主要道路的加气站',
    sortOrder: 2,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'group-003',
    name: '物流园区站点',
    description: '位于物流园区的加气站，主要服务货运车辆',
    sortOrder: 3,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'group-004',
    name: '公交加气站',
    description: '为公交公司提供专项服务的加气站',
    sortOrder: 4,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'group-005',
    name: '综合能源站',
    description: '同时提供加气、加油、充电服务的综合站点',
    sortOrder: 5,
    status: 'active',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
];

export default groups;
