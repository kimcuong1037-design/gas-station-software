// 区域模拟数据 - 树形结构
import type { Region } from '../features/operations/station/types';

export const regions: Region[] = [
  {
    id: 'region-001',
    name: '华北区',
    code: 'HB',
    level: 1,
    path: '/region-001/',
    sortOrder: 1,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    children: [
      {
        id: 'region-001-001',
        name: '北京市',
        code: '110000',
        parentId: 'region-001',
        level: 2,
        path: '/region-001/region-001-001/',
        sortOrder: 1,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        children: [
          {
            id: 'region-001-001-001',
            name: '朝阳区',
            code: '110105',
            parentId: 'region-001-001',
            level: 3,
            path: '/region-001/region-001-001/region-001-001-001/',
            sortOrder: 1,
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'region-001-001-002',
            name: '海淀区',
            code: '110108',
            parentId: 'region-001-001',
            level: 3,
            path: '/region-001/region-001-001/region-001-001-002/',
            sortOrder: 2,
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'region-001-001-003',
            name: '通州区',
            code: '110112',
            parentId: 'region-001-001',
            level: 3,
            path: '/region-001/region-001-001/region-001-001-003/',
            sortOrder: 3,
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      },
      {
        id: 'region-001-002',
        name: '天津市',
        code: '120000',
        parentId: 'region-001',
        level: 2,
        path: '/region-001/region-001-002/',
        sortOrder: 2,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'region-002',
    name: '华东区',
    code: 'HD',
    level: 1,
    path: '/region-002/',
    sortOrder: 2,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    children: [
      {
        id: 'region-002-001',
        name: '上海市',
        code: '310000',
        parentId: 'region-002',
        level: 2,
        path: '/region-002/region-002-001/',
        sortOrder: 1,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        children: [
          {
            id: 'region-002-001-001',
            name: '浦东新区',
            code: '310115',
            parentId: 'region-002-001',
            level: 3,
            path: '/region-002/region-002-001/region-002-001-001/',
            sortOrder: 1,
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'region-002-001-002',
            name: '徐汇区',
            code: '310104',
            parentId: 'region-002-001',
            level: 3,
            path: '/region-002/region-002-001/region-002-001-002/',
            sortOrder: 2,
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      },
      {
        id: 'region-002-002',
        name: '江苏省',
        code: '320000',
        parentId: 'region-002',
        level: 2,
        path: '/region-002/region-002-002/',
        sortOrder: 2,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        children: [
          {
            id: 'region-002-002-001',
            name: '南京市',
            code: '320100',
            parentId: 'region-002-002',
            level: 3,
            path: '/region-002/region-002-002/region-002-002-001/',
            sortOrder: 1,
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      },
    ],
  },
  {
    id: 'region-003',
    name: '华南区',
    code: 'HN',
    level: 1,
    path: '/region-003/',
    sortOrder: 3,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    children: [
      {
        id: 'region-003-001',
        name: '广东省',
        code: '440000',
        parentId: 'region-003',
        level: 2,
        path: '/region-003/region-003-001/',
        sortOrder: 1,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        children: [
          {
            id: 'region-003-001-001',
            name: '深圳市',
            code: '440300',
            parentId: 'region-003-001',
            level: 3,
            path: '/region-003/region-003-001/region-003-001-001/',
            sortOrder: 1,
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'region-003-001-002',
            name: '广州市',
            code: '440100',
            parentId: 'region-003-001',
            level: 3,
            path: '/region-003/region-003-001/region-003-001-002/',
            sortOrder: 2,
            status: 'active',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
      },
    ],
  },
];

/** 扁平化区域列表 */
export const flatRegions: Region[] = (() => {
  const result: Region[] = [];
  const flatten = (items: Region[]) => {
    items.forEach((item) => {
      const { children, ...rest } = item;
      result.push(rest);
      if (children) {
        flatten(children);
      }
    });
  };
  flatten(regions);
  return result;
})();

export default regions;
