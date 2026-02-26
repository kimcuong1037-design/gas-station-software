// P07: 检查项目管理列表页
import React, { useState, useMemo } from 'react';
import { Card, Typography, Button, Input, Select, Table, Space, Tabs, Tag, Popconfirm, Dropdown, Badge, message } from 'antd';
import { PlusOutlined, SearchOutlined, TagsOutlined, MoreOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { checkItems, inspectionTags, getCategoryStats } from '../../../../mock/inspections';
import type { CheckItem, CheckItemCategory, CheckItemStatus } from '../types';
import { CATEGORY_CONFIG, CHECK_ITEM_STATUS_CONFIG, DEFAULT_PAGE_SIZE, getLabel } from '../constants';
import CategoryTag from '../components/CategoryTag';
import CheckItemFormDrawer from './CheckItemFormDrawer';
import TagManagementDrawer from './TagManagementDrawer';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Title, Text } = Typography;

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '已停用' },
];

const CheckItemList: React.FC = () => {
  // -- state --
  const [keyword, setKeyword] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<CheckItemStatus | 'all'>('active');
  const [activeCategory, setActiveCategory] = useState<CheckItemCategory | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // drawer state
  const [checkItemDrawerOpen, setCheckItemDrawerOpen] = useState(false);
  const [tagDrawerOpen, setTagDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CheckItem | null>(null);

  // -- derived --
  const categoryStats = useMemo(() => getCategoryStats(), []);

  const filteredData = useMemo(() => {
    const filtered = checkItems.filter((item) => {
      // category tab
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      // status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      // tag filter
      if (tagFilter.length > 0) {
        const itemTagIds = item.tags.map((t) => t.id);
        if (!tagFilter.some((tid) => itemTagIds.includes(tid))) return false;
      }
      // keyword search
      if (keyword) {
        const kw = keyword.toLowerCase();
        if (
          !item.name.toLowerCase().includes(kw) &&
          !(item.description ?? '').toLowerCase().includes(kw) &&
          !(item.equipment?.name ?? '').toLowerCase().includes(kw)
        ) {
          return false;
        }
      }
      return true;
    });

    // Sort: category order then sortOrder
    const categoryOrder = Object.keys(CATEGORY_CONFIG);
    return filtered.sort((a, b) => {
      const aCatIdx = categoryOrder.indexOf(a.category);
      const bCatIdx = categoryOrder.indexOf(b.category);
      if (aCatIdx !== bCatIdx) return aCatIdx - bCatIdx;
      return a.sortOrder - b.sortOrder;
    });
  }, [keyword, tagFilter, statusFilter, activeCategory]);

  // -- handlers --
  const handleDeactivate = (item: CheckItem) => {
    message.success(`检查项「${item.name}」已停用`);
  };

  const handleReactivate = (item: CheckItem) => {
    message.success(`检查项「${item.name}」已恢复`);
  };

  const handleEdit = (item: CheckItem) => {
    setEditingItem(item);
    setCheckItemDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setCheckItemDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setCheckItemDrawerOpen(false);
    setEditingItem(null);
  };

  const handleSaved = () => {
    // In a real app, refetch data here
  };

  // -- category tabs --
  const categoryTabs = [
    {
      key: 'all',
      label: (
        <span>
          全部 <Badge count={categoryStats.all ?? 0} showZero size="small" style={{ marginLeft: 4 }} />
        </span>
      ),
    },
    ...Object.entries(CATEGORY_CONFIG).map(([key, config]) => ({
      key,
      label: (
        <span>
          {getLabel(config)}{' '}
          <Badge count={categoryStats[key] ?? 0} showZero size="small" style={{ marginLeft: 4 }} />
        </span>
      ),
    })),
  ];

  // -- columns --
  const columns: ColumnsType<CheckItem> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: CheckItemCategory) => <CategoryTag category={category} />,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string | null) => desc ?? '-',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 180,
      render: (tags: CheckItem['tags']) =>
        tags.length > 0
          ? tags.map((tag) => (
              <Tag key={tag.id} style={{ marginBottom: 2 }}>
                {tag.name}
              </Tag>
            ))
          : '-',
    },
    {
      title: '关联设备',
      key: 'equipment',
      width: 150,
      render: (_: unknown, record: CheckItem) => record.equipment?.name ?? '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: CheckItemStatus) => {
        const config = CHECK_ITEM_STATUS_CONFIG[status];
        return <Tag color={config.color}>{getLabel(config)}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: CheckItem) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Dropdown
            menu={{
              items:
                record.status === 'active'
                  ? [
                      {
                        key: 'deactivate',
                        label: (
                          <Popconfirm
                            title="确认停用"
                            description={`确定要停用「${record.name}」吗？停用后不会出现在新计划中。`}
                            onConfirm={() => handleDeactivate(record)}
                            okText="确定"
                            cancelText="取消"
                          >
                            <span>停用</span>
                          </Popconfirm>
                        ),
                      },
                    ]
                  : [
                      {
                        key: 'reactivate',
                        label: <span onClick={() => handleReactivate(record)}>恢复</span>,
                      },
                    ],
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div data-testid="check-item-list">
      <Card>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space align="center">
            <Title level={4} style={{ margin: 0 }}>
              检查项目管理
            </Title>
            <RequirementTag componentIds={['check-item-list', 'check-item-crud', 'check-item-deactivate']} module="inspection" showDetail />
          </Space>
          <Space>
            <Button icon={<TagsOutlined />} onClick={() => setTagDrawerOpen(true)}>
              管理标签 🏷
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              + 新增项目
            </Button>
          </Space>
        </div>

        {/* Category Tabs */}
        <Tabs
          activeKey={activeCategory}
          onChange={(key) => {
            setActiveCategory(key as CheckItemCategory | 'all');
            setCurrentPage(1);
          }}
          items={categoryTabs}
          style={{ marginBottom: 16 }}
        />

        {/* Filters */}
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索名称、描述、设备..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setCurrentPage(1);
            }}
            allowClear
            style={{ width: 260 }}
          />
          <Select
            mode="multiple"
            placeholder="按标签筛选"
            value={tagFilter}
            onChange={(val) => {
              setTagFilter(val);
              setCurrentPage(1);
            }}
            allowClear
            style={{ minWidth: 200 }}
            options={inspectionTags.map((t) => ({ value: t.id, label: t.name }))}
          />
          <Select
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            options={statusOptions}
            style={{ width: 140 }}
          />
        </Space>

        {/* Table */}
        <Table<CheckItem>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          locale={{ emptyText: '暂无检查项目' }}
        />
      </Card>

      {/* Drawers */}
      <CheckItemFormDrawer
        open={checkItemDrawerOpen}
        onClose={handleDrawerClose}
        editingItem={editingItem}
        onSaved={handleSaved}
      />
      <TagManagementDrawer
        open={tagDrawerOpen}
        onClose={() => setTagDrawerOpen(false)}
      />
    </div>
  );
};

export default CheckItemList;
