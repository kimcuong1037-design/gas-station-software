// P01: 安检任务列表页
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Button, Input, Select, Table, Space, Tabs, Modal, Form, Tag, message, Badge, DatePicker } from 'antd';
import { CalendarOutlined, CheckCircleOutlined, PieChartOutlined, WarningOutlined, BugOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { inspectionTasks, getTaskStats } from '../../../../mock/inspections';
import { employees } from '../../../../mock/employees';
import type { InspectionTask, TaskStatus } from '../types';
import { DEFAULT_PAGE_SIZE, isOverdue, isDueSoon } from '../constants';
import TaskStatusTag from '../components/TaskStatusTag';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Text } = Typography;

/** Status priority for default sort: pending → in_progress → completed */
const STATUS_SORT_ORDER: Record<TaskStatus, number> = {
  pending: 0,
  in_progress: 1,
  completed: 2,
};

const statusTabs: { key: string; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待执行' },
  { key: 'in_progress', label: '执行中' },
  { key: 'completed', label: '已完成' },
];

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  suffix?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, suffix, onClick }) => (
  <Card
    size="small"
    hoverable={!!onClick}
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <Row align="middle" gutter={12}>
      <Col>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: '#fff',
          }}
        >
          {icon}
        </div>
      </Col>
      <Col>
        <Text type="secondary" style={{ fontSize: 12 }}>{title}</Text>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
          {value}{suffix && <span style={{ fontSize: 13, fontWeight: 400 }}>{suffix}</span>}
        </div>
      </Col>
    </Row>
  </Card>
);

