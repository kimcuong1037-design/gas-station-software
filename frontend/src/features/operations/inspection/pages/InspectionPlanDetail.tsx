// P05: 安检计划详情页
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Descriptions, Table, Space, Progress, Popconfirm, Empty, message } from 'antd';
import { EditOutlined, PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { inspectionPlans, inspectionTasks } from '../../../../mock/inspections';
import type { InspectionTask } from '../types';

import PlanStatusTag from '../components/PlanStatusTag';
import CycleTypeTag from '../components/CycleTypeTag';
import TaskStatusTag from '../components/TaskStatusTag';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const InspectionPlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // -- state --
  // (dispatch modal removed, replaced with navigation to task creation page)

  // -- data --
  const plan = useMemo(() => {
    return inspectionPlans.find((p) => p.id === id) ?? null;
  }, [id]);

  const associatedTasks = useMemo(() => {
    if (!plan) return [];
    return inspectionTasks
      .filter((t) => t.planId === plan.id)
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  }, [plan]);

  // -- handlers --
  const handleCreateTask = () => {
    navigate(`/operations/inspection/tasks/create?planId=${plan?.id}`);
  };

  const handleCancelPlan = () => {
    if (plan) {
      message.success(`计划「${plan.name}」已取消`);
      navigate('/operations/inspection/plans');
    }
  };

  // -- not found --
  if (!plan) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Empty description="未找到该安检计划" />
        <Button
          type="primary"
          style={{ marginTop: 16 }}
          onClick={() => navigate('/operations/inspection/plans')}
        >
          返回列表
        </Button>
      </div>
    );
  }

  // -- task table columns --
  const taskColumns: ColumnsType<InspectionTask> = [
    {
      title: '任务编号',
      dataIndex: 'taskNo',
      width: 170,
      render: (taskNo: string, record) => (
        <a
          onClick={() => navigate(`/operations/inspection/tasks/${record.id}`)}
          style={{ fontWeight: 600 }}
        >
          {taskNo}
        </a>
      ),
    },
    {
      title: '执行人',
      dataIndex: ['assignee', 'name'],
      width: 100,
      render: (_: unknown, record) =>
        record.assignee?.name ?? <Text type="secondary">未分配</Text>,
    },
    {
      title: '进度',
      width: 160,
      render: (_, record) => {
        const percent = record.totalItems > 0
          ? Math.round((record.checkedItems / record.totalItems) * 100)
          : 0;
        return (
          <Space>
            <Progress
              percent={percent}
              size="small"
              style={{ width: 80 }}
              strokeColor={percent === 100 ? '#52c41a' : undefined}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.checkedItems}/{record.totalItems}
            </Text>
          </Space>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (status: InspectionTask['status']) => <TaskStatusTag status={status} />,
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      width: 120,
      align: 'center',
    },
    {
      title: '操作',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/operations/inspection/tasks/${record.id}`)}
        >
          查看
        </Button>
      ),
    },
  ];

  // -- dynamic action buttons --
  const renderActions = () => {
    const { status } = plan;
    const actions: React.ReactNode[] = [];

    if (status === 'pending') {
      actions.push(
        <Button
          key="edit"
          icon={<EditOutlined />}
          onClick={() => navigate(`/operations/inspection/plans/${plan.id}/edit`)}
        >
          编辑
        </Button>,
      );
      actions.push(
        <Button
          key="createTask"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateTask}
        >
          新增任务
        </Button>,
      );
      actions.push(
        <Popconfirm
          key="cancel"
          title="确认取消计划"
          description={`确定取消计划「${plan.name}」吗？此操作不可撤销。`}
          onConfirm={handleCancelPlan}
          okText="确定"
          cancelText="取消"
        >
          <Button danger>取消计划</Button>
        </Popconfirm>,
      );
    }

    if (status === 'in_progress') {
      actions.push(
        <Button
          key="createTask"
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateTask}
        >
          新增任务
        </Button>,
      );
    }

    if (status === 'completed' || status === 'cancelled') {
      actions.push(
        <Button
          key="back"
          onClick={() => navigate('/operations/inspection/plans')}
        >
          返回列表
        </Button>,
      );
    }

    return <Space>{actions}</Space>;
  };

  return (
    <div data-testid="inspection-plan-detail" style={{ padding: 24 }}>
      {/* 页面头部 */}
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          type="text"
          onClick={() => navigate('/operations/inspection/plans')}
        />
        <Title level={4} style={{ margin: 0 }}>安检计划详情</Title>
      </Space>

      {/* 计划信息 */}
      <Card
        title={plan.name}
        extra={renderActions()}
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="计划编号">{plan.planNo}</Descriptions.Item>
          <Descriptions.Item label="计划名称">{plan.name}</Descriptions.Item>
          <Descriptions.Item label="巡检周期">
            <CycleTypeTag cycle={plan.cycleType} />
          </Descriptions.Item>
          <Descriptions.Item label="时间范围">
            {plan.startDate} ~ {plan.endDate}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <PlanStatusTag status={plan.status} />
          </Descriptions.Item>
          <Descriptions.Item label="检查项数">
            <Text strong>{plan.checkItemCount}</Text> 项
          </Descriptions.Item>
          <Descriptions.Item label="创建人">{plan.createdBy.name}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(plan.createdAt).format('YYYY-MM-DD HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>
            {plan.description ? (
              <Text>{plan.description}</Text>
            ) : (
              <Text type="secondary">无</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 关联任务 */}
      <Card title={`关联任务（${associatedTasks.length}）`}>
        <Table
          columns={taskColumns}
          dataSource={associatedTasks}
          rowKey="id"
          pagination={
            associatedTasks.length > 10
              ? {
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条`,
                }
              : false
          }
          locale={{
            emptyText: (
              <div style={{ padding: 24 }}>
                <Text type="secondary">暂无关联任务</Text>
                {(plan.status === 'pending' || plan.status === 'in_progress') && (
                  <div style={{ marginTop: 8 }}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={handleCreateTask}
                    >
                      新增任务
                    </Button>
                  </div>
                )}
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default InspectionPlanDetail;
