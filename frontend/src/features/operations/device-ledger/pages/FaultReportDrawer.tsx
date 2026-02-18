// P15: 故障报修抽屉
import React, { useEffect } from 'react';
import { Drawer, Form, Select, Input, Button, Space, Radio, message, Popconfirm, Row, Col } from 'antd';
import { equipments } from '../../../../mock/equipments';
import type { FaultReportFormData, UrgencyLevel } from '../types';
import { URGENCY_CONFIG, getLabel, DEVICE_TYPE_CONFIG } from '../constants';

interface FaultReportDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultDeviceId?: string;
}

const FaultReportDrawer: React.FC<FaultReportDrawerProps> = ({ open, onClose, onSuccess, defaultDeviceId }) => {
  const [form] = Form.useForm<FaultReportFormData>();

  const activeDevices = equipments.filter((e) => e.status !== 'inactive');

  useEffect(() => {
    if (open) {
      form.resetFields();
      if (defaultDeviceId) {
        form.setFieldsValue({ deviceId: defaultDeviceId });
      }
      form.setFieldsValue({ urgency: 'medium' });
    }
  }, [open, defaultDeviceId, form]);

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      // 模拟创建报修工单
      const orderNo = `WO-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      message.success(`报修单已提交，工单编号: ${orderNo}`);
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch {
      // validation failed
    }
  };

  const handleClose = () => {
    const isModified = form.isFieldsTouched();
    if (!isModified) {
      onClose();
    }
    // Popconfirm handles modified case
  };

  const urgencyOptions: UrgencyLevel[] = ['low', 'medium', 'high', 'urgent'];

  return (
    <Drawer
      title="故障报修"
      width={480}
      open={open}
      onClose={handleClose}
      maskClosable={false}
      extra={
        <Space>
          {form.isFieldsTouched() ? (
            <Popconfirm title="确定放弃编辑？" onConfirm={onClose} okText="确定" cancelText="取消">
              <Button>取消</Button>
            </Popconfirm>
          ) : (
            <Button onClick={onClose}>取消</Button>
          )}
          <Button type="primary" onClick={handleSubmit}>
            提交报修
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" initialValues={{ urgency: 'medium' }}>
        <Form.Item
          name="deviceId"
          label="故障设备"
          rules={[{ required: true, message: '请选择故障设备' }]}
        >
          <Select
            showSearch
            placeholder="搜索设备编号/名称..."
            optionFilterProp="label"
            options={activeDevices.map((e) => ({
              value: e.id,
              label: `${DEVICE_TYPE_CONFIG[e.deviceType]?.icon ?? ''} ${e.deviceCode} - ${e.name}`,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="urgency"
          label="紧急程度"
          rules={[{ required: true, message: '请选择紧急程度' }]}
        >
          <Radio.Group buttonStyle="solid" style={{ width: '100%' }}>
            <Row gutter={8}>
              {urgencyOptions.map((level) => {
                const config = URGENCY_CONFIG[level];
                return (
                  <Col span={6} key={level}>
                    <Radio.Button
                      value={level}
                      style={{
                        width: '100%',
                        height: 64,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        lineHeight: '1.4',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{getLabel(config)}</div>
                      <div style={{ fontSize: 10, opacity: 0.8 }}>
                        {i18nDesc(config)}
                      </div>
                    </Radio.Button>
                  </Col>
                );
              })}
            </Row>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="description"
          label="故障描述"
          rules={[
            { required: true, message: '请描述故障情况' },
            { min: 5, message: '至少5个字符' },
            { max: 2000, message: '最多2000个字符' },
          ]}
        >
          <Input.TextArea rows={4} placeholder="请描述故障情况..." showCount maxLength={2000} />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

// Helper: i18n-aware description
function i18nDesc(config: { desc: string; descEn: string }): string {
  return config.desc;
}

export default FaultReportDrawer;
