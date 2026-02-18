// P14: 维保工单详情页
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Descriptions,
  Space,
  Empty,
  Timeline,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { maintenanceOrders } from '../../../../mock/maintenanceOrders';
import { equipments } from '../../../../mock/equipments';
import type { OrderStatus } from '../types';
import OrderStatusTag from '../components/OrderStatusTag';
import OrderStatusSteps from '../components/OrderStatusSteps';
import UrgencyTag from '../components/UrgencyTag';
import OrderTypeTag from '../components/OrderTypeTag';
import DeviceTypeTag from '../components/DeviceTypeTag';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const MaintenanceOrderDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [addRecordVisible, setAddRecordVisible] = useState(false);
  const [recordForm] = Form.useForm();

  const order = useMemo(() => maintenanceOrders.find((o) => o.id === id), [id]);
  const device = useMemo(() => (order ? equipments.find((e) => e.id === order.deviceId) : undefined), [order]);

  if (!order) {
    return (
      <div style={{ padding: 24 }}>
        <Empty description="工单不存在">
          <Button onClick={() => navigate('/operations/device-ledger/maintenance')}>返回列表</Button>
        </Empty>
      </div>
    );
  }

  // 状态流转操作
  const getStatusActions = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return [
          { label: '开始处理', action: 'processing', type: 'primary' as const },
        ];
      case 'processing':
        return [
          { label: '提交审核', action: 'pending_review', type: 'primary' as const },
        ];
      case 'pending_review':
        return [
          { label: '审核通过', action: 'completed', type: 'primary' as const },
          { label: '退回修改', action: 'processing', type: 'default' as const },
        ];
      case 'completed':
        return [
          { label: '关闭工单', action: 'closed', type: 'default' as const },
        ];
      default:
        return [];
    }
  };

  const handleStatusChange = (newStatus: string) => {
    message.success(`工单状态已更新为: ${newStatus}`);
  };

  const handleAddRecord = () => {
    recordForm.validateFields().then((values) => {
      console.log('Add record:', values);
      message.success('处理记录已添加');
      setAddRecordVisible(false);
      recordForm.resetFields();
    });
  };

  const statusActions = getStatusActions(order.status);

  // Timeline颜色
  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'create':
        return 'blue';
      case 'assign':
        return 'cyan';
      case 'process':
        return 'green';
      case 'review':
        return 'purple';
      case 'complete':
        return 'green';
      case 'close':
        return 'gray';
      default:
        return 'blue';
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* 页面头部 */}
      <Row align="middle" style={{ marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginRight: 8 }} />
        <div style={{ flex: 1 }}>
          <Row align="middle" justify="space-between">
            <Space align="center">
              <Title level={4} style={{ margin: 0 }}>{order.orderNo}</Title>
              <OrderStatusTag status={order.status} />
              <UrgencyTag level={order.urgency} />
              <OrderTypeTag type={order.orderType} />
            </Space>
            <Space>
              {statusActions.map((action) => (
                <Popconfirm
                  key={action.action}
                  title={`确认${action.label}？`}
                  onConfirm={() => handleStatusChange(action.action)}
                >
                  <Button type={action.type}>{action.label}</Button>
                </Popconfirm>
              ))}
            </Space>
          </Row>
        </div>
      </Row>

      {/* 状态进度 */}
      <Card style={{ marginBottom: 16 }}>
        <OrderStatusSteps status={order.status} records={order.records} />
      </Card>

      {/* 内容区域 - 两栏布局 */}
      <Row gutter={16}>
        {/* 左栏: 工单信息 */}
        <Col span={14}>
          {/* 基本信息 */}
          <Card title="工单信息" style={{ marginBottom: 16 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="工单号">{order.orderNo}</Descriptions.Item>
              <Descriptions.Item label="类型"><OrderTypeTag type={order.orderType} /></Descriptions.Item>
              <Descriptions.Item label="紧急程度"><UrgencyTag level={order.urgency} /></Descriptions.Item>
              <Descriptions.Item label="状态"><OrderStatusTag status={order.status} /></Descriptions.Item>
              <Descriptions.Item label="创建时间">{order.createdAt}</Descriptions.Item>
              <Descriptions.Item label="处理人">{order.assignee?.name || '未指派'}</Descriptions.Item>
            </Descriptions>
            <Divider style={{ margin: '12px 0' }} />
            <div>
              <Text strong>问题描述</Text>
              <Paragraph style={{ marginTop: 8 }}>{order.description}</Paragraph>
            </div>
          </Card>

          {/* 关联设备 */}
          {device && (
            <Card title="关联设备" style={{ marginBottom: 16 }}>
              <Descriptions column={2}>
                <Descriptions.Item label="设备名称">
                  <a onClick={() => navigate(`/operations/device-ledger/equipment/${device.id}`)}>
                    {device.name}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="设备编号">{device.deviceCode}</Descriptions.Item>
                <Descriptions.Item label="类型"><DeviceTypeTag type={device.deviceType} /></Descriptions.Item>
                <Descriptions.Item label="型号">{device.model || '-'}</Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Col>

        {/* 右栏: 处理时间线 */}
        <Col span={10}>
          <Card
            title="处理记录"
            extra={
              order.status !== 'closed' && (
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => setAddRecordVisible(true)}
                >
                  添加记录
                </Button>
              )
            }
          >
            {order.records && order.records.length > 0 ? (
              <Timeline
                items={[...order.records].reverse().map((record) => ({
                  color: getTimelineColor(record.action),
                  children: (
                    <div>
                      <Row justify="space-between" align="middle">
                        <Text strong>{record.content}</Text>
                      </Row>
                      <div style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {record.operator.name} · {record.timestamp}
                        </Text>
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty description="暂无处理记录" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 添加记录弹窗 */}
      <Modal
        title="添加处理记录"
        open={addRecordVisible}
        onOk={handleAddRecord}
        onCancel={() => { setAddRecordVisible(false); recordForm.resetFields(); }}
        okText="添加"
        cancelText="取消"
      >
        <Form form={recordForm} layout="vertical">
          <Form.Item
            label="处理内容"
            name="content"
            rules={[{ required: true, message: '请输入处理内容' }]}
          >
            <TextArea rows={4} placeholder="描述处理进展..." maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MaintenanceOrderDetail;
