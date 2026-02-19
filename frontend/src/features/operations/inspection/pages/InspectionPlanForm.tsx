// P04 + P06: 安检计划新建/编辑表单页
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Typography, Button, Input, Form, DatePicker, Radio, Space, Checkbox, Tabs, List, Tag, Popconfirm, Alert, message, Empty } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { inspectionPlans, checkItems } from '../../../../mock/inspections';
import type { CycleType, CheckItemCategory } from '../types';
import { CYCLE_TYPE_CONFIG, CATEGORY_CONFIG, estimateTaskCount, getLabel } from '../constants';
import CategoryTag from '../components/CategoryTag';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

/** Active check items only */
const activeCheckItems = checkItems.filter((ci) => ci.status === 'active');

/** Unique categories from active items */
const categories = Array.from(new Set(activeCheckItems.map((ci) => ci.category))) as CheckItemCategory[];

const cycleOptions: { value: CycleType; label: string; desc: string }[] = [
  { value: 'daily', label: '每日', desc: '每日生成任务' },
  { value: 'weekly', label: '每周', desc: '每周生成任务' },
  { value: 'monthly', label: '每月', desc: '每月生成任务' },
];

const InspectionPlanForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Detect mode from URL: if there's an :id param, it's edit mode; otherwise create
  const mode: 'create' | 'edit' = id ? 'edit' : 'create';
  const [form] = Form.useForm();

  // -- state --
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isDirty, setIsDirty] = useState(false);

  // -- load plan data for edit mode --
  const planData = useMemo(() => {
    if (mode === 'edit' && id) {
      return inspectionPlans.find((p) => p.id === id) ?? null;
    }
    return null;
  }, [mode, id]);

  useEffect(() => {
    if (mode === 'edit' && planData) {
      if (planData.status !== 'pending') {
        message.error('仅待执行状态的计划可编辑');
        navigate(`/operations/inspection/plans/${planData.id}`);
        return;
      }
      form.setFieldsValue({
        name: planData.name,
        cycleType: planData.cycleType,
        dateRange: [dayjs(planData.startDate), dayjs(planData.endDate)],
        description: planData.description ?? '',
      });
      setSelectedItemIds(planData.checkItemIds);
    }
  }, [mode, planData, form, navigate]);

  // -- derived --
  const categoryItems = useMemo(() => {
    if (activeCategory === 'all') return activeCheckItems;
    return activeCheckItems.filter((ci) => ci.category === activeCategory);
  }, [activeCategory]);

  const selectedItems = useMemo(() => {
    return activeCheckItems.filter((ci) => selectedItemIds.includes(ci.id));
  }, [selectedItemIds]);

  /** Category counts for tabs */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: activeCheckItems.length };
    activeCheckItems.forEach((ci) => {
      counts[ci.category] = (counts[ci.category] || 0) + 1;
    });
    return counts;
  }, []);

  /** Estimate task count */


  // -- handlers --
  const handleToggleItem = (itemId: string) => {
    setIsDirty(true);
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setIsDirty(true);
    setSelectedItemIds((prev) => prev.filter((id) => id !== itemId));
  };

  const handleSelectAll = (ids: string[], checked: boolean) => {
    setIsDirty(true);
    if (checked) {
      setSelectedItemIds((prev) => Array.from(new Set([...prev, ...ids])));
    } else {
      setSelectedItemIds((prev) => prev.filter((id) => !ids.includes(id)));
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (selectedItemIds.length === 0) {
        message.error('请至少选择一项检查项目');
        return;
      }

      const planName = values.name;
      if (mode === 'create') {
        message.success(`安检计划「${planName}」创建成功`);
        // Navigate to plan detail (mock: use first plan id)
        navigate('/operations/inspection/plans/plan-003');
      } else {
        message.success(`安检计划「${planName}」更新成功`);
        navigate(`/operations/inspection/plans/${id}`);
      }
    } catch {
      // validation failed
    }
  };

  const handleBack = () => {
    if (mode === 'edit' && id) {
      navigate(`/operations/inspection/plans/${id}`);
    } else {
      navigate('/operations/inspection/plans');
    }
  };

  const pageTitle = mode === 'create'
    ? '新建安检计划'
    : `编辑安检计划 - ${planData?.name ?? ''}`;

  // Recalculate task estimate on form values change
  const [taskCount, setTaskCount] = useState<number | null>(null);
  const handleValuesChange = () => {
    setIsDirty(true);
    const cycleType = form.getFieldValue('cycleType') as CycleType | undefined;
    const dateRange = form.getFieldValue('dateRange') as [dayjs.Dayjs, dayjs.Dayjs] | undefined;
    if (cycleType && dateRange && dateRange[0] && dateRange[1]) {
      setTaskCount(
        estimateTaskCount(cycleType, dateRange[0].format('YYYY-MM-DD'), dateRange[1].format('YYYY-MM-DD')),
      );
    } else {
      setTaskCount(null);
    }
  };

  // Category tab items
  const categoryTabs = [
    { key: 'all', label: `全部 (${categoryCounts.all ?? 0})` },
    ...categories.map((cat) => ({
      key: cat,
      label: `${getLabel(CATEGORY_CONFIG[cat])} (${categoryCounts[cat] ?? 0})`,
    })),
  ];

  return (
    <div data-testid="inspection-plan-form" style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* 页面头部 */}
      <Space style={{ marginBottom: 16 }}>
        {isDirty ? (
          <Popconfirm
            title="确认离开"
            description="表单内容尚未保存，确定要离开吗？"
            onConfirm={handleBack}
            okText="离开"
            cancelText="继续编辑"
          >
            <Button icon={<ArrowLeftOutlined />} type="text" />
          </Popconfirm>
        ) : (
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={handleBack} />
        )}
        <Title level={4} style={{ margin: 0 }}>{pageTitle}</Title>
      </Space>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={{ cycleType: 'daily' }}
      >
        {/* Section 1: 基本信息 */}
        <Card title="基本信息" style={{ marginBottom: 16 }}>
          <Form.Item
            name="name"
            label="计划名称"
            rules={[
              { required: true, message: '请输入计划名称' },
              { min: 2, message: '计划名称至少2个字符' },
              { max: 200, message: '计划名称最多200个字符' },
            ]}
          >
            <Input placeholder="请输入安检计划名称" maxLength={200} showCount />
          </Form.Item>

          <Form.Item
            name="cycleType"
            label="巡检周期"
            rules={[{ required: true, message: '请选择巡检周期' }]}
          >
            <Radio.Group>
              <Space size={16}>
                {cycleOptions.map((opt) => (
                  <Radio.Button
                    key={opt.value}
                    value={opt.value}
                    style={{
                      height: 'auto',
                      padding: '12px 24px',
                      lineHeight: 1.5,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 15 }}>
                      {CYCLE_TYPE_CONFIG[opt.value].icon} {opt.label}
                    </div>
                    <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                      {opt.desc}
                    </div>
                  </Radio.Button>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="时间范围"
            rules={[{ required: true, message: '请选择时间范围' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>

          {taskCount !== null && (
            <Alert
              type="info"
              showIcon
              icon={<CalendarOutlined />}
              message={`按当前周期与时间范围，预计生成 ${taskCount} 个任务`}
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            name="description"
            label="描述"
            rules={[{ max: 500, message: '描述最多500个字符' }]}
          >
            <TextArea rows={3} placeholder="请输入计划描述（可选）" maxLength={500} showCount />
          </Form.Item>
        </Card>

        {/* Section 2: 检查项目 */}
        <Card title={`检查项目（已选 ${selectedItemIds.length} 项）`} style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16, minHeight: 400 }}>
            {/* Left panel: category tabs + checkbox list */}
            <div style={{ flex: 1, borderRight: '1px solid #f0f0f0', paddingRight: 16 }}>
              <Tabs
                activeKey={activeCategory}
                onChange={setActiveCategory}
                size="small"
                items={categoryTabs}
              />
              <div style={{ marginBottom: 8 }}>
                <Checkbox
                  checked={categoryItems.length > 0 && categoryItems.every((ci) => selectedItemIds.includes(ci.id))}
                  indeterminate={
                    categoryItems.some((ci) => selectedItemIds.includes(ci.id)) &&
                    !categoryItems.every((ci) => selectedItemIds.includes(ci.id))
                  }
                  onChange={(e) =>
                    handleSelectAll(
                      categoryItems.map((ci) => ci.id),
                      e.target.checked,
                    )
                  }
                >
                  <Text type="secondary">全选当前分类</Text>
                </Checkbox>
              </div>
              <List
                dataSource={categoryItems}
                size="small"
                style={{ maxHeight: 320, overflowY: 'auto' }}
                renderItem={(item) => (
                  <List.Item
                    key={item.id}
                    style={{ padding: '6px 0', cursor: 'pointer' }}
                    onClick={() => handleToggleItem(item.id)}
                  >
                    <Checkbox
                      checked={selectedItemIds.includes(item.id)}
                      onChange={() => handleToggleItem(item.id)}
                      style={{ marginRight: 8 }}
                    />
                    <div style={{ flex: 1 }}>
                      <Text>{item.name}</Text>
                      <div>
                        <CategoryTag category={item.category} />
                        {item.equipment && (
                          <Tag style={{ fontSize: 11 }}>{item.equipment.name}</Tag>
                        )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>

            {/* Right panel: selected items */}
            <div style={{ flex: 1, paddingLeft: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 12 }}>
                已选项目 ({selectedItemIds.length})
              </Text>
              {selectedItems.length === 0 ? (
                <Empty description="请从左侧选择检查项目" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <List
                  dataSource={selectedItems}
                  size="small"
                  style={{ maxHeight: 380, overflowY: 'auto' }}
                  renderItem={(item) => (
                    <List.Item
                      key={item.id}
                      actions={[
                        <Button
                          key="remove"
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveItem(item.id)}
                        />,
                      ]}
                      style={{ padding: '6px 0' }}
                    >
                      <div>
                        <Text>{item.name}</Text>
                        <div>
                          <CategoryTag category={item.category} />
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </div>
          </div>
        </Card>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          {isDirty ? (
            <Popconfirm
              title="确认取消"
              description="表单内容尚未保存，确定要取消吗？"
              onConfirm={handleBack}
              okText="确定"
              cancelText="继续编辑"
            >
              <Button>取消</Button>
            </Popconfirm>
          ) : (
            <Button onClick={handleBack}>取消</Button>
          )}
          <Button type="primary" onClick={handleSubmit}>
            {mode === 'create' ? '创建计划' : '保存修改'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default InspectionPlanForm;
