// P03: 安检计划列表页
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Input, Select, Table, Space, Popconfirm, Dropdown, message } from 'antd';
import { PlusOutlined, SearchOutlined, MoreOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { inspectionPlans } from '../../../../mock/inspections';
import type { InspectionPlan, PlanStatus, CycleType } from '../types';
import { DEFAULT_PAGE_SIZE } from '../constants';
import PlanStatusTag from '../components/PlanStatusTag';
import CycleTypeTag from '../components/CycleTypeTag';
import { RequirementTag } from '../../../../components/RequirementTag';

const { Title, Text } = Typography;

/** Status priority for default sort: in_progress → pending → completed → cancelled */
const STATUS_SORT_ORDER: Record<PlanStatus, number> = {
  in_progress: 0,
  pending: 1,
  completed: 2,
  cancelled: 3,
};

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待执行' },
  { value: 'in_progress', label: '执行中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

const cycleTypeOptions = [
  { value: 'all', label: '全部周期' },
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
];

const InspectionPlanList: React.FC = () => {
  const navigate = useNavigate();

  // -- state --
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'all'>('all');
  const [cycleFilter, setCycleFilter] = useState<CycleType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // -- derived --
  const filteredData = useMemo(() => {
    const filtered = inspectionPlans.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (cycleFilter !== 'all' && p.cycleType !== cycleFilter) return false;
      if (keyword) {
        const kw = keyword.toLowerCase();
        if (
          !p.planNo.toLowerCase().includes(kw) &&
          !p.name.toLowerCase().includes(kw)
        ) {
          return false;
        }
      }
      return true;
    });

    // Sort: status priority → createdAt desc
    return filtered.sort((a, b) => {
      const aStatus = STATUS_SORT_ORDER[a.status] ?? 9;
      const bStatus = STATUS_SORT_ORDER[b.status] ?? 9;
      if (aStatus !== bStatus) return aStatus - bStatus;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [keyword, statusFilter, cycleFilter]);

  // -- handlers --
  const handleCancel = (plan: InspectionPlan) => {
    message.success(`计划「${plan.name}」已取消`);
  };

  // -- columns --
  const columns: ColumnsType<InspectionPlan> = [
    {
      title: '计划编号',
      dataIndex: 'planNo',
      width: 200,
      render: (planNo: string, record) => (
        <a
          onClick={() => navigate(`/operations/inspection/plans/${record.id}`)}
          style={{ fontWeight: 600 }}
        >
          {planNo}
        </a>
      ),
    },
    {
      title: '计划名称',
      dataIndex: 'name',
      width: 220,
      ellipsis: true,
    },
    {
      title: '巡检周期',
      dataIndex: 'cycleType',
      width: 100,
      align: 'center',
      render: (cycleType: CycleType) => <CycleTypeTag cycle={cycleType} />,
    },
    {
      title: '时间范围',
      width: 200,
      align: 'center',
      render: (_: unknown, record) => (
        <Text>{record.startDate} ~ {record.endDate}</Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (status: PlanStatus) => <PlanStatusTag status={status} />,
    },
    {
      title: '检查项数',
      dataIndex: 'checkItemCount',
      width: 100,
      align: 'center',
    },
    {
      title: '操作',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/operations/inspection/plans/${record.id}`)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              onClick={() => navigate(`/operations/inspection/plans/${record.id}/edit`)}
            >
              编辑
            </Button>
          )}
          {record.status === 'pending' && (
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'cancel',
                    label: (
                      <Popconfirm
                        title="确认取消"
                        description={`确定取消计划「${record.name}」吗？此操作不可撤销。`}
                        onConfirm={() => handleCancel(record)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <span style={{ color: '#ff4d4f' }}>取消计划</span>
                      </Popconfirm>
                    ),
                  },
                ],
              }}
              trigger={['click']}
            >
              <Button type="link" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div data-testid="inspection-plan-list">
      {/* 页面头部 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space align="center">
          <Title level={4} style={{ margin: 0 }}>安检计划</Title>
          <RequirementTag componentIds={['plan-list']} module="inspection" showDetail />
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/operations/inspection/plans/create')}
        >
          新建计划
        </Button>
      </div>

      {/* 筛选区域 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索计划编号/名称..."
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setCurrentPage(1); }}
            allowClear
            style={{ width: 260 }}
          />
          <Select
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
            options={statusOptions}
            style={{ width: 140 }}
          />
          <Select
            value={cycleFilter}
            onChange={(v) => { setCycleFilter(v); setCurrentPage(1); }}
            options={cycleTypeOptions}
            style={{ width: 140 }}
          />
          <Text type="secondary" style={{ marginLeft: 8 }}>共 {filteredData.length} 条记录</Text>
        </Space>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1200 }}
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
                <div style={{ marginBottom: 12 }}>暂无安检计划</div>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/operations/inspection/plans/create')}
                >
                  新建计划
                </Button>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default InspectionPlanList;
