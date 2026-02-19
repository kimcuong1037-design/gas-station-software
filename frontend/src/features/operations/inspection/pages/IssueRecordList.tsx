// P10: 问题记录列表页
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Input, Select, Table, Space, Tabs, Badge, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { issueRecords } from '../../../../mock/inspections';
import type { IssueRecord, IssueStatus, IssueSeverity } from '../types';
import { DEFAULT_PAGE_SIZE } from '../constants';
import IssueStatusTag from '../components/IssueStatusTag';
import SeverityTag from '../components/SeverityTag';
import IssueReportDrawer from './IssueReportDrawer';

const { Title, Text, Link } = Typography;

/** Severity sort weight: urgent=0 (top) → low=3 (bottom) */
const SEVERITY_SORT_ORDER: Record<IssueSeverity, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const statusTabs: { key: string; label: string; color?: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理', color: 'red' },
  { key: 'processing', label: '处理中' },
  { key: 'pending_review', label: '待验收' },
  { key: 'closed', label: '已闭环' },
];

const severityOptions = [
  { value: 'all', label: '全部等级' },
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
];

const IssueRecordList: React.FC = () => {
  const navigate = useNavigate();

  // -- state --
  const [activeTab, setActiveTab] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // -- badge counts --
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: issueRecords.length };
    issueRecords.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, []);

  // -- assignee options --
  const assigneeOptions = useMemo(() => {
    const seen = new Map<string, string>();
    issueRecords.forEach((r) => {
      if (r.assignee) seen.set(r.assignee.id, r.assignee.name);
    });
    return Array.from(seen, ([id, name]) => ({ value: id, label: name }));
  }, []);

  // -- filtered & sorted data --
  const filteredData = useMemo(() => {
    let data = [...issueRecords];

    // tab filter
    if (activeTab !== 'all') {
      data = data.filter((r) => r.status === activeTab);
    }

    // keyword
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      data = data.filter(
        (r) =>
          r.issueNo.toLowerCase().includes(kw) ||
          r.description.toLowerCase().includes(kw)
      );
    }

    // severity
    if (severityFilter !== 'all') {
      data = data.filter((r) => r.severity === severityFilter);
    }

    // assignee
    if (assigneeFilter) {
      data = data.filter((r) => r.assignee?.id === assigneeFilter);
    }

    // sort: severity desc (urgent first) then createdAt desc
    data.sort((a, b) => {
      const sevDiff = SEVERITY_SORT_ORDER[a.severity] - SEVERITY_SORT_ORDER[b.severity];
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return data;
  }, [activeTab, keyword, severityFilter, assigneeFilter]);

  // -- table columns --
  const columns: ColumnsType<IssueRecord> = [
    {
      title: '问题编号',
      dataIndex: 'issueNo',
      key: 'issueNo',
      width: 180,
      render: (text: string, record: IssueRecord) => (
        <Link strong onClick={() => navigate(`/operations/inspection/issues/${record.id}`)}>
          {text}
        </Link>
      ),
    },
    {
      title: '问题描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 260,
    },
    {
      title: '等级',
      dataIndex: 'severity',
      key: 'severity',
      width: 80,
      render: (severity: IssueSeverity) => <SeverityTag severity={severity} />,
    },
    {
      title: '关联任务',
      dataIndex: ['task', 'taskNo'],
      key: 'taskNo',
      width: 170,
      render: (_: unknown, record: IssueRecord) =>
        record.task ? (
          <Link onClick={() => navigate(`/operations/inspection/tasks/${record.task!.id}`)}>
            {record.task.taskNo}
          </Link>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: IssueStatus) => <IssueStatusTag status={status} />,
    },
    {
      title: '处理人',
      key: 'assignee',
      width: 100,
      render: (_: unknown, record: IssueRecord) => record.assignee?.name ?? <Text type="secondary">-</Text>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (t: string) => t.replace('T', ' ').replace('Z', '').slice(0, 16),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: IssueRecord) => (
        <Button type="link" size="small" onClick={() => navigate(`/operations/inspection/issues/${record.id}`)}>
          查看
        </Button>
      ),
    },
  ];

  // -- urgent/high row style --
  const rowClassName = (record: IssueRecord) => {
    if (record.severity === 'urgent' || record.severity === 'high') {
      return 'issue-row-urgent';
    }
    return '';
  };

  const handleDrawerSaved = () => {
    message.success('问题列表已刷新');
  };

  return (
    <div data-testid="issue-record-list" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>问题记录</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setDrawerOpen(true)}>
          新增问题
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ marginBottom: 16 }}
        items={statusTabs.map((tab) => ({
          key: tab.key,
          label: (
            <span>
              {tab.label}
              <Badge
                count={statusCounts[tab.key] || 0}
                size="small"
                style={{
                  marginLeft: 6,
                  backgroundColor: tab.color === 'red' ? '#ff4d4f' : undefined,
                }}
                showZero={false}
              />
            </span>
          ),
        }))}
      />

      {/* Filters */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="搜索编号/描述"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
          <Select
            value={severityFilter}
            onChange={setSeverityFilter}
            options={severityOptions}
            style={{ width: 140 }}
          />
          <Select
            value={assigneeFilter}
            onChange={setAssigneeFilter}
            placeholder="处理人"
            options={assigneeOptions}
            allowClear
            style={{ width: 140 }}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <style>{`
          .issue-row-urgent { background-color: #fff1f0 !important; }
          .issue-row-urgent:hover > td { background-color: #fff1f0 !important; }
        `}</style>
        <Table<IssueRecord>
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          rowClassName={rowClassName}
          pagination={{
            pageSize: DEFAULT_PAGE_SIZE,
            showSizeChanger: false,
            showTotal: (total) => `共 ${total} 条`,
          }}
          locale={{
            emptyText: (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 15 }}>
                  暂无问题记录，所有巡检执行正常 ✅
                </Text>
              </div>
            ),
          }}
        />
      </Card>

      {/* Drawer */}
      <IssueReportDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSaved={handleDrawerSaved}
      />
    </div>
  );
};

export default IssueRecordList;
