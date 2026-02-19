// P08: 检查项目表单抽屉
import React, { useEffect } from 'react';
import { Drawer, Form, Input, Select, Button, Space, Popconfirm, message } from 'antd';
import { inspectionTags } from '../../../../mock/inspections';
import { equipments } from '../../../../mock/equipments';
import type { CheckItem } from '../types';
import { CATEGORY_CONFIG, getLabel } from '../constants';

interface CheckItemFormDrawerProps {
  open: boolean;
  onClose: () => void;
  editingItem?: CheckItem | null;
  onSaved: () => void;
}

const categoryOptions = Object.entries(CATEGORY_CONFIG).map(([value, config]) => ({
  value,
  label: getLabel(config),
}));

const equipmentOptions = equipments.map((e) => ({
  value: e.id,
  label: `${e.name} (${e.deviceCode})`,
}));

const tagOptions = inspectionTags.map((t) => ({
  value: t.id,
  label: t.name,
}));

const CheckItemFormDrawer: React.FC<CheckItemFormDrawerProps> = ({
  open,
  onClose,
  editingItem,
  onSaved,
}) => {
  const [form] = Form.useForm();
  const isEdit = !!editingItem;

  // Pre-fill form when editing
  useEffect(() => {
    if (open && editingItem) {
      form.setFieldsValue({
        name: editingItem.name,
        category: editingItem.category,
        description: editingItem.description ?? '',
        equipmentId: editingItem.equipment?.id ?? undefined,
        tagIds: editingItem.tags.map((t) => t.id),
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, editingItem, form]);

  const handleSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      if (isEdit) {
        message.success(`检查项「${values.name}」已更新`);
      } else {
        message.success(`检查项「${values.name}」已创建`);
      }

      onSaved();
      onClose();
    } catch {
      // validation failed, form will show errors
    }
  };

  const handleClose = () => {
    const dirty = form.isFieldsTouched();
    if (dirty) {
      // Popconfirm handles this case in the footer
      return;
    }
    onClose();
  };

  const isFormDirty = () => form.isFieldsTouched();

  return (
    <Drawer
      data-testid="check-item-form-drawer"
      title={isEdit ? '编辑检查项目' : '新增检查项目'}
      placement="right"
      width={520}
      open={open}
      onClose={handleClose}
      destroyOnClose
      extra={
        <Space>
          {isFormDirty() ? (
            <Popconfirm
              title="确认取消"
              description="您有未保存的修改，确定要关闭吗？"
              onConfirm={onClose}
              okText="确定"
              cancelText="继续编辑"
            >
              <Button>取消</Button>
            </Popconfirm>
          ) : (
            <Button onClick={onClose}>取消</Button>
          )}
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </Space>
      }
    >
      <div data-testid="check-item-form-drawer">
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[
              { required: true, message: '请输入检查项名称' },
              { min: 2, message: '名称至少2个字符' },
              { max: 200, message: '名称最多200个字符' },
            ]}
          >
            <Input placeholder="请输入检查项名称" maxLength={200} showCount />
          </Form.Item>

          <Form.Item
            label="分类"
            name="category"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类" options={categoryOptions} />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ max: 1000, message: '描述最多1000个字符' }]}
          >
            <Input.TextArea
              placeholder="请输入检查项描述（选填）"
              maxLength={1000}
              showCount
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>

          <Form.Item
            label="关联设备"
            name="equipmentId"
          >
            <Select
              placeholder="请选择关联设备（选填）"
              options={equipmentOptions}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="标签"
            name="tagIds"
          >
            <Select
              mode="multiple"
              placeholder="请选择标签（选填）"
              options={tagOptions}
              allowClear
            />
          </Form.Item>
        </Form>
      </div>
    </Drawer>
  );
};

export default CheckItemFormDrawer;
