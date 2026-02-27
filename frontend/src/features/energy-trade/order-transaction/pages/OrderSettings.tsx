import React, { useState } from 'react';
import { Typography, Card, Table, Tag, Button, Popconfirm, Popover, Input, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { RequirementTag } from '../../../../components/RequirementTag';
import type { OrderTagConfig } from '../types';
import { orderTagConfigs as initialTags } from '../../../../mock/orderTransaction';

const { Title } = Typography;

interface LayoutContext {
  selectedStationId: string;
}

const OrderSettings: React.FC = () => {
  const { t } = useTranslation();
  const { selectedStationId: stationId } = useOutletContext<LayoutContext>();
  const [tags, setTags] = useState<OrderTagConfig[]>(initialTags);
  const [newTagName, setNewTagName] = useState('');
  const [addPopoverOpen, setAddPopoverOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddTag = () => {
    if (!newTagName.trim()) {
      message.error('请输入标签名称');
      return;
    }
    if (tags.some(t => t.name === newTagName.trim())) {
      message.error('标签名称已存在');
      return;
    }
    const newTag: OrderTagConfig = {
      id: `tag-cfg-${Date.now()}`,
      stationId,
      name: newTagName.trim(),
      sortOrder: tags.length,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    setTags([...tags, newTag]);
    setNewTagName('');
    setAddPopoverOpen(false);
    message.success('标签已添加');
  };

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter(t => t.id !== id));
    message.success('标签已删除');
  };

  const handleEditTag = (id: string) => {
    if (!editingName.trim()) {
      message.error('请输入标签名称');
      return;
    }
    setTags(tags.map(t => t.id === id ? { ...t, name: editingName.trim() } : t));
    setEditingId(null);
    setEditingName('');
    message.success('标签已更新');
  };

  const columns: ColumnsType<OrderTagConfig> = [
    {
      title: '标签名称', dataIndex: 'name', width: 200,
      render: (text: string, record) => {
        if (editingId === record.id) {
          return (
            <Space>
              <Input size="small" value={editingName} onChange={e => setEditingName(e.target.value)}
                onPressEnter={() => handleEditTag(record.id)} style={{ width: 120 }}
              />
              <Button size="small" type="primary" onClick={() => handleEditTag(record.id)}>保存</Button>
              <Button size="small" onClick={() => setEditingId(null)}>取消</Button>
            </Space>
          );
        }
        return <Tag>{text}</Tag>;
      },
    },
    { title: '使用次数', dataIndex: 'usageCount', width: 100 },
    {
      title: '创建时间', dataIndex: 'createdAt', width: 160,
      render: (v: string) => new Date(v).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作', width: 120,
      render: (_: unknown, record) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => { setEditingId(record.id); setEditingName(record.name); }}>编辑</Button>
          <Popconfirm title="确认删除该标签？" onConfirm={() => handleDeleteTag(record.id)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Title level={4} style={{ margin: 0 }}>{t('order.settings', '订单设置')}</Title>
          <RequirementTag componentId="tag-management" module="order-transaction" showDetail />
          <Tag color="blue">MVP+</Tag>
        </Space>
      </div>

      <Card
        title="订单标签管理"
        extra={
          <Popover
            open={addPopoverOpen}
            onOpenChange={setAddPopoverOpen}
            trigger="click"
            placement="bottomRight"
            content={
              <Space>
                <Input placeholder="输入标签名称" value={newTagName} onChange={e => setNewTagName(e.target.value)}
                  onPressEnter={handleAddTag} style={{ width: 160 }}
                />
                <Button type="primary" size="small" onClick={handleAddTag}>确定</Button>
              </Space>
            }
          >
            <Button type="primary" icon={<PlusOutlined />} size="small">新增标签</Button>
          </Popover>
        }
      >
        <Table<OrderTagConfig>
          columns={columns}
          dataSource={tags}
          rowKey="id"
          size="small"
          pagination={false}
          locale={{ emptyText: '暂无标签配置' }}
        />
      </Card>
    </div>
  );
};

export default OrderSettings;
