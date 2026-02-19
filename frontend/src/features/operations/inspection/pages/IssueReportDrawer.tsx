// P12: 登记问题抽屉
import React, { useEffect } from 'react';
import { Drawer, Form, Input, Select, DatePicker, Radio, Button, Space, message } from 'antd';
import { inspectionTasks, checkItems } from '../../../../mock/inspections';
import { equipments } from '../../../../mock/equipments';
import type { IssueSeverity } from '../types';
import { SEVERITY_CONFIG, DEFAULT_ISSUE_DUE_DAYS } from '../constants';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface IssueReportDrawerProps {
  open: boolean;
  onClose: () => void;
  prefill?: {
    taskId?: string;
    checkItemId?: string;
    equipmentId?: string;
  };
  onSaved?: () => void;
}

const severityOptions: { value: IssueSeverity; label: string; color: string; desc: string }[] = [
  { value: 'low', label: '低', color: SEVERITY_CONFIG.low.color, desc: SEVERITY_CONFIG.low.desc },
  { value: 'medium', label: '中', color: SEVERITY_CONFIG.medium.color, desc: SEVERITY_CONFIG.medium.desc },
  { value: 'high', label: '高', color: SEVERITY_CONFIG.high.color, desc: SEVERITY_CONFIG.high.desc },
  { value: 'urgent', label: '紧急', color: SEVERITY_CONFIG.urgent.color, desc: SEVERITY_CONFIG.urgent.desc },
];

const IssueReportDrawer: React.FC<IssueReportDrawerProps> = ({ open, onClose, prefill, onSaved }) => {
  const [form] = Form.useForm();

  // -- populate defaults when opened --
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        taskId: prefill?.taskId ?? undefined,
        checkItemId: prefill?.checkItemId ?? undefined,
        equipmentId: prefill?.equipmentId ?? undefined,
        severity: 'medium',
        description: '',
        dueDate: dayjs().add(DEFAULT_ISSUE_DUE_DAYS, 'day'),
      });
    }
  }, [open, prefill, form]);

  // -- task options --
  const taskOptions = inspectionTasks.map((t) => ({
    value: t.id,
    label: `${t.taskNo} - ${t.plan.name}`,
  }));

  // -- check item options --
  const checkItemOptions = checkItems
    .filter((ci) => ci.status === 'active')
    .map((ci) => ({
      value: ci.id,
      label: ci.name,
    }));

  // -- equipment options --
  const equipmentOptions = equipments.map((eq) => ({
    value: eq.id,
    label: `${eq.name} (${eq.deviceCode})`,
  }));

  // -- submit --
  const handleSubmit = () => {
    form.validateFields().then(() => {
      // Generate mock issue number
      const issueNo = `IS-${dayjs().format('MMDD')}-${String(Math.floor(Math.random() * 900) + 100)}`;
      message.success(`问题已登记，编号: ${issueNo}`);
      form.resetFields();
      onSaved?.();
      onClose();
    });
  };

  // -- close with confirm if dirty --
  const handleClose = () => {
    const touched = form.isFieldsTouched();
    if (touched) {
      // fields have been changed, just close (simplified — no confirmation for now)
      form.resetFields();
    }
    onClose();
  };

  return (
    <Drawer
      data-testid="issue-report-drawer"
      title="登记问题"
      placement="right"
      width={520}
      open={open}
      onClose={handleClose}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={handleClose}>取消</Button>
          <Button type="primary" onClick={handleSubmit}>
            提交
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" requiredMark="optional">
        {/* 关联任务 */}
        <Form.Item name="taskId" label="关联任务">
          <Select
            placeholder="选择关联的巡检任务（可选）"
            options={taskOptions}
            allowClear
            showSearch
            optionFilterProp="label"
            disabled={!!prefill?.taskId}
          />
        </Form.Item>

        {/* 检查项 */}
        <Form.Item name="checkItemId" label="检查项">
          <Select
            placeholder="选择检查项（可选）"
            options={checkItemOptions}
            allowClear
            showSearch
            optionFilterProp="label"
            disabled={!!prefill?.checkItemId}
          />
        </Form.Item>

        {/* 关联设备 */}
        <Form.Item name="equipmentId" label="关联设备">
          <Select
            placeholder="搜索设备名称/编号"
            options={equipmentOptions}
            allowClear
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        {/* 问题等级 — 大卡片按钮 */}
        <Form.Item
          name="severity"
          label="问题等级"
          rules={[{ required: true, message: '请选择问题等级' }]}
        >
          <Radio.Group style={{ width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              {severityOptions.map((opt) => {
                return (
                  <Radio.Button
                    key={opt.value}
                    value={opt.value}
                    style={{
                      height: 'auto',
                      padding: '12px 8px',
                      textAlign: 'center',
                      borderRadius: 8,
                      lineHeight: 1.4,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{opt.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{opt.desc}</div>
                  </Radio.Button>
                );
              })}
            </div>
          </Radio.Group>
        </Form.Item>

        {/* 问题描述 */}
        <Form.Item
          name="description"
          label="问题描述"
          rules={[
            { required: true, message: '请填写问题描述' },
            { min: 5, message: '至少 5 个字符' },
            { max: 2000, message: '不超过 2000 个字符' },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="请详细描述发现的问题（5-2000字）"
            maxLength={2000}
            showCount
          />
        </Form.Item>

        {/* 处理期限 */}
        <Form.Item name="dueDate" label="处理期限">
          <DatePicker style={{ width: '100%' }} placeholder="选择处理截止日期" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default IssueReportDrawer;
