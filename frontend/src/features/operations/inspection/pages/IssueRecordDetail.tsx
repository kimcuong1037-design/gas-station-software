// P11: 问题记录详情页
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Typography, Button, Descriptions, Steps, Timeline, Row, Col, Tag, Modal, Form, Input, Select, Checkbox, Space, message, Empty } from 'antd';
import { ArrowLeftOutlined, UserAddOutlined, CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import { issueRecords } from '../../../../mock/inspections';
import { employees } from '../../../../mock/employees';
import { SEVERITY_CONFIG } from '../constants';
import IssueStatusTag from '../components/IssueStatusTag';
import SeverityTag from '../components/SeverityTag';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Title, Text } = Typography;
const { TextArea } = Input;

/** Map status to step index */
const STATUS_STEP: Record<string, number> = {
  pending: 0,
  processing: 1,
  pending_review: 2,
  closed: 3,
};

/** Steps config */
const stepsItems = [
  { title: '待处理', key: 'pending' },
  { title: '处理中', key: 'processing' },
  { title: '待验收', key: 'pending_review' },
  { title: '已闭环', key: 'closed' },
];

/** Timeline action labels */
const ACTION_LABELS: Record<string, string> = {
  created: '创建问题',
  assigned: '分配处理人',
  rectified: '提交整改',
  approved: '确认闭环',
  rejected: '驳回',
};

const IssueRecordDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // -- modal states --
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [rectifyModalOpen, setRectifyModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [assignForm] = Form.useForm();
  const [rectifyForm] = Form.useForm();
  const [confirmForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  // -- find record --
  const record = issueRecords.find((r) => r.id === id);

  if (!record) {
    return (
      <div style={{ padding: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          返回
        </Button>
        <Empty description="问题记录不存在" />
      </div>
    );
  }

  const currentStep = STATUS_STEP[record.status] ?? 0;
  const severityConfig = SEVERITY_CONFIG[record.severity];

  // -- step timestamps --
  const getStepTimestamp = (stepKey: string): string | undefined => {
    const actionMap: Record<string, string> = {
      pending: 'created',
      processing: 'assigned',
      pending_review: 'rectified',
      closed: 'approved',
    };
    const action = actionMap[stepKey];
    const entry = record.timeline.find((t) => t.action === action);
    return entry?.timestamp?.replace('T', ' ').replace('Z', '').slice(0, 16);
  };

  // -- action handlers --
  const handleAssign = () => {
    assignForm.validateFields().then((values) => {
      const emp = employees.find((e) => e.id === values.assigneeId);
      message.success(`已分配给 ${emp?.name ?? values.assigneeId}`);
      setAssignModalOpen(false);
      assignForm.resetFields();
    });
  };

  const handleRectify = () => {
    rectifyForm.validateFields().then(() => {
      message.success('整改已提交，等待验收');
      setRectifyModalOpen(false);
      rectifyForm.resetFields();
    });
  };

  const handleConfirm = () => {
    confirmForm.validateFields().then(() => {
      message.success('问题已确认闭环');
      setConfirmModalOpen(false);
      confirmForm.resetFields();
    });
  };

  const handleReject = () => {
    rejectForm.validateFields().then(() => {
      message.warning('已驳回，退回处理中');
      setRejectModalOpen(false);
      rejectForm.resetFields();
    });
  };

  // -- render action buttons --
  const renderActions = () => {
    switch (record.status) {
      case 'pending':
        return (
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setAssignModalOpen(true)}>
            分配处理人
          </Button>
        );
      case 'processing':
        return (
          <Button type="primary" icon={<EditOutlined />} onClick={() => setRectifyModalOpen(true)}>
            提交整改
          </Button>
        );
      case 'pending_review':
        return (
          <Space>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => setConfirmModalOpen(true)}>
              确认闭环 ✓
            </Button>
            <Button danger icon={<CloseCircleOutlined />} onClick={() => setRejectModalOpen(true)}>
              驳回
            </Button>
          </Space>
        );
      case 'closed':
      default:
        return null;
    }
  };

  return (
    <div data-testid="issue-record-detail" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <Title level={4} style={{ margin: 0 }}>问题详情 {record.issueNo}</Title>
          <IssueStatusTag status={record.status} />
          <SeverityTag severity={record.severity} />
          <RequirementTag componentIds={['issue-detail', 'issue-workflow', 'issue-photos']} module="inspection" showDetail />
        </Space>
        {renderActions()}
      </div>

      {/* Status Steps */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Steps
          current={currentStep}
          size="small"
          items={stepsItems.map((s) => ({
            title: s.title,
            description: getStepTimestamp(s.key),
          }))}
        />
      </Card>

      {/* Two-column layout */}
      <Row gutter={16}>
        {/* Left: Issue info */}
        <Col span={10}>
          <Card title="问题信息" size="small">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="问题编号">{record.issueNo}</Descriptions.Item>
              <Descriptions.Item label="等级">
                <SeverityTag severity={record.severity} />
                <Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
                  {severityConfig.desc}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <IssueStatusTag status={record.status} />
              </Descriptions.Item>
              <Descriptions.Item label="关联任务">
                {record.task ? (
                  <Link to={`/operations/inspection/tasks/${record.task.id}`}>
                    {record.task.taskNo}
                  </Link>
                ) : (
                  <Text type="secondary">-</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="检查项">
                {record.checkItem?.name ?? <Text type="secondary">-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="关联设备">
                {record.equipment ? (
                  <Link to={`/operations/device-ledger/equipment/${record.equipment.id}`}>
                    {record.equipment.name} ({record.equipment.deviceCode})
                  </Link>
                ) : (
                  <Text type="secondary">-</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="问题描述">{record.description}</Descriptions.Item>
              <Descriptions.Item label="登记人">{record.reporter.name}</Descriptions.Item>
              <Descriptions.Item label="处理人">
                {record.assignee?.name ?? <Text type="secondary">未分配</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="处理期限">
                {record.dueDate ?? <Text type="secondary">-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {record.createdAt.replace('T', ' ').replace('Z', '').slice(0, 16)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Right: Timeline */}
        <Col span={14}>
          <Card title="处理记录" size="small">
            {record.timeline.length === 0 ? (
              <Empty description="暂无处理记录" />
            ) : (
              <Timeline
                style={{ marginTop: 16 }}
                items={record.timeline.map((entry) => ({
                  key: entry.id,
                  color:
                    entry.action === 'approved'
                      ? 'green'
                      : entry.action === 'rejected'
                      ? 'red'
                      : 'blue',
                  children: (
                    <div>
                      <div style={{ marginBottom: 4 }}>
                        <Text strong>{entry.operator.name}</Text>
                        <Tag style={{ marginLeft: 8 }}>{ACTION_LABELS[entry.action] ?? entry.action}</Tag>
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                          {entry.timestamp.replace('T', ' ').replace('Z', '').slice(0, 16)}
                        </Text>
                      </div>
                      <Text>{entry.content}</Text>
                      {entry.attachments && entry.attachments.length > 0 && (
                        <div style={{ marginTop: 4 }}>
                          {entry.attachments.map((att) => (
                            <Tag key={att.id} color="blue" style={{ cursor: 'pointer' }}>
                              📎 {att.fileName}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal: Assign */}
      <Modal
        title="分配处理人"
        open={assignModalOpen}
        onOk={handleAssign}
        onCancel={() => {
          setAssignModalOpen(false);
          assignForm.resetFields();
        }}
        okText="确认分配"
        cancelText="取消"
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="assigneeId"
            label="处理人"
            rules={[{ required: true, message: '请选择处理人' }]}
          >
            <Select
              placeholder="请选择处理人"
              showSearch
              optionFilterProp="label"
              options={employees.map((e) => ({ value: e.id, label: `${e.name} - ${e.position}` }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Rectification */}
      <Modal
        title="提交整改"
        open={rectifyModalOpen}
        onOk={handleRectify}
        onCancel={() => {
          setRectifyModalOpen(false);
          rectifyForm.resetFields();
        }}
        okText="提交"
        cancelText="取消"
      >
        <Form form={rectifyForm} layout="vertical">
          <Form.Item
            name="rectification"
            label="整改措施"
            rules={[{ required: true, message: '请填写整改措施' }]}
          >
            <TextArea rows={3} placeholder="请描述采取的整改措施" maxLength={1000} showCount />
          </Form.Item>
          <Form.Item
            name="rectificationResult"
            label="整改结果"
            rules={[{ required: true, message: '请填写整改结果' }]}
          >
            <TextArea rows={3} placeholder="请描述整改后的结果" maxLength={1000} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Confirm close */}
      <Modal
        title="确认闭环"
        open={confirmModalOpen}
        onOk={handleConfirm}
        onCancel={() => {
          setConfirmModalOpen(false);
          confirmForm.resetFields();
        }}
        okText="确认闭环"
        cancelText="取消"
      >
        <Form form={confirmForm} layout="vertical">
          <Form.Item
            name="confirmed"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('请确认整改结果')),
              },
            ]}
          >
            <Checkbox>确认整改结果符合要求</Checkbox>
          </Form.Item>
          <Form.Item name="reviewComment" label="验收备注（可选）">
            <TextArea rows={2} placeholder="可填写验收备注" maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Reject */}
      <Modal
        title="驳回"
        open={rejectModalOpen}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalOpen(false);
          rejectForm.resetFields();
        }}
        okText="确认驳回"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reviewComment"
            label="驳回原因"
            rules={[{ required: true, message: '请填写驳回原因' }]}
          >
            <TextArea rows={3} placeholder="请说明驳回原因" maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default IssueRecordDetail;