const InspectionTaskList: React.FC = () => {
  const navigate = useNavigate();

  // -- state --
  const [activeTab, setActiveTab] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // assign modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningTask, setAssigningTask] = useState<InspectionTask | null>(null);
  const [form] = Form.useForm();

  // -- derived --
  const stats = useMemo(() => getTaskStats(), []);

  /** Badge counts per status tab */
  const badgeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: inspectionTasks.length, pending: 0, in_progress: 0, completed: 0 };
    inspectionTasks.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return counts;
  }, []);

  /** Unique assignees for filter */
  const assigneeOptions = useMemo(() => {
    const map = new Map<string, string>();
    inspectionTasks.forEach((t) => {
      if (t.assignee) map.set(t.assignee.id, t.assignee.name);
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, []);

  /** Filtered + sorted data */
  const filteredData = useMemo(() => {
    const filtered = inspectionTasks.filter((t) => {
      // status tab
      if (activeTab !== 'all' && t.status !== activeTab) return false;
      // assignee
      if (assigneeFilter && t.assignee?.id !== assigneeFilter) return false;
      // date range
      if (dateRange) {
        const due = dayjs(t.dueDate);
        if (due.isBefore(dateRange[0], 'day') || due.isAfter(dateRange[1], 'day')) return false;
      }
      // keyword
      if (keyword) {
        const kw = keyword.toLowerCase();
        if (
          !t.taskNo.toLowerCase().includes(kw) &&
          !t.plan.name.toLowerCase().includes(kw) &&
          !(t.assignee?.name ?? '').toLowerCase().includes(kw)
        ) {
          return false;
        }
      }
      return true;
    });

    // Sort: overdue first → status priority → dueDate asc
    return filtered.sort((a, b) => {
      const aOverdue = isOverdue(a.dueDate, a.status) ? 0 : 1;
      const bOverdue = isOverdue(b.dueDate, b.status) ? 0 : 1;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;

      const aStatus = STATUS_SORT_ORDER[a.status] ?? 9;
      const bStatus = STATUS_SORT_ORDER[b.status] ?? 9;
      if (aStatus !== bStatus) return aStatus - bStatus;

      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [activeTab, keyword, assigneeFilter, dateRange]);

  // -- handlers --
  const handleStatClick = (type: string) => {
    switch (type) {
      case 'todayTotal':
        setActiveTab('all');
        setCurrentPage(1);
        break;
      case 'todayCompleted':
        setActiveTab('completed');
        setCurrentPage(1);
        break;
      case 'abnormalCount':
        navigate('/operations/inspection/logs?result=abnormal');
        break;
      case 'pendingIssueCount':
        navigate('/operations/inspection/issues');
        break;
      default:
        break;
    }
  };

  const openAssignModal = (task: InspectionTask) => {
    setAssigningTask(task);
    form.resetFields();
    if (task.assignee) {
      form.setFieldsValue({ assigneeId: task.assignee.id });
    }
    setAssignModalOpen(true);
  };

  const handleAssignConfirm = async () => {
    try {
      const values = await form.validateFields();
      const emp = employees.find((e) => e.id === values.assigneeId);
      message.success(`已将任务 ${assigningTask?.taskNo} 分配给 ${emp?.name ?? '未知'}`);
      setAssignModalOpen(false);
      setAssigningTask(null);
    } catch {
      // validation failed
    }
  };

  // -- columns --
  const columns: ColumnsType<InspectionTask> = [
    {
      title: '任务编号',
      dataIndex: 'taskNo',
      width: 170,
      sorter: (a, b) => a.taskNo.localeCompare(b.taskNo),
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
      title: '计划编号',
      dataIndex: ['plan', 'planNo'],
      width: 180,
      render: (_: unknown, record) => (
        <a onClick={() => navigate(`/operations/inspection/plans/${record.plan.id}`)}>
          {record.plan.planNo}
        </a>
      ),
    },
    {
      title: '所属计划',
      dataIndex: ['plan', 'name'],
      width: 180,
      render: (_: unknown, record) => (
        <a onClick={() => navigate(`/operations/inspection/plans/${record.plan.id}`)}>
          {record.plan.name}
        </a>
      ),
    },
    {
      title: '执行人',
      dataIndex: ['assignee', 'name'],
      width: 100,
      render: (_: unknown, record) => record.assignee?.name ?? <Text type="secondary">未分配</Text>,
    },
    {
      title: '进度',
      width: 100,
      align: 'center',
      sorter: (a, b) => {
        const aRate = a.totalItems > 0 ? a.checkedItems / a.totalItems : 0;
        const bRate = b.totalItems > 0 ? b.checkedItems / b.totalItems : 0;
        return aRate - bRate;
      },
      render: (_, record) => (
        <Text>
          {record.checkedItems}/{record.totalItems}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (status: TaskStatus) => <TaskStatusTag status={status} />,
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      width: 140,
      align: 'center',
      sorter: (a, b) => a.dueDate.localeCompare(b.dueDate),
      render: (dueDate: string, record) => (
        <Space size={4}>
          <Text>{dueDate}</Text>
          {isOverdue(dueDate, record.status) && <Tag color="red">已逾期</Tag>}
          {isDueSoon(dueDate, record.status) && <Tag color="gold">即将到期</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/operations/inspection/tasks/${record.id}`)}
          >
            查看
          </Button>
          {record.status !== 'completed' && (
            <Button
              type="link"
              size="small"
              onClick={() => openAssignModal(record)}
            >
              分配
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div data-testid="inspection-task-list">
      {/* 页面头部 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/operations/inspection/tasks/create')}
          >
            新增任务
          </Button>
        </Col>
        <Col>
          <RequirementTag componentIds={['task-list', 'task-assign']} module="inspection" showDetail />
        </Col>
      </Row>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <StatCard
            title="今日任务"
            value={stats.todayTotal}
            icon={<CalendarOutlined />}
            color="#1677ff"
            onClick={() => handleStatClick('todayTotal')}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <StatCard
            title="已完成"
            value={stats.todayCompleted}
            icon={<CheckCircleOutlined />}
            color="#52c41a"
            onClick={() => handleStatClick('todayCompleted')}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <StatCard
            title="完成率"
            value={stats.completionRate}
            suffix="%"
            icon={<PieChartOutlined />}
            color="#722ed1"
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <StatCard
            title="异常项"
            value={stats.abnormalCount}
            icon={<WarningOutlined />}
            color="#fa8c16"
            onClick={() => handleStatClick('abnormalCount')}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <StatCard
            title="待处理问题"
            value={stats.pendingIssueCount}
            icon={<BugOutlined />}
            color="#f5222d"
            onClick={() => handleStatClick('pendingIssueCount')}
          />
        </Col>
      </Row>

      {/* 状态 Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={(key) => { setActiveTab(key); setCurrentPage(1); }}
        items={statusTabs.map((tab) => ({
          key: tab.key,
          label: (
            <Badge count={badgeCounts[tab.key] ?? 0} size="small" offset={[8, -2]}>
              {tab.label}
            </Badge>
          ),
        }))}
        style={{ marginBottom: 0 }}
      />

      {/* 筛选区域 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Input
              prefix={<SearchOutlined />}
              placeholder="搜索任务编号/计划名称/执行人..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
              allowClear
              style={{ width: 280 }}
            />
          </Col>
          <Col>
            <Select
              value={assigneeFilter}
              onChange={(v) => { setAssigneeFilter(v); setCurrentPage(1); }}
              placeholder="执行人"
              allowClear
              style={{ width: 150 }}
              options={assigneeOptions}
            />
          </Col>
          <Col>
            <DatePicker.RangePicker
              value={dateRange}
              onChange={(dates) => { setDateRange(dates as [Dayjs, Dayjs] | null); setCurrentPage(1); }}
              placeholder={['截止日期起', '截止日期止']}
              allowClear
              style={{ width: 260 }}
            />
          </Col>
          <Col flex="auto" />
          <Col>
            <Text type="secondary">共 {filteredData.length} 条记录</Text>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          rowClassName={(record) =>
            isOverdue(record.dueDate, record.status) ? 'row-overdue' : ''
          }
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredData.length,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
          }}
          locale={{
            emptyText: (
              <div style={{ padding: 40 }}>
                <div style={{ marginBottom: 12 }}>暂无安检任务，请先创建安检计划并新增任务</div>
                <Button
                  type="primary"
                  onClick={() => navigate('/operations/inspection/plans')}
                >
                  前往计划列表
                </Button>
              </div>
            ),
          }}
        />
      </Card>

      {/* 逾期行高亮 */}
      <style>{`
        .row-overdue {
          background-color: #fff1f0 !important;
        }
        .row-overdue:hover > td {
          background-color: #fff1f0 !important;
        }
      `}</style>

      {/* 分配 Modal */}
      <Modal
        title={`分配任务 - ${assigningTask?.taskNo ?? ''}`}
        open={assignModalOpen}
        onOk={handleAssignConfirm}
        onCancel={() => { setAssignModalOpen(false); setAssigningTask(null); }}
        okText="确定"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="assigneeId"
            label="执行人"
            rules={[{ required: true, message: '请选择执行人' }]}
          >
            <Select
              showSearch
              placeholder="搜索并选择执行人"
              optionFilterProp="label"
              options={employees.map((e) => ({ value: e.id, label: `${e.name} (${e.employeeNo})` }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InspectionTaskList;
