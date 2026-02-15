// 燃料类型模拟数据
import type { FuelType } from '../features/operations/station/types';

export const fuelTypes: FuelType[] = [
  {
    id: 'fuel-001',
    code: 'GASOLINE_92',
    name: '92#汽油',
    category: 'gasoline',
    isSystem: true,
    unit: 'L',
    sortOrder: 1,
    status: 'active',
  },
  {
    id: 'fuel-002',
    code: 'GASOLINE_95',
    name: '95#汽油',
    category: 'gasoline',
    isSystem: true,
    unit: 'L',
    sortOrder: 2,
    status: 'active',
  },
  {
    id: 'fuel-003',
    code: 'GASOLINE_98',
    name: '98#汽油',
    category: 'gasoline',
    isSystem: true,
    unit: 'L',
    sortOrder: 3,
    status: 'active',
  },
  {
    id: 'fuel-004',
    code: 'DIESEL_0',
    name: '0#柴油',
    category: 'diesel',
    isSystem: true,
    unit: 'L',
    sortOrder: 4,
    status: 'active',
  },
  {
    id: 'fuel-005',
    code: 'CNG',
    name: 'CNG压缩天然气',
    category: 'gas',
    isSystem: true,
    unit: 'm³',
    sortOrder: 5,
    status: 'active',
  },
  {
    id: 'fuel-006',
    code: 'LNG',
    name: 'LNG液化天然气',
    category: 'gas',
    isSystem: true,
    unit: 'kg',
    sortOrder: 6,
    status: 'active',
  },
];

export default fuelTypes;
