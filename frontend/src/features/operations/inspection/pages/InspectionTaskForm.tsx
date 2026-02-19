// P-NEW: 安检任务新建页（支持从计划详情页跳转 or 从任务列表直接新增）
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Form,
  DatePicker,
  Select,
  Input,
  Space,
  Checkbox,
  Tabs,
  List,
  Tag,
  Alert,
  Empty,
  Popconfirm,
  Descriptions,
  message,
} from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { inspectionPlans, checkItems } from '../../../../mock/inspections';
import { employees } from '../../../../mock/employees';
import type { CheckItemCategory, InspectionPlan } from '../types';
import { CATEGORY_CONFIG, getLabel } from '../constants';
import CycleTypeTag from '../components/CycleTypeTag';
import PlanStatusTag from '../components/PlanStatusTag';
import CategoryTag from '../components/CategoryTag';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

/** Active check items only */
const activeCheckItems = checkItems.filter((ci) => ci.status === 'active');

/** Unique categories from active items */
const categories = Array.from(
  new Set(activeCheckItems.map((ci) => ci.category)),
) as CheckItemCategory[];

/** Available plans for task creation (only pending/in_progress plans are valid) */
const availablePlans = inspectionPlans.filter(
  (p) => p.status === 'pending' || p.status === 'in_progress',
);

const InspectionTaskForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPlanId = searchParams.get('planId');
  const [form] = Form.useForm();

  // -- state --
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(initialPlanId);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isDirty, setIsDirty] = useState(false);

  // -- data --
  const plan: InspectionPlan | null = useMemo(() => {
    if (!selectedPlanId) return null;
    return inspectionPlans.find((p) => p.id === selectedPlanId) ?? null;
  }, [selectedPlanId]);

  // Employees at the same station as assignee candidates
  const assigneeCandidates = useMemo(() => {
    if (!plan) return [];
    return employees.filter(
      (e) => e.stationId === plan.stationId && e.status === 'active',
    );
  }, [plan]);

  // When plan changes, reset selected items to the plan's check items and clear assignee
  useEffect(() => {
    if (plan) {
      setSelectedItemIds(plan.checkItemIds ?? []);
      setActiveCategory('all');
    } else {
      setSelectedItemIds([]);
    }
    // Reset assignee when plan changes (different station = different employees)
    form.setFieldValue('assigneeId', undefined);
  }, [plan, form]);

  // -- derived --
  /** Only show check items that belong to the plan (or all active if plan has none) */
  const availableItems = useMemo(() => {
    if (plan && plan.checkItemIds.length > 0) {
      return activeCheckItems.filter((ci) => plan.checkItemIds.includes(ci.id));
    }
    return activeCheckItems;
  }, [plan]);

  const categoryItems = useMemo(() => {
    if (activeCategory === 'all') return availableItems;
    return availableItems.filter((ci) => ci.category === activeCategory);
  }, [activeCategory, availableItems]);

  const selectedItems = useMemo(() => {
    return availableItems.filter((ci) => selectedItemIds.includes(ci.id));
  }, [selectedItemIds, availableItems]);

  /** Category counts */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: availableItems.length };
    availableItems.forEach((ci) => {
      counts[ci.category] = (counts[ci.category] || 0) + 1;
    });
    return counts;
  }, [availableItems]);

  const availableCategories = useMemo(() => {
    return categories.filter((cat) => (categoryCounts[cat] ?? 0) > 0);
  }, [categoryCounts]);

  // -- handlers --
  const handleToggleItem = (itemId: string) => {
    setIsDirty(true);
    setSelectedItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
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
      if (!plan) {
        setIsDirty(true);
        message.error('请先选择关联的安检计划');
        return;
      }
      await form.validateFields();
      if (selectedItemIds.length === 0) {
        message.error('请至少选择一项检查项目');
        return;
      }
      message.success('安检任务创建成功');
      // Navigate back: if came from plan detail, go back there; otherwise go to task list
      if (initialPlanId && plan) {
        navigate(`/operations/inspection/plans/${plan.id}`);
      } else {
        navigate('/operations/inspection/tasks');
      }
    } catch {
      // validation failed
    }
  };

  const handleBack = () => {
    if (initialPlanId && plan) {
      navigate(`/operations/inspection/plans/${plan.id}`);
    } else {
      navigate('/operations/inspection/tasks');
    }
  };

  // Category tab items
  const categoryTabs = [
    { key: 'all', label: `全部 (${categoryCounts.all ?? 0})` },
    ...availableCategories.map((cat) => ({
      key: cat,
      label: `${getLabel(CATEGORY_CONFIG[cat])} (${categoryCounts[cat] ?? 0})`,
    })),
  ];

  return (
    <div
      data-testid="inspection-task-form"
      style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}
    >
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
          <Button
            icon={<ArrowLeftOutlined />}
            type="text"
            onClick={handleBack}
          />
        )}
        <Title level={4} style={{ margin: 0 }}>
          新增安检任务
        </Title>
      </Space>

      {/* 关联计划 */}
      <Card title="关联计划" style={{ marginBottom: 16 }}>
        {!initialPlanId && (
          <Form.Item
            label="选择安检计划"
            required
            style={{ marginBottom: plan ? 16 : 0 }}
            validateStatus={!plan ? 'error' : undefined}
            help={!plan && isDirty ? '请选择一个安检计划' : undefined}
          >
            <Select
              placeholder="请选择要关联的安检计划"
              value={selectedPlanId ?? undefined}
              onChange={(value) => { setSelectedPlanId(value); setIsDirty(true); }}
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: '100%' }}
              options={availablePlans.map((p) => ({
                value: p.id,
                label: `${p.planNo} — ${p.name}`,
              }))}
              optionRender={(option) => {
                const p = availablePlans.find((pl) => pl.id === option.value);
                if (!p) return option.label;
                return (
                  <Space>
                    <Text strong>{p.planNo}</Text>
                    <Text>{p.name}</Text>
                    <CycleTypeTag cycle={p.cycleType} />
                    <PlanStatusTag status={p.status} />
                  </Space>
                );
              }}
            />
          </Form.Item>
        )}
        {plan && (
          <Descriptions column={2} size="small">
            <Descriptions.Item label="计划编号">
              {plan.planNo}
            </Descriptions.Item>
            <Descriptions.Item label="计划名称">
              {plan.name}
            </Descriptions.Item>
            <Descriptions.Item label="巡检周期">
              <CycleTypeTag cycle={plan.cycleType} />
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <PlanStatusTag status={plan.status} />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={() => setIsDirty(true)}
      >
        {/* Section: 任务信息 */}
        <Card title="任务信息" style={{ marginBottom: 16 }}>
          <Form.Item
            name="assigneeId"
            label="执行人"
            rules={[{ required: true, message: '请选择执行人' }]}
          >
            <Select
              placeholder={plan ? '请选择执行人' : '请先选择关联计划'}
              disabled={!plan}
              allowClear
              showSearch
              optionFilterProp="label"
              options={assigneeCandidates.map((e) => ({
                value: e.userId ?? e.id,
                label: `${e.name}（${e.position}）`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="截止日期"
            rules={[{ required: true, message: '请选择截止日期' }]}
            initialValue={dayjs()}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) =>
                current && current < dayjs().startOf('day')
              }
            />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <TextArea
              rows={2}
              placeholder="请输入任务备注（可选）"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Card>

        {/* Section: 检查项目 */}
        <Card
          title={`检查项目（已选 ${selectedItemIds.length} 项）`}
          style={{ marginBottom: 16 }}
        >
          {plan ? (
            <Alert
              type="info"
              showIcon
              message="检查项目已从计划中继承，您可以根据需要调整"
              style={{ marginBottom: 16 }}
            />
          ) : (
            <Alert
              type="warning"
              showIcon
              message="请先选择关联的安检计划，检查项目将自动加载"
              style={{ marginBottom: 16 }}
            />
          )}

          <div style={{ display: 'flex', gap: 16, minHeight: 360 }}>
            {/* Left panel: items to select */}
            <div
              style={{
                flex: 1,
                borderRight: '1px solid #f0f0f0',
                paddingRight: 16,
              }}
            >
              <Tabs
                activeKey={activeCategory}
                onChange={setActiveCategory}
                size="small"
                items={categoryTabs}
              />
              <div style={{ marginBottom: 8 }}>
                <Checkbox
                  checked={
                    categoryItems.length > 0 &&
                    categoryItems.every((ci) =>
                      selectedItemIds.includes(ci.id),
                    )
                  }
                  indeterminate={
                    categoryItems.some((ci) =>
                      selectedItemIds.includes(ci.id),
                    ) &&
                    !categoryItems.every((ci) =>
                      selectedItemIds.includes(ci.id),
                    )
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
                style={{ maxHeight: 280, overflowY: 'auto' }}
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
                          <Tag style={{ fontSize: 11 }}>
                            {item.equipment.name}
                          </Tag>
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
                <Empty
                  description="请从左侧选择检查项目"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <List
                  dataSource={selectedItems}
                  size="small"
                  style={{ maxHeight: 340, overflowY: 'auto' }}
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
        <div
          style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}
        >
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
            创建任务
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default InspectionTaskForm;
