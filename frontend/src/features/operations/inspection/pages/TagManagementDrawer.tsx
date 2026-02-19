// P09: 标签管理抽屉
import React, { useState } from 'react';
import { Drawer, Table, Button, Input, Space, Popconfirm, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { inspectionTags } from '../../../../mock/inspections';
import type { InspectionTag } from '../types';

interface TagManagementDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface TagRow extends InspectionTag {
  isNew?: boolean;
}

const TagManagementDrawer: React.FC<TagManagementDrawerProps> = ({ open, onClose }) => {
  const [tags, setTags] = useState<TagRow[]>(() => [...inspectionTags]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // -- handlers --
  const handleAddTag = () => {
    const newId = `tag-new-${Date.now()}`;
    const newTag: TagRow = {
      id: newId,
      name: '',
      stationId: 'station-001',
      sortOrder: 0,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isNew: true,
    };
    setTags([newTag, ...tags]);
    setEditingId(newId);
    setEditingName('');
  };

  const handleEditStart = (tag: TagRow) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
  };

  const handleEditSave = () => {
    if (!editingId) return;
    const trimmed = editingName.trim();
    if (!trimmed) {
      message.warning('标签名称不能为空');
      return;
    }
    // Check duplicate
    if (tags.some((t) => t.id !== editingId && t.name === trimmed)) {
      message.warning('标签名称已存在');
      return;
    }

    const target = tags.find((t) => t.id === editingId);
    if (target?.isNew) {
      message.success(`标签「${trimmed}」已创建`);
    } else {
      message.success(`标签「${trimmed}」已更新`);
    }

    setTags((prev) =>
      prev.map((t) =>
        t.id === editingId
          ? { ...t, name: trimmed, isNew: false, updatedAt: new Date().toISOString() }
          : t,
      ),
    );
    setEditingId(null);
    setEditingName('');
  };

  const handleEditCancel = () => {
    if (!editingId) return;
    const target = tags.find((t) => t.id === editingId);
    // If new tag with no name, remove it
    if (target?.isNew && !target.name) {
      setTags((prev) => prev.filter((t) => t.id !== editingId));
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (tag: TagRow) => {
    setTags((prev) => prev.filter((t) => t.id !== tag.id));
    message.success(`标签「${tag.name}」已删除`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  // -- columns --
  const columns: ColumnsType<TagRow> = [
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: TagRow) => {
        if (editingId === record.id) {
          return (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleEditSave}
              placeholder="输入标签名称"
              size="small"
              maxLength={50}
              autoFocus
              style={{ width: 200 }}
            />
          );
        }
        return record.name || '-';
      },
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      width: 100,
      align: 'center',
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: TagRow) => {
        if (editingId === record.id) {
          return (
            <Space>
              <Button type="link" size="small" onClick={handleEditSave}>
                保存
              </Button>
              <Button type="link" size="small" onClick={handleEditCancel}>
                取消
              </Button>
            </Space>
          );
        }
        return (
          <Space>
            <Button type="link" size="small" onClick={() => handleEditStart(record)}>
              编辑
            </Button>
            {record.usageCount > 0 ? (
              <Popconfirm
                title="确认删除"
                description={`标签「${record.name}」已被 ${record.usageCount} 个检查项使用，删除后将从这些检查项中移除。确定删除吗？`}
                onConfirm={() => handleDelete(record)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </Popconfirm>
            ) : (
              <Popconfirm
                title="确认删除"
                description={`确定要删除标签「${record.name}」吗？`}
                onConfirm={() => handleDelete(record)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Drawer
      title="管理标签"
      placement="right"
      width={480}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <div data-testid="tag-management-drawer">
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<span>+</span>}
            onClick={handleAddTag}
            disabled={editingId !== null}
          >
            新增标签
          </Button>
        </div>

        <Table<TagRow>
          columns={columns}
          dataSource={tags}
          rowKey="id"
          pagination={false}
          size="small"
          locale={{ emptyText: '暂无标签' }}
        />
      </div>
    </Drawer>
  );
};

export default TagManagementDrawer;
