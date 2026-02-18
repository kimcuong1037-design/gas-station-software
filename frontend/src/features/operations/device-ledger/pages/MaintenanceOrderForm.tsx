// P13: 维保工单创建/编辑表单
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Input,
  Select,
  Form,
  Radio,
  Space,
  Descriptions,
  Popconfirm,
  message,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { equipments } from '../../../../mock/equipments';
import { mockEmployees } from '../../../../mock/maintenanceOrders';
import type { OrderType, UrgencyLevel } from '../types';
import { ORDER_TYPE_CONFIG, getLabel } from '../constants';
import DeviceStatusTag from '../components/DeviceStatusTag';
import DeviceTypeTag from '../components/DeviceTypeTag';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Title } = Typography;
const { TextArea } = Input;

const urgencyOptions: { value: UrgencyLevel; label: string; color: string; desc: string }[] = [
  { value: 'urgent', label: '紧急', color: '#ff4d4f', desc: '严重影响运营，需立即处理' },
  { value: 'high', label: '高', color: '#fa8c16', desc: '较大影响，24小时内处理' },
  { value: 'medium', label: '中', color: '#faad14', desc: '有一定影响，本周内处理' },
  { value: 'low', label: '低', color: '#52c41a', desc: '影响较小，按计划处理' },
];

const MaintenanceOrderForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [isModified, setIsModified] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(searchParams.get('deviceId') ?? undefined);

  // URL参数预填充设备
  useEffect(() => {
    const deviceId = searchParams.get('deviceId');
    if (deviceId) {
      form.setFieldValue('deviceId', deviceId);
      setSelectedDeviceId(deviceId);
    }
  }, [searchParams, form]);

  const selectedDevice = useMemo(() => equipments.find((e) => e.id === selectedDeviceId), [selectedDeviceId]);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        console.log('Create order:', values);
        // 自动生成工单号
        const orderNum = `WO-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 900 + 100)}`;
        message.success(`工单 ${orderNum} 已创建`);
        navigate('/operations/device-ledger/maintenance');
      })
      .catch(() => {
        message.warning('请检查表单必填项');
      });
  };

  return (
    <div style={{ padding: 24, maxWidth: 960 }}>
      {/* 页面头部 */}
      <Row align="middle" style={{ marginBottom: 24 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 8 }} />
        <Title level={4} style={{ margin: 0 }}>
          {t('deviceLedger.maintenance.createOrder', '创建维保工单')}
        </Title>
        <RequirementTag componentId="maintenance-create" module="device-ledger" showDetail />
      </Row>

      <Form
        form={form}
        layout="vertical"
        onValuesChange={() => setIsModified(true)}
        initialValues={{
          orderType: 'repair' as OrderType,
          urgency: 'medium' as UrgencyLevel,
        }}
      >
        {/* 关联设备 */}
        <Card title="关联设备" style={{ marginBottom: 16 }}>
          <Form.Item
            label="选择设备"
            name="deviceId"
            rules={[{ required: true, message: '请选择关联设备' }]}
          >
            <Select
              placeholder="搜索设备编号/名称..."
              showSearch
              optionFilterProp="label"
              onChange={(v) => setSelectedDeviceId(v)}
              options={equipments
                .filter((e) => e.status !== 'inactive')
                .map((e) => ({
                  value: e.id,
                  label: `${e.deviceCode} - ${e.name}`,
                }))}
            />
          </Form.Item>

          {/* 设备预览 */}
          {selectedDevice && (
            <Card size="small" style={{ backgroundColor: '#fafafa' }}>
              <Descriptions size="small" column={2}>
                <Descriptions.Item label="设备名称">{selectedDevice.name}</Descriptions.Item>
                <Descriptions.Item label="设备编号">{selectedDevice.deviceCode}</Descriptions.Item>
                <Descriptions.Item label="类型"><DeviceTypeTag type={selectedDevice.deviceType} /></Descriptions.Item>
                <Descriptions.Item label="状态"><DeviceStatusTag status={selectedDevice.status} /></Descriptions.Item>
                <Descriptions.Item label="型号">{selectedDevice.model || '-'}</Descriptions.Item>
                <Descriptions.Item label="位置">{selectedDevice.location || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Card>

        {/* 工单信息 */}
        <Card title="工单信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="工单类型" name="orderType" rules={[{ required: true }]}>
                <Select
                  options={Object.entries(ORDER_TYPE_CONFIG).map(([key, config]) => ({
                    value: key,
                    label: getLabel(config),
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="指派人员" name="assignee">
                <Select
                  placeholder="选择处理人员（可选）"
                  allowClear
                  options={mockEmployees.map((e) => ({
                    value: e.name,
                    label: e.name,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 紧急程度 */}
          <Form.Item
            label="紧急程度"
            name="urgency"
            rules={[{ required: true, message: '请选择紧急程度' }]}
          >
            <Radio.Group style={{ width: '100%' }}>
              <Row gutter={12}>
                {urgencyOptions.map((opt) => (
                  <Col span={6} key={opt.value}>
                    <Radio.Button
                      value={opt.value}
                      style={{
                        width: '100%',
                        height: 'auto',
                        padding: '12px 16px',
                        textAlign: 'center',
                        borderColor: form.getFieldValue('urgency') === opt.value ? opt.color : undefined,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: opt.color, fontSize: 16 }}>{opt.label}</div>
                        <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>{opt.desc}</div>
                      </div>
                    </Radio.Button>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
          </Form.Item>
        </Card>

        {/* 问题描述 */}
        <Card title="问题描述" style={{ marginBottom: 16 }}>
          <Form.Item
            label="故障/维保描述"
            name="description"
            rules={[
              { required: true, message: '请输入描述' },
              { min: 5, message: '描述不少于5个字' },
            ]}
          >
            <TextArea
              rows={5}
              placeholder="请详细描述设备的故障现象或需要维保的内容..."
              maxLength={2000}
              showCount
            />
          </Form.Item>
        </Card>

        {/* 操作按钮 */}
        <Row justify="end">
          <Space>
            {isModified ? (
              <Popconfirm title="放弃未保存的内容？" onConfirm={() => navigate(-1)}>
                <Button>{t('common.cancel', '取消')}</Button>
              </Popconfirm>
            ) : (
              <Button onClick={() => navigate(-1)}>{t('common.cancel', '取消')}</Button>
            )}
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              {t('deviceLedger.maintenance.submit', '提交工单')}
            </Button>
          </Space>
        </Row>
      </Form>
    </div>
  );
};

export default MaintenanceOrderForm;
